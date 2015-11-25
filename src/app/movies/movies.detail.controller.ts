namespace app.movies {
    'use strict';

    class MoviesDetailController {
        static $inject = [
            '$state',
            '$rootScope',
            '$uibModal',
            'dataService',
            'identityService',
            'previewModal',
            'logger',
            'video'
        ];

        relatedVideos: models.IProduct[];

        constructor(
            $state: ng.ui.IStateService,
            $rootScope: any,
            private $uibModal: ng.ui.bootstrap.IModalService,
            dataService: app.core.DataService,
            private identity: app.auth.IdentityService,
            private previewModal: PreviewModalService,
            private logger: blocks.logger.Logger,
            private video: models.Product
        ) {
            $rootScope.title = video.title;

            var productId = this.video.productId;

            dataService.getRecommendations(productId)
                .then(products => {
                    this.relatedVideos = products;
                });
        }

        get preview() {
            return _.first(this.video.previewList);
        }

        playPreview() {
            this.previewModal.open(this.preview);
        }

        onPurchaseOption(option: models.IPurchaseOption) {
            var purchase = () => {
                if (!this.identity.isLoggedIn) {
                    this.logger.warning('[onPurchaseOption] not logged in');
                    return;
                }

                this.$uibModal.open({
                    controllerAs: 'ctrl',
                    controller: 'BraintreeModalController',
                    templateUrl: 'app/movies/braintree_modal/braintree_modal.html'
                });
            };

            if (this.identity.isLoggedIn) {
                purchase();
                return;
            }

            this.identity.loginModal().then(purchase);
        }
    }

    angular
        .module('app.movies')
        .controller('MoviesDetailController', MoviesDetailController);
}
