'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.login',
    'myApp.register',
    'myApp.version'
]).
    config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'LNCXMLHttpRequest';
        $routeProvider.otherwise({redirectTo: '/login'});
    }]);
