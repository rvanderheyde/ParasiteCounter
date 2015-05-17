(function(){
	var app = angular.module('nav-directives', ['ngCookies']);

	app.directive('navBar',['$cookieStore', '$http', '$location', function($cookieStore, $http, $location){
		return {
			restrict: 'E',
			templateUrl: '../templates/nav.html',
			controller: function(){

			},
			controllerAs: 'nav',
		}
	}]);
})();