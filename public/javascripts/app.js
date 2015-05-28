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
    this.loadImage = function (filename, data, drawn) {
      Tiff.initialize({TOTAL_MEMORY: 16777216 * 100});
       var xhr = new XMLHttpRequest();
       xhr.open('GET', filename);
       xhr.responseType = 'arraybuffer';
       xhr.onload = function (e) {

        var insideCircle = function(cir1, cir2){
          var dist = Math.sqrt(Math.pow(cir1[0]-cir2[0], 2) + Math.pow(cir1[1]-cir2[1], 2));
          if (cir1[2]>=dist){
            return true;
          } else {
            return false;
          }
        }

         var buffer = xhr.response;
         var tiff = new Tiff({buffer: buffer});
         var canvas = tiff.toCanvas(); 
         var width =  tiff.width();
         var height = tiff.height();
         var count = 0;
        if (canvas) {
          canvas.setAttribute("id", "TIFFimage")
          var $elem = $('<div class="content"><div><p>' +
            filename +
            ' (width: ' + width + ', height:' + height + ')' +
            '</p></div></div>');
          $elem.append(canvas);
          $('body').append($elem);
          var ctx = canvas.getContext("2d");
          for(var i=0; i<data.length; i++){  
            var r = data[i][2];
            var cx = data[i][0];
            var cy = data[i][1];
            var flag = false;
            for (var j=0; j<drawn.length; j++){
              if (insideCircle(drawn[j], [cx,cy,r])){
                flag = true;
              } 
            }
            if (!flag){
              count+=1;
              ctx.fillStyle = "FF0000";
              ctx.strokeStyle = "00FF00";
              ctx.beginPath();
              ctx.arc(cx,cy,r,0, Math.PI*2);
              ctx.stroke();
              ctx.closePath();
              drawn.push([cx,cy,r]);
            } 
          }
        // return [count, drawn]  
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
  app.controller('CounterController', ['$http', '$location','tiffCanvas','$scope', function($http, $location, tiffCanvas, $scope){
    //Loads images then applies opencv
    console.log($location.path())
    var path = $location.path().split('/');
    var imgType = path[2].split('.')[1];
    this.filename = '/img/'+path[2];
    var counter = this;
    counter.count = 0;
    this.drawn = [];
    this.clicks = 0;
    this.timer = null;
    this.DELAY = 200;

    this.redraw = function(){
      $(".content").remove();
      var out = tiffCanvas.loadImage(counter.filename, counter.drawn, [])
    } 
     
    

    this.insideCircle = function(cir1, cir2){
      var dist = Math.sqrt(Math.pow(cir1[0]-cir2[0], 2) + Math.pow(cir1[1]-cir2[1], 2));
      if (cir1[2]>=dist){
        return true;
      } else {
        return false;
      }
    }

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
      var x = ev.layerX;
      var y = ev.layerY;
      for (var i=0; i<counter.drawn.length; i++){
        if (counter.insideCircle(counter.drawn[i], [x,y])){
          counter.count -= 1;
          counter.drawn.splice(i, 1);
        }
      }
      counter.redraw()
      $scope.$apply()
    }

    this.onSingleClick = function(ev){
      counter.clicks++
      if (counter.clicks===1){
        counter.timer = setTimeout(function(){
          var x = ev.layerX;
          var y = ev.layerY;
          var val = $("#threshold").val();
          var r = val;
          counter.drawn.push([x,y,r])
          counter.count+=1;
          var elem = document.getElementsByTagName("CANVAS");
          if (elem.length){
            console.log('Drawing')
            console.log(counter.count)
            var ctx = elem[0].getContext("2d");
            ctx.fillStyle = "FF0000";
            ctx.strokeStyle = "00FF00";
            ctx.beginPath();
            ctx.arc(x,y,r,0, Math.PI*2);
            ctx.stroke();
            ctx.closePath();
            $scope.$apply();
          }  
          counter.clicks = 0;
        }, counter.DELAY)
        
      } else {
        clearTimeout(counter.timer)
        counter.onDblClick(ev)
        counter.clicks = 0;
      }
      
    }

    this.clearAll = function(filename){
      $(".content").remove();
      tiffCanvas.loadImage(filename, [], []);
    }

    this.onload = function(){
      if (imgType == 'tif'){
        //TIFF images only
        var filename = '/img/'+path[2];
        tiffCanvas.loadImage(filename, [], []);
        //fix the canvas drawing problem. 
        
        counter.callCounter = function(){
          var val = $("#threshold").val();
          var val1 = $("#Lowthreshold").val();
          $http.post('/counter', {filename: filename, val: val, val1: val1}).success(function(data, status, headers, config){
            console.log(data);
            counter.data = data;
            var elem = document.getElementsByTagName("CANVAS");
            console.log(elem[0]);
            document.addEventListener('dblclick', function(ev){ev.preventDefault()})
            document.addEventListener('click', function(ev){counter.onSingleClick(ev)})
            if (elem.length){
              var ctx = elem[0].getContext("2d");
              for(var i=0; i<data.areas.length; i++){  
                var r = Math.sqrt(data.areas[i]/Math.PI);
                var cx = data.centers[i][0];
                var cy = data.centers[i][1];
                var flag = false;
                for (var j=0; j<counter.drawn.length; j++){
                  if (counter.insideCircle(counter.drawn[j], [cx,cy,r])){
                    flag = true;
                  } 
                }
                if (!flag){
                  counter.count+=1;
                  ctx.fillStyle = "FF0000";
                  ctx.strokeStyle = "00FF00";
                  ctx.beginPath();
                  ctx.arc(cx,cy,r,0, Math.PI*2);
                  ctx.stroke();
                  ctx.closePath();
                  counter.drawn.push([cx,cy,r]);
                } 
              }
            }
          });
        } 
      }
    }
    
  }]);
})();