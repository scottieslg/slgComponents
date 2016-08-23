var gulp = require("gulp");
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var debug = require('gulp-debug');


gulp.task('default', ['js', 'css']);

gulp.task('js', function () {
    return gulp.src(['scripts/slgSpinner.js', 'scripts/slgComponents.js', 'scripts/slgButtonSpinner.js'])
		.pipe(sourcemaps.init())
		.pipe(uglify())
        .pipe(rename('slgComponents.min.js'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('npm/dist/js'))
});

gulp.task('css', function () {
    return gulp.src(['content/slgButtonSpinner.css'])
		.pipe(uglifycss())
        .pipe(rename('slgComponents.min.css'))
		.pipe(gulp.dest('npm/dist/css'))
});
