angular.module('dcs.directives').directive('cleanSidebarNoTools', function() {
	return {
		restrict: 'E',
		scope: 
			{
				'tableSelection': '='
			},
		templateUrl: "directives/clean.sidebar.noTools.html",
		link: function(scope, element, attr) {
			scope.$watch('tableSelection', function(newSelection, oldSelection)
			{
				scope.shouldShow = false;
				//scope.shouldShow = typeof scope.selectedCells === 'object' ? !scope.selectionIsRows(scope.selectedCells) && !scope.selectionIsColumn(scope.selectedCells) : true;
			}, true);
		}
	}
});