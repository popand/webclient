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
            private video: models.IProduct
        ) {
            var id = video.productId;
            $rootScope.title = video.title;

            dataService.getRecommendations(id)
                .then(products => {
                    for (let product of products) {
                        product.image = _.find(product.imageList, {imageType: 'Medium'});
                    }

                    this.relatedVideos = products;
                });

            dataService.getReviews(id)
                .then(reviews => {
                    this.comments = reviews;
                });
        }

        get canWatch() {
            return this.video.canWatchNow === true;
        }

        get canRent() {
            return !this.canWatch && this.identity.isLoggedIn && this.price;
        }

        get price() {
            return _.get(this.video, 'purchaseOptionList[0].price', '');
        }

        rent() {
            var doRent = () => {
                if (!this.identity.isLoggedIn) {
                    this.logger.warning('[doRent] not logged in');
                    return;
                }

                this.$uibModal.open({
                    controllerAs: 'ctrl',
                    controller: 'BraintreeModalController',
                    templateUrl: 'app/movies/braintree_modal/braintree_modal.html'
                });
            };

            if (this.identity.isLoggedIn) {
                doRent();
                return;
            }

            this.identity.loginModal().then(doRent);
        }
    }

    angular
        .module('app.movies')
        .controller('MoviesDetailController', MoviesDetailController);
}
