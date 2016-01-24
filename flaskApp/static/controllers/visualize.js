angular.module('dcs.controllers').controller('VisualizeController', ['$scope', '$rootScope', '$state', 'session', 
	function($scope, $rootScope, $state, session)
	{
		$rootScope.$watch('data',
			function(newVal, oldVal)
			{
				$scope.init();
			}, true);

		$rootScope.$watch('dataTypes',
			function(newVal, oldVal)
			{
				$scope.init();
			}, true);

		$scope.init = 
			function()
			{
				$scope.data = $rootScope.data;
				if(typeof $scope.data !== 'undefined')
				{
					$scope.plotly = {x:[], y:[]};
					for(var index = 0 ; index < $scope.data.length ; index++)
					{
						$scope.plotly['x'].push($scope.data[index]["day"]);
						$scope.plotly['y'].push($scope.data[index]["temperature"]);
					}
					Plotly.newPlot('tester', [$scope.plotly], {margin:{t:0}});
				}
			};

		$scope.init();
	}]);