namespace app.movies {
    'use strict';

    declare var braintree: any;

    class BraintreeModalController {
        static $inject = [
            '$uibModalInstance',
            '$scope',
            'dataService',
            'token',
            'productId',
            'offer',
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
            productId: string,
            offer: models.IOffer,
            logger: blocks.logger.Logger
        ) {
            var onPaymentMethodReceived = (payload: any) => {
                var data = {
                    paymentNonce: payload.nonce,
                    offer: offer,
                    productId: productId
                };

                libertas.purchaseCheckout(data)
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

        open(productId: string, offerId: string) {
            return this.$uibModal.open({
                controllerAs: 'ctrl',
                controller: 'BraintreeModalController',
                templateUrl: 'app/movies/braintree_modal/braintree_modal.html',
                resolve: {
                    productId: () => productId,
                    token: () => this.libertas.getPurchaseClientToken(),
                    offer: () => this.libertas.getOffer(offerId)
                }
            });
        }

    }

    angular
        .module('app.movies')
        .controller('BraintreeModalController', BraintreeModalController)
        .service('braintreeModal', BraintreeModalService);
}
