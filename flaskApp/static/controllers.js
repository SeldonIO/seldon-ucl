var dcsControllers = angular.module('dcsControllers', ['ngFileUpload', 'dcsServices']);

dcsControllers.controller('UploadController', ['$scope', '$state', 'Upload', 'sockets',
	function($scope, $state, Upload, sockets)
	{
		$scope.submit =
			function()
			{
				if($scope.file)
					$scope.upload($scope.file);
			};

		$scope.shouldShowError = $scope.error && !$scope.file;

		$scope.upload =
			function(file)
			{
				Upload.
					upload({
						url: 'upload/',
						data: {file: file}
					}).
					then(function (resp) {
			            if(resp.data["success"])
			            {
			            	sockets.initialize(resp.data["sessionID"]);
			            	$state.go('view');
			            }
			            else
			            {
			            	$scope.file = null;
			            	$scope.uploadProgress = null;
			            	$scope.error = "Could not parse CSV file";
			            }
			        }, function (resp) {
			            console.log('Error status: ' + resp.status);
			        }, function (evt) {
			            $scope.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
			        });
			};
	}]);

dcsControllers.controller('DataViewController', ['$scope', '$state', 'sockets', 
	function($scope, $state, sockets)
	{
		$scope.init = 
			function()
			{
				if(typeof(sockets.sessionID) !== 'string' || sockets.sessionID.length != 30)
					$state.go('upload');
				else
				{
					sockets.requestFullJSON(
						function(result)
						{
							$scope.$apply(
								function()
								{
									$scope.data = result;
									$scope.parsed = JSON.parse(result);
									console.log(JSON.stringify($scope.parsed));
									$scope.plotly = {x:[], y:[]};
									for(var key in $scope.parsed)
									{
										$scope.plotly['x'].push($scope.parsed[key]["day"]);
										$scope.plotly['y'].push($scope.parsed[key]["temperature"]);
									}
									Plotly.plot('tester', [$scope.plotly], {margin:{t:0}});
								});
						});
				}
			};

		$scope.data = {};


		$scope.init();
	}]);