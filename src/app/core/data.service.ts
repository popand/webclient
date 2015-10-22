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
         * [authenticate description]
         * @param {[type]} force = false [description]
         */
        authenticate(force = false) {
            var storage = this.storage;
            var token: ng.IPromise<string>;

            if (force || !storage.get('auth.token')) {
                token = this.getAccessToken().then((token) => {
                    storage.set('auth.token', token);
                    return token;
                });
            } else {
                token = this.$q.when(storage.get('auth.token'));
            }

            return token;
        }

        /**
         * [request description]
         * @param  {ng.IRequestConfig} config [description]
         * @param  {boolean} force = false [description]
         * @return {ng.IPromise<any>} [description]
         */
        request(config: ng.IRequestConfig, force = false): ng.IPromise<any> {
            const $q = this.$q;
            const $http = this.$http;
            config.cache = true;

            return this
                .authenticate(force)
                .then((token) => {
                    if (!token) {
                        return $q.reject('no token');
                    }

                    $http.defaults.headers.common.Authorization = `Bearer ${token}`;
                    return $http(config)
                        .catch((response: any) => {
                            if (!force && response.status === 401) {
                                return this.request(config, true);
                            }
                            return $q.reject(response);
                        })
                        .then((response) => {
                            return response;
                        });
                });
        }


        /**
         * Request all pages.
         * @param  {ng.IRequestConfig} config
         * @param  {number} pageSize
         * @return {ng.IPromise<any>}
         */
        requestAll(config: ng.IRequestConfig, pageSize = 20): ng.IPromise<any> {
            var next = (config: ng.IRequestConfig, content: any[]): ng.IPromise<any> => {
                return this.request(config)
                    .then(
                        (response: ISuccessResponse) => {
                            var data = response.data;

                            if (data.success !== true) {
                                this.logger.error(data.message, data.errors);
                                return this.$q.reject(data.message);
                            }

                            var responseObject = data.responseObject;
                            if (!responseObject) {
                                return data;
                            }

                            content = content.concat(responseObject.content || []);
                            if (responseObject.last === false) {
                                var config = response.config;
                                config.params.pageNumber += 1;
                                return next(config, content);
                            }

                            return content;
                        }
                    );
            };

            config.params = _.extend(config.params || {}, {pageSize: 20, pageNumber: 0});
            return next(config, []);
        }


        /**
         * In order to use any of the apis an oauth2 token will been be provided with each request.
         */
        getAccessToken() {
            var url = this.api('/securityservice/oauth/token');
            var params = {grant_type: 'client_credentials'};
            this.$http.defaults.headers.post.Authorization = 'Basic dmlwYWFzLXVzZXI6c2VjcmV0';

            return this.$http
                .post(url, null, {params: params})
                .then((response: any) => {
                    return response.data['access_token'];
                });
        }


        /**
         * Get a list of all promotions available.
         * These are just logical groupings of movies.
         * @return {ng.IPromise<models.IPromotion[]>} [description]
         */
        getPromotions(): ng.IPromise<models.IPromotion[]> {
            return this.requestAll({
                    method: 'GET',
                    url: this.api('/promotionservice/v1/promotion/findAll')
                });
        }

        /**
         * To get the details of this promotions call this API.
         * List of movies that are part of this grouping.
         * @param  {string} id [description]
         * @return {ng.IPromise<models.IPromotionDetails>}    [description]
         */
        getPromotion(id: string): ng.IPromise<models.IPromotionDetails> {
            return this.request({
                    method: 'GET',
                    url: this.api(`/promotionservice/v1/promotion/${id}`)
                })
                .then((response: any) => {
                    var data = response.data.responseObject;
                    data.products = data.products.content;
                    return data;
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
            return this.request({
                    method: 'GET',
                    url: this.api(`/productservice/v1/products/${id}/productDetails`)
                })
                .then((response) => {
                    return response.data.responseObject;
                });
        }

        /**
         * List of comments for the selected movie.
         * @param {string} productId  [description]
         */
        getReviews(productId: string) {
            return this.requestAll({
                    method: 'GET',
                    url: this.url.get(`/reviewservice/v1/review/findAll/product/${productId}`)
                });
        }

        /**
         * List of movies recommended
         * @param {string} productId  [description]
         */
        getRecommendations(productId: string) {
            return this.requestAll({
                    method: 'GET',
                    url: this.api(`/recommendationservice/recommendation/product/${productId}`)
                })
                .then(
                    (content: any) => {
                        console.log('getRecommendations', content);
                        return content;
                    }
                );
        }
    }

    angular
        .module('app.core')
        .service('dataService', DataService);
}
