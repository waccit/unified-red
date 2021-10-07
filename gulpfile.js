var gulp = require('gulp');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var sass = require('gulp-sass')(require('sass'));
var rename = require('gulp-rename');
var eol = require('gulp-eol');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var autoprefixer = require('gulp-autoprefixer');

paths = {
    'npm': './node_modules',
};

//Copy, compile, minify all scripts
function scripts(done) {
    gulp.src([
        paths.npm + '/jquery/dist/jquery.js',
        paths.npm + '/popper.js/dist/umd/popper.js',
        paths.npm + '/bootstrap/dist/js/bootstrap.js',
        paths.npm + '/moment/min/moment.min.js',
    ])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/assets/js/'));
    gulp.src(paths.npm + '/lodash/lodash.min.js').pipe(
        gulp.dest('src/assets/js/')
    );
    done();
}

//Copy, compile, minify all plugins styles
function style(done) {
    return gulp
        .src([
            paths.npm + '/bootstrap/dist/css/bootstrap.css',
            paths.npm + '/perfect-scrollbar/css/perfect-scrollbar.css',
        ])
        .pipe(concat('app.min.css'))
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 2 versions'],
                cascade: false,
            })
        )
        .pipe(uglifycss())
        .pipe(gulp.dest('src/assets/css/'));
    done();
}

// tinycolor2
function tinycolor2(done) {
    gulp.src(paths.npm + '/tinycolor2/dist/tinycolor-min.js')
        .pipe(eol('\n'))
        .pipe(gulp.dest('src/assets/js/'));
    done();
}

gulp.task('scripts', scripts);
gulp.task('style', style);
gulp.task('tinycolor2', tinycolor2);

gulp.task('default', gulp.series(scripts, style, tinycolor2));
