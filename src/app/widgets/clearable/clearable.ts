namespace app.widget {
    'use strict';

    class ClearableDirective implements ng.IDirective {
        link = function(scope: ng.IScope, element: any) {
            element.clearSearch();
        };
    }


    angular
        .module('app.widgets')
        .directive('clearable', () => new ClearableDirective());
}
