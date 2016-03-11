angular.module('dcs.controllers').controller('MainController', ['$scope', '$state','$stateParams','session', '$timeout', '$mdDialog',
	function($scope, $state, $stateParams, session, $timeout, $mdDialog, $mdMedia)
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
							$timeout(function()
								{
									self.hideLoadingDialog();
									$state.go('upload');
								});
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


				$scope.$on("firstLoad",
					function()
					{
						$timeout(function()
								{
									self.hideLoadingDialog();
								});
					});
			};

		self.showLoadingDialog = function() {
			$mdDialog.show({
				templateUrl: 'directives/loading.dialog.html',
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
				self.hideLoadingDialog();
			});
		};

		$scope.showAdvanced = function(ev) {
		    $mdDialog.show({
		      controller: DialogController,
		      templateUrl: 'directives/export.dialog.html',
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