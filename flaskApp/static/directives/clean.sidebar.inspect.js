angular.module('dcs.directives').directive('cleanSidebarInspect', ['$rootScope', 'session', function($rootScope, session) {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: "directives/clean.sidebar.inspect.html",
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
					var dataType = $rootScope.dataTypes[scope.columns[scope.selectedCells.columnStart]];
					scope.shouldShow = (scope.numericalDataTypes.indexOf(dataType) >= 0) && (typeof scope.selectedCells === 'object' ? scope.selectionIsColumn(scope.selectedCells) : false);
				}
			}

			scope.init = function() 
			{
				scope.featureScalingMethod = null;
				scope.featureScalingText = "Apply";
				scope.rangeFrom = 0;
				scope.rangeTo = 1;
				scope.numericalDataTypes = ['int64', 'float64', 'datetime64'];
				scope.update();
			}

			scope.init();
		}
	}
}]);