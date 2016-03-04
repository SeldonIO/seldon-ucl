angular.module('dcs.directives').directive('cleanSidebarFilter', ['session', function(session) {
	return {
		restrict: 'E',
		scope: 
			{
				onChange: '&onChange',
				showToast: '&',
				showLoadingDialog: '&',
				hideToast: '&',
				hideDialog: '&'
			},
		templateUrl: "directives/clean.sidebar.filter.html",
		link: function(scope, element, attr) {
			element.init = function() 
			{
				scope.shouldShow = true;
				scope.filterColumns = [];
				session.subscribeToMetadata({}, 
					function(dataSize, columns, columnInfo)
					{
						scope.columns = columns;

						// handle deleted column
						var index = 0;
						var spliced = false;
						while( index < scope.filterColumns.length )
						{
							if(scope.columns.indexOf(scope.filterColumns[index]) < 0)
							{
								scope.filterColumns.splice(index, 1);
								spliced = true;
							}
							else
								index++;
						}
						if(spliced)
							scope.onChange(scope.columns);
					})
			}

			scope.querySearch = function(query)
			{
		      var results = query ? scope.columns.filter(element.createFilterFor(query)) : [];
		      return results;
		    }

			element.createFilterFor = function(query)
			{
				var lowercaseQuery = angular.lowercase(query);
				return function filterFn(currentColumnName)
				{
					return currentColumnName.toLowerCase().indexOf(lowercaseQuery) >= 0;
				};
			}

			// PERFORMANCE KILLER below
			scope.$watch('filterColumns', 
				function(newVal, oldVal)
				{
					scope.onChange({columns: scope.filterColumns, type: scope.filterType});
				}, true);

			// PERFORMANCE KILLER below
			scope.$watch('filterType', 
				function(newVal, oldVal)
				{
					scope.onChange({columns: scope.filterColumns, type: scope.filterType});
				}, true);

			element.init();
		}
	}
}]);