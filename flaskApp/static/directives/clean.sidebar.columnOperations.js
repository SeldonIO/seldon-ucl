angular.module('dcs.directives').directive('cleanSidebarColumnOperations', ['session', function(session) {
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
		templateUrl: "directives/clean.sidebar.columnOperations.html",
		link: function(scope, element, attr) {
			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.columns.length == 1 && selection.rows.length > 1;

			}, true);

			element.init = function()
			{
				scope.inplace = false;
			}

			element.init();

			scope.insertDuplicateColumn =
				function()
				{
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
					session.insertDuplicateColumn(session.columns.indexOf(scope.tableSelection.columns[0]),
						function(success)
						{
							if(!success)
							{
								alert("Duplicate column failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast({message: "Successfully duplicated column. Loading changes...", delay: 3000});
								scope.hideDialog();
							}
						});
				}

			scope.splitColumn =
				function()
				{
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
					session.splitColumn(session.columns.indexOf(scope.tableSelection.columns[0]), scope.delimiter, scope.regex == undefined ? false : true,
						function(success)
						{
							if(!success)
							{
								alert("Split column failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast({message: "Successfully splitted column. Loading changes...", delay: 3000});
								scope.hideDialog();
							}
						});
				}

		}
	}
}]);