module.exports = function( grunt ) {
	'use strict';
	
	// Require all Grunt tasks.
	require( 'load-grunt-tasks' )( grunt );
	
	// Configure each task.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		meta: {
			banner: '/*!\n' +
				' * <%= pkg.title %> <%= pkg.version %>\n' +
				' * \n' +
				' * @author <%= pkg.author.name %> \n' +
				' * @license <%= pkg.repository.url %> <%= pkg.license.type %>\n' +
				'*/\n'
		},
		concat: {
			options: {
				banner: '<%= meta.banner %>'
			},
			dist: {
				files: {
					'dist/midi-events.js': 'src/midi-events.js'
				}
			}
		},
		uglify: {
			options: {
				banner: '<%= meta.banner %>'
			},
			dist: {
				files: {
					'dist/midi-events.min.js': 'src/midi-events.js'
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'src/midi-events.js'
			]
		}
	} );
	
	// Register tasks.
	grunt.registerTask( 'default', [ 'jshint' ]);
	grunt.registerTask( 'release', [
		'jshint',
		'concat',
		'uglify'
	] );
};