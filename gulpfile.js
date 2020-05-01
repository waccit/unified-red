var gulp = require('gulp');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var eol = require('gulp-eol');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var autoprefixer = require('gulp-autoprefixer');


paths = {
	'npm': './node_modules'
};

//Copy, compile, minify all scripts
function scripts(done) {
	gulp.src([
		paths.npm + '/jquery/dist/jquery.js',
		paths.npm + '/popper.js/dist/umd/popper.js',
		paths.npm + '/bootstrap/dist/js/bootstrap.js',
		paths.npm + '/jquery-sparkline/jquery.sparkline.min.js',
		paths.npm + '/moment/min/moment.min.js',
		paths.npm + '/owl.carousel/dist/owl.carousel.min.js',
	])
		.pipe(concat('app.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('src/assets/js/'));
	done();
};

//Copy, compile, minify all chart script
function chart(done) {
	gulp.src([
		paths.npm + '/morris.js/morris.js',
		paths.npm + '/raphael/raphael.min.js',
		paths.npm + '/chart.js/dist/Chart.bundle.js',
	])
		.pipe(concat('chart.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('src/assets/js/'));
	done();
};

//Copy, compile, minify all plugins styles
function style(done) {
	return gulp.src([
		paths.npm + '/bootstrap/dist/css/bootstrap.css',
		paths.npm + '/simple-line-icons/css/simple-line-icons.css',
		paths.npm + '/node-waves/dist/waves.css',
		paths.npm + '/animate.css/animate.css',
		paths.npm + '/morris.js/morris.css',
		paths.npm + '/owl.carousel/dist/assets/owl.carousel.min.css',
		paths.npm + '/owl.carousel/dist/assets/owl.theme.default.min.css',
		paths.npm + '/perfect-scrollbar/css/perfect-scrollbar.css'

	])
		.pipe(concat('app.min.css'))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 2 versions'],
			cascade: false
		}))
		.pipe(uglifycss())
		.pipe(gulp.dest('src/assets/css/'));
	done();
};

// gridstack
function gridstack(done) {
	gulp.src(paths.npm + '/gridstack/dist/gridstack.min.css').pipe(gulp.dest('src/assets/css/'));
	gulp.src(paths.npm + '/gridstack/dist/gridstack.jQueryUI.min.js').pipe(gulp.dest('src/assets/js/'));
	gulp.src(paths.npm + '/gridstack/dist/gridstack.min.js').pipe(gulp.dest('src/assets/js/'));
	gulp.src(paths.npm + '/gridstack/dist/gridstack.min.map').pipe(gulp.dest('src/assets/js/'));
	gulp.src(paths.npm + '/lodash/lodash.min.js').pipe(gulp.dest('src/assets/js/'));
	gulp.src(paths.npm + '/gridstack/dist/src/gridstack-extra.scss')
		.pipe(replace('$gridstack-columns: 12 !default;','$gridstack-columns: 30;'))
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(rename({extname: '.min.css'}))
		.pipe(gulp.dest('src/assets/css'))
	done();
}

// tinycolor2
function tinycolor2(done) {
	gulp.src(paths.npm + '/tinycolor2/dist/tinycolor-min.js')
		.pipe(eol('\n'))
		.pipe(gulp.dest('src/assets/js/'));
	done();
}

gulp.task("scripts", scripts);
gulp.task("chart", chart);
gulp.task("style", style);
gulp.task("gridstack", gridstack);
gulp.task("tinycolor2", tinycolor2);

gulp.task("default", gulp.series(scripts, chart, style, gridstack, tinycolor2));