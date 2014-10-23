module.exports = function(config) {
  config.set({
    plugins: ['karma-phantomjs-launcher','karma-chrome-launcher', 'karma-mocha', 'karma-chai', 'karma-spec-reporter'],
    browsers: ['PhantomJS'],

    frameworks: ['mocha', 'chai'],
    
    files: [
      'public/javascripts/action.js',
      'public/javascripts/action.*_test.js'
    ]

    , colors: true
    , reporters: ['spec']
  });
};