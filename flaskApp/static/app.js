var dcsApp = angular.module('dcs', ['ngMaterial', 'ui.router', 'dcs.controllers', 'dcs.filters', 'dcs.directives']);

dcsApp.config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider',
	function($stateProvider, $urlRouterProvider, $mdThemingProvider)
	{	
		$mdThemingProvider.theme('black')
                .primaryPalette('blue-grey', {
                    'default': '700',

                })
                .accentPalette('orange');

        $mdThemingProvider.setDefaultTheme('black');

		$urlRouterProvider.otherwise('/upload');
		
		// $urlRouterProvider.when('/{sessionID:[0-9a-fA-F]{30}}/', '/{sessionID:[0-9a-fA-F]{30}}/clean');
		// $urlRouterProvider.when('/{sessionID:[0-9a-fA-F]{30}}', '/{sessionID:[0-9a-fA-F]{30}}/clean');

		$stateProvider
			.state('upload', {
				url:"/upload",
				templateUrl:'partials/upload.html',
				controller: 'UploadController'
			})
			.state('main',
			{
				url:"/{sessionID:[0-9a-fA-F]{30}}",
				views: {
					'' : {
						templateUrl:'partials/main.html',
						controller: 'MainController'
					},
					'clean@main': {

						templateUrl:'partials/main.clean.html',
						controller: 'CleanController'
					},
					'visualize@main': {

						templateUrl:'partials/main.visualize.html',
						controller: 'VisualizeController'
					},
					'analyze@main': {

						templateUrl:'partials/main.analyze.html',
						controller: 'AnalyzeController'
					}
				}
			});
	}]);