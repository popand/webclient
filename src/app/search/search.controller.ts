namespace app.search {
    'use strict';

    class SearchController {
        static $inject = [
            '$state',
            '$stateParams',
            'results'
        ];

        query = '';
        label = '';

        constructor(
            private $state: ng.ui.IStateService,
            $stateParams: any,
            private results: models.IProduct[]
        ) {
            // TODO: What image type? And don't like product.image here.
            // TODO: pagination
            for (let product of this.results) {
                product.image = _.find(product.imageList, {imageType: 'Medium'});
            }

            this.query = $stateParams.query;
            this.label = this.getLabel(this.query);
        }

        private getLabel(query: string) {
            if (!query) {
                return '';
            }

            if (_.isEmpty(this.results)) {
                return 'No search results found';
            }

            return `Search results for: <span class="search-word">"${query}"</span>`;
        }

        search() {
            if (!this.query) {
                return;
            }

            this.$state.go('search', {query: this.query});
        }
    }

    angular
        .module('app.search')
        .controller('SearchController', SearchController);
}
