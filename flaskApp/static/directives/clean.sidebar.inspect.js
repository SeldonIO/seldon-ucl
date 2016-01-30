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
				if (scope.selectedCells != undefined) {
					scope.columnName = scope.columns[scope.selectedCells.columnStart];
					scope.reset();
				}
			}

			scope.init = function() 
			{
				scope.numericalDataTypes = ['int64', 'float64', 'datetime64'];
				scope.update();
			}

			scope.reset = 
				function()
				{
					//
				};

			scope.$watch('columnName', 
				function(newVal, oldVal)
				{
					if(typeof newVal !== 'undefined' && typeof $rootScope.data !== 'undefined')
					{
						var index = scope.columns.indexOf(scope.columnName);
						scope.changeSelection({rowStart: 0 , rowEnd: scope.hot.getData().length - 1, columnStart: index, columnEnd: index});
						scope.reset();
					}
				});

			scope.init();
		}
	}
}]);