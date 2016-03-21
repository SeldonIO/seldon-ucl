angular.module('dcs.services').service('dialogs', ['$mdDialog', '$mdToast', 
	function($mdDialog, $mdToast)
	{
		var self = this;

		self.errorDialog = function(operation, error, errorDescription) {
			console.log("showing error dialog")
			$mdDialog.show(
				$mdDialog.alert()
					.clickOutsideToClose(true)
					.title(error)
					.content(errorDescription)
					.ok('OK')
				);
		};
	}]);