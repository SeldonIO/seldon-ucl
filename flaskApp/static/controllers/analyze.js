angular.module('dcs.controllers').controller('AnalyzeController', ['$scope', 'session', '$timeout',
	function($scope, session, $timeout)
	{
		var self = this;

		self.columnsSortedByInvalidValuesCount = 
			function()
			{
				var toReturn = [];
				for(var index = 0 ; index < session.columns.length ; index++)
					if(session.invalidValues[session.columns[index]].hasInvalidValues)
						toReturn.push({column: session.columns[index], numberOfInvalidValues: session.invalidValues[session.columns[index]].invalidIndices.length});
				return toReturn.sort(function(a, b) { return a.numberOfInvalidValues > b.numberOfInvalidValues });
			}

		self.updateStatistics = 
			function()
			{
				$timeout(
					function()
					{
						var columnsSortedByInvalidValuesCount = self.columnsSortedByInvalidValuesCount();
						$scope.summaryStatistics = {
							"Columns": session.columns.length,
							"Rows": session.data.length,
							"Columns with invalid rows": columnsSortedByInvalidValuesCount.length };
						if(columnsSortedByInvalidValuesCount.length >= 2)
						{
							var last = columnsSortedByInvalidValuesCount.pop();
							$scope.summaryStatistics["Column with most invalid values"] = last.column + " (" + last.numberOfInvalidValues + ")";
						}

						$scope.$digest();
					}, 0, false);
			}

		session.subscribeToData(
			function(data)
			{
				$scope.columns = data.columns;
				self.updateStatistics();
			});
	}]);