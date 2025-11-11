/**
 * Main entry point for Webpack
 * This file imports all dependencies and application code
 * 
 * Note: AngularJS requires global variables, so we use require() instead of import
 */

// Import jQuery first (required by Bootstrap) - must be global
window.$ = window.jQuery = require('jquery');

// Import Bootstrap JS (CSS is imported via LESS)
require('bootstrap/dist/js/bootstrap.js');

// Import AngularJS and modules - must be global for AngularJS
window.angular = require('angular');
require('angular-animate');
require('angular-cookies');
require('angular-resource');
require('angular-sanitize');
require('angular-touch');
require('angular-ui-router');

// Import lodash - make it global
window._ = require('lodash');

// Import angular-simple-logger (required by angular-google-maps)
// This provides the 'nemLogging' module
require('angular-simple-logger/dist/angular-simple-logger.js');

// Import angular-google-maps (must be loaded after angular-simple-logger)
// Use full path to ensure proper loading
require('angular-google-maps/dist/angular-google-maps.js');

// Import legacy shims (for IE support)
require('es5-shim');
require('json3');

// Import application styles
require('../styles/main.less');

// Import application code (order matters for AngularJS)
require('./app.js');
require('./routes.js');
require('./controllers/customer-controller.js');
require('./controllers/store-controller.js');
require('./controllers/about-controller.js');

