var gulp = require("gulp");
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var debug = require('gulp-debug');
var concat = require('gulp-concat');


gulp.task('default', ['js', 'css']);

gulp.task('js', function () {
    return gulp.src([
        'scripts/slgSpinner.js',
        'scripts/slgComponents.js',
        'scripts/slgButtonSpinner.js',
        'scripts/slgPleaseWait.js'])
		.pipe(concat('slgComponents.min.js'))
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('npm/dist/js'))
});

gulp.task('css', function () {
    return gulp.src(['content/slgButtonSpinner.css',
        'content/slgPleaseWait.css'])
		.pipe(concat('slgComponents.min.css'))
		.pipe(uglifycss())
		.pipe(gulp.dest('npm/dist/css'))
});
