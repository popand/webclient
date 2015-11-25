namespace app.movies {
    'use strict';

    angular
        .module('app.movies')
        .constant('clientTokenPath', '/') // TODO: temporary
        .config(configureStates);

    configureStates.$inject = ['$stateProvider'];

    /* @ngInject */
    function configureStates($stateProvider: ng.ui.IStateProvider) {
        var states = [
            {
                state: 'movies',
                config: {
                    abstract: true,
                    url: '/movies',
                    template: '<ui-view/>'
                }
            },
            {
                state: 'movies.detail',
                config: {
                    url: '/:id',
                    templateUrl: 'app/movies/movies.detail.html',
                    controller: 'MoviesDetailController',
                    controllerAs: 'ctrl',
                    title: 'Surf: Movie',
                    resolve: {
                        video: resolveVideo
                    }
                }
            },
            {
                state: 'movies.watch',
                config: {
                    url: '/:id/watch',
                    templateUrl: 'app/movies/movies.watch.html',
                    controller: 'MoviesWatchController',
                    controllerAs: 'ctrl',
                    title: 'Surf: Inner',
                    resolve: {
                        video: resolveVideo
                    }
                }
            }
        ];

        states.forEach(function(state) {
            $stateProvider.state(state.state, state.config);
        });
    }

    resolveVideo.$inject = ['$stateParams', 'dataService'];
    function resolveVideo($stateParams: any, libertas: app.core.DataService) {
        return libertas.getProduct($stateParams.id);
    }
}
