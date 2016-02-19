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

									// unique values
									scope.frequencies = analysis.raw.frequencies;
									scope.displayNumberUnique = scope.frequencies.length < 50 ? scope.frequencies.length : 50;

									scope.shouldShowWordFrequencies = "word_unique_count" in analysis.raw;
									scope.wordFrequencies = analysis.raw.word_frequencies;
									scope.displayNumberWordFrequencies = scope.wordFrequencies.length;
									scope.displayNumberWordFrequenciesMax = scope.wordFrequencies.length;
									
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