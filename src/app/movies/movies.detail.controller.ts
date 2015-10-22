namespace app.movies {
    'use strict';

    class MoviesDetailController {
        static $inject = [
            '$state',
            '$stateParams',
            '$rootScope',
            'dataService',
            'logger'
        ];

        video = {title: '', longDescription: ''};
        relatedVideos: models.IProduct[] = [];

        constructor(
            $state: ng.ui.IStateService,
            $stateParams: any,
            $rootScope: any,
            dataService: app.core.DataService,
            logger: blocks.logger.Logger
        ) {
            var id = $stateParams.id;

            dataService.getProduct(id)
                .then(
                    (product: models.IProduct) => {
                        this.video = product;
                        $rootScope.title = product.title;
                    }
                )
                .catch(response => {
                    logger.error('Failed to fetch a product', response);
                    $state.go('404');
                });

            dataService.getRecommendations(id)
                .then(products => {
                    for (let product of products) {
                        product.image = _.find(product.imageList, {imageType: 'Medium'});
                    }

                    this.relatedVideos = products;
                });
        }
    }

    angular
        .module('app.movies')
        .controller('MoviesDetailController', MoviesDetailController);
}
