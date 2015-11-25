module.exports = function() {
    var src = './src/';
    var app = src + 'app/';
    var root = './';
    var temp = './.tmp/';
    var build = './build/';
    var wiredep = require('wiredep');
    var nodeModules = 'node_modules';
    var bowerFiles = wiredep({devDependencies: true})['js'];
    var bower = {
        json: require('./bower.json'),
        directory: './bower_components/',
        ignorePath: '..'
    };

    var config = {
        /**
         * File paths
         */

        build: build,
        src: src,
        temp: temp,
        root: root,
        source: 'src/',

        index: {
            src: src + 'index.tpl.html',
            build: src + 'index.html'
        },

        templates: {
            src: app + '**/*.html',
            file: 'templates.js',
            options: {
                module: 'app.core',
                root: 'app/',
                standalone: false
            }
        },

        ts: {
            src: [
                src + '/tsd.d.ts',
                src + '**/*.ts'
            ],
            specs: src + '**/*.spec.ts',
            build: temp
        },

        js: {
            // app js, with no specs
            src: [
                temp + 'app/**/*.module.js',
                temp + 'app/**/*.js',
                '!' + temp + 'app/**/*.spec.js'
            ],

            specs: temp + 'app/**/*.spec.js',

            order: [
                'app/**/app.module.js',
                'app/**/*.module.js',
                'app/**/*.js'
            ],

            optimized: {
                app: 'app.js',
                lib: 'lib.js'
            }
        },

        constants: {
            src: './config.json',
            build: temp + 'app/',
            templatePath: app + 'config.tpl.ejs'
        },

        sass: {
            src: src + 'styles/*.scss',
            build: temp,
        },

        css: {
            src: {
                app: temp + '*.css',
                vendor: [
                    bower.directory + 'owlcarousel/owl-carousel/owl.carousel.css'
                ],
            },
            build: build + 'styles/',

            optimized: {
                app: 'main.css',
                vendor: 'vendor.css'
            }
        },

        fonts: {
            src: [
                bower.directory + 'sass-bootstrap/fonts/*.*',
                bower.directory + 'font-awesome/fonts/**/*.*',
                src + 'fonts/*.*'
            ],
            build: build + 'fonts/'
        },

        images: {
            src: src + 'images/**/*.*',
            build: build + 'images/'
        },

        serve: {
            dev: [
                bower.directory + 'sass-bootstrap/dist/',
                bower.directory + 'font-awesome/',
                root,
                src
            ]
        },

        /**
         * Bower and NPM files
         */
        bower: bower,
        packages: [
            './package.json',
            './bower.json'
        ],

        /**
         * specs.html, our HTML spec runner
         */
        specRunner: src + 'specs.html',
        specRunnerFile: 'specs.html',

        /**
         * The sequence of the injections into specs.html:
         *  1 testlibraries
         *      mocha setup
         *  2 bower
         *  3 js
         *  4 spechelpers
         *  5 specs
         *  6 templates
         */
        testlibraries: [
            nodeModules + '/mocha/mocha.js',
            nodeModules + '/chai/chai.js',
            nodeModules + '/sinon-chai/lib/sinon-chai.js',
            nodeModules + '/sinon/pkg/sinon.js',
            nodeModules + '/chai-as-promised/lib/chai-as-promised.js'
        ]
    };

    /**
     * wiredep and bower settings
     */
    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    };

    /**
     * karma settings
     */
    config.karma = getKarmaOptions();

    return config;

    ////////////////

    function getKarmaOptions() {
        var options = {
            files: [].concat(
                bowerFiles,
                // config.specHelpers,
                config.js.src,
                config.js.specs
            ),
            exclude: [],
            preprocessors: {}
        };
        return options;
    }

};
