namespace app.movies {
    'use strict';

    class PreviewModalController {
        static $inject = [
            '$modalInstance',
            'preview'
        ];

        ready = false;

        constructor(
            private modal: ng.ui.bootstrap.IModalServiceInstance,
            private preview: models.IMedia
        ) {
            // The bitdash player can't calculate its size properly,
            // if modal isn't fully rendered
            this.modal.rendered.then(() => {
                this.ready = true;
            });
        }
    }

    export class PreviewModalService {
        static $inject = ['$uibModal'];

        constructor(private $uibModal: ng.ui.bootstrap.IModalService) {
        }

        open(preview: models.IMedia) {
            if (!preview) {
                return;
            }

            this.$uibModal.open({
                animation: true,
                controller: 'PreviewModalController',
                controllerAs: 'ctrl',
                windowClass: 'preview-modal',
                templateUrl: 'app/movies/preview_modal/preview_modal.html',
                resolve: {
                    preview: () => preview
                }
            });
        }

    }

    angular
        .module('app.movies')
        .controller('PreviewModalController', PreviewModalController)
        .service('previewModal', PreviewModalService);
}
