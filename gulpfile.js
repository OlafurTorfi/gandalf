'use strict'
const gulp = require('gulp')
const electron = require('electron-connect').server.create()
const less = require('gulp-less')

function compileLess() {
    return gulp
        .src('./less/main.less')
        .pipe(less())
        .pipe(gulp.dest('./css'))
}
gulp.task('less', compileLess)

gulp.task('serve', function() {
    compileLess()
    // Start browser process
    electron.start(['.', 'dev=true'])

    // Restart browser process
    gulp.watch('app.js', electron.restart)

    // Reload renderer process
    gulp.watch(['./dist/**/*.js', 'index.html'], electron.reload)
    gulp.watch(['./less/**/*.less'], compileLess)
    //gulp.watch(['./css/**/*.css'], electron.reload);
})
