var loadGruntTasks = require('load-grunt-tasks');

module.exports = function (grunt) {
  loadGruntTasks(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {  // grunt-contrib-jshint
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        '**/*.js',
        '!node_modules/**/*'
      ]
    },
    watch: {  // grunt-contrib-watch
      all: {
        files: [
          '**/*.js',
          '!node_modules/**/*'
        ]
      }
    }
  });

  grunt.registerTask('default', [
    'jshint',
    'watch'
  ]);
};
