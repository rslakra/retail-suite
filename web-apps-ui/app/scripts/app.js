'use strict';

/**
 * @ngdoc overview
 * @name customersStoresUiApp
 * @description
 * # customersStoresUiApp
 *
 * Main module of the application.
 */
angular
  .module('customersStoresUiApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ui.router',
    'ngSanitize',
    'ngTouch',
    'uiGmapgoogle-maps'
  ])
  .constant('appConfiguration', {
    //e.g. http://myserver:9000/rest
    customerApiUrl: window.location.protocol + '//' + window.location.host,
    storeApiUrl: window.location.protocol + '//' + window.location.host
  })
  .config(function () {

  });
