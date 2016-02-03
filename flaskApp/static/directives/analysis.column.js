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
			var Statistic =
				function(metric, value, detail)
				{
					this.metric = metric;
					this.value = value;
					this.detail = detail;
				}

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

			element.subscribeToAnalysis = 
				function(column)
				{
					if(typeof element.unsubscribe === 'function')
						element.unsubscribe();
					element.unsubscribe = analysis.subscribe(column,
						function(analysis)
						{
							var basicAnalysis = [];
							basicAnalysis.push(new Statistic("Unique values", analysis.unique, null));
							basicAnalysis.push(new Statistic("Missing/Invalid values", analysis.invalid, (100.0 * analysis.invalid / session.data.length).toFixed(1) + "%"));
							
							// mode
							if(analysis["mode"] != null)
							{
								var mode = analysis.mode[0];
								for(var index = 1 ; index < analysis.mode.length ; index++)
								{
									if(index >= 3)
									{
										mode += ", ..."
										break;
									}
									else
										mode += ", " + analysis.mode[index]
								}
								basicAnalysis.push(new Statistic("Mode", mode, analysis.mode_count + " occurrences"));
							}
							else
								basicAnalysis.push(new Statistic("Mode", "None", null));


							scope.analyses = [basicAnalysis];

							if("word_unique" in analysis)
							{
								// text column
								var textAnalysis = [];
								textAnalysis.push(new Statistic("Total words", analysis.word_total, null));
								textAnalysis.push(new Statistic("Unique words", analysis.word_unique, null));
								
								var mostProminentWord = analysis.word_mode[0];
								for(var index = 1 ; index < analysis.word_mode.length ; index++)
								{
									if(index >= 3)
									{
										mostProminentWord += ", ..."
										break;
									}
									else
										mostProminentWord += ', "' + analysis.word_mode[index] + '"'
								}

								textAnalysis.push(new Statistic(analysis.word_mode.length > 1 ? "Most prominent words" : "Most prominent word", mostProminentWord, analysis.word_mode_count + " occurrences"));
								textAnalysis.push(new Statistic("Average word length", Number(analysis.word_length_average).toFixed(2) + " letters", null));
								textAnalysis.push(new Statistic("Word length range", analysis.word_length_min + " to " + analysis.word_length_max + " words", null));
								scope.analyses.push(textAnalysis);
							}
							else if("mean" in analysis)
							{
								// number column
								var numericalAnalysis = [];
								numericalAnalysis.push(new Statistic("Mean", Number(analysis.mean).toFixed(2), null));
								numericalAnalysis.push(new Statistic("Standard deviation", Number(analysis.std).toFixed(2), null));
								numericalAnalysis.push(new Statistic("Minimum", Number(analysis.min).toFixed(2), null));
								numericalAnalysis.push(new Statistic("Lower quartile", Number(analysis["25%"]).toFixed(2), null));
								numericalAnalysis.push(new Statistic("Median", Number(analysis["50%"]).toFixed(2), null));
								numericalAnalysis.push(new Statistic("Upper quartile", Number(analysis["75%"]).toFixed(2), null));
								numericalAnalysis.push(new Statistic("Maximum", Number(analysis.max).toFixed(2), null));
								scope.analyses.push(numericalAnalysis);
							}
							
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