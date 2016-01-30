angular.module('dcs.directives').directive('cleanInspectorBar', ['$rootScope', 'session', function($rootScope, session) {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: "directives/clean.inspectorBar.html",
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
					scope.shouldShow = true;
				}
			}

			scope.init = function() 
			{
				scope.numericalDataTypes = ['int64', 'float64', 'datetime64'];
				scope.update();
			}

			scope.init();
		}
	}
}]);