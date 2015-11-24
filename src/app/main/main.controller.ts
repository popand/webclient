namespace app.main {
    'use strict';

    class MainController {
        static $inject = ['$timeout', 'dataService'];

        carousel: {};
        products: any;

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
                    autoPlay: 3000,
                    // Basic Speeds
                    slideSpeed : 800,
                    paginationSpeed : 1000,
                    rewindSpeed : 1000
                }
            };

            var tags = {
                carousel: 'Banner',
                shows: 'Small',
                latest: 'Medium'
            };

            _.each(tags, (imageType, tag) => dataService.getProductsByTags([tag])
                .then(products => {
                    for (let product of products) {
                        product.image = _.find(product.imageList, {imageType});
                    }

                    this.products[tag] = products;
                }));
        }
    }

    angular
        .module('app.main')
        .controller('MainController', MainController);
}
