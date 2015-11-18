namespace app.auth {
    'use strict';

    class RegistrationController {
        static $inject = [
            '$scope',
            '$state',
            'identityService',
            'dataService'
        ];

        serverErrors: string[] = [];

        user: models.ICustomer = {
            email: '',
            password: ''
        };

        constructor(
            private $scope: ng.IScope,
            private $state: ng.ui.IStateService,
            private identity: app.auth.IdentityService,
            private libertas: app.core.DataService
        ) {
        }

        submit(form: ng.IFormController) {
            console.log(form);
            if (form.$invalid) {
                this.$scope.$broadcast('show-errors-check-validity');
                return;
            }

            this.serverErrors = [];
            this.$scope.$broadcast('show-errors-reset');

            var config = {
                method: 'POST',
                url: this.libertas.api('/customerservice/v1/customer/register'),
                data: this.user
            };

            return this.libertas.request(config)
                .then(
                    (response: any) => {
                        this.$state.go('main');
                        this.identity.loginModal();
                    },
                    (rejection: any) => {
                        this.serverErrors = rejection.data.errors;
                    }
                );
        }
    }

    angular
        .module('app.auth')
        .controller('RegistrationController', RegistrationController);
}
