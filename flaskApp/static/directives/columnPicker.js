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
			element.init = function() {
				scope.selection = [];
				element.setSearchColumns();
			};

			scope.$watch('ngDisabled', function() {
				if(typeof scope.ngDisabled === 'boolean')
					element.updateEnabled();
			});

			scope.$watch('ngEnabled', function() {
				if(typeof scope.ngEnabled === 'boolean')
					element.updateEnabled();
			});

			scope.$watch('max', function() {
				self.max = parseInt(scope.max);
				if(self.max >= 0) {
					// delete extras
					scope.selection = scope.selection.slice(0, self.max);
				}
			});

			element.updateEnabled = function() {
				$timeout(function() {
					if((typeof scope.disabled === 'boolean' && scope.disabled) || (typeof scope.enabled === 'boolean' && !scope.enabled) || (typeof self.max === 'number' && scope.selection.length >= self.max)) {
						element[0].getElementsByTagName("md-autocomplete")[0].disabled = true;
						element[0].getElementsByTagName("md-autocomplete")[0].style.display = "none";
					} else {
						element[0].getElementsByTagName("md-autocomplete")[0].disabled = false;
						element[0].getElementsByTagName("md-autocomplete")[0].style.display = "block";
					}
				}, 0, false);
			}

			scope.$watch('filter', function() {
				element.setSearchColumns();
			});

			scope.$watch('selection', function(selection, oldVal) {
				element.updateEnabled();
				if(typeof scope.changed === 'function')
					scope.changed(scope.selection);
			}, true);

			session.subscribeToMetadata({}, element.setSearchColumns);

			element.setSearchColumns = function() {
				if(typeof scope.filter === 'function') 
					element.searchColumns = session.columns.filter(scope.filter);
				else
					element.searchColumns = session.columns;

				// handle deleted column
				var index = 0;
				var spliced = false;
				while( scope.selection instanceof Array && index < scope.selection.length )
				{
					if(element.searchColumns.indexOf(scope.selection[index]) < 0)
					{
						scope.selection.splice(index, 1);
						spliced = true;
					}
					else
						index++;
				}

				if(spliced)
					$timeout(function() { scope.$digest(); }, 0, false);
			}

			scope.querySearch = function(query)
			{
				var results = [];
				if(typeof query === 'string') {
					query = angular.lowercase(query);
					results = element.searchColumns.filter(function(column) { return angular.lowercase(column).indexOf(query) >= 0; });
				}
				return results;
			}

			element.init();
		}
	}
}]);