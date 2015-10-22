namespace app.layout {
    'use strict';


    class TopNav implements ng.IDirective {
        scope = {};
        bindToController = true;
        controller = TopNavController;
        controllerAs = 'ctrl';
        restrict = 'EA';
        templateUrl = 'app/layout/top-nav.html';
    }

    class TopNavController {
        static $inject = ['$state'];

        constructor(private $state: ng.ui.IStateService) {
        }

        get inner() {
            const state = this.$state.current.name;
            const inner = [
                'movies.detail'
            ];
            return inner.indexOf(state) !== -1;
        }
    }

    angular.module('app.layout')
        .directive('topNav', () => new TopNav());
}
