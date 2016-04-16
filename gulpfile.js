'use strict';

var gulp         = require('gulp'),
	cache 		 = require('gulp-cached'),
    path         = require('path'),
    gutil 		 = require('gulp-util'),
    jpegoptim 	 = require('imagemin-jpegoptim'),
    pngquant 	 = require('imagemin-pngquant'),
    optipng      = require('imagemin-optipng'),
    svgo         = require('imagemin-svgo'),    
    sass 		 = require('gulp-sass'),
    sourcemaps 	 = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    sassdoc 	 = require('sassdoc'),
    livereload 	 = require('gulp-livereload'),
    browserSync  = require('browser-sync').create();

//    jshint       = require('gulp-jshint'),
//    uglify       = require('gulp-uglify'),
//    concat       = require('gulp-concat');


var path = {
    DEV_CSS: './app/scss/**/*.scss',
    DEV_IMAGES: './app/images/',
    PROD_CSS: './assets/css/',
    PROD_IMAGES: './assets/images/'
};

var sassOptions = {
	errLogToConsole: true,
	outputStyle: 'expanded'
};

gulp.task('sass', function () {	
    //return sass path   
    return gulp.src(path.DEV_CSS)
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer())
        //return css path
        .pipe(gulp.dest(path.PROD_CSS))
        .pipe(browserSync.stream())
        .pipe(livereload());
});

gulp.task('sassdoc', function () {
    //return sass path
    return gulp.src(path.DEV_CSS)
        .pipe(sassdoc())
        .resume();
});

// IMAGES
gulp.task('images', function () {
    var options = { headers: {'Cache-Control': 'max-age=604800, no-transform, public'} }
    //return image paths
    return gulp.src( path.DEV_IMAGES + '/**/*.{png,jpg,jpeg,gif,svg}' )
        //cache
        .pipe(cache('images'))
        //quant pngs, lossy but unnoticeable compression  
        .pipe(pngquant({ quality: '65-80', speed: 4 })())
        //remove meta / unnecessary data from pngs
        .pipe(optipng({ optimizationLevel: 3 })())
        //optimize jpgs
        .pipe(jpegoptim({ max: 90, progressive: true })())
        //minify svg
        .pipe(svgo()())
        //overwrite images
        .pipe(gulp.dest(path.PROD_IMAGES))    
        //reload
        .pipe(livereload());
});
 
gulp.task('watch', function() {
	return gulp.watch(path.DEV_CSS, ['sass'])
        livereload.listen();
});

gulp.task('browser-sync', function () {
	return browserSync.init(null, {
		proxy: "http://designingstories.dev/",
        files: ["./assets/css/**/*.*"],
        browser: "google chrome"
    });
});

gulp.task('prod', ['sassdoc', 'images'], function () {
  	return gulp.src(path.DEV_CSS)
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(autoprefixer())
        .pipe(gulp.dest(path.PROD_CSS));
});

gulp.task('default', ['sass','watch','browser-sync']);
