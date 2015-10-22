namespace app.widgets {
    'use strict';

    interface OwlCarouselScope extends ng.IScope {
        owlOptions: {[index: string]: any};
        initCarousel: () => void;
    }

    class OwlCarouselController {
        static $inject = ['$scope'];

        constructor(private $scope: OwlCarouselScope) {
        }

        initCarousel() {
            this.$scope.initCarousel();
        }
    }

    class OwlCarouselDirective implements ng.IDirective {
        restrict = 'EA';
        transclude = false;
        scope = {owlOptions: '='};
        controller = OwlCarouselController;
        link = (scope: OwlCarouselScope, element: ng.IAugmentedJQuery) => {
            scope.initCarousel = function() {
                $(element).owlCarousel(scope.owlOptions);
            };
        };
    }

    class OwlCarouselItemDirective implements ng.IDirective {
        restrict = 'A';
        transclude = false;
        scope = false;
        require = '^owlCarousel';
        link = (scope: any, element: ng.IAugmentedJQuery, attrs: any, ctrl: any) => {
            if (scope.$last) {
                ctrl.initCarousel();
            }
        };
    }

    angular
        .module('app.widgets')
        .directive('owlCarousel', () => new OwlCarouselDirective())
        .directive('owlCarouselItem', () => new OwlCarouselItemDirective());
}
