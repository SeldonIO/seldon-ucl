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
			state('main',
			{
				url:"/{sessionID:[0-9a-fA-F]{30}}",
				abstract: true,
				templateUrl:'partials/main.html',
				controller: 'MainController'
			}).
			state('main.clean', 
			{
				url:'/clean',
				templateUrl:'partials/main.clean.html',
				controller: 'CleanController'
			}).
			state('main.visualize', 
			{
				url:'/visualize',
				templateUrl:'partials/main.visualize.html',
				controller: 'VisualizeController'
			}).
			state('main.analyze', 
			{
				url:'/analyze',
				templateUrl:'partials/main.analyze.html',
				controller: 'AnalyzeController'
			});
		
		$urlRouterProvider.when('/{sessionID:[0-9a-fA-F]{30}}', '/{sessionID:[0-9a-fA-F]{30}}/clean');
	}]);