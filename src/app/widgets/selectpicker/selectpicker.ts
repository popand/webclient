namespace app.widget {
    'use strict';

    class SelectPickerDirective implements ng.IDirective {
        link = function(scope: ng.IScope, element: any) {
            element.toggleClass('selectpicker', true);
            element.selectpicker();
        };
    }


    angular
        .module('app.widgets')
        .directive('selectpicker', () => new SelectPickerDirective());
}
