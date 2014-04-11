var gulp = require('gulp')
    , watch = require('gulp-watch')
    , plumber = require('gulp-plumber')
    , concat = require('gulp-concat');

gulp.task('default', ['localBuild'], function(){
    gulp.watch(['public/javascripts/app.js', 'public/javascripts/components/**/*.js'], function(){
        gulp.run('localBuild');
    });
});

gulp.task('localBuild', function(){
    gulp.src(['public/javascripts/app.js', './public/javascripts/components/**/*.js','!./public/javascripts/components/**/*_test.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/javascripts/built/'));
});


// gulp.task('default', function () {
//     watch({ glob: ['public/javascripts/app.js', 'public/javascripts/components/**/*.js'], emitOnGlob: false })
//         .pipe(plumber())
//         .pipe(concat('app.js'))
//         .pipe(gulp.dest('public/javascripts/built/js/'));
// });