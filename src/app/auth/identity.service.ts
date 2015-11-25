namespace app.auth {
    'use strict';

    const STORAGE_USER_KEY = 'libertas.user';
    const STORAGE_USER_TOKEN_KEY = 'libertas.user_token';

    export interface ICredentials {
        email: string;
        password: string;
    }

    export class IdentityService {
        static $inject = [
            '$rootScope',
            '$state',
            '$uibModal',
            'authService',
            'localStorageService',
            'dataService'
        ];

        public username = '';
        public customerId = '';

        constructor(
            $rootScope: any,
            private $state: ng.ui.IStateService,
            private $uibModal: ng.ui.bootstrap.IModalService,
            private authService: ng.httpAuth.IAuthService,
            private storage: ng.local.storage.ILocalStorageService,
            private libertas: core.DataService
        ) {
            this.load();

            $rootScope.$on('event:auth-loginRequired', () => this.loginModal());
        }


        public login(credentials: ICredentials, remember = false) {
            var success = (response: any) => {
                var user = response.data.responseObject;
                this.storage.set(STORAGE_USER_TOKEN_KEY, user.userToken);

                this.username = user.userName;
                this.customerId = user.customerId;

                if (remember) {
                    this.save();
                }

                this.authService.loginConfirmed();
            };

            var config = {
                method: 'POST',
                url: this.url('/login'),
                data: credentials
            };

            return this.libertas.request(config).then(success);
        }

        public logout() {
            if (this.storage.get(STORAGE_USER_TOKEN_KEY)) {
                // The service needs user token, so delete it only when we finally done with the request
                this.libertas
                    .request({ method: 'POST', url: this.url('/logout')} )
                    .finally(() => this.storage.remove(STORAGE_USER_TOKEN_KEY));
            }

            this.username = '';
            this.customerId = '';
            this.storage.remove(STORAGE_USER_KEY);
        }

        public save() {
            this.storage.set(STORAGE_USER_KEY, {
                username: this.username,
                customerId: this.customerId
            });
        }

        public load() {
            var user: any = this.storage.get(STORAGE_USER_KEY);

            if (!user) {
                this.logout();
                return;
            }

            this.username = user.username;
            this.customerId = user.customerId;
        }

        public loginModal() {
            this.logout();

            var instance = this.$uibModal.open({
                animation: true,
                controller: 'LoginModalController',
                controllerAs: 'ctrl',
                windowClass: 'login-modal',
                templateUrl: 'app/auth/login_modal/login_modal.html'
            });

            return instance.result.then(null, (reason) => {
                this.authService.loginCancelled();

                if (reason === 'registration') {
                    this.$state.go('registration');
                }

                return reason;
            });
        }

        get isLoggedIn() {
            return !!this.storage.get(STORAGE_USER_TOKEN_KEY);
        }

        private url(path: string) {
            return this.libertas.api(`/customerservice/v1/customer${path}`);
        }
    }


    angular
        .module('app.auth')
        .service('identityService', IdentityService);
}
