namespace app.movies {
    'use strict';

    class MoviesWatchController {
        static $inject = [
            '$state',
            '$rootScope',
            'dataService',
            'video'
        ];

        comments: models.IReview[];
        relatedVideos: models.IProduct[];

        constructor(
            $state: ng.ui.IStateService,
            $rootScope: any,
            dataService: app.core.DataService,
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
    }

    angular
        .module('app.movies')
        .controller('MoviesWatchController', MoviesWatchController);
}
