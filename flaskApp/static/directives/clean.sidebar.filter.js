angular.module('dcs.directives').directive('cleanSidebarFilter', ['session', function(session) {
	return {
		restrict: 'E',
		scope: 
			{
				onChange: '&onChange'
			},
		templateUrl: "directives/clean.sidebar.filter.html",
		link: function(scope, element, attr) {
			element.init = function() 
			{
				scope.shouldShow = true;
				scope.filterColumns = [];
				scope.columnFilter = scope.duplicateGroupByFilter = function(column) { return false };
			}

			scope.notifyListener = function() {
				scope.onChange({columns: scope.filterType == "duplicates" && scope.duplicateAllColumns ? "all" : scope.filterColumns, type: scope.filterType});
			}

			scope.filterColumnsChanged = function(columns) {
				scope.filterColumns = columns;

				if(scope.filterType == "duplicates" && scope.filterColumns.length > 0 && scope.filterColumns.indexOf(scope.duplicateGroupByFilterColumn) < 0)
					scope.duplicateGroupByFilterColumn = scope.filterColumns[0];

				scope.notifyListener();
			}

			scope.filterTypeChanged = function(filterType) {
				if(filterType == "invalid") {
					scope.columnFilter = function(column) {
						return session.columnInfo[column].invalidValues > 0;
					}
				} else if(filterType == "duplicates") {
					scope.columnFilter = function(column) {
						return true;
					}
				} else if(filterType == "outliers") {
					scope.columnFilter = function(column) {
						var dataType = angular.lowercase(session.columnInfo[column].dataType);
						return dataType.indexOf("int") >= 0 || dataType.indexOf("float") >= 0 || dataType.indexOf("double") >= 0; 
					}
				}

				if(scope.filterColumns instanceof Array && scope.filterColumns.length > 0 && typeof scope.filterType === 'string')
					scope.notifyListener();
			};

			scope.duplicateGroupByFilterColumnChanged = function(column) {
				var index = scope.filterColumns.indexOf(column);
				if(scope.filterType == "duplicates" && scope.filterColumns.length > 0 && index >= 0) {
					var temp = scope.filterColumns[0];
					scope.filterColumns[0] = scope.filterColumns[index];
					scope.filterColumns[index] = temp;
				}
			}

			element.init();
		}
	}
}]);