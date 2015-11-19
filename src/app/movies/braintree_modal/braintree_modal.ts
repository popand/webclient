namespace app.movies {
    'use strict';

    class BraintreeModalController {
        static $inject = [
            '$modalInstance',
            '$braintree',
            'identityService',
            'CONFIG'
        ];

        ngModelOptions = {
            updateOn: 'default blur',
            debounce:  {
                'default': 250
            }
        };

        constructor(
            private $modalInstance: ng.ui.bootstrap.IModalServiceInstance,
            private $braintree: any,
            private identity: app.auth.IdentityService,
            config: any
        ) {
            $braintree.setup(config.braintree.token, 'dropin', {
                container: 'dropin-container'
            });
        }

        cancel() {
            this.$modalInstance.dismiss('cancel');
        }
    }

    angular
        .module('app.movies')
        .controller('BraintreeModalController', BraintreeModalController);
}
