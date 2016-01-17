'use strict';

var gulp        = require('gulp'),
    browserify  = require('browserify'),
    babelify    = require('babelify'),
    source      = require('vinyl-source-stream'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    insert      = require('gulp-insert'),
    packageJSON = require('./package.json');

gulp.task('build', function () {
  return browserify({
      entries: './src/main.js',
      extensions: ['.js'],
      standalone: 'midiEvents'
    })
    .transform(babelify)
    .bundle()
    .pipe(source('midi-events.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify', ['build'], function () {
  return gulp.src('dist/midi-events.js')
    .pipe(concat('midi-events.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('license', ['build', 'minify'], function () {
  gulp.src('dist/**/*.js')
    .pipe(insert.prepend('/*!\n * MIDI Events ' + packageJSON.version + '\n *\n * @author Mikael Jorhult\n * @license https://github.com/mikaeljorhult/midi-events MIT\n */\n'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['build'], function () {
  gulp.watch('*.js', ['build']);
});

gulp.task('release', ['build', 'minify', 'license'])

gulp.task('default', ['build'], function() {
  gulp.watch(['src/**/*.js'], ['build']);
});