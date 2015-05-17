(function(){
  var app = angular.module("Pcount", ['ngRoute', 'ngCookies', 'nav-directives']);
  //Router to handle the views
  app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider.when('/', {
      templateUrl: '../templates/landing.html',
    }).when('/counter', {
      templateUrl: '../templates/counter.html',
      controller: 'CounterController',
      controllerAs: 'edit'
    }).when('/home#_=_', {
      templateUrl: '../templates/index.html',
      // controller: 'IndexController',
      // controllerAs: 'index'
    }).when('/home', {
      templateUrl: '../templates/index.html',
      // controller: 'IndexController',
      // controllerAs: 'index'
    }).otherwise({redirectTo: '/home'});

    //so weird hashes aren't in the urls
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  }]);  

})();