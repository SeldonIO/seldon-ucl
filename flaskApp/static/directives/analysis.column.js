angular.module('dcs.directives').directive('analysisColumn', ['analysis', 'session', function(analysis, session) {
	return {
		restrict: 'E',
		scope:
			{
				filterQuery: '=',
				column: '='
			},
		templateUrl: "directives/analysis.column.html",
		link: function(scope, element, attr) {
			scope.update = 
				function()
				{
					scope.updateFilter();
					element.subscribeToAnalysis(scope.column);
				};

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
				};

			scope.changing =
				function()
				{
					element.subscribeToAnalysis(scope.column);
				};

			element.subscribeToAnalysis = 
				function(column)
				{
					if(typeof element.unsubscribe === 'function')
						element.unsubscribe();
					element.unsubscribe = analysis.subscribe(column,
						function(analysis)
						{
							scope.analyses = [analysis.general];
							if(typeof analysis.text === 'object')
								scope.analyses.push(analysis.text);
							else if(typeof analysis.numerical === 'object')
								scope.analyses.push(analysis.numerical);
							else
								scope.analyses.push(analysis.date);

							if("word_unique_count" in analysis.raw)
							{
								// text column
								scope.shouldShowFrequencies = true;
								scope.frequencies = []
								var iter = 0;
								console.log(JSON.stringify(analysis.raw.word_frequencies));
								for(var key in analysis.raw.word_frequencies)
								{									
									if(iter < scope.displayNumber)
									{
										iter += 1;
										scope.frequencies.push({ metric: analysis.raw.word_frequencies[key][0] + " : ", value: analysis.raw.word_frequencies[key][1] });
									}
									else
										break;
								}
							}
							else
								scope.shouldShowFrequencies = false;
							
							scope.$digest();			
						});
				}

			scope.$on('$destroy',
				function()
				{
					if(typeof element.unsubscribe === 'function')
						element.unsubscribe();
				});

			scope.$watch('column',
				function(newVal, oldVal)
				{
					if(typeof newVal === 'string')
					{
						scope.update();
					};
				});

			scope.$watch('filterQuery',
				function(newVal, oldVal)
				{
					scope.updateFilter();
				}, true);
		}
	}
}]);