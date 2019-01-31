/**
 * Gulp tasks for static site builds
 *
 * @copyright Copyright (c) 2019 and beyond Humble Meteor
 * @author Michael Becker - michael@humblemeteor.com
 *
 */


'use strict';

// gulp plugin vars
const gulp = require('gulp'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('autoprefixer'),
	del = require('del'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util'),
	runSequence = require('run-sequence'),
	postcss = require('gulp-postcss'),
	postcssScss = require('postcss-scss'),
	postcssNested = require('postcss-nested'),
	postcssFocusVisible = require('postcss-focus-visible'),
	rename = require("gulp-rename"),
	replace = require('gulp-replace'),
	nunjucks = require('gulp-nunjucks'),
	data = require('gulp-data'),
	fs = require('fs'),
  merge = require('gulp-merge-json'),
  jsonSass = require('gulp-json-sass');


// Set up variables
let outputDir,
    paths,
    production,
    sassStyle,
    browserSync,
    reload,
		autoprefixerOptions,
		splashScreen;

outputDir = './build/';


// Project paths array
paths = {

  nodeModulesPath: './node_modules/',

  styles: {
    src: './src/scss/**/*',
    dest: './build/css/'
  },

  html: {
    src: './src/*.html',
    watchPath: outputDir +'*.html',
    dest: outputDir
  },

  fonts: {
    src: './src/fonts/**/*',
    dest: outputDir + 'fonts/'
  },

  tokens: {
    src: './design-tokens/**/*',
    scssDest: './src/scss/',
    jsonDest: './src/'
  }
};


// browsersync vars
browserSync = require('browser-sync').create();
reload      = browserSync.reload;


// autoprefix options
autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};


/*
 * loads .json config file for the project you're spinning up
 */
function loadJsonConfig () {
	return JSON.parse(fs.readFileSync('./src/tokens.json'));
}


// serve task : browsersync spins up localhost server in specified browser
// ---------------------------------------------------------------------------------
gulp.task('serve', () => {

	// refer to terminal output for browser path to your project
	browserSync.init({
		// default static settings
		server: {
			baseDir: outputDir
		},
		browser: ["google chrome"],
    notify: false,
    injectChanges: true
 	}, splashScreen);


	// watch source files
  gulp.watch(paths.styles.src, ['scss']);
  
  gulp.watch(paths.html.watchPath, ['html']).on('change', browserSync.reload);
  gulp.watch(paths.html.src, ['html', browserSync.reload]);

	gulp.watch(paths.tokens.src, ['build:tokens']);
});



// scss task : compiles sass files into css and moves it to build dir
// ---------------------------------------------------------------------------------
gulp.task('scss', () => {
	return gulp.src(paths.styles.src)
		.pipe(plumber(function(error) {
			gutil.beep();
			gutil.log(gutil.colors.red(error.message));
			this.emit('end');
		}))
		.pipe(sourcemaps.init())

    .pipe(sass({
			outputStyle: 'expanded',
			includePaths: [
        paths.nodeModulesPath
      ],
      errLogToConsole: true
		}))

    .pipe(postcss([
      postcssNested,
			autoprefixer, 
			postcssFocusVisible
    ], {syntax: postcssScss}))
    
	.pipe(sourcemaps.write())
	.pipe(concat('styles.css'))
	.pipe(gulp.dest(outputDir + 'css/'))
	.pipe(browserSync.stream())
  .on('end', () => gutil.log(gutil.colors.gray('====> SCSS compressed & prefixed')));
});



// clean task : force empties build folder each time the project spins up
// ---------------------------------------------------------------------------------
gulp.task('clean:output', () => del([outputDir]));



// html task : grabs all html files and moves 'em to the build dir
// ---------------------------------------------------------------------------------
gulp.task('html', () => {
	let jsonConfig = loadJsonConfig();

	return gulp.src(paths.html.src)
		.pipe(data(jsonConfig))
		.pipe(nunjucks.compile())
		.pipe(gulp.dest(paths.html.dest))
		.on('end', () => gutil.log(gutil.colors.gray('====> HTML moved')));
});


// fonts task : grabs all fonts and moves 'em to the build dir
// ---------------------------------------------------------------------------------
gulp.task('fonts', () => {
	return gulp.src(paths.fonts.src)
	    .pipe(gulp.dest(paths.fonts.dest))
      .on('end', () => gutil.log(gutil.colors.gray('====> Fonts moved')));
});


// design tokens tasks : convert design tokens from .json files => scss & json files
// ---------------------------------------------------------------------------------
gulp.task('design-tokens:scss', ['design-tokens:json'], () => {
  gulp.src(paths.tokens.src)
  .pipe(merge())
  .pipe(jsonSass({
    sass: false
  }))
  .pipe(rename('_design-tokens.scss'))
  .pipe(replace('_', '-'))
	.pipe(gulp.dest(paths.tokens.scssDest))
  .on('end', () => gutil.log(gutil.colors.gray('====> Design tokens: SCSS created')));
});

gulp.task('design-tokens:json', () => {
  gulp.src(paths.tokens.src)
  .pipe(merge())
  .pipe(rename('tokens.json'))
  .pipe(replace('\'', ''))
  .pipe(gulp.dest(paths.tokens.jsonDest))
  .on('end', () => gutil.log(gutil.colors.gray('====> Design tokens: JSON created')));
});


// build task : builds project
// ---------------------------------------------------------------------------------
gulp.task('build', (callback) => {
  runSequence(
	'clean:output',
	'design-tokens:scss',
	['fonts', 'scss'],
	'html',
  'serve',
  callback);
});


// build:tokens : rebuilds tokens from watch command when working in tokens dir
// ---------------------------------------------------------------------------------
gulp.task('build:tokens', (callback) => {
  runSequence(
		'design-tokens:scss',
    ['html'],
    callback);
});