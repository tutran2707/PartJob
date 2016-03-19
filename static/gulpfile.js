// gulp
var gulp = require('gulp');

// plugins
var run = require('run-sequence')
    , argv = require('yargs').argv
    , open = require('gulp-open')
    , clean = require('gulp-rimraf')
    , connect = require('gulp-connect')
    , watch = require('gulp-watch')
    , concat = require('gulp-concat')
    , inject = require('gulp-inject')
    , jshint = require('gulp-jshint')
    , less = require('gulp-less')
    , minifyCSS = require('gulp-minify-css')
    , uglifyJS = require('gulp-uglify')
    , bowerFile = require('main-bower-files')
    , browserify = require('gulp-browserify')
    , ngAnnotate = require('gulp-ng-annotate')
    , minifyJS = require('gulp-minify');

var ROOT_PATH = argv.app || 'app';
var SERVER_PORT = argv.port || 9000;

var Path = {
    app: {
        dir: ROOT_PATH,
        all: ROOT_PATH + '/*',
        url: 'http://localhost:' + SERVER_PORT + '/' + ROOT_PATH,

        html: {
            dir:  ROOT_PATH + '/views',
            main: ROOT_PATH + '/index.html',
            all: [ ROOT_PATH + '/index.html', ROOT_PATH + '/views/**/*.html']
        },
        js: {
            dir: ROOT_PATH + '/scripts',
            main: ROOT_PATH + '/scripts/bundled.js',
            all: [ ROOT_PATH + '/scripts/**/*.js', '!' + ROOT_PATH + '/scripts/bundled.js']
        },
        css: {
            dir: ROOT_PATH + '/styles',
            main: ROOT_PATH + '/styles/main.css',
            all: [ ROOT_PATH + '/styles/**/*.css', ROOT_PATH + '/styles/**/*.less', '!' + ROOT_PATH +'/styles/main.css']
        },
        less: {
            main: ROOT_PATH + '/styles/main.less',
            import: [ ROOT_PATH + '/styles/**/*.css', '!' + ROOT_PATH + '/styles/main.css', ROOT_PATH + '/styles/**/*.less', '!' + ROOT_PATH + '/styles/main.less']
        },
        asset: {
            dir: ROOT_PATH + '/assets',
            all: ROOT_PATH + '/assets/*'
        }
    },
    dist: {
        root: 'dist',
        dir: 'dist/' + ROOT_PATH,
        all: 'dist/' + ROOT_PATH + '/*',
        url: 'http://localhost:' + SERVER_PORT + '/dist/' + ROOT_PATH,

        html: {
            dir: 'dist/' + ROOT_PATH + '/views',
            main: 'dist/' + ROOT_PATH + '/index.html'
        },
        js: {
            dir: 'dist/' + ROOT_PATH + '/scripts',
            main: 'dist/' + ROOT_PATH + '/scripts/bundled.js',
            vendor: 'dist/' + ROOT_PATH + '/scripts/library.js',
            all: ['dist/' + ROOT_PATH + 'scrips/**/*.js']
        },
        css: {
            dir: 'dist/' + ROOT_PATH + '/styles',
            main: 'dist/' + ROOT_PATH + '/styles/main.css',
            all: ['dist/' + ROOT_PATH + '/styles/**/*.css']
        },
        asset: {
            dir: 'dist/' + ROOT_PATH + '/assets',
            all: 'dist/' + ROOT_PATH + '/assets/*'
        }
    }
};

/** Privates tasks **/

/** Task clean- - remove dist folder **/
gulp.task('clean', function() {
    return gulp.src(Path.dist.root)
        .pipe(clean({force: true}));
});


/** Task clean-dist - remove dist/app folder **/
gulp.task('clean-dist', function() {
    return gulp.src(Path.dist.dir)
        .pipe(clean({force: true}));
});

/** Task lint - check code style **/
gulp.task('lint', function() {
    return gulp.src(Path.app.js.all)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

/** Task inject-bower - inject all bower script and css to index file **/
gulp.task('inject-app', function () {
    console.log(bowerFile());
    return gulp.src(Path.app.html.main)
        .pipe(inject(gulp.src(bowerFile(), {read: false}), {name: 'bower', relative: true}))
        .pipe(inject(gulp.src([Path.app.js.main, Path.app.css.main], {read: false}), {relative: true}))
        .pipe(gulp.dest(Path.app.dir));
});

/** Task inject-build **/
gulp.task('inject-build', function () {
    var bCSS = [];
    bowerFile().forEach(function(file) {
        if(file.slice(-4) === '.css') {
            bCSS.push(file);
        }
    });



    return gulp.src(Path.dist.html.main)
        .pipe(inject(gulp.src(bCSS.concat([Path.dist.js.vendor]), {read: false}), {name: 'bower', relative: true}))
        .pipe(inject(gulp.src([Path.dist.js.main, Path.dist.css.main], {read: false}), {relative: true}))
        .pipe(gulp.dest(Path.dist.dir));
});

/** Task less-css **/
gulp.task('less-css', function () {
    return gulp.src(Path.app.less.main)
        .pipe(less({
            paths: Path.app.less.import
        }))
        .pipe(gulp.dest(Path.app.css.dir));
});

/** Task minify-css **/
gulp.task('minify-css', ['less-css'], function () {
    return gulp.src(Path.app.css.main)
        .pipe(minifyCSS())
        .pipe(gulp.dest(Path.dist.css.dir));
});

/** Task browserify **/
gulp.task('browserify', function() {
    return gulp.src(Path.app.js.all)
        .pipe(ngAnnotate())
        /*.pipe(browserify({
            insertGlobals: true,
            debug: true
        }))*/
        .pipe(concat('bundled.js'))
        .pipe(gulp.dest(Path.app.js.dir));
});

/** Task uglify-js **/
gulp.task('uglify-js', ['browserify'], function () {
    return gulp.src(Path.app.js.main)
        .pipe(uglifyJS())
        .pipe(gulp.dest(Path.dist.js.dir));
});

/** Task uglify-js-bower **/
gulp.task('uglify-js-bower', function () {
    var bJS = [];
    bowerFile().forEach(function(file) {
        if(file.slice(-3) === '.js') {
            bJS.push(file);
        }
    });
    //console.log(bJS);
    return gulp.src(bJS)
        .pipe(concat('library.js'))
        .pipe(uglifyJS())
        //.pipe(minifyJS())
        .pipe(gulp.dest(Path.dist.js.dir));
});

/** Task watch-bower-changed **/
gulp.task('watch-bower-changed', function() {
    run('inject-app', 'connect-reload');
});

/** Task watch-js-changed **/
gulp.task('watch-js-changed', function() {
    run('lint', 'browserify', 'connect-reload');
});

/** Task watch-css-changed **/
gulp.task('watch-css-changed', function() {
    run('less-css', 'connect-reload');
});

/** Task watch-html-changed **/
gulp.task('watch-html-changed', function() {
    run('connect-reload');
});

/** Task watch **/
gulp.task('watch', function() {
    gulp.watch('bower.json', ['watch-bower-changed']);
    gulp.watch(Path.app.js.all, ['watch-js-changed']);
    gulp.watch(Path.app.css.all, ['watch-css-changed']);
    gulp.watch(Path.app.html.all, ['watch-html-changed']);
});

/** Task copy-resources **/
gulp.task('copy-resources', function() {
    return gulp.src([Path.app.asset.all].concat(Path.app.html.all), {base: Path.app.dir})
        .pipe(gulp.dest(Path.dist.dir));
});

/** Task connect **/
gulp.task('connect', function () {
    connect.server({root: [__dirname], livereload: true, port: SERVER_PORT});
});

/** Task connect-reload **/
gulp.task('connect-reload', function () {
    return gulp.src(Path.app.html.main)
        .pipe(connect.reload());
});

/** Task open-browser **/
gulp.task('open-browser-app', function () {
    return gulp.src(Path.app.html.main)
        .pipe(open('', {url: Path.app.url}));
});

/** Task open-browser-build **/
gulp.task('open-browser-build', function () {
    return gulp.src(Path.dist.html.main)
        .pipe(open('', {url: Path.dist.url}));
});

gulp.task('build', ['clean-dist'], function() {
    run('lint',
        ['minify-css', 'uglify-js', 'uglify-js-bower'],
        'copy-resources', 'inject-build',
        'connect', 'open-browser-build');
});

gulp.task('default', ['clean-dist'], function() {
    run(['lint', 'less-css', 'browserify'],
        'inject-app',
        'watch', 'connect', 'open-browser-app');
});