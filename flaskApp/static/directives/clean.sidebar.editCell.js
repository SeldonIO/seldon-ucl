angular.module('dcs.directives').directive('cleanSidebarEditCell', ['session', 'dialogs', function(session, dialogs) {
	return {
		restrict: 'E',
		scope: 
			{
				tableSelection: '='
			},
		templateUrl: "directives/clean.sidebar.editCell.html",
		link: function(scope, element, attr) {
			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.columns.length == 1 && selection.rows.length == 1;
			}, true);

			scope.newCellValue = function() {
				scope.$emit('showToast', "Changing cell value...");
				scope.$emit('showLoadingDialog');
				session.newCellValue(session.columns.indexOf(scope.tableSelection.columns[0]), scope.tableSelection.rows[0], scope.newValue == undefined ? "" : scope.newValue,
					function(success, error, errorDescription) { 
						if(!success) {
							scope.$emit('showToast', "Change cell value failed", 3000);
							dialogs.errorDialog("Change cell value", error, errorDescription);
						} else {
							scope.$emit('showToast', "Successfully changed cell value. Loading changes...", 3000);
							scope.$emit('hideLoadingDialogAfterLoad');
						}
					});
			};
		}
	}
}]);