namespace app.widget {
    'use strict';

    class CommentSectionController {
        static $inject = [
            '$scope',
            'dataService'
        ];

        collapsed = false;
        comments: models.IReview[];
        productId: string;

        submitted = false;
        comment = '';

        constructor(
            private $scope: ng.IScope,
            private libertas: app.core.DataService
        ) {
            libertas.getReviews(this.productId)
                .then(comments => this.comments = comments);
        }

        onCollapseClick(event: ng.IAngularEvent) {
            event.preventDefault();
            this.collapsed = !this.collapsed;
        }

        onSubmit(form: ng.IFormController) {
            if (form.$invalid) {
                this.$scope.$broadcast('show-errors-check-validity');
                this.submitted = true;
                return;
            }

            return this.libertas.createReview(this.productId, this.comment)
                .then(comment => this.comments.push(comment));
        }

    }

    class CommentSectionDirective implements ng.IDirective {
        scope = {};
        controller = CommentSectionController;
        controllerAs = 'ctrl';
        bindToController = {
            productId: '=forProductId'
        };
        templateUrl = 'app/widgets/comment_section/comment_section.html';
    }

    angular
        .module('app.widgets')
        .directive('commentSection', () => new CommentSectionDirective());
}
