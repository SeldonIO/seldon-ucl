var dcsControllers = angular.module('dcsControllers', ['ngFileUpload', 'dcsServices', 'ui.router']);

dcsControllers.controller('UploadController', ['$scope', '$state', '$location', 'Upload',
	function($scope, $state, $location, Upload)
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

dcsControllers.controller('MainController', ['$scope', '$state', '$stateParams', 'session', 
	function($scope, $state, $stateParams, session)
	{
		$scope.init = 
			function()
			{
				if(typeof($stateParams["sessionID"]) !== 'string' || $stateParams["sessionID"].length != 30)
					$state.go('upload');

				session.initialize($stateParams["sessionID"],
					function(success)
					{
						if(!success)
							$state.go('upload');
					});
			};

		$scope.init();
	}]);

dcsControllers.controller('CleanController', ['$scope', '$state', '$rootScope', 'session', 
	function($scope, $state, $rootScope, session)
	{
		var selectionState = 
			{
				ROW: "row",
				COLUMN: "column",
				OTHER: "other"
			};

		$rootScope.$watch('data',
			function(newVal, oldVal)
			{
				if(typeof newVal !== 'undefined')
				{
					$scope.hot.removeHook('afterSelection', $scope.userDidSelect);
					$scope.hot.loadData($rootScope.data);
					$scope.hot.render();
					$scope.hot.addHook('afterSelection', $scope.userDidSelect);
				}
			}, true);

		$rootScope.$watch('dataTypes',
			function(newVal, oldVal)
			{
				if(typeof newVal !== 'undefined')
				{
					$scope.columns = $scope.getColumns($rootScope.dataTypes);
					$scope.hot.removeHook('afterSelection', $scope.userDidSelect);
					$scope.hot.updateSettings({colHeaders:$scope.columns});
					$scope.hot.render();
					$scope.hot.addHook('afterSelection', $scope.userDidSelect);
				}
			}, true);

		$scope.getColumns =
			function(dataTypes)
			{
				toReturn = [];
				if(typeof dataTypes === 'object')
					for(var columnName in dataTypes)
						toReturn.push(columnName);
				return toReturn;
			}

		$scope.selectionIsRows = 
			function(rowStart, columnStart, rowEnd, columnEnd)
			{
				if(columnStart == 0 && columnEnd == $scope.columns.length - 1)
					return true;
				else
					return false;
			}

		$scope.selectionIsColumn = 
			function(rowStart, columnStart, rowEnd, columnEnd)
			{
				if(rowStart == 0 && rowEnd == $rootScope.data.length - 1 && columnStart == columnEnd)
					return true;
				else
					return false;
			}

		$scope.userDidSelect = 
			function(rowStart, columnStart, rowEnd, columnEnd)
			{
				if(rowStart > rowEnd)
				{
					var temp = rowStart;
					rowStart = rowEnd;
					rowEnd = temp;
				}
				if(columnStart > columnEnd)
				{
					var temp = columnStart;
					columnStart = columnEnd;
					columnEnd = temp;
				}
				if($scope.selectionIsRows(rowStart, columnStart, rowEnd, columnEnd))
				{
					$scope.$apply(
						function()
						{
							$scope.selectionState = selectionState.ROW;
							$scope.selectionRowIndex = rowStart;
							
							// context-aware toolbox
							$scope.noToolsMessageHidden = true;
							$scope.editColumnToolHidden = true;
							$scope.deleteRowToolHidden = false;
							$scope.rowToolText = rowStart == rowEnd ? "Row" : "Rows";
						});
				}
				else if($scope.selectionIsColumn(rowStart, columnStart, rowEnd, columnEnd))
				{
					$scope.$apply(
						function()
						{
							$scope.selectionState = selectionState.COLUMN;

							// context-aware toolbox
							$scope.noToolsMessageHidden = true;
							$scope.editColumnToolHidden = false;
							$scope.editColumnToolColumnSelectorDisabled = true;
							$scope.deleteRowToolHidden = true;

							$scope.editColumn = $scope.columns[columnStart];
						});
				}
				else
				{
					$scope.$apply(
						function()
						{
							$scope.selectionState = selectionState.OTHER;

							// context-aware toolbox
							$scope.noToolsMessageHidden = false;
							$scope.editColumnToolHidden = true;
							$scope.editColumnToolColumnSelectorDisabled = false;
							$scope.deleteRowToolHidden = true;
						});
				}
			};

		$scope.renderTableHeader =
			function(columnIndex, domElement)
			{
				if(columnIndex >= 0 && typeof $rootScope.dataTypes !== 'undefined' && typeof $scope.columns !== 'undefined')
				{	
					var columnName = $scope.columns[columnIndex];
					var columnDataType = $rootScope.dataTypes[columnName];
					domElement.firstChild.innerHTML = "";

					var columnNameSpan = document.createElement('span');
					columnNameSpan.className = "colHeader";
					columnNameSpan.innerHTML = columnName;

					var dataTypeDiv = document.createElement('span');
					dataTypeDiv.innerHTML = ": " + columnDataType;
					dataTypeDiv.style.color = "#999";

					domElement.firstChild.appendChild(columnNameSpan);
					domElement.firstChild.appendChild(dataTypeDiv);
				}  
			};

		$scope.init = 
			function()
			{
				$scope.columns = $scope.getColumns($rootScope.dataTypes);
				$scope.selectionState = selectionState.OTHER;
				$scope.editColumnToolHidden = true;
				$scope.editColumnToolColumnSelectorDisabled = false;
				$scope.deleteRowToolHidden = true;
				$scope.hot = new Handsontable(document.getElementById('hotTable'), 
				{
					data: $rootScope.data,
					allowInsertColumn: false,
					readOnly: true,
					contextMenu: false,
					className: 'htCenter',
					allowInsertRow: false,
					allowRemoveRow: false,
					allowRemoveColumn: false,
					outsideClickDeselects: false,
					rowHeaders:true,
					colHeaders:$scope.columns
				});
				$scope.hot.selectCell(0, 0, 0, 0, false, false);
				$scope.hot.addHook('afterSelection', $scope.userDidSelect);
				$scope.hot.addHook('afterGetColHeader', $scope.renderTableHeader);
			};

		$scope.$watch('editColumnNewName', 
			function(newVal, oldVal)
			{
				$scope.validNewName = typeof $scope.editColumnNewName !== 'undefined' && $scope.editColumnNewName.length > 0 && $scope.editColumnNewName != $scope.editColumn; 
				$scope.editColumnCanSave = $scope.validNewName || $scope.validNewDataType;
			});

		$scope.$watch('editColumnNewDataType',
			function(newVal, oldVal)
			{
				$scope.validNewDataType = typeof $scope.editColumnNewDataType !== 'undefined' && $scope.editColumnNewDataType.length > 0 && $scope.editColumnNewDataType != $scope.editColumnDataType;
				$scope.editColumnCanSave = $scope.validNewName || $scope.validNewDataType;
			});

		$scope.requestRenameColumn = 
			function()
			{
				session.renameColumn($scope.editColumn, $scope.editColumnNewName, 
					function(success)
					{
						if(!success)
							alert("renaming failed");

						$scope.$apply(
							function()
							{
								$scope.editColumn = $scope.editColumnNewName;
							});
					}); 
			}; 

		$scope.requestChangeColumnDataType = 
			function()
			{

			};

		$scope.requestDeleteSelectedRows =
			function()
			{
				var selection = $scope.hot.getSelected();
				var rowFrom = selection[0];
				var rowTo = selection[2];
				session.deleteRows(rowFrom, rowTo,
					function(success)
					{
						if(!success)
							alert("deletion failed");

						$scope.$apply(
							function()
							{
								$scope.editColumn = $scope.editColumnNewName;
							});
					});
			};

		$scope.requestFillDown =
			function(method)
			{
				var selection = $scope.hot.getSelected();
				var columnFrom = selection[1];
				var columnTo = selection[3];
				session.fillDown(columnFrom, columnTo, method,
					function(success)
					{
						if(!success)
							alert("fill down failed");
					});
			};

		$scope.saveColumnChanges = 
			function()
			{
				if($scope.validNewName)
					$scope.requestRenameColumn();
				if($scope.validNewDataType)
					$scope.requestChangeColumnDataType();
			};

		$scope.deleteSelectedRows =
			function()
			{
				$scope.requestDeleteSelectedRows();
			}

		$scope.fillDown =
			function()
			{
				$scope.requestFillDown();
			}

		$scope.resetColumnChanges = 
			function()
			{
				$scope.editColumnDataType = $rootScope.dataTypes[$scope.editColumn];
				$scope.editColumnAlternativeDataTypes = ['datetime64', 'str', 'float64'];
				$scope.editColumnNewDataType = "";
				$scope.editColumnNewName = "";
				$scope.editColumnForm.$setPristine();
			};

		$scope.$watch('editColumn', 
			function()
			{
				if( typeof $scope.columns !== 'undefined' && typeof $rootScope.data !== 'undefined' )
				{					
					$scope.hot.removeHook('afterSelection', $scope.userDidSelect);
					var columnIndex = $scope.columns.indexOf($scope.editColumn);
					$scope.hot.selectCell(0, columnIndex, $rootScope.data.length - 1, columnIndex, false, false);
					$scope.hot.addHook('afterSelection', $scope.userDidSelect);
					$scope.resetColumnChanges();
				}
			});

		$scope.init();
	}]);

dcsControllers.controller('VisualizeController', ['$scope', '$rootScope', '$state', 'session', 
	function($scope, $rootScope, $state, session)
	{
		$rootScope.$watch('data',
			function(newVal, oldVal)
			{
				$scope.init();
			}, true);

		$rootScope.$watch('dataTypes',
			function(newVal, oldVal)
			{
				$scope.init();
			}, true);

		$scope.init = 
			function()
			{
				$scope.data = $rootScope.data;
				if(typeof $scope.data !== 'undefined')
				{
					$scope.plotly = {x:[], y:[]};
					for(var index = 0 ; index < $scope.data.length ; index++)
					{
						$scope.plotly['x'].push($scope.data[index]["day"]);
						$scope.plotly['y'].push($scope.data[index]["temperature"]);
					}
					Plotly.newPlot('tester', [$scope.plotly], {margin:{t:0}});
				}
			};

		$scope.init();
	}]);

dcsControllers.controller('AnalyzeController', ['$scope', '$state', 'session', 
	function($scope, $state, session)
	{
		
	}]);