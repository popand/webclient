namespace app.core {
    'use strict';

    configure.$inject = [
        'CONFIG',
        '$logProvider',
        'localStorageServiceProvider'
    ];

    /* @ngInject */
    function configure(
        config: any,
        $logProvider: ng.ILogProvider,
        localStorageServiceProvider: ng.local.storage.ILocalStorageServiceProvider
    ) {
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(config.debug);
        }

        localStorageServiceProvider
            .setPrefix(config.localStoragePrefix)
            .setNotify(true, true);

    }

    angular.module('app.core')
        .config(configure);
}
