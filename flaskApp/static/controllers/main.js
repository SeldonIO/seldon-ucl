angular.module('dcs.controllers').controller('MainController', ['$scope', '$state', '$stateParams', 'session', '$timeout', '$mdDialog',
	function($scope, $state, $stateParams, session, $timeout, $mdDialog)
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
						$timeout(function()
								{
									$mdDialog.hide();
								});
						if(!success)
							$state.go('upload');
						else
						{
							$scope.dataLoaded = true;
							$scope.$digest();
						}
					});
			};

		$scope.init();
	}]);
