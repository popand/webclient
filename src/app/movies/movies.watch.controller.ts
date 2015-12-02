namespace app.movies {
    'use strict';

    class MoviesWatchController {
        static $inject = [
            '$state',
            '$rootScope',
            'dataService',
            'video'
        ];

        playerVideo: models.IPlaybackInfo;
        relatedVideos: models.IProduct[];

        constructor(
            $state: ng.ui.IStateService,
            $rootScope: any,
            dataService: app.core.DataService,
            private video: models.Product
        ) {
            $rootScope.title = video.title;

            var productId = this.video.productId;
            var purchaseOption = this.video.purchaseOptionList[0];
            var media = purchaseOption.mediaList[0];
            var offerId = purchaseOption.offerId;
            var targetDevice = media.targetDevice;

            dataService.getPlaybackUrl(productId, offerId, targetDevice)
                .then(video => {
                    this.playerVideo = video;
                });

            dataService.getRecommendations(productId)
                .then(products => {
                    this.relatedVideos = products;
                });
        }
    }

    angular
        .module('app.movies')
        .controller('MoviesWatchController', MoviesWatchController);
}
