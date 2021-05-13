var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass');

var paths = {
    scripts: [
        'js/utils.js',
        'js/main.js'
    ],
    injectedScripts: [
        'js/utils.js',
        'js/injected.js'
    ],
    styles: [
        'css/main.scss'
    ]
};

gulp.task('default');

gulp.task('compile-styles', function() {
    return gulp.src(paths.styles)
        .pipe(sourcemaps.init())
            .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('css'));
});

gulp.task('compile-scripts', function() {
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
            .pipe(babel({ presets: ['es2015'] }))
            .pipe(uglify().on('error', function(err){throw err;}))
            .pipe(concat('js/main.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./'));
});

gulp.task('compile-injected', function() {
    return gulp.src(paths.injectedScripts)
        .pipe(sourcemaps.init())
            .pipe(babel({ presets: ['es2015'] }))
            .pipe(uglify().on('error', function(err){throw err;}))
            .pipe(concat('js/injected.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./'));
});

gulp.task('build', ['compile-styles', 'compile-scripts', 'compile-injected']);
