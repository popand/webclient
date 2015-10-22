namespace app.main {
    'use strict';

    class MainController {
        static $inject = ['$timeout', 'dataService'];

        carousel: {};
        products: {
            carousel: models.IProduct[];
            shows: models.IProduct[];
            latest: models.IProduct[];
        };

        constructor($timeout: ng.ITimeoutService, dataService: app.core.DataService) {
            this.products = {
                carousel: [],
                shows: [],
                latest: []
            };

            this.carousel = {
                small: {
                    items : 5, // 5 items above 1000px browser width
                    itemsDesktop : [1200, 4], // 4 items between 1000px and 901px
                    itemsTablet: [600, 2], // 2 items between 600 and 0
                    itemsMobile : false, // itemsMobile disabled - inherit from itemsTablet option
                    navigation : true,
                    navigationText : ['', ''],
                    autoPlay: 2600
                },
                big: {
                    navigation : true,
                    navigationText : ['', ''],
                    singleItem : true,
                    autoPlay: 3600,
                    // Basic Speeds
                    slideSpeed : 800,
                    paginationSpeed : 1000,
                    rewindSpeed : 1000
                }
            };


            dataService.getPromotionsWithDetails()
                .then(promotions => {
                    this.products.carousel = filter(promotions, 'Carousel', 'Banner');
                    this.products.shows = filter(promotions, 'Shows', 'Box');
                    this.products.latest = filter(promotions, 'Latest', 'Medium');
                });


            function filter(list: models.IPromotionDetails[], name: string, imageType: string): models.IProduct[] {
                var products = _.chain(list)
                    .filter(x => x.promotion.name === name)
                    .pluck('products')
                    .flatten()
                    .value();

                for (let product of products) {
                    product.image = _.find(product.imageList, {imageType});
                }
                return products;
            }
        }
    }

    angular
        .module('app.main')
        .controller('MainController', MainController);
}
