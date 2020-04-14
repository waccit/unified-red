var gulp = require('gulp');
var concat = require('gulp-concat');
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

gulp.task("scripts", scripts);
gulp.task("chart", chart);
gulp.task("style", style);

gulp.task("default", gulp.series(scripts, chart, style));