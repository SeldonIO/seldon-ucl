angular.module('dcs.controllers').controller('MainController', ['$scope', '$state', '$stateParams', 'session', '$timeout', '$rootScope', '$mdDialog',
	function($scope, $state, $stateParams, session, $timeout, $rootScope, $mdDialog)
	{
		$scope.init = 
			function()
			{
				if(typeof($stateParams["sessionID"]) !== 'string' || $stateParams["sessionID"].length != 30)
					$state.go('upload');

				$scope.initialLoad = true;

				$mdDialog.show({
					templateUrl: 'directives/loading.dialog.html',
					parent: angular.element(document.body),
					clickOutsideToClose:false
				});			

				session.initialize($stateParams["sessionID"],
					function(success)
					{
						if(!success)
						{
							$timeout(function()
								{
									$mdDialog.hide();
								}, 0);
							$state.go('upload');
						}
					});
			};

		$rootScope.$watch('data',
			function(newVal, oldVal)
			{
				if($scope.initialLoad)
				{
					$timeout(function()
								{
									$mdDialog.hide();
								}, 1000);
					$scope.initialLoad = false;
				}
			}, true);

		$scope.init();


	}]);
