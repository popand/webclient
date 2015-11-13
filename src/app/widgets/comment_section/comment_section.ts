namespace app.widget {
    'use strict';

    class CommentSectionController {
        collapsed = false;
        comments: models.IReview[];

        constructor() {}

        onCollapseClick(event: ng.IAngularEvent) {
            event.preventDefault();
            this.collapsed = !this.collapsed;
        }
    }

    class CommentSectionDirective implements ng.IDirective {
        scope = {};
        controller = CommentSectionController;
        controllerAs = 'ctrl';
        bindToController = {
            comments: '='
        };
        templateUrl = 'app/widgets/comment_section/comment_section.html';
    }

    angular
        .module('app.widgets')
        .directive('commentSection', () => new CommentSectionDirective());
}
