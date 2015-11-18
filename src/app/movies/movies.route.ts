namespace app.movies {
    'use strict';

    angular
        .module('app.movies')
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
                    title: 'Surf: Movie'
                }
            }
        ];

        states.forEach(function(state) {
            $stateProvider.state(state.state, state.config);
        });
    }
}
