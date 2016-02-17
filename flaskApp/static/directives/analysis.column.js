angular.module('dcs.directives').directive('analysisColumn', ['analysis', 'session', '$timeout', function(analysis, session, $timeout) {
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
							$timeout(
								function()
								{
									scope.analyses = [analysis.general];
									if(typeof analysis.text === 'object')
										scope.analyses.push(analysis.text);
									else if(typeof analysis.numerical === 'object')
										scope.analyses.push(analysis.numerical);
									else
										scope.analyses.push(analysis.date);

									//unique values
									scope.uniqueValues = []
									var iter = 0;
									for(var key in analysis.raw.unique_values)
									{
										if(iter < scope.displayNumberUnique)
										{
											iter +=1;
											scope.uniqueValues.push({metric: analysis.raw.unique_values[key][0] + " : ", value: analysis.raw.unique_values[key][1]});
										}
										else
											break;
									}


									if("word_unique_count" in analysis.raw)
									{
										// text column
										scope.shouldShowFrequencies = true;
										scope.frequencies = []
										var iter = 0;
										for(var key in analysis.raw.word_frequencies)
										{									
											if(iter < scope.displayNumberFrequencies)
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
								}, 0, false);
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