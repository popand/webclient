namespace app.movies {
    'use strict';

    class MoviesDetailController {
        static $inject = [
            '$state',
            '$rootScope',
            '$uibModal',
            'dataService',
            'identityService',
            'logger',
            'video'
        ];

        comments: models.IReview[];
        relatedVideos: models.IProduct[];

        constructor(
            $state: ng.ui.IStateService,
            $rootScope: any,
            private $uibModal: ng.ui.bootstrap.IModalService,
            dataService: app.core.DataService,
            private identity: app.auth.IdentityService,
            private logger: blocks.logger.Logger,
            private video: models.Product
        ) {
            $rootScope.title = video.title;

            var productId = this.video.productId;

            dataService.getRecommendations(productId)
                .then(products => {
                    this.relatedVideos = products;
                });

            dataService.getReviews(productId)
                .then(reviews => {
                    this.comments = reviews;
                });
        }

        onPurchaseOption(option) {
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
