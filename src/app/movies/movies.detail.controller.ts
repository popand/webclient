namespace app.movies {
    'use strict';

    class MoviesDetailController {
        static $inject = [
            '$rootScope',
            'dataService',
            'identityService',
            'braintreeModal',
            'previewModal',
            'video'
        ];

        relatedVideos: models.IProduct[];

        constructor(
            $rootScope: any,
            dataService: app.core.DataService,
            private identity: app.auth.IdentityService,
            private braintreeModal: BraintreeModalService,
            private previewModal: PreviewModalService,
            private video: models.Product
        ) {
            $rootScope.title = video.title;

            dataService.getRecommendations(this.video.productId)
                .then(products => {
                    this.relatedVideos = products;
                });
        }

        get canWatchNow() {
            return this.video.canWatchNow && this.identity.isLoggedIn;
        }

        get preview() {
            return _.first(this.video.previewList);
        }

        playPreview() {
            this.previewModal.open(this.preview);
        }

        onPurchaseOption(option: models.IPurchaseOption) {
            if (!this.identity.isLoggedIn) {
                this.identity.loginModal();
                return;
            }

            this.braintreeModal.open({
                productId: this.video.productId,
                offerId: option.offerId,
                price: option.price,
                paymentNonce: null
            });
        }
    }

    angular
        .module('app.movies')
        .controller('MoviesDetailController', MoviesDetailController);
}
