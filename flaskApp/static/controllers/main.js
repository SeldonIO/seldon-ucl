angular.module('dcs.controllers').controller('MainController', ['$scope', '$state', '$stateParams', 'session', '$timeout', '$rootScope', '$mdDialog',
	function($scope, $state, $stateParams, session, $timeout, $rootScope, $mdDialog)
	{
		$scope.init = 
			function()
			{
				if(typeof($stateParams["sessionID"]) !== 'string' || $stateParams["sessionID"].length != 30)
					$state.go('upload');

				$scope.initialLoad = true;

				//$timeout(function() { $rootScope.$broadcast("showLoadingDialog"); } );
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
							$state.go('upload');
							$mdDialog.hide();
						}
					});
			};

		$rootScope.$watch('data',
			function(newVal, oldVal)
			{
				if($scope.initialLoad)
				{
					$timeout(function() { $mdDialog.hide(); });
					$scope.initialLoad = false;
				}
			}, true);

		$scope.init();


	}]);
