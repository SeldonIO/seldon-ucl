// Karma configuration
// Generated on Fri Mar 25 2016 19:20:02 GMT+0000 (GMT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'libraries/bower_components/angular/angular.js',
      'libraries/bower_components/angular-mocks/angular-mocks.js',
      'libraries/bower_components/angular-animate/angular-animate.js',
      'libraries/bower_components/angular-aria/angular-aria.js',
      'libraries/bower_components/angular-material/angular-material.js',
      'libraries/bower_components/angular-ui-router/release/angular-ui-router.js',
      'libraries/bower_components/handsontable/dist/handsontable.full.min.js',
      'libraries/bower_components/jquery/dist/jquery.js',
      'libraries/bower_components/moment/moment.js',
      'libraries/bower_components/ng-file-upload/ng-file-upload.js',
      'libraries/bower_components/pikaday/pikaday.js',
      'libraries/bower_components/socket.io-client/socket.io.js',
      'app.js',
      'controllers/init.js',
      'directives/init.js',
      'services/init.js',
      'controllers/**/*.js',
      'directives/**/*.js',
      'services/**/*.js',
      'filters.js',
      'test/**/*.js',
      'directives/**/*.html'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {'directives/**/*.html': ["ng-html2js"]},

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox', 'Safari'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

	  ngHtml2JsPreprocessor: {
		  moduleName: 'templates'
	  }
	})
}
