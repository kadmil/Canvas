var gulp = require('gulp');
var open = require('open');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var del = require('del');
var uncss = require('gulp-uncss');
var glob = require('glob');
var browserify = require('gulp-browserify');
var runSequence = require('run-sequence');
var deploy = require('gulp-gh-pages');

var paths = {
    source: {
        html: './src/*.html',
        scripts: './src/scripts/*.js',
        sass: './src/sass/*.scss'
    },
    dest: {
        server: './app',
        html: './app',
        css: './app/css',
        scripts: './app/scripts'
    }
}
gulp.task('startServer', function() {
    var serverOptions = {
        root: paths.dest.server,
        host: 'localhost',
        livereload: true,
        port: 9000
    };
    connect.server(serverOptions);
    open('http://localhost:' + serverOptions.port);
});

gulp.task('clean', ['clean:css', 'clean:scripts', 'clean:html'], function(cb) {
    cb();
});

gulp.task('clean:css', function(cb) {
    console.log('cleaning css');
    del([paths.dest.css + '/*.css'], {
        force: true
    }, cb);
});


gulp.task('clean:scripts', function(cb) {
    console.log('cleaning scripts');
    del([paths.dest.scripts + '/*.js'], {
        force: true
    }, cb);
});


gulp.task('clean:html', function(cb) {
    console.log('cleaning html');
    del([paths.dest.html + '/*.html'], {
        force: true
    }, cb);
});

gulp.task('sass', function() {
    gulp.src([paths.source.sass]).pipe(sass({
        errLogToConsole: true
    })).pipe(uncss({
        html: glob.sync(paths.source.html)
    })).pipe(gulp.dest(paths.dest.css)).pipe(connect.reload());
});

gulp.task('scripts', function() {
    gulp.src(paths.source.scripts)
        .pipe(browserify({
            insertGlobals: true
        }))
        .pipe(gulp.dest(paths.dest.scripts)).pipe(connect.reload());
});

gulp.task('watch', function() {
    gulp.watch([paths.source.sass], function() {
        runSequence('clean:css', 'sass');
    });
    gulp.watch([paths.source.scripts], function() {
        runSequence('clean:scripts', 'scripts')
    });
    gulp.watch([paths.source.html], function() {
        runSequence('clean:html', 'html');
    });
});

gulp.task('html', function() {
    gulp.src(paths.source.html).pipe(gulp.dest(paths.dest.html)).pipe(connect.reload());
});

gulp.task('build', function() {
    runSequence('clean', 'sass', 'scripts', 'html');
});

gulp.task('deploy', ['build'] function () {
    return gulp.src('./app/**/*')
        .pipe(deploy());
});

gulp.task('travis', ['deploy']);

gulp.task('default', function(){
    runSequence('build', 'startServer', 'watch');
});
