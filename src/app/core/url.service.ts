namespace app.core {
    'use strict';

    export class UrlService {
        static $inject = ['CONFIG'];
        private baseUrl = '/';

        constructor(config: any) {
            this.baseUrl = config.apiUrl || '/';
        }

        get(path: string) {
            return this.baseUrl + path;
        }
    }


    angular
        .module('app.core')
        .service('url', UrlService);
}
