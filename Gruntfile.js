module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
      options: {
	livereload: 35729,
      },
      build: {
        files: ['index.html', 'src/**/*'],
        tasks: ['build'],
        options: {
          spawn     : false,
          interrupt : true,
        }
      },
      express: {
	files: ['build/src/server/*.js', 'build/src/common/*.js'],
	tasks: ['express:dev'],
	options: {
	  spawn: false,
	},
      },
      reload: {
        files: ['index.html', 'src/**/*'],
        options: {
          spawn     : false,
        }
      }
    },
    typescript: {
      client: {
        src: ['src/client/*.ts', 'src/common/*.ts'],
        dest: 'build/src',
        options: {
          basePath  : 'src/',
          references: "lib/**/*.d.ts",
          target    : 'es5',
          module    : 'amd',
          sourceMap : true
        }
      },
      server: {
        src: ['src/server/*.ts', 'src/common/*.ts'],
        dest: 'build/src',
        options: {
          basePath  : 'src/',
          references: "lib/**/*.d.ts",
          target    : 'es5',
          module    : 'commonjs',
          sourceMap : true
        }
      }
    },
    sync: {
      main: {
        files: [{
          src: ['index.html', 'assets/*', 'lib/*'],
          dest: 'build/',
        }],
        verbose: true
      }
    },
    mkdir: {
      build: {
        options: {
          create: ['build/', 'build/src']
        }
      }
    },
    exec: {
      protobuf: 'echo "I am gonna build protobuf stuff"'
    },
    express: {
      dev: {
        options: {
          script: 'build/src/server/main.js',
	},
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec')
  grunt.loadNpmTasks('grunt-express-server')
  grunt.loadNpmTasks('grunt-mkdir')
  grunt.loadNpmTasks('grunt-sync')
  grunt.loadNpmTasks('grunt-typescript')

  grunt.registerTask('build', ['mkdir:build', 'sync', 'typescript']);
  grunt.registerTask('default', ['build', 'express:dev', 'watch']);
};
