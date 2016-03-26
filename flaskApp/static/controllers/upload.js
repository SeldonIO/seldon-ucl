angular.module('dcs.controllers').controller('UploadController', ['$scope', '$state', '$location', 'Upload',
	function($scope, $state, $location, Upload)
	{
		$scope.submit =
			function()
			{
				if($scope.file)
					$scope.upload($scope.file);
			};

		$scope.upload =
			function(file)
			{
				Upload.
					upload({
						url: 'upload/',
						data: {
							file: file,
							'initialSkip': (typeof $scope.ignoreLines === 'undefined') ? 0 : $scope.ignoreLines,
							'sampleSize': (typeof $scope.sampleSize === 'undefined') ? 100 : $scope.sampleSize,
							'seed': (typeof $scope.sampleSeed === 'undefined') ? '___DoNotUseThisAsSeed___' : $scope.sampleSeed,
							'headerIncluded': (typeof $scope.headerIncluded === 'undefined') ? 'true' : $scope.headerIncluded
						}
					}).
					then(function (resp) {
			            if(resp.data["success"])
			            {
			            	$location.path("/" + resp.data["sessionID"]);
			            }
			            else
			            {
			            	$scope.file = null;
			            	$scope.uploadProgress = null;
			            	$scope.error = "Could not parse file";
			            }
			        }, function (resp) {
			            console.log('Error status: ' + resp.status);
			        }, function (evt) {
			            $scope.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
			        });
			};
	}]);