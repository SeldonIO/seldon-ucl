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
				scope.invalidValuesFilterColumns = [];
				session.subscribeToData(
					function(data)
					{
						scope.columns = data.columns;

						// handle deleted column
						var index = 0;
						var spliced = false;
						while( index < scope.invalidValuesFilterColumns.length )
						{
							if(scope.columns.indexOf(scope.invalidValuesFilterColumns[index]) < 0)
							{
								scope.invalidValuesFilterColumns.splice(index, 1);
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
			scope.$watch('invalidValuesFilterColumns', 
				function(newVal, oldVal)
				{
					scope.onChange({columns: newVal});
				}, true);

			element.init();
		}
	}
}]);