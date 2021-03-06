namespace app.core {
    'use strict';

    angular
        .module('app.core')
        .config(configureStates)
        .run(appRun);

    appRun.$inject = ['RouterHelper'];
    function appRun(RouterHelper: blocks.router.RouterHelper) {}

    configureStates.$inject = [
        '$stateProvider',
        '$locationProvider',
        '$urlRouterProvider',
        '$urlMatcherFactoryProvider'
    ];

    /* @ngInject */
    function configureStates(
        $stateProvider: ng.ui.IStateProvider,
        $locationProvider: ng.ILocationProvider,
        $urlRouterProvider: ng.ui.IUrlRouterProvider,
        $urlMatcherFactoryProvider: ng.ui.IUrlMatcherFactory
    ) {
        var otherwise = '/404';
        var states = getStates();

        states.forEach(function(state) {
            $stateProvider.state(state.state, state.config);
        });

        $urlRouterProvider.otherwise(otherwise);

        // make slashes optional in route urls
        $urlMatcherFactoryProvider.strictMode(false);

        // needs server setup
        $locationProvider.html5Mode(false);
    }

    function getStates() {
        return [
            {
                state: '404',
                config: {
                    url: '/404',
                    templateUrl: 'app/core/404.html',
                    title: 'Surf: Page not found'
                }
            }
        ];
    }
}
