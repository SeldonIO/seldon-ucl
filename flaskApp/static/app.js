var dcsApp = angular.module('dcs', ['ui.router', 'dcsControllers', 'dcsFilters']);

dcsApp.config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider)
	{
		$urlRouterProvider.otherwise('/upload');

		$stateProvider.
			state('upload',
			{
				url:"/upload",
				templateUrl:'partials/upload.html',
				controller: 'UploadController'
			}).
			state('view',
			{
				url:"/view",
				templateUrl:'partials/dataView.html',
				controller: 'DataViewController'
			});
	}]);