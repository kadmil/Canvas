var gulp = require('gulp');
var open = require('open');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var del = require('del');
var uncss = require('gulp-uncss');
var glob = require('glob');
var browserify = require('gulp-browserify');

gulp.task('startServer', function() {
    var serverOptions = {
        root: '',
        host: 'localhost',
        livereload: true,
        port: 9000
    };
    connect.server(serverOptions);
    open('http://localhost:' + serverOptions.port);
});

var paths = {
    html: './*.html',
    css: './css/*.css',
    script: './scripts/*.js',
    sass: './sass/*.scss'
}

gulp.task('clean:css', function(cb) {
    console.log('cleaning css');
    del([paths.css], {
        force: true
    }, cb);
});

gulp.task('sass', ['clean:css'], function() {
    gulp.src([paths.sass]).pipe(sass({
        errLogToConsole: true
    })).pipe(uncss({
        html: glob.sync(paths.html)
    })).pipe(gulp.dest('./css')).pipe(connect.reload());
});

gulp.task('reload', function() {
    gulp.src([paths.html, paths.script, paths.css])
        .pipe(connect.reload());
});

// gulp.task('scripts', function() {
//     gulp.src('src/js/app.js')
//         .pipe(browserify({
//           insertGlobals : true,
//           debug : !gulp.env.production
//         }))
//         .pipe(gulp.dest('./build/js'))
// });

gulp.task('watch', function() {
    gulp.watch([paths.sass], ['sass']);
    gulp.watch([paths.html, paths.script, paths.css], ['reload']);
});

gulp.task('build', ['sass']);

gulp.task('default', ['build', 'startServer', 'watch']);
