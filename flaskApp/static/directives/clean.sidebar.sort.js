angular.module('dcs.directives').directive('cleanSidebarSort', ['session', function(session) {
	return {
		restrict: 'E',
		scope: 
			{
				onChange: '&onChange'
			},
		templateUrl: "directives/clean.sidebar.sort.html",
		link: function(scope, element, attr) {
			element.init = function() 
			{
				scope.shouldShow = true;
				scope.order = "ascending";
			}

			scope.sortColumnChanged = function(columns) {
				if(columns instanceof Array && columns.length > 0)
					scope.sortColumn = columns[0];
				else
					scope.sortColumn = undefined;
				scope.onChange({sortColumn: scope.sortColumn, ascending: scope.order == "ascending"});
			}

			scope.orderChanged = function(order) {
				scope.onChange({sortColumn: scope.sortColumn, ascending: scope.order == "ascending"});
			}

			element.init();
		}
	}
}]);