angular.module('dcs.directives').directive('cleanInspectorBar', ['analysis', 'session', '$timeout', function(analysis, session, $timeout) {
	return {
		restrict: 'E',
		scope: 
			{
				tableSelection: '=',
				showToast: '&',
				showLoadingDialog: '&',
				hideToast: '&',
				hideDialog: '&'
			},
		templateUrl: "directives/clean.inspectorBar.html",
		link: function(scope, element, attr) {
			var Property =
				function(metric, value)
				{
					this.metric = metric;
					this.value = value;
				};

			element.subscribeToAnalysis = 
				function()
				{
					if(typeof element.unsubscribe === 'function')
						element.unsubscribe();
					element.unsubscribe = analysis.subscribe(scope.column,
						function(analysis)
						{
							$timeout(
								function()
								{
									scope.properties = [];
									scope.properties.push(new Property("Data Type", session.dataTypes[scope.column], null));
									if("word_unique_count" in analysis.raw) // text column
										scope.properties.push(new Property("Mode", analysis.raw.word_mode[0]));
									else if("std" in analysis.raw) // number column
										scope.properties.push(new Property("Mean", Number(analysis.raw.mean).toFixed(2)));
									else // date column
										scope.properties.push(new Property("Median", analysis.raw.median));
									scope.properties.push(new Property("Missing/Invalid Values", analysis.raw.invalid));

									scope.$digest();		
								}, 0, false);
						});
				}

			scope.$watch('tableSelection', function(selection, oldVal)
			{ 
				if(typeof session.columns === 'object' && typeof selection === 'object' && selection.columns.length > 0)
				{
					if( typeof selection.columns[0] === 'string' && selection.columns[0] != scope.column )
					{
						scope.column = selection.columns[0];
						element.subscribeToAnalysis();
					}
				}
			}, true);

			scope.$on('$destroy',
				function()
				{
					if(typeof element.unsubscribe === 'function')
					{
						element.unsubscribe();
					}
				});

			scope.properties = [new Property("Data Type", "N/A"), new Property("Mean", "N/A"), new Property("Missing/Invalid Values", "N/A")];
		}
	}
}]);