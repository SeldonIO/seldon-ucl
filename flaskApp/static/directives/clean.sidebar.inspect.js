angular.module('dcs.directives').directive('cleanSidebarInspect', ['$rootScope', 'analysis', function($rootScope, analysis) {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: "directives/clean.sidebar.inspect.html",
		link: function(scope, element, attr) {
			scope.$watch('selectedCells', function(newSelection, oldSelection)
			{
				scope.update();
			}, true);

			scope.update = function()
			{
				if (scope.selectedCells != undefined && scope.selectionIsColumn(scope.selectedCells))
				{
					scope.column = scope.columns[scope.selectedCells.columnStart];
					scope.subscribeToAnalysis();
				}
			}

			var Statistic = 
				function(metric, value, detail)
				{
					this.metric = metric;
					this.value = value;
					this.detail = detail;
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
									scope.properties.push(new Statistic("Data type", $rootScope.dataTypes[scope.column], null));
									scope.properties.push(new Statistic("Unique values", analysis.unique, null));
									scope.properties.push(new Statistic("Missing/Invalid values", analysis.invalid, (100.0 * analysis.unique / $rootScope.data.length).toFixed(1) + "%"));

									scope.analysis = []; 
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
										scope.analysis.push(new Statistic("Mode", mode, analysis.mode_count + " occurrences"));
									}
									else
										scope.analysis.push(new Statistic("Mode", "None", null));

									if("word_unique" in analysis)
									{
										// text column
										scope.analysis.push(new Statistic("Total words", analysis.word_total, null));
										scope.analysis.push(new Statistic("Unique words", analysis.word_unique, null));
										
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

										scope.analysis.push(new Statistic(analysis.word_mode.length > 1 ? "Most prominent words" : "Most prominent word", mostProminentWord, analysis.word_mode_count + " occurrences"));
										scope.analysis.push(new Statistic("Average word length", Number(analysis.word_length_average).toFixed(2) + " letters", null));
										scope.analysis.push(new Statistic("Word length range", analysis.word_length_min + " to " + analysis.word_length_max + " words", null));
									}
									else if("mean" in analysis)
									{
										// number column
										scope.analysis.push(new Statistic("Mean", Number(analysis.mean).toFixed(2), null));
										scope.analysis.push(new Statistic("Standard deviation", Number(analysis.std).toFixed(2), null));
										scope.analysis.push(new Statistic("Minimum", Number(analysis.min).toFixed(2), null));
										scope.analysis.push(new Statistic("Lower quartile", Number(analysis["25%"]).toFixed(2), null));
										scope.analysis.push(new Statistic("Median", Number(analysis["50%"]).toFixed(2), null));
										scope.analysis.push(new Statistic("Upper quratile", Number(analysis["75%"]).toFixed(2), null));
										scope.analysis.push(new Statistic("Maximum", Number(analysis.max).toFixed(2), null));
									}
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
					if(typeof newVal !== 'undefined' && typeof $rootScope.data !== 'undefined')
					{
						var index = scope.columns.indexOf(scope.column);
						scope.changeSelection({rowStart: 0 , rowEnd: scope.hot.getData().length - 1, columnStart: index, columnEnd: index});
						scope.subscribeToAnalysis();
					}
				});
		}
	}
}]);