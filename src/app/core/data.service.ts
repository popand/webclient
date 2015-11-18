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

    export class DataService {
        static $inject = ['$http', '$q', 'url', 'localStorageService', 'logger'];

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
                if (!token) {
                    return $q.reject('no token');
                }

                return $http(withAuthHeaders(config));
            }

            function invalidAccessToken(response: any) {
                var error = response.data.error;
                var skip = error && error !== 'invalid_token';

                if (!skip && response.status === 401) {
                    return self.ensureAccessToken(true).then(doRequest);
                }

                return $q.reject(response);
            }

            function withAuthHeaders(config: any) {
                var headers = config.headers || {};

                var accessToken = storage.get('libertas.access_token');
                if (accessToken) {
                    headers.Authorization = 'Bearer ' + accessToken;
                } else {
                    headers.Authorization = undefined;
                }

                var userToken = storage.get('libertas.user_token');
                if (userToken) {
                    headers.UserAuthorization = userToken;
                } else {
                    headers.UserAuthorization = undefined;
                }

                config.headers = headers;
                return config;
            }
        }

        ensureAccessToken(force = false) {
            var token = this.storage.get('libertas.access_token');

            if (force || !token) {
                token = this.fetchAccessToken();
                this.storage.set('libertas.access_token', token);
            } else {
                token = this.$q.when(token);
            }

            return <ng.IPromise<string>>token;
        }

        fetchAccessToken() {
            var config: any = {
                method: 'POST',
                url: this.api('/securityservice/oauth/token'),
                params: { 'grant_type': 'client_credentials' },
                headers: { 'Authorization': 'Basic dmlwYWFzLXVzZXI6c2VjcmV0' }
            };

            return this.$http(config)
                .then((response: any) => {
                    var token = response.data['access_token'];
                    this.storage.set('libertas.access_token', token);
                    return token;
                });
        }

        /**
         * Request all pages.
         * @param  {ng.IPromise<any>} request
         * @param  {function} iteratee
         * @return {ng.IPromise<any>}
         */
        all(promise: ng.IPromise<any>, iteratee = getResponseObject) {
            var next = (promise: ng.IPromise<any>, content: any[]): ng.IPromise<any> => {
                return promise.then((response: any) => {
                    var data = response.data;

                    if (data.success !== true) {
                        this.logger.error('next', data.message, data.errors);
                        return this.$q.reject(data.message);
                    }

                    var pagedData = iteratee(response);
                    if (!pagedData) {
                        return data;
                    }

                    content = content.concat(pagedData.content || []);
                    if (pagedData.last === false) {
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
                    var products: models.IProduct[] = data.products.content;
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

        getProduct(product: models.IProduct) {
            var id = product.productId;
            var request = this.request({
                method: 'GET',
                url: this.api(`/productservice/v1/products/${id}/productDetails`)
            });

            return request.then(getResponseObject);
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

            return this.all(request);
        }

        searchProducts(query: string) {
            // TODO: search returns empty data

            if (!query) {
                return this.$q.when([]);
            }

            var request = this.request({
                method: 'GET',
                url: this.api('/productservice/v1/products/retrieveAllProductDetailsByTags'),
                // url: this.api('/productservice/v1/products/search'),
                params: {
                    // query: query,
                    tags: [query],
                    pageSize: 40,
                    pageNumber: 0
                }
            });

            return this.all(request);
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

        /**
         * List of movies recommended
         * @param {string} productId  [description]
         */
        getRecommendations(productId: string): ng.IPromise<models.IProduct[]> {
            var request =  this.request({
                method: 'GET',
                url: this.api(`/recommendationservice/v1/recommendation/product/${productId}`),
                params: {
                    pageNumber: 0,
                    pageSize: 20
                }
            });

            return this.all(request, (x: any) => x.responseObject.products);
        }
    }

    angular
        .module('app.core')
        .service('dataService', DataService);
}
