namespace app.widget {
    'use strict';


    class VideoBlockDirective implements ng.IDirective {
        scope = {};
        transclude = true;
        controller = function() {};
        controllerAs = 'ctrl';
        bindToController = {
            videos: '=',
            label: '@'
        };
        templateUrl = 'app/widgets/video_block/video_block.html';
    }

    function productsByImageWidth() {
        // See: http://stackoverflow.com/a/16513030/521590
        return _.memoize(chunkByWeight, chunkByWeightResolver);

        function chunkByWeight(items: models.IProduct[], chunkWeight = 3) {
            items = items.filter(x => !!x.image);

            if (_.isEmpty(items)) {
                return [];
            }

            // Find image weights based on their width.
            // items = _.clone(items);
            var sum = _.sum(items.map(x => x.image.imageWidth));
            var avg = sum / items.length;
            var weights = items.map((x, i) => {
                return {index: i, weight: Math.round(x.image.imageWidth / avg)};
            });

            // Now we have a sequence like [1, 1, 1, 2, 1, 1, 2].
            // Split it to chunks of chunkWeight size.
            var chunks: any[] = [];
            var chunk: any[] = [];
            var weight = 0;

            var push = function() {
                chunks.push(chunk);
                chunk = [];
                weight = 0;
            };

            while (weights.length) {
                let item = weights.shift();

                if (weight + item.weight > 3) {
                    weights.push(item);
                    continue;
                }

                var product: any = items[item.index];
                product.weight = item.weight;
                weight += item.weight;
                chunk.push(product);

                if (weight === 3) {
                    push();
                }
            }

            if (chunk.length) {
                push();
            }

            return chunks;
        }

        function chunkByWeightResolver(items: models.IProduct[], chunkWeight = 3) {
            return _.isEmpty(items) ? '' : items.reduce((sum, x) => sum + x.id, chunkWeight.toString());
        }
    }

    angular
        .module('app.widgets')
        .filter('productsByImageWidth', productsByImageWidth)
        .directive('videoBlock', () => new VideoBlockDirective());

}
