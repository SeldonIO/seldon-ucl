angular.module('dcs.directives').directive('cleanSidebarInspect', ['analysis', 'session', '$timeout', function(analysis, session, $timeout) {
	return {
		restrict: 'E',
		scope:
			{
				onColumnChange: '&',
				tableSelection: '='
			},
		templateUrl: "directives/clean.sidebar.inspect.html",
		link: function(scope, element, attr) {
			scope.$watchCollection('tableSelection', function(selection, oldSelection)
			{
				if(typeof session.columns === 'object' && typeof selection === 'object' && selection.columns.length > 0)
				{
					if( typeof selection.columns[0] === 'string' && selection.columns[0] != scope.column )
					{
						scope.column = selection.columns[0];
						element.subscribeToAnalysis();
					}
				}
			});

			var Statistic = 
				function(metric, value, detail)
				{
					this.metric = metric;
					this.value = value;
					this.detail = detail;
				}

			element.subscribeToAnalysis = 
				function(column)
				{
					if(typeof element.unsubscribe === 'function')
						element.unsubscribe();
					element.unsubscribe = analysis.subscribe(scope.column,
						function(analysis)
						{
							$timeout(
								function()
								{
									scope.columns = session.columns;
								 	scope.properties = analysis.general;
								 	
								 	if(typeof analysis.text === 'object')
								 		scope.analysis = analysis.text;
								 	else if(typeof analysis.numerical === 'object')
								 		scope.analysis = analysis.numerical;
								 	else if(typeof analysis.date === 'object')
								 		scope.analysis = analysis.date;
									
									scope.$digest();
								}, 0, false);			
						});
				}

			scope.$on('$destroy',
				function()
				{
					if(typeof element.unsubscribe === 'function')
					{
						element.unsubscribe();
					}
				});

			scope.userChangedColumn = 
				function(columnName)
				{
					if(typeof session.columns === 'object' && session.columns.indexOf(columnName) >= 0)
					{
						scope.onColumnChange({'column': columnName, 'digest': false});
						element.subscribeToAnalysis();
					}
				};

			scope.columns = session.columns;
		}
	}
}]);