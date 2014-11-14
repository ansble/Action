var gulp = require('gulp')
    , watch = require('gulp-watch')
    , plumber = require('gulp-plumber')
    , concat = require('gulp-concat')
    , uglify = require('gulp-uglify')
    , rename = require('gulp-rename')
    , zip = require('gulp-zip')
    , jshint = require('gulp-jshint')
    , header = require('gulp-header')
    , browserify = require('gulp-browserify')
    , es6 = require('gulp-es6-transpiler')
    , es6Mod = require('gulp-es6-module-transpiler')
    , stylish = require('jshint-stylish')

    , karma = require('gulp-karma')


    , pkg = require('./package.json');

gulp.task('build', function () {
    'use strict';

    gulp.src('src/cjs/action.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(browserify())
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task('localBuild', function(){
    'use strict';

    gulp.src(['public/javascripts/app.js', './public/javascripts/components/**/*.js','!./public/javascripts/components/**/*_test.js'])
        .pipe(concat('app.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('public/javascripts/built/'));
});

gulp.task('generateForPublish', function(){
    'use strict';

    var headerText = '/****************************************\nAction! v' + pkg.version + ' ' + pkg.releaseName + ' \n' + pkg.quote + '\nhttps://github.com/designfrontier/Action \n****************************************/\n';

    gulp.src('src/cjs/action.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(browserify())
        .pipe(header(headerText))
        .pipe(gulp.dest('packages/latest/'))
        .pipe(rename('action-v' + pkg.version + '.js'))
        .pipe(gulp.dest('packages/' + pkg.version + '/'))
        .pipe(uglify())
        .pipe(header(headerText))
        .pipe(rename('action.min.js'))
        .pipe(gulp.dest('packages/latest/'))
        .pipe(rename('action-v' + pkg.version + '.min.js'))
        .pipe(gulp.dest('packages/' + pkg.version + '/'));
});

gulp.task('publish', ['generateForPublish'], function(){
    'use strict';

});

gulp.task('test', ['build'], function (done) {
  gulp.src(['public/javascripts/action*.js', 'src/cjs/*_test.js'])
        .pipe(karma({
            configFile: 'karma.conf.js'
            , action: 'run'
        }))
        .pipe(plumber());
});

gulp.task('develop', function (done) {
    gulp.watch(['src/cjs/*.js'], ['build', 'test']);
});
