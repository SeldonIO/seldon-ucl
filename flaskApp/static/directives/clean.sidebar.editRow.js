angular.module('dcs.directives').directive('cleanSidebarEditRow', ['session', function(session) {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: "directives/clean.sidebar.editRow.html",
		link: function(scope, element, attr) {
			var self = this;

			scope.$watch('selectedIndices', function(selection, oldSelection)
			{
				if( typeof selection === 'object' && selection.rows.length > 0 && typeof session.data === 'object' && selection.columns.length == session.columns.length)
				{
					scope.shouldShow = true;
					scope.text = selection.rows.length == 1 ? "Row" : "Rows";
				}
				else
					scope.shouldShow = false;
			}, true);

			self.init = function()
			{
				scope.missingValsInterpolationMethods = ['Linear', 'Quadratic', 'Cubic', 'Barycentric'];
			}

			self.init();

			scope.deleteSelectedRows = function()
			{
				session.deleteRows(scope.selectedIndices.rows,
					function(success)
					{
						if(!success)
							alert("deletion failed");

						scope.selectFirstCellOfCurrentSelection(true);
					});
			}
		}
	}
}]);