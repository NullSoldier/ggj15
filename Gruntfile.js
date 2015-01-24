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
          spawn    : false,
          interrupt: true,
        }
      },
      protobuf: {
        files: ['src/protocol.proto'],
        tasks: ['exec:protobuf'],
        options: {
          spawn     : false,
          interrupt : true,
        }
      },
      express: {
        files: ['build/server.js', 'build/protocol.server.js'],
        tasks: ['express:dev'],
        options: {
          spawn: false,
        },
      },
      reload: {
        files: ['index.html', 'src/**/*'],
        options: {
          spawn: false,
        }
      }
    },
    typescript: {
      client: {
        src: ['src/client/*.ts', 'src/common/*.ts'],
        dest: 'build/client.js',
        options: {
          basePath  : 'src/',
          references: "lib/**/*.d.ts",
          target    : 'es5',
          module    : 'amd',
        }
      },
      server: {
        src: ['src/common/level.ts', 'src/server/*.ts', 'src/common/*.ts'],
        dest: 'build/server.js',
        options: {
          basePath  : 'src/',
          references: "lib/**/*.d.ts",
          target    : 'es5',
          module    : 'commonjs',
        }
      }
    },
    sync: {
      main: {
        files: [{
          src: ['index.html', 'assets/*', 'lib/**'],
          dest: 'build/',
        }],
        verbose: true
      }
    },
    mkdir: {
      build: {
        options: {
          create: [
            'build/']
        }
      }
    },
    exec: {
      protobuf: [
        'node_modules/protobufjs/bin/proto2js src/protocol.proto -commonjs > build/protocol.server.js',
        'node build/protocol.server.js  # Check for errors.',
        'node_modules/protobufjs/bin/proto2js src/protocol.proto -class > build/protocol.client.js',
      ].join('\n'),
    },
    express: {
      dev: {
        options: {
          script: 'build/server.js',
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

  grunt.registerTask('build', ['mkdir:build', 'sync', 'exec:protobuf', 'typescript']);
  grunt.registerTask('default', ['server']);
  grunt.registerTask('server', ['build', 'express:dev', 'watch']);
};
