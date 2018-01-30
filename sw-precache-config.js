/* eslint-env node */

module.exports = {
  staticFileGlobs: [
    'index.html',
    'manifest.json',
    'favicon.ico',
    'src/**/*',
    'assets/**/*',
    'bower_components/webcomponentsjs/webcomponents-loader.js',
    'bower_components/idb/lib/idb.js',
    'bower_components/cr-fonts/fonts/*',
    'bower_components/cr-card/assets/**/*',
  ],
  runtimeCaching: [
    {
      urlPattern: /\/bower_components\/webcomponentsjs\/.*\.js/,
      handler: 'fastest',
      options: {
        cache: {
          name: 'webcomponentsjs-polyfills-cache',
        },
      },
    },
  ],
  navigateFallback: 'index.html',
};
