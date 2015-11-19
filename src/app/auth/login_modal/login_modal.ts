namespace app.auth {
    'use strict';

    class LoginModalController {
        static $inject = [
            'identityService',
            '$modalInstance'
        ];

        ngModelOptions = {
            updateOn: 'default blur',
            debounce:  {
                'default': 250
            }
        };

        serverErrors: string[] = [];
        submitted = false;
        remember = false;
        credentials = {
            email: '',
            password: ''
        };

        constructor(
            private identity: app.auth.IdentityService,
            private $modalInstance: ng.ui.bootstrap.IModalServiceInstance
        ) {
        }

        login(form: ng.IFormController) {
            this.serverErrors = [];

            if (form.$invalid) {
                this.submitted = true;
                return;
            }

            return this.identity
                .login(this.credentials, this.remember)
                .then(
                    () => this.$modalInstance.close('loggedIn'),
                    (rejection: any) => {
                        this.serverErrors = rejection.data.errors;
                    }
                );
        }

        registration() {
            this.$modalInstance.dismiss('registration');
        }

        cancel() {
            this.$modalInstance.dismiss('cancel');
        }
    }

    angular
        .module('app.auth')
        .controller('LoginModalController', LoginModalController);
}
