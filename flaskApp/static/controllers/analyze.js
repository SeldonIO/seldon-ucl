angular.module('dcs.controllers').controller('AnalyzeController', ['$scope', 'session', '$rootScope', 
	function($scope, session, $rootScope)
	{
		$rootScope.$watch('data',
			function(newVal, oldVal)
			{
				if(typeof newVal !== 'undefined')
				{
					$scope.columns = $scope.getColumns($rootScope.data);
					$scope.updateStatistics();
				}
			}, true);

		$rootScope.$watch('dataTypes',
			function(newVal, oldVal)
			{
				
			}, true);

		$scope.columnsSortedByInvalidValuesCount = 
			function()
			{
				var toReturn = [];
				if( typeof $rootScope.data !== 'undefined' && typeof $rootScope.invalidValues !== 'undefined')
					for(var index = 0 ; index < $scope.columns.length ; index++)
						if($rootScope.invalidValues[$scope.columns[index]].hasInvalidValues)
							toReturn.push({column: $scope.columns[index], numberOfInvalidValues: $rootScope.invalidValues[$scope.columns[index]].invalidIndices.length});
				return toReturn.sort(function(a, b) { return a.numberOfInvalidValues > b.numberOfInvalidValues });
			}

		$scope.updateStatistics = 
			function()
			{
				if( typeof $rootScope.data !== 'undefined' )
				{
					var columnsSortedByInvalidValuesCount = $scope.columnsSortedByInvalidValuesCount();
					$scope.summaryStatistics = {
						"Columns": $scope.columns.length,
						"Rows": $rootScope.data.length,
						"Columns with invalid rows": columnsSortedByInvalidValuesCount.length };
					if(columnsSortedByInvalidValuesCount.length >= 2)
					{
						var last = columnsSortedByInvalidValuesCount.pop();
						$scope.summaryStatistics["Column with most invalid values"] = last.column + " (" + last.numberOfInvalidValues + ")";
					}
					console.log('updating statistics ' + JSON.stringify($scope.summaryStatistics));
				}
			}

		$scope.init = 
			function()
			{
				$scope.columns = $scope.getColumns($rootScope.data);
				$scope.updateStatistics();
			};

		$scope.getColumns =
			function(data)
			{
				toReturn = [];
				if(typeof data === 'object')
					for(var key in data[0])
						toReturn.push(key);
				return toReturn;
			};

		$scope.init();
	}]);