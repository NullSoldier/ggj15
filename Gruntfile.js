module.exports = function(grunt) {
  grunt.initConfig({
    connect: {
      server: {
        options: {
          base      : 'build',
          hostname  : 'localhost',
          port      : 8001,
          livereload: true,
          open      : false
        }
      }
    },
    watch: {
      build: {
        files: ['index.html', 'src/**/*'],
        tasks: ['build'],
        options: {
          spawn     : false,
          interrupt : true,
          livereload: 35729,
        }
      },
      reload: {
        files: ['index.html', 'src/**/*'],
        options: {
          spawn     : false,
          interrupt : true,
          livereload: 35729,
        }
      }
    },
    typescript: {
      base: {
        src: ['src/**/*.ts'],
        dest: 'build/src',
        options: {
          basePath  : 'src/',
          references: "lib/**/*.d.ts",
          target    : 'es5',
          module    : 'amd',
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
    clean: {
      build: ['build/']
    },
    mkdir: {
      build: {
        options: {
          create: [
            'build/',
            'build/src',
            'build/src/client',
            'build/src/server',
            'build/src/common']
        }
      }
    },
    exec: {
      protobuf: 'echo "I am gonna build protobuf stuff"'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir')
  grunt.loadNpmTasks('grunt-typescript')
  grunt.loadNpmTasks('grunt-sync')
  grunt.loadNpmTasks('grunt-exec')

  grunt.registerTask('build', ['clean:build', 'mkdir:build', 'sync', 'typescript']);
  grunt.registerTask('default', ['build', 'connect', 'watch:build']);
  grunt.registerTask('server', ['build', 'connect', 'watch:reload']);
};
