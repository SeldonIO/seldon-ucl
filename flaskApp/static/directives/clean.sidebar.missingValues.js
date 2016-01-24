angular.module('dcs.directives').directive('cleanSidebarMissingValues', ['$rootScope', 'session', function($rootScope, session) {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: "directives/clean.sidebar.missingValues.html",
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
					scope.shouldShow = typeof scope.selectedCells === 'object' ? scope.selectionIsColumn(scope.selectedCells) : false;
					var dataType = $rootScope.dataTypes[scope.columns[scope.selectedCells.columnStart]];
					scope.shouldShowInterpolation = scope.interpolationAllowedDataTypes.indexOf(dataType) >= 0;
				}
			}

			scope.init = function()
			{
				scope.interpolationAllowedDataTypes = ['int64', 'float64', 'datetime64'];
				scope.missingValsInterpolationMethods = ['Linear', 'Quadratic', 'Cubic', 'Barycentric'];
				scope.update();
			}

			scope.init();

			scope.requestFill =
				function(method)
				{
					session.fillDown(scope.selectedCells.columnStart, scope.selectedCells.columnEnd, method,
						function(success)
						{
							if(!success)
								alert("fill down failed");
						});
				};

			scope.interpolate =
				function()
				{
					method = scope.interpolationMethod;
					session.interpolate(scope.selectedCells.columnStart, method,
						function(success)
						{
							if(!success)
								alert("interpolation failed");
						});
				};
		}
	}
}]);