(function(){
	var app = angular.module('nav-directives', ['ngCookies']);

	app.directive('navBar',['$cookieStore', '$http', '$location', function($cookieStore, $http, $location){
		return {
			restrict: 'E',
			templateUrl: '../templates/nav.html',
			controller: function(){
				var user = this;
				this.username = $cookieStore.get('username');

				$http.get('/session/user').success(function(data){
					//bake the cookie with username from server to control view.
					if (data !== 'error'){
						var username = data.userName;
						var id = data.id
						$cookieStore.put('username', username);
						$cookieStore.put('id', id)
						user.username = username;
					}
				}).error(function(data){
					if (data === 'Unauthorized' || data === 401){
						alert(data);
						$location.path('/')
					}
				});

				this.eatCookie = function(){
					//eat the cookie!!(destroys it)
					var username = $cookieStore.get('username');
					$http.post('/session/end').success(function(data, status, headers, config){
						console.log(username);
						$cookieStore.remove('username');
						user.username = '';
						$location.path('/')
					}).error(function(data,status,headers,config){
						alert("There was an err loggin out")
					})
				};

			},
			controllerAs: 'nav',
		}
	}]);
})();