var gulp = require('gulp');
var open = require('open');
var connect = require('gulp-connect');
var sass = require('gulp-sass');
var del = require('del');
var glob = require('glob');
var runSequence = require('run-sequence');
var uglifyjs = require('gulp-uglifyjs');
var uglify = require('gulp-uglify');
var concatCss = require('gulp-concat-css');
var minifyCSS = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var postcss = require('gulp-postcss');
var usemin = require('gulp-usemin');
var plumber = require('gulp-plumber');
var replace = require('gulp-replace-task');
var to5 = require('gulp-6to5');

var to5options = {
    loose: 'all',
    playground: true
};

var paths = {
    sourceBase: './src/',
    destBase: './app/'
};

paths.source = {
    html: paths.sourceBase + '*.html',
    scripts: paths.sourceBase + 'scripts/**/*.js',
    sass: paths.sourceBase + 'styles/*.scss',
    img: paths.sourceBase + 'img/**/*.*',
    templates: paths.sourceBase + 'templates/**/*.html',
    vendor: {
        scripts: paths.sourceBase + 'vendor/scripts/**/*.js',
        css: paths.sourceBase + 'vendor/styles/**/*.css',
        fonts: paths.sourceBase + 'vendor/fonts/**/*.*'
    },
    favicon: paths.sourceBase + 'favicon.png'
};

paths.dest = {
    server: paths.destBase,
    html: paths.destBase,
    css: paths.destBase + 'css',
    img: paths.destBase + 'img',
    templates: paths.destBase + 'templates',
    scripts: paths.destBase + 'scripts',
    vendor: {
        scripts: paths.destBase + 'vendor/scripts',
        css: paths.destBase + 'vendor/styles',
        fonts: paths.destBase + 'vendor/fonts'
    },
    favicon: paths.destBase
};

gulp.task('server', function() {
    var serverOptions = {
        root: paths.dest.server,
        host: 'localhost',
        livereload: {port: 35731},
        port: 9002
    };
    connect.server(serverOptions);
    open('http://localhost:' + serverOptions.port);
});

gulp.task('clean', ['clean:css', 'clean:scripts', 'clean:html', 'clean:vendor-assets']);

gulp.task('clean:vendor-assets', ['clean:vendor-scripts', 'clean:vendor-css']);

gulp.task('clean:css', function(cb) {
    del([paths.dest.css + '/*.css'], {
        force: true
    }, cb);
});

gulp.task('clean:vendor-scripts', function(cb) {
    del([paths.dest.vendor.scripts + '/*.js'], {
        force: true
    }, cb);
});

gulp.task('clean:vendor-css', function(cb) {
    del([paths.dest.vendor.css + '/*.css'], {
        force: true
    }, cb);
});


gulp.task('clean:scripts', function(cb) {
    del([paths.dest.scripts + '/*.js'], {
        force: true
    }, cb);
});


gulp.task('clean:html', function(cb) {
    del([paths.dest.html + '/*.html'], {
        force: true
    }, cb);
});

gulp.task('clean:templates', function(cb) {
    del([paths.dest.templates + '/*.html'], {
        force: true
    }, cb);
});


gulp.task('sass', function() {
    var processors = [
        // require("postcss-import"),
        require("autoprefixer-core"),
        // require("postcss-custom-properties"),
        // require("postcss-nested"),
        // require("postcss-calc"),
        require("csswring").postcss,
    ];
    return gulp.src([paths.source.sass])
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(paths.dest.css))
        .pipe(connect.reload());
});

gulp.task('scripts:prod', function() {
    return gulp.src(paths.source.scripts)
        .pipe(replace({
            patterns: [{
                match: 'path',
                replacement: '/api'
            }]
        }))
        .pipe(to5(to5options))
        .pipe(ngAnnotate())
        .pipe(uglifyjs('app.js'))
        .pipe(gulp.dest(paths.dest.scripts));
});

gulp.task('scripts', function() {
    return gulp.src(paths.source.scripts)
        .pipe(plumber())
        .pipe(replace({
            patterns: [{
                match: 'path',
                replacement: 'http://192.168.56.12/api'
            }]
        }))
        .pipe(to5(to5options))
        .pipe(ngAnnotate())
        .pipe(uglifyjs('app.js', {
            compress: false,
            mangle: false,
            output: {
                beautify: true
            }
        }))
        .pipe(gulp.dest(paths.dest.scripts))
        .pipe(connect.reload());
});

gulp.task('watch', ['build'], function() {
    gulp.watch([paths.source.sass], function() {
        runSequence('clean:css', 'sass');
    });

    gulp.watch([paths.source.scripts], function() {
        runSequence('clean:scripts', 'scripts');
    });

    gulp.watch([paths.source.html], function() {
        runSequence('clean:html', 'html');
    });
    gulp.watch([paths.source.vendor.scripts], function() {
        runSequence('clean:vendor-scripts', 'vendor-scripts');
    });
    gulp.watch([paths.source.vendor.css], function() {
        runSequence('clean:vendor-css', 'vendor-css');
    });
    gulp.watch([paths.source.templates], function() {
        runSequence('clean:templates', 'html:templates');
    });
});

gulp.task('html', ['html:main', 'html:templates']);

gulp.task('html:main', function() {
    return gulp.src(paths.source.html)
        .pipe(gulp.dest(paths.dest.html))
        .pipe(connect.reload());
});

gulp.task('html:templates', function() {
    return gulp.src(paths.source.templates)
        .pipe(gulp.dest(paths.dest.templates))
        .pipe(connect.reload());
});

gulp.task('html:prod', ['html:templates'], function() {
    return gulp.src(paths.source.html)
        .pipe(usemin({
            assetsDir: paths.sourceBase,
            vendor_css: [minifyCSS(), 'concat'],
            vendor_js: [uglify()]
        }))

    .pipe(gulp.dest(paths.dest.html));
});

gulp.task('vendor-css', function() {
    return gulp.src(paths.source.vendor.css)
        .pipe(gulp.dest(paths.dest.vendor.css))
        .pipe(connect.reload());
});

gulp.task('vendor-scripts', function() {
    return gulp.src(paths.source.vendor.scripts)
        .pipe(gulp.dest(paths.dest.vendor.scripts))
        .pipe(connect.reload());
});

gulp.task('vendor-fonts', function() {
    return gulp.src(paths.source.vendor.fonts)
        .pipe(gulp.dest(paths.dest.vendor.fonts))
        .pipe(connect.reload());
});

gulp.task('assets', ['img']);

gulp.task('img', function() {
    gulp.src(paths.source.favicon)
        .pipe(gulp.dest(paths.dest.favicon));
    return gulp.src(paths.source.img)
        .pipe(gulp.dest(paths.dest.img));
});


gulp.task('build', ['clean'], function(cb) {
    runSequence('vendor-fonts', 'vendor-css', 'vendor-scripts', 'assets', 'sass', 'scripts', 'html', cb);
});

gulp.task('prod', ['clean'], function(cb) {
    runSequence('vendor-fonts', 'assets', 'sass', 'scripts:prod', 'html:prod', cb);
});

gulp.task('default', ['watch'], function(cb) {
    runSequence('server', cb);
});
