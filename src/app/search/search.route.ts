namespace app.search {
    'use strict';

    angular
        .module('app.search')
        .config(configureStates);

    configureStates.$inject = ['$stateProvider'];

    /* @ngInject */
    function configureStates($stateProvider: ng.ui.IStateProvider) {
        var states = [
            {
                state: 'search',
                config: {
                    url: '/search/:query',
                    templateUrl: 'app/search/search.html',
                    controller: 'SearchController',
                    controllerAs: 'ctrl',
                    title: 'Surf: Search result',
                    resolve: {
                        results: searchResults
                    }
                }
            }
        ];

        states.forEach(function(state) {
            $stateProvider.state(state.state, state.config);
        });
    }

    searchResults.$inject = ['$q', '$stateParams', 'dataService'];
    function searchResults($q: ng.IQService, $stateParams: any, libertas: app.core.DataService) {
        return libertas.searchProducts($stateParams.query)
            .catch((rejection: any) => {
                if (rejection.status === 404) {
                    return [];
                }
                return $q.reject(rejection);
            });
    }
}
