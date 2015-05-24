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
      //so facebook login will work(instead of changing url)
      templateUrl: '../templates/index.html',
      controller: 'IndexController',
      controllerAs: 'index'
    }).when('/home', {
      templateUrl: '../templates/index.html',
      controller: 'IndexController',
      controllerAs: 'index'
    }).when('/image/:name', {
      templateUrl: '../templates/count.html',
      controller: 'CounterController',
      controllerAs: 'count'
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
    //directive to allow multipart/form-data transfer
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
    //allows for easy multipart/form-data
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
  app.service('tiffCanvas', ['$http',function ($http){
    //Loads tiff images into a Canvas
    this.loadImage = function (filename) {
      Tiff.initialize({TOTAL_MEMORY: 16777216 * 10});
       var xhr = new XMLHttpRequest();
       xhr.open('GET', filename);
       xhr.responseType = 'arraybuffer';
       xhr.onload = function (e) {
         var buffer = xhr.response;
         var tiff = new Tiff({buffer: buffer});
         var canvas = tiff.toCanvas(); 
         var width =  tiff.width();
         var height = tiff.height();
        if (canvas) {
          var $elem = $('<div class="content"><div><p>' +
            filename +
            ' (width: ' + width + ', height:' + height + ')' +
            '</p></div></div>');
          $elem.append(canvas);
          $('body').append($elem);
       }
           };
           xhr.send();
         };
  }]);
  app.controller('IndexController', ['$scope','fileUpload','$http', function($scope, fileUpload, $http){
    //Index page controller: gets a user's images, lists them, and calls file upload service 
    $http.get('/userImages').success(function(data, status, headers, config){
      console.log(data);
      $scope.Images = []
      for (var i=0; i<data.imageList.length; i++){
        var temp = data.imageList[i].split('/')
        $scope.Images.push(temp[2])
      }
    }).error(function(data,status){
      console.log(status);
      console.log(data);
    })

    $scope.uploadFile = function(){
        var file = $scope.myFile;
        console.log('file is ' + JSON.stringify(file));
        $scope.Images.push(file.name)
        var uploadUrl = "/upload";
        fileUpload.uploadFileToUrl(file, uploadUrl);
    };
  }]);
  app.controller('CounterController', ['$http', '$location','tiffCanvas', function($http, $location, tiffCanvas){
    //Loads images then applies opencv
    console.log($location.path())
    var path = $location.path().split('/');
    var imgType = path[2].split('.')[1];

    this.onDblClick = function(ev){
      function clearSelection() {
        if(document.selection && document.selection.empty) {
            document.selection.empty();
        } else if(window.getSelection) {
            var sel = window.getSelection();
            sel.removeAllRanges();
        }
      }
      clearSelection();
    }

    this.onSingleClick = function(ev){

    }

    this.clearAll = function(){
      $(".content").remove();
      tiffCanvas.loadImage(filename);
    }

    if (imgType == 'tif'){
      //TIFF images only
      var filename = '/img/'+path[2];
      tiffCanvas.loadImage(filename);
      //fix the canvas drawing problem. 
      var counter=this;
      this.callCounter = function(){
        var val = $("#threshold").val();
        $http.post('/counter', {filename: filename, val: val}).success(function(data, status, headers, config){
          console.log(data);
          counter.data = data;
          var elem = document.getElementsByTagName("CANVAS");
          console.log(elem[0]);
          elem[0].addEventListener('dblclick', function(ev){counter.onDblClick(ev)})
          elem[0].addEventListener('click', function(ev){counter.onSingleClick(ev)})
          if (elem[0]){
            var ctx = elem[0].getContext("2d");
            ctx.fillStyle = "FF0000";
            for(var i=0; i<data.areas.length; i++){   
              ctx.beginPath();
              var r = Math.sqrt(data.areas[i]/Math.PI);
              var cx = data.centers[i][0];
              var cy = data.centers[i][1];
              ctx.arc(cx,cy,r,0, Math.PI*2);
              ctx.stroke();
              ctx.closePath();
            }
          }
        });
      } 
    }
  }]);
})();