angular.module('dcs.controllers').controller('MainController', ['$scope', '$state', '$stateParams', 'session', 
	function($scope, $state, $stateParams, session)
	{
		$scope.init = 
			function()
			{
				if(typeof($stateParams["sessionID"]) !== 'string' || $stateParams["sessionID"].length != 30)
					$state.go('upload');

				session.initialize($stateParams["sessionID"],
					function(success)
					{
						if(!success)
							$state.go('upload');
					});
			};

		$scope.init();
	}]);