angular.module('dcs.directives').directive('cleanInspectorBar', ['$rootScope', 'analysis', function($rootScope, analysis) {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: "directives/clean.inspectorBar.html",
		link: function(scope, element, attr) {
			scope.$watch('selectedCells', function(newSelection, oldSelection)
			{
				scope.update();
			}, true);

			scope.update = function()
			{
				if(typeof scope.selectedCells === 'object')
				{
					scope.column = scope.columns[scope.selectedCells.columnStart];
				}
			}

			var Property =
				function(metric, value)
				{
					this.metric = metric;
					this.value = value;
				} 

			scope.subscribeToAnalysis = 
				function(column)
				{
					if(typeof scope.unsubscribe === 'function')
						scope.unsubscribe();
					scope.unsubscribe = analysis.subscribe(scope.column,
						function(analysis)
						{
							scope.$apply(
								function()
								{
									scope.properties = [];
									scope.properties.push(new Property("Data Type", $rootScope.dataTypes[scope.column], null));
									if("word_unique" in analysis) // text column
										scope.properties.push(new Property("Mode", analysis.word_mode[0]));
									else if("std" in analysis) // text column
										scope.properties.push(new Property("Mean", Number(analysis.mean).toFixed(2)));
									scope.properties.push(new Property("Missing/Invalid Values", analysis.invalid));
								});				
						});
				}


			scope.$on('$destroy',
				function()
				{
					if(typeof scope.unsubscribe === 'function')
						scope.unsubscribe();
				});

			scope.$watch('column', 
				function(newVal, oldVal)
				{
					scope.subscribeToAnalysis();
				});

			scope.init = 
				function()
				{
					scope.properties = [new Property("Data Type", "N/A"), new Property("Mean", "N/A"), new Property("Missing/Invalid Values", "N/A")];
				};

			scope.init();
		}
	}
}]);