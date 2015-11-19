namespace app.movies {
    'use strict';

    class MoviesWatchController {
        static $inject = [
            '$state',
            '$rootScope',
            'dataService',
            'logger',
            'video'
        ];

        comments: models.IReview[];
        relatedVideos: models.IProduct[];

        constructor(
            $state: ng.ui.IStateService,
            $rootScope: any,
            dataService: app.core.DataService,
            logger: blocks.logger.Logger,
            private video: models.IProduct
        ) {
            var id = this.video.productId;
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
    }

    angular
        .module('app.movies')
        .controller('MoviesWatchController', MoviesWatchController);
}
