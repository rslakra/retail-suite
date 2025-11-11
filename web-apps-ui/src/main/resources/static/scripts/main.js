/**
 * Main entry point for Webpack
 * This file imports all dependencies and application code
 * 
 * Note: AngularJS requires global variables, so we use require() instead of import
 */

// Import jQuery first (required by Bootstrap) - must be global
window.$ = window.jQuery = require('jquery');

// Import Bootstrap CSS and JS
require('bootstrap/dist/css/bootstrap.css');
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

// Import angular-google-maps
require('angular-google-maps');

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

