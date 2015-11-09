"use strict";

var gulp = require('gulp'),
    connect = require('gulp-connect'),          //runs local dev server
    open = require('gulp-open'),                //opens URL in browser
    browserify = require('browserify'),         //bundles all scripts and dependencies into one file
    babelify = require('babelify'),             //converts es2015 to es5
    source = require('vinyl-source-stream'),    //conventional text streams at the start of your pipelines
    buffer = require('vinyl-buffer'),           //convert streaming back to buffered
    sass = require('gulp-sass'),                //compiles SASS files to CSS
    uglify = require('gulp-uglify'),            //minifies JS
    gulpif = require('gulp-if'),                //allows basis logic in gulp pipelines
    config = {
        compress: true,                 //compress your CSS and JS?
        devbaseUrl: 'http:localhost',   //base url for webserver
        port: 9906,                     //port for web server
        paths: {
            html: './src/**/*.html',
            sass: './src/scss/*.scss',
            js: './src/**/*.js',
            jsIndex: './src/js/index.js',
            images: './src/images/*',
            dist: './dist'
        }
    };


//Start local server
gulp.task('connect', function() {
   connect.server({
       root: ['dist'],
       port: config.port,
       base: config.devBaseUrl,
       livereload: true
   });
});


//Open dev url in browser
gulp.task('open', ['connect'], function() {
    gulp.src('dist/index.html')
        .pipe(open('', { url: config.devbaseUrl + ':' + config.port + '/' }));
});


//Move images to dist
gulp.task('images', function() {
    gulp.src(config.paths.images)
        .pipe(gulp.dest(config.paths.dist + '/assets/images'))
        .pipe(connect.reload());
});


//Move html files to dist
gulp.task('html', function() {
   gulp.src(config.paths.html)
       .pipe(gulp.dest(config.paths.dist))
       .pipe(connect.reload());
});


//Bundle and move js files
gulp.task('js', function() {
   browserify(config.paths.jsIndex)
       .transform(babelify, {presets: ["es2015"]})
       .bundle()
       .pipe(source('main.js'))
       .pipe(gulpif(config.compress, buffer()))
       .pipe(gulpif(config.compress, uglify()))
       .pipe(gulp.dest(config.paths.dist + '/assets/scripts'))
       .pipe(connect.reload());
});


//Process SCSS files and move to dist
gulp.task('sass', function() {
    gulp.src(config.paths.sass)
        .pipe(sass({outputStyle: config.compress ? 'compressed' : 'uncompressed'}).on('error', sass.logError))
        .pipe(gulp.dest(config.paths.dist + '/assets/css'))
        .pipe(connect.reload());
});


//Watch files for any changes
gulp.task('watch', function() {
    gulp.watch(config.paths.html, ['html']);
    gulp.watch(config.paths.js, ['js']);
    gulp.watch(config.paths.sass, ['sass']);
    gulp.watch(config.paths.images, ['images']);
});


gulp.task('default', ['html', 'js', 'sass', 'images', 'open', 'watch']);