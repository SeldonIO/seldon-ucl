angular.module('dcs.directives').directive('cleanSidebarSearch', ['session', function(session) {
	return {
		restrict: 'E',
		scope: 
			{
				onChange: '&onChange'
			},
		templateUrl: "directives/clean.sidebar.search.html",
		link: function(scope, element, attr) {
			element.init = function() 
			{
				scope.shouldShow = true;
				scope.canSearch = false;
				scope.allColumns = true;
			}

			scope.searchColumnsChanged = function(columns) {
				scope.searchColumns = columns;
				scope.searchCriteriaChanged();
			}

			scope.searchCriteriaChanged = function() {
				if(typeof scope.query === "string" && scope.query.length > 0) {
					if(scope.allColumns || (scope.searchColumns instanceof Array && scope.searchColumns.length > 0)) {
						scope.canSearch = true;
					} else {
						scope.canSearch = false;
					}
				}
			}

			scope.search = function(order) {
				scope.canSearch = false;
				element.notifyListener();
			}

			scope.reset = function() {
				scope.query = undefined;
				scope.canSearch = false;
				scope.showButtons = false;
				element.notifyListener();
			}

			element.notifyListener = function() {
				scope.onChange({columns: scope.allColumns ? "all" : scope.searchColumns, query: scope.query, regex: scope.regex});
			};

			element.init();
		}
	}
}]);