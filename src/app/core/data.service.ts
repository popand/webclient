namespace app.core {
    'use strict';

    interface ISuccessData {
        success: boolean;
        command: string;
        params: {};
        httpStatus: string;
        message: string;
        errors: string[];
        throwable: any;

        responseObject?: {
            content: {};
            last: boolean;
            totalPages: number;
            totalElements: number;
            numberOfElements: number;
            sort: any;
            first: boolean;
            size: number;
            number: number;
        };
    }

    interface IErrorData {
        error: string;
        exception: string;
        message: string;
        path: string;
        status: number;
        timestamp: number;
    }

    export type ISuccessResponse = ng.IHttpPromiseCallbackArg<ISuccessData>;
    export type IErrorResponse = ng.IHttpPromiseCallbackArg<IErrorData>;

    function getResponseObject(response: any) {
        return response.data.responseObject;
    }

    function getResponseObjectContent(response: any) {
        return response.data.responseObject.content;
    }

    function asProducts(products: models.IProduct[]) {
        return _.map(products, models.Product.fromJson);
    }



    export class DataService {
        static $inject = ['$http', '$q', 'url', 'localStorageService', 'logger'];
        private accessToken: ng.IPromise<string> = null;
        private lastAccessTokenFetch = 0;

        constructor(
            protected $http: ng.IHttpService,
            protected $q: ng.IQService,
            protected url: app.core.UrlService,
            protected storage: ng.local.storage.ILocalStorageService,
            protected logger: blocks.logger.Logger
        ) {
        }

        api(path: string) {
            return this.url.get(path);
        }

        /**
         * [request description]
         * @param  {ng.IRequestConfig} config [description]
         * @return {ng.IPromise<any>} [description]
         */
        request(config: ng.IRequestConfig): ng.IPromise<any> {
            const $q = this.$q;
            const $http = this.$http;
            const storage = this.storage;
            const self = this;

            return this.ensureAccessToken()
                .then(doRequest)
                .catch(invalidAccessToken);

            function doRequest(token: string) {
                if (!token || !_.isString(token)) {
                    return $q.reject('no token');
                }

                return $http(withAuthHeaders(config, token));
            }

            function invalidAccessToken(response: any) {
                var error = _.get(response, 'data.error', response);
                var skip = error && error !== 'invalid_token';

                if (!skip && response.status === 401) {
                    // Invalid access token, probably just expired, do request again,
                    // but don't catch the error again, don't need the infinite loop.
                    return self.ensureAccessToken(true).then(doRequest);
                }

                return $q.reject(response);
            }

            function withAuthHeaders(config: any, accessToken: string) {
                var userToken = storage.get('libertas.user_token') || undefined;
                var headers = config.headers || {};

                headers.Authorization = 'Bearer ' + accessToken;
                headers.UserAuthorization = userToken;

                config.headers = headers;
                return config;
            }
        }

        ensureAccessToken(force=false) {
            if (force || !this.accessToken) {
                this.accessToken = this.fetchAccessToken();
            }
            return this.accessToken;
        }

        fetchAccessToken() {
            // If multiple errors happened, we only want to fetch the access token once.
            // Wait 5 seconds, if you want to make another request, otherwise return existing token.
            const now = moment.utc().unix();
            const wait = 5;  // TODO: move to the config or use token.expire_in?

            if (this.lastAccessTokenFetch && now < this.lastAccessTokenFetch + wait) {
                return this.accessToken;
            }

            this.lastAccessTokenFetch = now;

            var config: any = {
                method: 'POST',
                url: this.api('/securityservice/oauth/token'),
                params: { 'grant_type': 'client_credentials' },
                headers: { 'Authorization': 'Basic cGhpLXVzZXI6c2VjcmV0' }
            };

            return this.$http(config)
                .then((response: any) => {
                    return response.data['access_token'];
                });
        }

        /**
         * Request all pages.
         * @param  {ng.IPromise<any>} request
         * @param  {function} iteratee
         * @return {ng.IPromise<any>}
         */
        all(promise: ng.IPromise<any>, iteratee = getResponseObjectContent) {
            var next = (promise: ng.IPromise<any>, content: any[]): ng.IPromise<any> => {
                return promise.then((response: any) => {
                    var data = response.data;

                    if (data.success !== true) {
                        this.logger.error('next', data.message, data.errors);
                        return this.$q.reject(data.message);
                    }

                    var pagedData = iteratee(response);
                    if (!pagedData) {
                        return this.$q.reject(response);
                    }

                    content = content.concat(pagedData || []);
                    if (data.responseObject.last === false) {
                        var config = response.config;
                        config.params.pageNumber += 1;
                        return next(this.request(config), content);
                    }

                    return content;
                });
            };

            return next(promise, []);
        }


        /**
         * Get a list of all promotions available.
         * These are just logical groupings of movies.
         * @return {ng.IPromise<models.IPromotion[]>} [description]
         */
        getPromotions(): ng.IPromise<models.IPromotion[]> {
            var request = this.request({
                method: 'GET',
                url: this.api('/promotionservice/v1/promotion/findAll'),
                params: {
                    pageNumber: 0,
                    pageSize: 20
                }
            });

            return this.all(request);
        }

        /**
         * To get the details of this promotions call this API.
         * List of movies that are part of this grouping.
         * @param  {string} id [description]
         * @return {ng.IPromise<models.IPromotionDetails>}    [description]
         */
        getPromotion(id: string): ng.IPromise<models.IPromotionDetails> {
            var request = this.request({
                method: 'GET',
                url: this.api(`/promotionservice/v1/promotion/${id}`)
            });

            return request
                .then(getResponseObject)
                .then((data: any) => {
                    var products: models.IProduct[] = _.get(data, 'products.content', []);
                    if (_.isEmpty(products)) {
                        data.products = [];
                        return data;
                    }

                    var productIds = _.map(products, x => x.productId);
                    return this.getProductsByIds(productIds)
                        .then(products => {
                            data.products = products;
                            return data;
                        });
                });
        }

        /**
         * [getPromotionsWithDetails description]
         * @return {ng.IPromise<models.IPromotionDetails[]>} [description]
         */
        getPromotionsWithDetails(): ng.IPromise<models.IPromotionDetails[]> {
            return this.getPromotions()
                .then(promotions => {
                    return this.$q.all(promotions.map(x => this.getPromotion(x.id)));
                });
        }

        getProduct(id: string) {
            var request = this.request({
                method: 'GET',
                url: this.api(`/productservice/v1/products/${id}/productDetails`)
            });

            return request.then(getResponseObject).then(models.Product.fromJson);
        }

        getProductsByIds(ids: string[]) {
            var request = this.request({
                method: 'GET',
                url: this.api('/productservice/v1/products/retrieveAllProductDetailsByIds'),
                params: {
                    productIds: ids,
                    pageSize: 40,
                    pageNumber: 0
                }
            });

            return this.all(request).then(asProducts);
        }

        getProductsByTags(tags: string[]) {
            var request = this.request({
                method: 'GET',
                url: this.api('/productservice/v1/products/retrieveAllProductDetailsByTags'),
                params: {
                    tags: tags,
                    pageSize: 50,
                    pageNumber: 0
                }
            });

            return this.all(request).then(asProducts);
        }

        searchProducts(query: string) {
            if (!query) {
                return this.$q.when([]);
            }

            // TODO: search returns empty data
            if (true) {
                return this.getProductsByTags([query]);
            }

            var request = this.request({
                method: 'GET',
                url: this.api('/productservice/v1/products/search'),
                params: {
                    query: query,
                    pageSize: 40,
                    pageNumber: 0
                }
            });

            return this.all(request).then(asProducts);
        }


        /**
         * List of comments for the selected movie.
         * @param {string} productId  [description]
         */
        getReviews(productId: string): ng.IPromise<models.IReview[]> {
            var request = this.request({
                method: 'GET',
                url: this.api(`/reviewservice/v1/review/findAll/product/${productId}`),
                params: {
                    pageNumber: 0,
                    pageSize: 20
                }
            });

            return this.all(request);
        }

        createReview(productId: string, comment: string): ng.IPromise<models.IReview> {
            if (_.isEmpty(productId) || _.isEmpty(comment)) {
                this.logger.warning('createReview: invalid args', arguments);
                return;
            }

            var request = this.request({
                method: 'POST',
                url: this.api(`/reviewservice/v1/review/product/${productId}`),
                data: {
                    comment: comment
                }
            });

            return request.then(getResponseObject);
        }

        /**
         * List of movies recommended
         * @param {string} productId  [description]
         */
        getRecommendations(productId: string): ng.IPromise<models.Product[]> {
            var request =  this.request({
                method: 'GET',
                url: this.api(`/recommendationservice/v1/recommendation/product/${productId}`),
                params: {
                    pageNumber: 0,
                    pageSize: 20
                }
            });

            var ids = 'responseObject.recommendation.recommendationProductIds';
            return this.all(request, (response: any) => _.get(response.data, ids, []))
                .then(ids => _.isEmpty(ids) ? [] : this.getProductsByIds(ids));
        }

        purchaseCheckout(data: models.IPurchaseRequestData) {
            var request = this.request({
                method: 'POST',
                url: this.api('/purchaseservice/v1/purchase/checkout'),
                data: data
            });
            return request;
        }

        getPurchaseClientToken(): ng.IPromise<string> {
            var request = this.request({
                method: 'GET',
                url: this.api('/purchaseservice/v1/purchase/client_token')
            });

            return request.then(response => response.data);
        }

        getOffer(offerId: string): ng.IPromise<models.IOffer> {
            var request = this.request({
                method: 'GET',
                url: this.api(`/offerservice/v1/offer/${offerId}`)
            });

            return request.then(getResponseObject);
        }

        getPlaybackUrl(productId: string, offerId: string, deviceSpec: string, deviceId = 'web') {
            var request = this.request({
                method: 'GET',
                url: this.api('/playbackservice/v1/playback/url'),
                params: {productId, offerId, deviceSpec, deviceId}
            });

            return request.then(getResponseObject);
        }
    }

    angular
        .module('app.core')
        .service('dataService', DataService);
}
