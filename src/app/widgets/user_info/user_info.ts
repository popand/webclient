namespace app.widgets {
    'use strict';

    class UserInfoController {
        static $inject = ['identityService'];
        constructor(private identity: app.auth.IdentityService) {}
    }

    class UserInfoDirective implements ng.IDirective {
        scope = {};
        controller = UserInfoController;
        controllerAs = 'ctrl';
        bindToController = {};
        templateUrl = 'app/widgets/user_info/user_info.html';
    }

    angular
        .module('app.widgets')
        .directive('userInfo', () => new UserInfoDirective());
}
