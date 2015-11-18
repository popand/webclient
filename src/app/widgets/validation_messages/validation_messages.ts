namespace app.widget {
    'use strict';

    class ValidationMessagesDirective implements ng.IDirective {
        scope = {};
        require = '^form';
        transclude = true;
        replace = true;
        templateUrl = 'app/widgets/validation_messages/validation_messages.html';
        link = function(scope: any, el: ng.IAugmentedJQuery, attrs: any, formCtrl: ng.IFormController) {
            var inputEl = el[0].parentElement.querySelector('[name]');
            var inputNgEl = angular.element(inputEl);
            var inputName = inputNgEl.attr('name');

            scope.input = formCtrl[inputName];
        };
    }

    angular
        .module('app.widgets')
        .directive('validationMessages', () => new ValidationMessagesDirective());

}
