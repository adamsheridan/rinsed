var exec = require('child_process').exec;

console.log('UGH UGH GUH');

module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		coffee: {
			compile: {
				files: [
					{
						expand: true,
						cwd: 'src/coffee/server/',
						src: ['**/*.coffee'],
						dest: 'app/',
						ext: '.js'
					},
					{
						expand: true,
						cwd: 'src/coffee/client/',
						src: ['*.coffee'],
						dest: 'app/static/js/',
						ext: '.js'
					}
				],
			}
		},
		sass: {
			compile: {
				files: {
					'app/static/css/style.css':'src/sass/style.scss'
				}
			}
		},
		watch: {
			coffee: {
				files: ['src/coffee/**/*'],
				tasks: ['coffee:compile']
			},
			sass: {
				files: ['src/sass/*'],
				tasks: ['sass:compile']
			}
		},
		nodemon: {
			dev: {
				options: {
					cwd: __dirname+'/app',
					file: 'server.js',
					watchedExtensions: ['js'],
					watchedFolders: ['app'],
					delayTime: 1
				}
			}
		},
		concurrent: {
			target: {
				tasks: ['nodemon:dev', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}	
		}
	});

	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');

	grunt.event.on('watch', function(action, filepath, target){
		grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
	});

	grunt.registerTask('default', ['coffee:compile', 'sass:compile', 'concurrent:target']);

}