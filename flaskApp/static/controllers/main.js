angular.module('dcs.controllers').controller('MainController', ['$scope', '$state','$stateParams', 'session', '$timeout', '$mdDialog', '$rootScope', 'dialogs', 
	function($scope, $state, $stateParams, session, $timeout, $mdDialog, $rootScope, dialogs)
	{
		var self = this;

		$scope.init = 
			function()
			{
				$scope.docName = $stateParams["sessionID"];

				if(typeof($stateParams["sessionID"]) !== 'string' || $stateParams["sessionID"].length != 30)
					$state.go('upload');

				$scope.initialLoad = true;

				self.showLoadingDialog();

				session.initialize($stateParams["sessionID"],
					function(success)
					{
						if(!success)
							self.fatalError();
						else
						{
							$scope.dataLoaded = true;
							$scope.$digest();

							session.subscribeToMetadata({}, self.metadataCallbackHandler);
						}
					});
			};

		self.metadataCallbackHandler = function(dataSize, columns, columnInfo, undoAvailable) {
			$timeout(function() {
				$scope.undoAvailable = undoAvailable;
				$scope.$digest();
			}, 0, false);
		}

		$rootScope.$on('fatalError', function() {
			self.fatalError();
		});

		$scope.$on("firstLoad",
			function()
			{
				$timeout(function() {
					self.hideLoadingDialog();
				}, 0, false);
			});

		self.fatalError = function() {
			self.hideLoadingDialog();
			$state.go('upload');
		};

		self.showLoadingDialog = function() {
			$mdDialog.show({
				templateUrl: 'partials/loading.dialog.html',
				parent: angular.element(document.body),
				clickOutsideToClose:false
			});	
		};

		self.hideLoadingDialog = function() {
			$mdDialog.hide();
		}

		$scope.undo = function() {
			self.showLoadingDialog();
			$scope.$broadcast('showToast', "Undoing last operation...");
			session.undo(function(success, error, errorDescription) {
				if(success) {
					$scope.$broadcast('showToast', "Successfully reverted dataframe. Loading changes...", 3000);
					$scope.$broadcast('hideLoadingDialogAfterLoad');
				} else {
					$scope.$broadcast('showToast', "Failed to undo last operation", 3000);
					dialogs.errorDialog("Undo", error, errorDescription);
				}
			});
		};

		$scope.showExportOptions = function(ev) {
		    $mdDialog.show({
				controller: function($scope, $mdDialog, $stateParams, session) {
					$scope.identity = $stateParams["sessionID"];

					$scope.cancel = function() {
						$mdDialog.cancel();
					};
				},
				templateUrl: 'partials/export.dialog.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:true,
		    })
		 };

		$scope.init();
	}]);