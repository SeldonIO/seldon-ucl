angular.module('dcs.directives').directive('cleanSidebarFeatureEncoding', ['session', function(session) {
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
		templateUrl: "directives/clean.sidebar.featureEncoding.html",
		link: function(scope, element, attr) {
			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.columns.length == 1 && selection.rows.length > 1;

			}, true);

			element.init = function()
			{
				scope.inplace = false;
			}

			element.init();

			scope.generateDummies =
				function()
				{
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
					session.generateDummies(session.columns.indexOf(scope.tableSelection.columns[0]), scope.inplace,
						function(success)
						{
							if(!success)
							{
								alert("encoding failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast({message: "Successfully encoded column. Loading changes...", delay: 3000});
								scope.hideDialog();
							}
						});
				}

		}
	}
}]);