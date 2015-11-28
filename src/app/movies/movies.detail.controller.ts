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

            this.$uibModal.open({
                controllerAs: 'ctrl',
                controller: 'BraintreeModalController',
                templateUrl: 'app/movies/braintree_modal/braintree_modal.html'
            });
        }
    }

    angular
        .module('app.movies')
        .controller('MoviesDetailController', MoviesDetailController);
}
