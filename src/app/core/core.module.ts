namespace app.core {
    'use strict';

    angular
        .module('app.core', [
            'ngAnimate',
            'ngSanitize',
            'ngHolder',

            // 'blocks.exception',
            'blocks.logger',
            'blocks.router',

            'LocalStorageModule',
            'ui.router',
            'ui.router.util',
            'ui.bootstrap',
            'ng.shims.placeholder'
        ]);
}