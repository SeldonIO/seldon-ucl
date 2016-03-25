angular.module('dcs.directives').directive('cleanSidebarFeatureEncoding', ['session', 'dialogs', function(session, dialogs) {
	return {
		restrict: 'E',
		scope: 
			{
				tableSelection: '='
			},
		templateUrl: "directives/clean.sidebar.featureEncoding.html",
		link: function(scope, element, attr) {
			scope.$watchCollection('tableSelection', function(selection, oldSelection) {
				scope.shouldShow = typeof selection === 'object' && selection.type.indexOf("column") >= 0 && selection.columns.length == 1;
			});

			element.init = function() {
				scope.inplace = false;
			}

			element.init();

			scope.generateDummies = function() {
				scope.$emit('showToast', "Encoding column...");
				scope.$emit('showLoadingDialog');
				session.generateDummies(session.columns.indexOf(scope.tableSelection.columns[0]), scope.inplace,
					function(success, error, errorDescription) { 
						if(!success) {
							scope.$emit('showToast', "Encode column failed", 3000);
							dialogs.errorDialog("Encode column", error, errorDescription);
						} else {
							scope.$emit('showToast', "Successfully encoded column. Loading changes...", 3000);
							scope.$emit('hideLoadingDialogAfterLoad');
						}
					});
			}

		}
	}
}]);