angular.module('dcs.services').service('dialogs', ['$mdDialog', '$mdToast', '$timeout',
	function($mdDialog, $mdToast, $timeout)
	{
		var self = this;

		self.errorDialog = function(operation, error, description) {
			$mdDialog.show({
				controller: ['$scope', '$mdDialog', 'operation', 'error', 'description', function($scope, $mdDialog, operation, error, description) {
					$scope.operation = operation;
					$scope.error = error;
					$scope.description = description;

					$scope.dismiss = function() {
						$mdDialog.hide();
					};
				}],
				locals: {operation: operation, error: error, description: description},
				templateUrl: 'partials/error.dialog.html'
			});
		};
	}]);