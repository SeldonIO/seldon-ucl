angular.module('dcs.directives').directive('cleanSidebarEditRow', ['session', 'dialogs', function(session, dialogs) {
	return {
		restrict: 'E',
		scope: 
			{
				'tableSelection': '='
			},
		templateUrl: "directives/clean.sidebar.editRow.html",
		link: function(scope, element, attr) {
			var self = this;

			scope.$watchCollection('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.type.indexOf("row") >= 0;
				if( scope.shouldShow )
				{
					scope.text = selection.rows.length == 1 ? "Row" : "Rows";
				}
			});

			scope.deleteSelectedRows = function()
			{
				scope.$emit('showToast', "Deleting row(s)...");
				scope.$emit('showLoadingDialog');
				session.deleteRows(scope.tableSelection.rows,
					function(success, error, errorDescription)
					{
						if(!success) {
							scope.$emit('showToast', "Delete row(s) failed", 3000);
							dialogs.errorDialog("Delete row(s)", error, errorDescription);
						} else {
							scope.$emit('showToast', "Successfully deleted row(s)", 3000);
							scope.$emit('hideLoadingDialogAfterLoad');
							scope.$emit('selectFirstCellOfCurrentSelection');
						}
					});
			}
		}
	}
}]);