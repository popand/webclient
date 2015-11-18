namespace app.auth {
    'use strict';

    angular
        .module('app.auth')
        .config(configureStates)
        .config(configureAuthService);

    configureStates.$inject = ['$stateProvider'];

    /* @ngInject */
    function configureStates($stateProvider: ng.ui.IStateProvider) {
        var states = [
            {
                state: 'registration',
                config: {
                    url: '/registration',
                    templateUrl: 'app/auth/registration.html',
                    controller: 'RegistrationController',
                    controllerAs: 'ctrl',
                    title: 'Surf: Registration',
                    registration: true
                }
            }
        ];

        states.forEach(function(state) {
            $stateProvider.state(state.state, state.config);
        });
    }

    configureAuthService.$inject = ['$httpProvider'];

    /* @ngInject */
    function configureAuthService($httpProvider: ng.IHttpProvider) {
        var interceptors = $httpProvider.interceptors;
        var index = _.findIndex(interceptors, (x: any[]) => _.contains(x, 'httpBuffer'));

        interceptors[index] = ['$rootScope', '$q', 'httpBuffer', authInterceptor];

        function authInterceptor($rootScope: any, $q: any, httpBuffer: any) {
            return {
                responseError: function(rejection: any) {
                    if (!rejection.config.ignoreAuthModule) {
                        switch (rejection.status) {
                        case 401:
                            if (rejection.data.error === 'invalid_token') {
                                return $q.reject(rejection);
                            }

                            var deferred = $q.defer();
                            httpBuffer.append(rejection.config, deferred);
                            $rootScope.$broadcast('event:auth-loginRequired', rejection);
                            return deferred.promise;
                        case 403:
                            $rootScope.$broadcast('event:auth-forbidden', rejection);
                            break;
                        }
                    }
                    // otherwise, default behaviour
                    return $q.reject(rejection);
                }
            };
        }
    }

}
