angular.module('dcs.controllers').controller('MainController', ['$scope', '$state','$stateParams', 'session', '$timeout', '$mdDialog', '$rootScope',
	function($scope, $state, $stateParams, session, $timeout, $mdDialog, $rootScope)
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

							session.subscribeToMetadata({}, function(dataSize, columns, columnInfo, undoAvailable) {
								$timeout(function() {
									$scope.undoAvailable = undoAvailable;
									$scope.$digest();
								}, 0, false);
							});
						}
					});

				$rootScope.$on('fatalError', function() {
					self.fatalError();
				});

				$scope.$on("firstLoad",
					function()
					{
						$timeout(function() {
							self.hideLoadingDialog();
						});
					});
			};

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
			session.undo(function(success) {
				$scope.$broadcast('hideLoadingDialogAfterLoad');
			});
		};

		$scope.showExportOptions = function(ev) {
		    $mdDialog.show({
		      controller: DialogController,
		      templateUrl: 'partials/export.dialog.html',
		      parent: angular.element(document.body),
		      targetEvent: ev,
		      clickOutsideToClose:true,
		    })
		  };

		$scope.init();
	}]);
	
	function DialogController($scope, $mdDialog, $stateParams, session) {
		$scope.identity = $stateParams["sessionID"];

	  $scope.cancel = function() {
	    $mdDialog.cancel();
	  };

}