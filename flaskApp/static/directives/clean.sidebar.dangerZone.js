angular.module('dcs.directives').directive('cleanSidebarDangerZone', ['session', function(session) {
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
		templateUrl: "directives/clean.sidebar.dangerZone.html",
		link: function(scope, element, attr) {
			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = true;

			}, true);

			element.init = function()
			{
				scope.shouldShow = true;
			}

			element.init();

			scope.executeCommand =
				function()
				{
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
					session.executeCommand(scope.command,
						function(success)
						{
							if(!success)
							{
								alert("Execution failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast({message: "Successfully executed command. Loading changes...", delay: 3000});
								scope.hideDialog();
							}
						});
				}

		}
	}
}]);