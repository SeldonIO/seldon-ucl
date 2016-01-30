angular.module('dcs.directives').directive('analysisColumn', ['$rootScope', 'analysis', function($rootScope, analysis) {
	return {
		restrict: 'E',
		scope:
			{
				filterQuery: '=',
				column: '='
			},
		templateUrl: "directives/analysis.column.html",
		link: function(scope, element, attr) {
			scope.init = function() 
			{
				if(scope.column)
				{
					scope.analysis = {"Missing Rows": $rootScope.invalidValues[scope.column].hasInvalidValues ? $rootScope.invalidValues[scope.column].invalidIndices.length : 0};
					scope.updateFilter();
				}
			}

			scope.updateFilter = 
				function()
				{
					if(scope.column)
					{
						if( typeof scope.filterQuery !== 'string' )
							scope.shouldShow = true;
						else
							scope.shouldShow = scope.filterQuery == "" || scope.column.toLowerCase().indexOf(scope.filterQuery.toLowerCase()) >= 0;
					}
				}

			scope.$watch('filterQuery',
				function(newVal, oldVal)
				{
					scope.updateFilter();
				}, true);

			scope.init();
		}
	}
}]);