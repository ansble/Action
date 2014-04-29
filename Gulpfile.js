var gulp = require('gulp')
    , watch = require('gulp-watch')
    , plumber = require('gulp-plumber')
    , concat = require('gulp-concat')
    , uglify = require('gulp-uglify')
    , rename = require('gulp-rename')
    , zip = require('gulp-zip')
    , jshint = require('gulp-jshint')

    , pkg = require('./package.json');

gulp.task('default', ['localBuild'], function(){
    'use strict';

    gulp.watch(['public/javascripts/app.js', 'public/javascripts/components/**/*.js'], function(){
        gulp.run('localBuild');
    });
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

    gulp.src('public/javascripts/action.js')
        .pipe(rename('action-v' + pkg.version + '.js'))
        .pipe(gulp.dest('packages/' + pkg.version + '/'))
        .pipe(uglify())
        .pipe(rename('action-v' + pkg.version + '.min.js'))
        .pipe(gulp.dest('packages/' + pkg.version + '/'));
});

gulp.task('publish', ['generateForPublish'], function(){
    'use strict';

     // gulp.src(['packages/' + pkg.version + '/*.js'])
     //    .pipe(zip('action.zip'))
     //    .pipe(gulp.dest('packages/' + pkg.version + '/'));
});

// gulp.task('default', function () {
//     watch({ glob: ['public/javascripts/app.js', 'public/javascripts/components/**/*.js'], emitOnGlob: false })
//         .pipe(plumber())
//         .pipe(concat('app.js'))
//         .pipe(gulp.dest('public/javascripts/built/js/'));
// });