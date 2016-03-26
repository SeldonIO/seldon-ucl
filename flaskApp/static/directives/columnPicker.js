angular.module('dcs.directives').directive('columnPicker', ['session', '$timeout', function(session, $timeout) {
	return {
		restrict: 'E',
		scope: 
			{
				placeholder: '@',
				filter: '=',
				changed: '=',
				disabled: '=',
				enabled: '=',
				max: '@'
			},
		templateUrl: "directives/columnPicker.html",
		link: function(scope, element, attr) {
			scope.init = function() {
				scope.selection = [];
				scope.setSearchColumns();
				scope.unsubscribe = session.subscribeToMetadata({}, scope.setSearchColumns);
			};

			scope.$watch('ngDisabled', function() {
				if(typeof scope.ngDisabled === 'boolean')
					scope.updateEnabled();
			});

			scope.$watch('ngEnabled', function() {
				if(typeof scope.ngEnabled === 'boolean')
					scope.updateEnabled();
			});

			scope.$watch('max', function() {
				scope.max = parseInt(scope.max);
				if(typeof scope.max === 'number' && scope.max >= 0) {
					// delete extras
					scope.selection = scope.selection.slice(0, scope.max);
					scope.updateEnabled();
				}
			});

			scope.updateEnabled = function() {
				$timeout(function() {
					if((typeof scope.disabled === 'boolean' && scope.disabled) || (typeof scope.enabled === 'boolean' && !scope.enabled) || (typeof scope.max === 'number' && scope.selection.length >= scope.max)) {
						element[0].getElementsByTagName("md-autocomplete")[0].disabled = true;
						element[0].getElementsByTagName("md-autocomplete")[0].style.display = "none";
					} else {
						element[0].getElementsByTagName("md-autocomplete")[0].disabled = false;
						element[0].getElementsByTagName("md-autocomplete")[0].style.display = "block";
					}
				}, 0, false);
			}

			scope.$watch('filter', function() {
				scope.setSearchColumns();
			});

			scope.$watch('selection', function(selection, oldVal) {
				scope.updateEnabled();
				if(typeof scope.changed === 'function')
					scope.changed(scope.selection);
			}, true);

			scope.setSearchColumns = function() {
				if(typeof scope.filter === 'function') 
					scope.searchColumns = session.columns.filter(scope.filter);
				else
					scope.searchColumns = session.columns;

				// handle deleted column
				var index = 0;
				while( scope.selection instanceof Array && index < scope.selection.length )
				{
					if(scope.searchColumns.indexOf(scope.selection[index]) < 0)
						scope.selection.splice(index, 1);
					else
						index++;
				}

				$timeout(function() { scope.$digest(); }, 0, false);
			}

			scope.querySearch = function(query)
			{
				var results = [];
				if(typeof query === 'string') {
					query = angular.lowercase(query);
					results = scope.searchColumns.filter(function(column) { return angular.lowercase(column).indexOf(query) >= 0; });
				}
				return results;
			}

			scope.init();

			scope.$on('destroy', function() {
				if(typeof scope.unsubscribe === 'function')
					scope.unsubscribe();
			})
		}
	}
}]);