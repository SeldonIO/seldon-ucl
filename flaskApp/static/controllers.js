var dcsControllers = angular.module('dcsControllers', ['ngFileUpload', 'dcsServices', 'ui.router']);

dcsControllers.controller('UploadController', ['$scope', '$state', '$location', 'Upload', 'sockets',
	function($scope, $state, $location, Upload, sockets)
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
			            	$location.path("/" + resp.data["sessionID"]);
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

dcsControllers.controller('MainController', ['$scope', '$state', '$stateParams', 'session', 'sockets', 
	function($scope, $state, $stateParams, session, sockets)
	{
		$scope.init = 
			function()
			{
				if(typeof($stateParams["sessionID"]) !== 'string' || $stateParams["sessionID"].length != 30)
					$state.go('upload');

				sockets.initialize($stateParams["sessionID"]);
				sockets.fullJSON(
					function(result)
					{
						if(typeof result === 'string')
							session.setData(JSON.parse(result));
						else
							$state.go('upload');
					});
			};

		$scope.data = session.data;

		$scope.init();
	}]);

dcsControllers.controller('CleanController', ['$scope', '$state', 'session', 'sockets', 
	function($scope, $state, session, sockets)
	{
		session.registerCallback(
			function(newData)
			{
				$scope.$apply(
					function()
					{
						$scope.data = newData;
						$scope.columns = $scope.getColumns($scope.data);
						$scope.hot.loadData($scope.data);
						$scope.hot.updateSettings({colHeaders:$scope.columns});
						$scope.hot.render();
					});
			});

		$scope.getColumns =
			function(data)
			{
				toReturn = [];
				if(typeof data === 'object' && data.length > 0)
					for(var key in data[0])
						toReturn.push(key);
				return toReturn;
			}

		$scope.init = 
			function()
			{
				$scope.data = session.data;
				$scope.columns = $scope.getColumns($scope.data);
				$scope.hot = new Handsontable(document.getElementById('hotTable'), 
				{
					data: $scope.data,
					allowInsertColumn: false,
					readOnly: true,
					contextMenu: false,
					className: 'htCenter',
					allowInsertRow: false,
					allowRemoveRow: false,
					allowRemoveColumn: false,
					rowHeaders:true,
					colHeaders:$scope.columns
				});
			};

		$scope.requestRenameColumn = 
			function()
			{
				sockets.renameColumn($scope.renameColumn, $scope.renameColumnNewValue, 
					function(success)
					{
						if(success)
						{
							console.log('changed column');
							sockets.fullJSON(
								function(data)
								{
									if(typeof data === 'string')
										session.setData(JSON.parse(data));
									else
										$state.go('upload');
								});
						}
					});
			};

		$scope.$watch('renameColumnNewValue', 
			function(newVal, oldVal)
			{
				$scope.canRename = $scope.renameColumnNewValue != undefined && $scope.renameColumnNewValue.length > 0 && $scope.renameColumnNewValue != $scope.renameColumn; 
			});

		$scope.init();
	}]);

dcsControllers.controller('VisualizeController', ['$scope', '$state', 'session', 'sockets', 
	function($scope, $state, session, sockets)
	{
		$scope.data = session.data;
		session.registerCallback(
			function(newData)
			{
				$scope.$apply(
					function()
					{
						$scope.data = newData;
						$scope.init();
					});
			});

		$scope.init = 
			function()
			{
				$scope.plotly = {x:[], y:[]};
				for(var index = 0 ; index < $scope.data.length ; index++)
				{
					$scope.plotly['x'].push($scope.data[index]["day"]);
					$scope.plotly['y'].push($scope.data[index]["temperature"]);
				}
				Plotly.newPlot('tester', [$scope.plotly], {margin:{t:0}});
			};

		// $scope.init();
	}]);

dcsControllers.controller('AnalyzeController', ['$scope', '$state', 'session', 'sockets', 
	function($scope, $state, session, sockets)
	{
		$scope.data = session.data;
		session.registerCallback(
			function(newData)
			{
				$scope.$apply(
					function()
					{
						$scope.data = newData;
					});
			});
	}]);