angular.module('dcs.directives').directive('cleanSidebarDiscretization', ['session', function(session) {
	return {
		restrict: 'E',
		scope: 
			{
				tableSelection: '=',
				showToast: '&',
				showLoadingDialog: '&',
				hideToast: '&',
				hideDialog: '&'
			},
		templateUrl: "directives/clean.sidebar.discretization.html",
		link: function(scope, element, attr) {
			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				if( typeof scope.tableSelection === 'object' && scope.tableSelection.columns.length == 1 && scope.tableSelection.rows.length > 1 && scope.tableSelection.columns[0] in session.columnInfo)
				{
					var dataType = session.columnInfo[scope.tableSelection.columns[0]].dataType;
					scope.shouldShow = (self.numericalDataTypes.indexOf(dataType) >= 0);
					self.reset();
				}
				else
					scope.shouldShow = false;

			}, true);

			element.init = function()
			{
				scope.quantiling = false;
			}

			element.init();

			scope.cutModeChanged =
				function()
				{
					if (scope.cutMode == "discretization") {
						scope.quantiling = false
						scope.customQuantiles = false;
					} else {
						scope.quantiling = true;
					}
				}

			scope.discretize =
				function()
				{
					var q = scope.customQuantiles ? scope.quantiles : scope.numberOfBins;
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
					session.discretize(session.columns.indexOf(scope.tableSelection.columns[0]), scope.cutMode, q,
						function(success)
						{
							if(!success)
							{
								alert("Discretization failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast({message: "Successfully discretized column. Loading changes...", delay: 3000});
								scope.hideDialog();
							}
						});
				}

		}
	}
}]);