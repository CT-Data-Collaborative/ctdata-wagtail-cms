
////////////////////////////////
		//Setup//
////////////////////////////////

// Plugins
var gulp = require('gulp'),
      pjson = require('./package.json'),
      gutil = require('gulp-util'),
      sass = require('gulp-sass'),
      autoprefixer = require('gulp-autoprefixer'),
      cssnano = require('gulp-cssnano'),
      rename = require('gulp-rename'),
      del = require('del'),
      plumber = require('gulp-plumber'),
      pixrem = require('gulp-pixrem'),
      uglify = require('gulp-uglify'),
      imagemin = require('gulp-imagemin'),
      exec = require('gulp-exec'),
      runSequence = require('run-sequence'),
      browserSync = require('browser-sync');


// Relative paths function
var pathsConfig = function (appName) {
  this.root = "./";

  return {
    app: this.root + (appName || pjson.name),
    node_modules: this.root + '/node_modules',
    templates: this.app + '/templates',
    css: this.app + '/static/css',
    sass: this.app + '/static/sass',
    fonts: this.app + '/static/fonts',
    images: this.app + '/static/images',
    js: this.app + '/static/js',
    wagtail: this.root + 'ctdata',
    wagtail_static: this.root + 'ctdata/static',
    wagtail_css: this.root + 'ctdata/static/ctdata/css',
    wagtail_sass: this.root + 'ctdata/static/ctdata/sass',
    wagtail_core_css: this.root + 'dashboard/static/wagtailadmin/css',
    wagtail_core_sass: this.root + 'dashboard/static/wagtailadmin/scss',
    wagtail_fonts: this.root + 'ctdata/static/ctdata/fonts',
    wagtail_images: this.root + 'ctdata/static/ctdata/images',
    wagtail_js: this.root + 'ctdata/static/ctdata/js'
  }
};

var paths = pathsConfig();

////////////////////////////////
		//Tasks//
////////////////////////////////

// Styles autoprefixing and minification
gulp.task('styles', function() {
  return gulp.src(paths.wagtail_sass + '/site.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(plumber()) // Checks for errors
    .pipe(autoprefixer({browsers: ['last 2 version']})) // Adds vendor prefixes
    .pipe(pixrem())  // add fallbacks for rem units
    .pipe(gulp.dest(paths.wagtail_css))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano()) // Minifies the result
    .pipe(gulp.dest(paths.wagtail_css));
});


// Javascript minification
gulp.task('scripts', function() {
  return gulp.src(paths.wagtail_js + '/project.js')
    .pipe(plumber()) // Checks for errors
    .pipe(uglify()) // Minifies the js
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.wagtail_js));
});

// Image compression
gulp.task('imgCompression', function(){
  return gulp.src(paths.images + '/*')
    .pipe(imagemin()) // Compresses PNG, JPEG, GIF and SVG images
    .pipe(gulp.dest(paths.images))
});

gulp.task('libs', function() {
	gulp.src([
            paths.node_modules + 'bootstrap/dist/js/bootstrap.min.js',
			paths.node_modules + '/lodash/lodash.min.js',
			paths.node_modules + '/mustache/mustache.min.js',
			paths.node_modules + '/jquery/dist/jquery.min.js',
			paths.node_modules + '/tether/dist/js/tether.min.js',
			paths.node_modules +  '/pym.js/dist/pym.min.js',
            paths.node_modules + '/moment/min/moment.min.js',
            paths.node_modules + '/d3/build/d3.js',
            paths.node_modules + '/d3-sankey/build/d3-sankey.js',
            paths.node_modules + '/d3-tip/index.js',
            paths.node_modules + '/d3-svg-annotation/d3-annotation.min.js',
            paths.node_modules + '/d3-svg-annotation/d3-annotation.js',
            paths.node_modules + '/d3-svg-legend/d3-legend.min.js'

		])
		.pipe(gulp.dest(paths.wagtail_js + '/lib'))
});

gulp.task('css_libs', function() {
	gulp.src([
        paths.node_modules + '/tether/dist/css/tether.min.css',
        paths.node_modules + '/bootstrap/dist/css/bootstrap.css',
        paths.node_modules + '/bootstrap/dist/css/bootstrap.min.css.map'
    ])
		.pipe(gulp.dest(paths.wagtail_css))
});

// Default task
gulp.task('default', function() {
    runSequence(['styles', 'scripts', 'imgCompression', 'libs', 'css_libs']);
});

////////////////////////////////
		//Watch//
////////////////////////////////

// Watch
gulp.task('watch', ['default'], function() {

  gulp.watch(paths.sass + '/*.scss', ['styles']);
  gulp.watch(paths.js + '/*.js', ['scripts']);
  gulp.watch(paths.images + '/*', ['imgCompression']);
  gulp.watch('templates/*.html');

});



gulp.task('print_paths', function() {
    gutil.log(paths.wagtail_js);
    gutil.log(paths.wagtail_css);
;})
