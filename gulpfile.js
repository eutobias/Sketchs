var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var sequence = require('gulp-sequence');
var babel = require('gulp-babel');
var gutil = require('gulp-util');
var tap = require('gulp-tap');
var browserify = require('browserify');
var plumber = require('gulp-plumber');
var nunjucksRender = require('gulp-nunjucks-render');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');

// Static Server + watching scss/html files
gulp.task('serve', function () {
    browserSync.init({
        server: "./dist"
    });

    gulp.watch("src/scss/*.scss", ['sass']);
    gulp.watch("src/**/*.html", ['nunjucks']);
    gulp.watch("src/**/*.js", ['copy-js']);
    gulp.watch("dist/**/*").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function () {
    var l = sass({});
    l.on('error', function (e) {
        gutil.log(e);
        l.end();
    });

    return gulp.src("src/scss/base.scss")
        .pipe(sass())
        .on('error', function (e) {
            gutil.log(e.message);
            // this.emit('end');
        })
        .pipe(concat('main.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest("dist/css"))
        .pipe(browserSync.stream());
});

gulp.task('clear-dist', function () {
    return gulp.src('dist/*', {
        read: false
    })
        .pipe(clean());
});

gulp.task('copy-html', function () {
    return gulp.src('src/**/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('copy-assets', function () {
    return gulp.src('src/assets/**/*.css')
        .pipe(gulp.dest('dist/assets'));
});

gulp.task('copy-js', function () {
    return gulp.src('src/js/main.js')
        .pipe(babel({
            presets: ['env']
        }))
        .on('error', function (e) {
            gutil.log(e.message);
            this.emit('end');
        })
        .pipe(tap(function (file) {
            gutil.log('bundling ' + file.path);
            file.contents = browserify(file.path, {
                debug: true
            })
                .transform("babelify", {
                    presets: ["env"]
                })
                .bundle();
        }))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('nunjucks', function () {
    return gulp.src('src/pages/**/*.+(html|nunjucks)')
        .pipe(nunjucksRender({
            path: ['src/templates']
        }))
        .on('error', function (e) {
            gutil.log(e.message);
            this.emit('end');
        })
        .pipe(gulp.dest('dist'))
});

gulp.task('images', () =>
    gulp.src(['src/**/*.png', 'src/**/*.jpg', 'src/**/*.gif', 'src/**/*.jpeg'])
        .pipe(imagemin())
        .pipe(gulp.dest('dist'))
);

gulp.task('dev', function (cb) {
    sequence('clear-dist', 'nunjucks', 'copy-js', 'sass','copy-assets', 'images', 'serve', cb)
})

gulp.task('build', function (cb) {
    sequence('clear-dist', 'nunjucks', 'copy-js', 'sass','copy-assets', 'images', cb)
})