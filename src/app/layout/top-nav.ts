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
        isNavbarCollapsed = true;

        constructor(private $state: ng.ui.IStateService) {
        }

        toggleNavBar() {
            this.isNavbarCollapsed = !this.isNavbarCollapsed;
        }
    }

    angular.module('app.layout')
        .directive('topNav', () => new TopNav());
}
