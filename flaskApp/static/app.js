var dcsApp = angular.module('dcs', ['ngMaterial', 'ui.router', 'dcs.controllers', 'dcs.filters', 'dcs.directives']);

dcsApp.config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider',
	function($stateProvider, $urlRouterProvider, $mdThemingProvider)
	{	
		$mdThemingProvider.theme('blue-grey')
			.primaryPalette('blue-grey', {
			  'default': '700',

			})
			.accentPalette('orange');

		$mdThemingProvider.theme('cyan')
			.primaryPalette('cyan', {
			  'default': '700',

			})
			.accentPalette('blue-grey', {
				'default': '700',
			});

		$mdThemingProvider.definePalette('toolTabs', {
	    '50': 'aaaaaa',
	    '100': '999999',
	    '200': 'eeeeee',
	    '300': 'e57373',
	    '400': 'ef5350',
	    '500': 'f44336',
	    '600': 'e53935',
	    '700': 'd32f2f',
	    '800': 'c62828',
	    '900': 'b71c1c',
	    'A100': 'ff8a80',
	    'A200': 'ff5252',
	    'A400': 'ff1744',
	    'A700': 'd50000',
	    'contrastDefaultColor': 'light',
	    'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
	    'contrastLightColors': undefined
	  });

		$mdThemingProvider.theme('grey')
			.primaryPalette('toolTabs', {
			  'default': '200',

			})
			.accentPalette('blue-grey', {
				'default': '700',
			});

    $mdThemingProvider.setDefaultTheme('blue-grey');

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