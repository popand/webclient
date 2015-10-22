namespace app.movies {
    'use strict';

    class CommentSectionController {
        static $inject = ['$stateParams', 'dataService'];
        collapsed = false;

        constructor(
            $stateParams: any,
            dataService: app.core.DataService
        ) {
            dataService.getReviews($stateParams.id);
        }

        onCollapseClick(event: ng.IAngularEvent) {
            event.preventDefault();
            this.collapsed = !this.collapsed;
        }
    }

    class CommentSectionDirective implements ng.IDirective {
        scope = {};
        controller = CommentSectionController;
        controllerAs = 'ctrl';
        bindToController = {};
        templateUrl = 'app/movies/comment_section.html';
    }

    angular
        .module('app.movies')
        .directive('commentSection', () => new CommentSectionDirective());
}
