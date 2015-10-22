namespace app.main {
    'use strict';

    angular
        .module('app.main')
        .config(configureStates);

    configureStates.$inject = ['$stateProvider'];

    /* @ngInject */
    function configureStates($stateProvider: ng.ui.IStateProvider) {
        var states = [
            {
                state: 'main',
                config: {
                    url: '',
                    templateUrl: 'app/main/main.html',
                    controller: 'MainController',
                    controllerAs: 'ctrl',
                    title: 'Shuvit TV :: Main'
                }
            }
        ];

        states.forEach(function(state) {
            $stateProvider.state(state.state, state.config);
        });
    }
}
