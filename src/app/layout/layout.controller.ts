namespace app.layout {
    'use strict';

    class LayoutController {
        static $inject = ['$scope', '$http', '$timeout'];

        constructor(
            $scope: ng.IScope,
            $http: ng.IHttpService,
            $timeout: ng.ITimeoutService
        ) {
        }
    }

    angular
        .module('app.layout')
        .controller('LayoutController', LayoutController);
}
