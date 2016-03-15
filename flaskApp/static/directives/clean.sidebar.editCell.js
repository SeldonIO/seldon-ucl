angular.module('dcs.directives').directive('cleanSidebarEditCell', ['session', function(session) {
	return {
		restrict: 'E',
		scope: 
			{
				tableSelection: '=',
				showToast: '&',
				showLoadingDialog: '&',
				hideToast: '&',
				hideDialog: '&',
				selectedIndices: '&'
			},
		templateUrl: "directives/clean.sidebar.editCell.html",
		link: function(scope, element, attr) {
			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.columns.length == 1 && selection.rows.length == 1;
			}, true);

			element.init = function()
			{
				scope.inplace = false;
			}

			element.init();

			scope.newCellValue =
				function()
				{
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
					session.newCellValue(session.columns.indexOf(scope.tableSelection.columns[0]), scope.tableSelection.rows[0], scope.newValue == undefined ? "" : scope.newValue,
						function(success)
						{
							if(!success)
							{
								alert("Edit cell failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast({message: "Successfully edited cell. Loading changes...", delay: 3000});
								scope.hideDialog();
							}
						});
				}

		}
	}
}]);