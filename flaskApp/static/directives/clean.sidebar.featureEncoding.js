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
				scope.shouldShow = typeof selection === 'object' && selection.columns.length == 1 && scope.tableSelection.rows.length > 1;

			}, true);

			element.init = function()
			{
				scope.inplace = false;
			}

			element.init();

			scope.generateDummies =
				function()
				{
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
								scope.showToast({message: "Successfully encoded column.", delay: 3000});
								scope.hideDialog();
							}
						});
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
				}

		}
	}
}]);