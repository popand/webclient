namespace app.movies {
    'use strict';

    declare var braintree: any;

    class BraintreeModalController {
        static $inject = [
            '$uibModalInstance',
            '$scope',
            'dataService',
            'token',
            'payload',
            'logger'
        ];

        checkout: any;
        processing = false;
        error = '';

        constructor(
            private modal: ng.ui.bootstrap.IModalServiceInstance,
            $scope: ng.IScope,
            libertas: app.core.DataService,
            token: string,
            payload: models.IPurchaseRequestData,
            logger: blocks.logger.Logger
        ) {
            var onPaymentMethodReceived = (data: any) => {
                payload.paymentNonce = data.nonce;

                libertas.purchaseCheckout(payload)
                    .then(
                        response => this.close(response),
                        (reason: any) => {
                            logger.error('PurchaseCheckout', reason);
                            var message = reason.data.message || reason.statusText;
                            this.error = `Checkout failed: ${message}`;
                        }
                    )
                    .finally(() => this.processing = false);
            };

            braintree.setup(token, 'dropin', {
                container: 'dropin-container',
                onReady: (integration: any) => {
                    $scope.$apply(() => {
                        this.checkout = integration;
                    });
                },
                onError: (error: any) => {
                    $scope.$apply(() => {
                        this.processing = false;
                    });
                },
                onPaymentMethodReceived: onPaymentMethodReceived
            });
        }

        onSubmit() {
            this.error = '';
            this.processing = true;
        }

        close(result: any) {
            if (!this.checkout) {
                return;
            }

            this.processing = true;
            this.checkout.teardown(() => {
                this.checkout = null;
                this.modal.close(result);
            });
        }
    }

    export class BraintreeModalService {
        static $inject = ['$uibModal', 'dataService'];

        constructor(
            private $uibModal: ng.ui.bootstrap.IModalService,
            private libertas: app.core.DataService
        ) {
        }

        open(payload: models.IPurchaseRequestData) {
            return this.$uibModal.open({
                controllerAs: 'ctrl',
                controller: 'BraintreeModalController',
                templateUrl: 'app/movies/braintree_modal/braintree_modal.html',
                resolve: {
                    payload: () => payload,
                    token: () => this.libertas.getPurchaseClientToken()
                }
            });
        }

    }

    angular
        .module('app.movies')
        .controller('BraintreeModalController', BraintreeModalController)
        .service('braintreeModal', BraintreeModalService);
}
