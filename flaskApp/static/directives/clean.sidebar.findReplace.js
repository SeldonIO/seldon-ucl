angular.module('dcs.directives').directive('cleanSidebarFindReplace', ['session', function(session) {
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
		templateUrl: "directives/clean.sidebar.findReplace.html",
		link: function(scope, element, attr) {
			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.columns.length == 1;

			}, true);

			element.init = function()
			{
				
			}

			element.init();

			scope.findReplace =
				function()
				{
					session.findReplace(session.columns.indexOf(scope.tableSelection.columns[0]), scope.toReplace, scope.replaceWith,
						function(success)
						{
							if(!success)
							{
								alert("find replace failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast({message: "Successfully replaced values.", delay: 3000});
								scope.hideDialog();
							}
						});
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
				}

		}
	}
}]);