angular.module('dcs.directives').directive('cleanInspectorBar', ['analysis', 'session', '$timeout', function(analysis, session, $timeout) {
	return {
		restrict: 'E',
		scope: 
			{
				tableSelection: '='
			},
		templateUrl: "directives/clean.inspectorBar.html",
		link: function(scope, element, attr) {
			var _this = this;

			var Property =
				function(metric, value)
				{
					this.metric = metric;
					this.value = value;
				} 

			scope.subscribeToAnalysis = 
				function()
				{
					if(typeof _this.unsubscribe === 'function')
						_this.unsubscribe();
					console.log("requestin analysis");
					_this.unsubscribe = analysis.subscribe(scope.column,
						function(analysis)
						{
							console.log("received analysis " + JSON.stringify(analysis));
							$timeout(
								function()
								{
									scope.properties = [];
									scope.properties.push(new Property("Data Type", session.dataTypes[scope.column], null));
									if("word_unique" in analysis) // text column
										scope.properties.push(new Property("Mode", analysis.word_mode[0]));
									else if("std" in analysis) // text column
										scope.properties.push(new Property("Mean", Number(analysis.mean).toFixed(2)));
									scope.properties.push(new Property("Missing/Invalid Values", analysis.invalid));

									scope.$digest();		
								});
						});
				}

			scope.$watch('tableSelection', function(selection, oldVal)
			{ 
				if(typeof session.columns === 'object' && typeof selection === 'object' && selection.columns.length > 0)
				{
					if( typeof selection.columns[0] === 'string' && selection.columns[0] != scope.column )
					{
						scope.column = selection.columns[0];
						scope.subscribeToAnalysis();
					}
				}
			}, true);

			scope.$on('$destroy',
				function()
				{
					if(typeof scope.unsubscribe === 'function')
						scope.unsubscribe();
				});

			scope.properties = [new Property("Data Type", "N/A"), new Property("Mean", "N/A"), new Property("Missing/Invalid Values", "N/A")];
		}
	}
}]);