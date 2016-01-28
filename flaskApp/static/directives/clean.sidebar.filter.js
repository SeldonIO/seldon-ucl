angular.module('dcs.directives').directive('cleanSidebarFilter', ['$rootScope', 'session', function($rootScope, session) {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: "directives/clean.sidebar.filter.html",
		link: function(scope, element, attr) {
			scope.$watch('selectedCells', function(newSelection, oldSelection)
			{
				scope.update();
			}, true);

			$rootScope.$watch('dataTypes', function(newVal, oldVal)
			{
				scope.update()
			}, true);

			scope.update = function()
			{
				if(typeof scope.selectedCells === 'object')
				{
					scope.shouldShow = true;
					var dataType = $rootScope.dataTypes[scope.columns[scope.selectedCells.columnStart]];
				}
			}

			scope.init = function() 
			{
				scope.invalidValuesFilterColumns = [];
				scope.shouldShow = true;
				scope.update();
			}

			scope.querySearch = function(query)
			{
	      var results = query ? scope.columns.filter(scope.createFilterFor(query)) : [];
	      return results;
	    }
	    
	    scope.createFilterFor = function(query)
	    {
	      var lowercaseQuery = angular.lowercase(query);
	      return function filterFn(currentColumnName)
	      {
	      	return currentColumnName.toLowerCase().indexOf(lowercaseQuery) >= 0;
	      };
	    }

	    scope.$watch('invalidValuesFilterColumns', 
	    	function(newVal, oldVal)
	    	{
	    		scope.setInvalidValuesFilterColumns(newVal);
	    	}, true);

	    scope.$watch('data',
	    	function(newVal, oldVal)
	    	{
	    		scope.setInvalidValuesFilterColumns(scope.invalidValuesFilterColumns);
	    	}, true);

			scope.init();
		}
	}
}]);