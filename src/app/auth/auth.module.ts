namespace app.auth {
    'use strict';

    angular.module('app.auth', [
        'ngMessages',
        'ui.bootstrap',
        'ui.bootstrap.showErrors',
        'validation.match',
        'http-auth-interceptor'
    ]);
}
