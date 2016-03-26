angular.module('dcs.directives').directive('cleanSidebarDangerZone', ['session', function(session) {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: "directives/clean.sidebar.dangerZone.html",
		link: function(scope, element, attr) {
			scope.executeCommand =
				function() {
					scope.$emit('showToast', "Executing command...");
					scope.$emit('showLoadingDialog');
					session.executeCommand(scope.command,
						function(success, error, errorDescription)
						{
							if(!success) {
								scope.$emit('showToast', "Execute command failed", 3000);
								dialogs.errorDialog("Execute command", error, errorDescription);
							} else {
								scope.$emit('showToast', "Successfully executed command. Loading changes...", 3000);
								scope.$emit('hideLoadingDialogAfterLoad');
							}
						});
				}
		}
	}
}]);