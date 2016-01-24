angular.module('dcs.directives').directive('cleanSidebarEditRow', ['$rootScope', 'session', function($rootScope, session) {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: "directives/clean.sidebar.editRow.html",
		link: function(scope, element, attr) {
			scope.$watch('selectedCells', function(newSelection, oldSelection)
			{
				scope.update();
			}, true);

			scope.update = function()
			{
				scope.shouldShow = typeof scope.selectedCells === 'object' ? scope.selectionIsRows(scope.selectedCells) : false;
				if(scope.shouldShow)
				{
					scope.text = scope.selectedCells.rowStart == scope.selectedCells.rowEnd ? "Row" : "Rows";
				}
			}

			scope.init = function()
			{
				scope.missingValsInterpolationMethods = ['Linear', 'Quadratic', 'Cubic', 'Barycentric'];
				scope.update();
			}

			scope.init();

			scope.deleteSelectedRows = function()
			{
				session.deleteRows(scope.selectedCells.rowStart, scope.selectedCells.rowEnd,
					function(success)
					{
						if(!success)
							alert("deletion failed");

						scope.changeSelection({rowStart: scope.selectedCells.rowStart, rowEnd: scope.selectedCells.rowStart, columnStart: 0, columnEnd: 0});
						scope.userDidSelect(scope.selectedCells.rowStart, 0, scope.selectedCells.rowStart, 0);
					});
			}
		}
	}
}]);