angular.module('dcs.controllers').controller('AnalyzeController', ['$scope', 'session', '$timeout',
	function($scope, session, $timeout)
	{
		var self = this;

		self.updateStatistics = 
			function()
			{
				$timeout(
					function()
					{
						$scope.summaryStatistics = {
							"Columns": session.dataSize.columns,
							"Rows": session.dataSize.rows
						};

						$scope.$digest();
					}, 0, false);
			}

		session.subscribeToMetadata({}, 
			function(dataSize, columns, columnInfo)
			{
				$scope.columns = columns;
				self.updateStatistics();
			});
	}]);