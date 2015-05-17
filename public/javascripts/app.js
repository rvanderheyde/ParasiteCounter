(function(){
  var app = angular.module("Pcount", ['ngRoute', 'ngCookies', 'nav-directives','ngFileUpload']);
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
      controller: 'IndexController',
      controllerAs: 'index'
    }).when('/home', {
      templateUrl: '../templates/index.html',
      controller: 'IndexController',
      controllerAs: 'index'
    }).when('/401', {
      redirectTo: '/'
    }).otherwise({redirectTo: '/home'});

    //so weird hashes aren't in the urls
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
  }]);  
  app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
  }]);
  app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
        })
        .error(function(){
        });
    }
  }]);
  app.controller('IndexController', ['$scope','fileUpload', function($scope,fileUpload){
    $scope.uploadFile = function(){
        var file = $scope.myFile;
        console.log('file is ' + JSON.stringify(file));
        var uploadUrl = "/upload";
        fileUpload.uploadFileToUrl(file, uploadUrl);
    };
  }]);
  // app.controller('IndexController',[ '$scope', 'Upload', function($scope, Upload) {
  //   $scope.$watch('files', function () {
  //       $scope.upload($scope.files);
  //   });

  //   $scope.upload = function (files) {
  //       if (files && files.length) {
  //           for (var i = 0; i < files.length; i++) {
  //               var file = files[i];
  //               console.log(file)
  //               Upload.http({
  //                   url: '/upload',
  //                   headers: {
  //                     'Content-Type': file.type
  //                   },
  //                   // fields: {'username': $scope.username},
  //                   data: file
  //               }).progress(function (evt) {
  //                   var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
  //                    $scope.log = 'progress: ' + progressPercentage + '% ' +
  //                               evt.config.file.name + '\n' + $scope.log;
  //               }).success(function (data, status, headers, config) {
  //                   console.log(data)
  //               });
  //           }
  //       }
  //   };
  // }]);
})();