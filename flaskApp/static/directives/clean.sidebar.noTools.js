angular.module('dcs.directives').directive('cleanSidebarNoTools', function() {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: "directives/clean.sidebar.noTools.html",
		link: function(scope, element, attr) {
			scope.$watch('selectedCells', function(newSelection, oldSelection)
			{
				scope.update();
			}, true);

			scope.update = function()
			{
				scope.shouldShow = false;
				//scope.shouldShow = typeof scope.selectedCells === 'object' ? !scope.selectionIsRows(scope.selectedCells) && !scope.selectionIsColumn(scope.selectedCells) : true;
			}

			scope.update();
		}
	}
});