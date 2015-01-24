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
      files: ['index.html', 'src/**/*'],
      tasks: ['build'],
      options: {
        spawn     : false,
        interrupt : true,
        livereload: 35729,
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
    copy: {
      build: {
        src: ['index.html', 'assets/*', 'lib/*'],
        dest: 'build/'
      }
    },
    clean: {
      build: ['build/']
    },
    mkdir: {
      build: {
        options: {
          create: ['build/', 'build/src']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir')
  grunt.loadNpmTasks('grunt-typescript')

  grunt.registerTask('build', ['clean:build', 'mkdir:build', 'copy:build', 'typescript']);
  grunt.registerTask('default', ['build', 'connect', 'watch']);
};
