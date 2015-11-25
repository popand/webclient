namespace app.movies {
    'use strict';

    declare var bitdash: any;

    class BitdashController {
        static $inject = ['CONFIG'];

        video: models.IMedia;
        player: any;
        config: any;
        url: string;

        constructor(config: any) {
            this.url = config.bitdash.url;
            this.config = {
                key: config.bitdash.key,
                source: {
                    hls: this.video.url,
                    poster: config.bitdash.poster
                },
                playback: {
                    autoplay: true,
                    muted: false,
                    audioLanguage: ['en', 'es', 'de'],
                    subtitleLanguage: 'en'
                },
                style: {
                    width: '100%',
                    aspectratio: this.video.aspectRatio
                }
            };
        }

        destructor() {
            if (this.player) {
                this.player.destroy();
            }
        }

        init(player: any) {
            this.player = player.setup(this.config);
        }
    }

    class BitdashDirective implements ng.IDirective {
        restrict = 'EA';
        transclude = false;
        scope = {};
        controller = BitdashController;
        controllerAs = 'ctrl';
        bindToController = {
            video: '='
        };
        link = function(scope: any, element: ng.IAugmentedJQuery, attrs: any) {
            var url = scope.ctrl.url;
            var id = attrs.id || 'bitdash-player';

            if (!attrs.id) {
                element.attr('id', id);
            }

            if (typeof bitdash === 'undefined') {
                let script = document.createElement('script');
                script.src = url;
                document.body.appendChild(script);
                script.onload = init;
            } else {
                init();
            }

            scope.$on('$destroy', () => scope.ctrl.destructor());

            function init() {
                scope.ctrl.init(bitdash(id));
            }
        };
    }

    angular
        .module('app.movies')
        .directive('bitdash', () => new BitdashDirective());
}
