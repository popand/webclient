var args = require('yargs').argv;
var browserSync = require('browser-sync').create();
var config = require('./gulp.config')();
var del = require('del');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({ lazy: true });
var karmaServer = null;
var tsProject = $.typescript.createProject('tsconfig.json');

/**
 * yargs variables can be passed in to alter the behavior, when present.
 * Example: gulp serve-dev
 *
 * --verbose  : Various tasks will produce more output to the console.
 */

/**
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);


gulp.task('constants', ['clean-code'], function() {
    log('Creating config with app constants')

    return gulp
        .src(config.constants.src)
        .pipe($.ngConstant({
            name: 'app.core',
            space: '  ',
            templatePath: config.constants.templatePath
        }))
        .pipe(gulp.dest(config.constants.build));
});

/**
 * Compiles *.ts files
 */
gulp.task('tsc', ['constants'], function() {
    log('Compiling typescript files');

    return gulp
        .src(config.ts.src)
        .pipe($.typescript(tsProject))
        .pipe(gulp.dest(config.ts.build));
});


/**
 * vet the code and create coverage report
 * @return {Stream}
 */
gulp.task('vet', function() {
    log('Analyzing source with TSLint');

    return gulp
        .src(config.ts.src)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.tslint())
        .pipe($.tslint.report('verbose', {
            emitError: false
        }));
});


/**
 * Compile less to css
 * @return {Stream}
 */
gulp.task('styles', ['clean-styles'], function() {
    log('Compiling SASS --> CSS');

    return gulp
        .src(config.sass.src)
        .pipe($.plumber()) // exit gracefully if something fails after this
        .pipe($.sass({outputStyle: 'expanded'}).on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.sass.build));
});

/**
 * Copy fonts
 * @return {Stream}
 */
gulp.task('fonts', ['clean-fonts'], function() {
    log('Copying fonts');

    return gulp
        .src(config.fonts.src)
        .pipe(gulp.dest(config.fonts.build));
});

/**
 * Compress images
 * @return {Stream}
 */
gulp.task('images', ['clean-images'], function() {
    log('Compressing and copying images');

    return gulp
        .src(config.images.src)
        .pipe($.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(config.images.build));
});


/**
 * Wire-up the bower dependencies, js and css.
 * @return {Stream}
 */
gulp.task('inject', ['tsc', 'styles', 'templatecache'], function() {
    log('Wire up bower dependencies, css and js into the html, after files are ready');

    var wiredep = require('wiredep').stream;
    var options = config.getWiredepDefaultOptions();

    return gulp
        .src(config.index.src)
        .pipe(wiredep(options))
        .pipe(inject(config.js.src, '', config.js.order))
        .pipe(inject(config.css.src.vendor, 'vendor'))
        .pipe(inject(config.css.src.app))
        .pipe($.rename('index.html'))
        .pipe(gulp.dest(config.src));
});


/**
 * Build everything
 * This is separate so we can run tests on
 * optimize before handling image or fonts
 */
gulp.task('build', ['optimize', 'images', 'fonts'], function() {
    log('Building everything');

    var msg = {
        title: 'gulp build',
        message: 'Deployed to the build folder'
    };
    del(config.temp);
    log(msg);
});

/**
 * Inject all the spec files into the specs.html
 * @return {Stream}
 */
gulp.task('build-specs', ['tsc', 'templatecache'], function() {
    log('building the spec runner');

    var wiredep = require('wiredep').stream;
    var options = config.getWiredepDefaultOptions();
    var templateCache = config.temp + config.templates.file;
    var specs = config.js.specs;

    options.devDependencies = true;

    return gulp
        .src(config.specRunner)
        .pipe(wiredep(options))
        .pipe(inject(config.js.src, '', config.js.order))
        .pipe(inject(config.testlibraries, 'testlibraries'))
        .pipe(inject(specs, 'specs', ['**/*']))
        .pipe(inject(templateCache, 'templates'))
        .pipe(gulp.dest(config.src));
});

/**
 * Create $templateCache from html templates
 * @return {Stream}
 */
gulp.task('templatecache', ['clean-code'], function() {
    log('Creating an AngularJS $templateCache');

    return gulp
        .src(config.templates.src)
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
            config.templates.file,
            config.templates.options
        ))
        .pipe(gulp.dest(config.temp));
});


/**
 * Optimize all files, move to a build folder,
 * and inject them into the new index.html
 * @return {Stream}
 */
gulp.task('optimize', ['inject'], function() {
    log('Optimizing the js, css, and html');

    var assets = $.useref.assets({searchPath: './'});

    // Filters are named for the gulp-useref path
    var cssAppFilter = $.filter('**/' + config.css.optimized.app, {restore: true});
    var cssVendorFilter = $.filter('**/' + config.css.optimized.vendor, {restore: true});
    var jsAppFilter = $.filter('**/' + config.js.optimized.app, {restore: true});
    var jslibFilter = $.filter('**/' + config.js.optimized.lib, {restore: true});
    var templateCache = config.temp + config.templates.file;

    return gulp
        .src(config.index.build)
        .pipe($.plumber())
        .pipe(inject(templateCache, 'templates'))
        .pipe(assets) // Gather all assets from the html with useref
        // Get the css
        .pipe(cssVendorFilter)
        .pipe($.csso())
        .pipe(cssVendorFilter.restore)
        // Custom css
        .pipe(cssAppFilter)
        .pipe($.csso())
        .pipe(cssAppFilter.restore)
        // Get the custom javascript
        .pipe(jsAppFilter)
        .pipe($.ngAnnotate({add: true}))
        .pipe($.uglify())
        .pipe(jsAppFilter.restore)
        // Get the vendor javascript
        .pipe(jslibFilter)
        .pipe($.uglify()) // another option is to override wiredep to use min files
        .pipe(jslibFilter.restore)
        // Take inventory of the file names for future rev numbers
        .pipe($.rev())
        // Apply the concat and file replacement with useref
        .pipe(assets.restore())
        .pipe($.useref())
        // Replace the file names in the html with rev numbers
        .pipe($.revReplace())
        .pipe(gulp.dest(config.build));
});


// Helper serve tasks

function browserReload() {
    if (karmaServer) {
        karmaServer.refreshFiles();
    }
    browserSync.reload();
}

gulp.task('optimize-reload', ['optimize'], browserReload);
gulp.task('inject-reload', ['inject'], browserReload);


/**
 * serve the dev environment
 * --test
 */
gulp.task('serve-dev', ['inject'], function(done) {
    browserSync.init({
        open: false,
        server: config.serve.dev
    });

    if (args.test) {
        karmaServer = startTests(false, done);
        karmaServer.start();
    }

    gulp.watch([config.sass.src, config.ts.src], ['inject-reload']);
    gulp.watch(config.src + '/**/*.html', browserSync.reload);
});

/**
 * serve the build environment
 */
gulp.task('serve-build', ['build'], function() {
    browserSync.init({
        open: false,
        server: config.build
    });

    gulp.watch([
        config.index.src,
        config.ts.src,
        config.sass.src
    ], ['optimize-reload']);
});


/**
 * Start the tests using karma.
 * @param  {boolean} singleRun - True means run once and end (CI), or keep running (dev)
 * @param  {Function} done - Callback to fire when karma is done
 * @return {undefined}
 */
function startTests(singleRun, done) {
    var Server = require('karma').Server;

    return new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: !!singleRun
    }, karmaCompleted);

    ////////////////

    function karmaCompleted(karmaResult) {
        log('Karma completed');
        if (karmaResult === 1) {
            done('karma: tests failed with code ' + karmaResult);
        } else {
            done();
        }
    }
}

/**
 * Remove all files from the build, temp, and reports folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', function(done) {
    var delconfig = [].concat(config.build, config.temp);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig, done);
});

/**
 * Remove all fonts from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-fonts', function(done) {
    return clean(config.fonts.build + '**/*.*', done);
});

/**
 * Remove all images from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-images', function(done) {
    return clean(config.images.build + '**/*.*', done);
});

/**
 * Remove all styles from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-styles', function(done) {
    var files = [].concat(
        config.temp + '**/*.css',
        config.build + '**/*.css'
    );
    return clean(files, done);
});

/**
 * Remove all js and html from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-code', function(done) {
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + '**/*.js',
        config.build + '**/*.html'
    );
    return clean(files, done);
});

////////////////

/**
 * Delete all files in a given path
 * @param  {Array}   path - array of paths to delete
 * @param  {Function} done - callback when complete
 */
function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    return del(path, done);
}

/**
 * Inject files in a sorted sequence at a specified inject label
 * @param   {Array} src   glob pattern for source files
 * @param   {String} label   The label name
 * @param   {Array} order   glob pattern for sort order of the files
 * @returns {Stream}   The stream
 */
function inject(src, label, order) {
    var options = {read: false};
    if (label) {
        options.name = 'inject:' + label;
    }

    return $.inject(orderSrc(src, order), options);
}

/**
 * Order a stream
 * @param   {Stream} src   The gulp.src stream
 * @param   {Array} order Glob array pattern
 * @returns {Stream} The ordered stream
 */
function orderSrc(src, order) {
    //order = order || ['**/*'];
    return gulp
        .src(src)
        .pipe($.if(order, $.order(order)));
}


/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}


module.exports = gulp;
