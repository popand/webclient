/* tslint:disable:max-line-length */
var expect = chai.expect;

describe('DataService', () => {
    var mocks = getMocks();
    var dataService: app.core.DataService;
    var localStorageService: ng.local.storage.ILocalStorageService;
    var $httpBackend: ng.IHttpBackendService;
    var $rootScope: ng.IRootScopeService;
    var tokenUrl: string;

    beforeEach(angular.mock.module('app.core'));

    beforeEach(inject(function(
        $injector: ng.auto.IInjectorService,
        _$rootScope_: ng.IRootScopeService,
        _$httpBackend_: ng.IHttpBackendService,
        _dataService_: app.core.DataService,
        _localStorageService_: ng.local.storage.ILocalStorageService
    ) {
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        localStorageService = _localStorageService_;
        dataService = _dataService_;
        tokenUrl = dataService.api('/securityservice/oauth/token?grant_type=client_credentials');

        // See: https://github.com/angular-ui/ui-router/issues/212
        $httpBackend.when('GET', 'app/core/404.html').respond(200, 'mock 404');
        localStorageService.clearAll();
    }));

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('authenticate()', () => {
        it('should store the token in local storage', () => {
            let response = $httpBackend.when('POST', tokenUrl);
            let promise = dataService.authenticate();
            const token = mocks.token['access_token'];

            expect(localStorageService.get('auth.token')).to.equal(null);
            expect(promise).eventually.to.equal(token);
            expect(promise).eventually.to.be.a('string');

            response.respond(200, mocks.token);
            $httpBackend.flush();

            expect(localStorageService.get('auth.token')).to.equal(token);
        });
    });

    describe('request()', () => {
        it('should ask for an access token', () => {
            var authenticate = sinon.spy(dataService, 'authenticate');

            $httpBackend.expectPOST(tokenUrl).respond(200, mocks.token);
            $httpBackend.expectGET('/').respond(200, 'value');

            var promise = dataService.request({method: 'GET', url: '/'});
            promise.should.eventually.have.property('data', 'value');
            promise.should.eventually.have.deep.property(
                'config.headers.Authorization',
                'Bearer ' + mocks.token['access_token']
            );

            $httpBackend.flush();
            authenticate.should.have.callCount(1);

        });

        it('should fail if there is no access token', () => {
            var authenticate = sinon.spy(dataService, 'authenticate');

            $httpBackend.expectPOST(tokenUrl).respond(200, '');

            dataService
                .request({method: 'GET', url: '/'}, true)
                .should.be.rejectedWith('no token');

            $httpBackend.flush();
            authenticate.should.have.callCount(1);
        });

        it('should ask for new token if the server returned not authorized', () => {
            var authenticate = sinon.spy(dataService, 'authenticate');
            localStorageService.set('auth.token', 'invalid_token');

            $httpBackend.expectGET('/').respond(401, 'not authorized');
            $httpBackend.expectPOST(tokenUrl).respond(200, mocks.token);
            $httpBackend.expectGET('/').respond(200, 'value');

            var promise = dataService.request({method: 'GET', url: '/'});

            promise.should.eventually.have.property('data', 'value');
            promise.should.eventually.have.deep.property(
                'config.headers.Authorization',
                'Bearer ' + mocks.token['access_token']
            );

            $httpBackend.flush();
            authenticate.should.have.callCount(2);
        });

        it('should ask for new token only once', () => {
            var authenticate = sinon.spy(dataService, 'authenticate');
            localStorageService.set('auth.token', 'invalid_token');

            $httpBackend.expectGET('/').respond(401, 'not authorized');
            $httpBackend.expectPOST(tokenUrl).respond(200, mocks.token);
            $httpBackend.expectGET('/').respond(401, 'not authorized');

            var promise = dataService.request({method: 'GET', url: '/'});

            promise.should.eventually.have.property('data', 'not authorized');
            promise.should.eventually.have.property('status', 401);
            promise.should.eventually.have.deep.property(
                'config.headers.Authorization',
                'Bearer ' + mocks.token['access_token']
            );

            $httpBackend.flush();
            authenticate.should.have.callCount(2);
        });
    });
});


function getMocks() {
    const data: any = {
        token: {
            'access_token': 'eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsidmlwYWFzLWFwaSJdLCJzY29wZSI6WyJyZWFkIiwid3JpdGUiXSwiZXhwIjoxNDQ0NTA5NzE3LCJhdXRob3JpdGllcyI6WyJST0xFX0NMSUVOVCJdLCJqdGkiOiIxMDcxZjQ0My1jNzY0LTRiZjAtOTZlMC1mMGQyNDE0NDU4MGIiLCJjbGllbnRfaWQiOiJ2aXBhYXMtdXNlciJ9.cI_pTgfUwrQaloAbC8EgePRtdzo_ZpsMoyn1vkYcTIESYHhQgF8dbF4x0Wh9y0oSGhCxntfYT7tnM5aZWlPDo99OypF06fd-wQmEf_ss47hxHm_uyHNbcqZDEPztAtWnaY6a2ADjOednNUPO-XzqfL-3iG918glaN5UP_Renj3A43g5EYoScDE_tFypDAbaloJLQ3sspJYDGGDyVEJhk_vzbb1w2DcTRa0GngczI_HmYv1Ct-6wgC-erUhWj3XuSnOJoXJ3BYyVK-pXRClZh0PoWXwfJoiVyUyNIZI6r4I2XdRCqAhBU9MecVdjxOVkiGXDw_uX0_UjYKN-cual0OA',
            'token_type': 'bearer',
            'expires_in': 7669,
            'scope': 'read write',
            'jti': '1071f443-c764-4bf0-96e0-f0d24144580b'
        },
        promotions: {
            'content': [{
                'id': 'db88f59a-0e4f-4622-987d-e3859ee8d00f',
                'name': 'latest',
                'tenantId': 'vipaas-user',
                'tags': ['latest'],
                'deleteDate': null
            },
            {
                'id': '9b31ac99-dc0e-455d-adb4-6746e5145299',
                'name': 'shows',
                'tenantId': 'vipaas-user',
                'tags': ['shows'],
                'deleteDate': null
            },
            {
                'id': '9f720e70-05fb-448e-ab0d-c57a8dd871a5',
                'name': 'carousel',
                'tenantId': 'vipaas-user',
                'tags': ['carousel'],
                'deleteDate': null
            },
            {
                'id': '705c83bc-ce8c-4d2c-8234-0d9e5d4b5745',
                'name': 'promo4',
                'tenantId': 'vipaas-user',
                'tags': ['Action'],
                'deleteDate': null
            }],

            'totalElements': 4,
            'totalPages': 1,
            'last': true,
            'size': 20,
            'number': 0,
            'first': true,
            'numberOfElements': 4,
            'sort': null
        }
    };

    return data;
}
