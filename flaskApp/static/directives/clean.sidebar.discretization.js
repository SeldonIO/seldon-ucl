angular.module('dcs.directives').directive('cleanSidebarDiscretization', ['session', 'dialogs', function(session, dialogs) {
	return {
		restrict: 'E',
		scope: 
			{
				tableSelection: '='
			},
		templateUrl: "directives/clean.sidebar.discretization.html",
		link: function(scope, element, attr) {
			scope.$watchCollection('tableSelection', function(selection, oldSelection)
			{
				if( typeof selection === 'object' && selection.type.indexOf("column") >= 0 && selection.columns.length == 1 && scope.tableSelection.columns[0] in session.columnInfo)
					scope.shouldShow = session.isNumericColumn(scope.tableSelection.columns[0]);
				else
					scope.shouldShow = false;

			});

			element.init = function() {
				scope.quantiling = false;
			}

			element.init();

			scope.cutModeChanged = function() {
				if (scope.cutMode == "discretization") {
					scope.quantiling = false
					scope.customQuantiles = false;
				} else {
					scope.quantiling = true;
				}
			}

			scope.discretize = function() {
				var q = scope.customQuantiles ? scope.quantiles : scope.numberOfBins;
				scope.$emit('showToast', "Discretizing column...");
				scope.$emit('showLoadingDialog');
				session.discretize(session.columns.indexOf(scope.tableSelection.columns[0]), scope.cutMode, q,
					function(success, error, errorDescription) { 
						if(!success) {
							scope.$emit('showToast', "Discretize column failed", 3000);
							dialogs.errorDialog("Discretize column", error, errorDescription);
						} else {
							scope.$emit('showToast', "Successfully discretized column. Loading changes...", 3000);
							scope.$emit('hideLoadingDialogAfterLoad');
						}
					});
			}
		}
	}
}]);