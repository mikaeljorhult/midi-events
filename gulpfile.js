'use strict';

var gulp       = require('gulp'),
    browserify = require('browserify'),
    babelify   = require('babelify'),
    source     = require('vinyl-source-stream'),
    concat     = require('gulp-concat'),
    uglify     = require('gulp-uglify');

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

gulp.task('watch', ['build'], function () {
  gulp.watch('*.js', ['build']);
});

gulp.task('release', ['build', 'minify'])

gulp.task('default', ['build']);