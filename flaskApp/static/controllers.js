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
					$scope.columns = $scope.getColumns($rootScope.data);
					$scope.hot.updateSettings({colHeaders:$scope.columns});
					$scope.hot.render();
					$scope.hot.addHook('afterSelection', $scope.userDidSelect);
				}
			}, true);

		$rootScope.$watch('dataTypes',
			function(newVal, oldVal)
			{
				if(typeof newVal !== 'undefined')
				{
					$scope.hot.removeHook('afterSelection', $scope.userDidSelect);
					$scope.hot.render();
					$scope.hot.addHook('afterSelection', $scope.userDidSelect);
				}
			}, true);

		$scope.getColumns =
			function(data)
			{
				toReturn = [];
				if(typeof data === 'object')
					for(var columnName in data[0])
						toReturn.push(columnName);
				return toReturn;
			}

		$scope.selectionIsRows = 
			function(rowStart, columnStart, rowEnd, columnEnd)
			{
				console.log("checking if " + columnStart + " and " + columnEnd + " is a row selection");
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

		$scope.updateToolboxContext =
			function()
			{
				$scope.editColumnToolHidden = true;
				$scope.deleteRowToolHidden = true;
				$scope.noToolsMessageHidden = true;
				if($scope.selectionState == selectionState.ROW)
				{
					$scope.deleteRowToolHidden = false;
					$scope.rowToolText = $scope.selectedCells['rowStart'] == $scope.selectedCells['rowEnd'] ? "Row" : "Rows";
				}
				else if($scope.selectionState == selectionState.COLUMN)
				{
					$scope.editColumnToolHidden = false;
				}
				else
				{
					$scope.noToolsMessageHidden = false;
				}
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

				$scope.selectedCells = {rowStart: rowStart, columnStart: columnStart, rowEnd: rowEnd, columnEnd: columnEnd}; 

				if($scope.selectionIsRows(rowStart, columnStart, rowEnd, columnEnd))
				{
					$scope.$apply(
						function()
						{
							$scope.selectionState = selectionState.ROW;
							$scope.updateToolboxContext();
						});
				}
				else if($scope.selectionIsColumn(rowStart, columnStart, rowEnd, columnEnd))
				{
					$scope.$apply(
						function()
						{
							$scope.selectionState = selectionState.COLUMN;
							$scope.editColumn = $scope.columns[columnStart];
							$scope.updateToolboxContext();
						});
				}
				else
				{
					$scope.$apply(
						function()
						{
							$scope.selectionState = selectionState.OTHER;
							$scope.updateToolboxContext();
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

		$scope.resetSelectionAndToolbar =
			function()
			{
				$scope.selectionState = selectionState.OTHER;
				$scope.editColumnToolHidden = true;
				$scope.deleteRowToolHidden = true;
				$scope.hot.selectCell(0, 0, 0, 0, false, false);
			}

		$scope.init = 
			function()
			{
				$scope.columns = $scope.getColumns($rootScope.data);
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
				$scope.resetSelectionAndToolbar();
				$scope.hot.addHook('afterSelection', $scope.userDidSelect);
				$scope.hot.addHook('afterGetColHeader', $scope.renderTableHeader);

				$scope.missingValsInterpolationMethods = ['Linear', 'Quadratic', 'Cubic', 'Barycentric'];
				$scope.allowedAlternativeDataTypes = {'int64': ['float64', 'str'], 'float64': ['int64', 'str'], 'object': ['datetime64', 'float64', 'int64']}
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
				session.changeColumnDataType($scope.editColumn, $scope.editColumnNewDataType, {},
					function(success)
					{
						if(!success)
							alert("changing column type failed");
					}) 
			};

		$scope.requestDeleteSelectedRows =
			function()
			{
				session.deleteRows($scope.selectedCells['rowStart'], $scope.selectedCells['rowEnd'],
					function(success)
					{
						if(!success)
							alert("deletion failed");

						$scope.resetSelectionAndToolbar();
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

		$scope.interpolate =
			function()
			{
				var selection = $scope.hot.getSelected();
				var columnIndex = selection[1];
				method = $scope.interpolationMethod;
				session.interpolate(columnIndex, method,
					function(success)
					{
						if(!success)
							alert("interpolation failed");
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
				$scope.editColumnAlternativeDataTypes = $scope.allowedAlternativeDataTypes[$scope.editColumnDataType];
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