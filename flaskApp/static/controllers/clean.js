angular.module('dcs.controllers').controller('CleanController', ['$scope', '$state', '$rootScope', '$mdToast', '$mdDialog', '$mdMedia', 'session', 
	function($scope, $state, $rootScope, $mdToast, $mdDialog, $mdMedia, session)
	{
		$rootScope.$watch('data',
			function(newVal, oldVal)
			{
				if(typeof newVal !== 'undefined')
				{
					$scope.hot.removeHook('afterSelection', $scope.userDidSelect);
					$scope.indices = null;
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
					for(var key in data[0])
						toReturn.push(key);
				return toReturn;
			}

		$scope.selectionIsRows = 
			function(selection)
			{
				return selection.columnStart == 0 && selection.columnEnd == $scope.columns.length - 1;
			}

		$scope.selectionIsColumn = 
			function(selection)
			{
				return selection.rowStart == 0 && selection.rowEnd == $scope.hot.getData().length - 1 && selection.columnStart == selection.columnEnd;
			}

		$scope.setInvalidValuesFilterColumns =
			function(columns)
			{
				$scope.invalidValuesFilterColumns = columns;
				var filteredData = [];

				if( typeof columns !== 'object' || columns.length == 0 )
				{
					$scope.dataFiltered = false;
					$scope.hot.updateSettings({height: window.innerHeight - 113});
					if( typeof $rootScope.data === 'object' )
					{
						$scope.indices = null;
						filteredData = $rootScope.data;
					}
				}
				else
				{
					$scope.dataFiltered = true;
					$scope.hot.updateSettings({height: window.innerHeight - 113 - $scope.tableHeightOffset});
					var invalidIndexFrequencies = {};
					for( var i = 0 ; i < columns.length ; i++ )
					{
						var column = columns[i];
						if( $rootScope.invalidValues[column].hasInvalidValues )
						{
							for( var j = 0 ; j < $rootScope.invalidValues[column].invalidIndices.length ; j++ )
							{
								var index = $rootScope.invalidValues[column].invalidIndices[j];
								invalidIndexFrequencies[index] = index in invalidIndexFrequencies ? invalidIndexFrequencies[index] + 1 : 1;
							}
						}
					}

					var invalidIndices = [];
					for( index in invalidIndexFrequencies )
						if( invalidIndexFrequencies[index] == columns.length )
							invalidIndices.push(index);

					invalidIndices.sort(function(a,b){return a - b;});

					for( var i = 0 ; i < invalidIndices.length ; i++ )
						filteredData.push( $rootScope.data[invalidIndices[i]] );
					
					var emptyRow = {};
					for (var i = 0; i < $rootScope.data.length; i++)
						emptyRow[$scope.columns[i]] = "...";

					var prevIndex = 0;
					var i = 1;
					while( i < invalidIndices.length )
					{
						if (invalidIndices[i] > parseInt(invalidIndices[prevIndex]) + 1)
						{
							invalidIndices.splice(i, 0, "...");
							filteredData.splice(i, 0, emptyRow );
							prevIndex = i + 1;
							i += 2;
						}
						else
						{
							prevIndex = i;
							i++;
						}
					}

					$scope.indices = invalidIndices;
				}

				$scope.hot.removeHook('afterSelection', $scope.userDidSelect);
				$scope.hot.loadData(filteredData);
				$scope.hot.render();
				$scope.hot.addHook('afterSelection', $scope.userDidSelect);

			};

		$scope.userDidSelect = 
			function(rowStart, columnStart, rowEnd, columnEnd)
			{
				console.log('user changed selection');
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

				$scope.$apply(
					function()
					{
						$scope.selectedCells = {rowStart: rowStart, columnStart: columnStart, rowEnd: rowEnd, columnEnd: columnEnd}; 
					});
			};

		$scope.renderTableColumnHeader =
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

		$scope.renderTableRowHeader =
			function(rowIndex, domElement)
			{
				if($scope.indices != null)
				{
					domElement.firstChild.innerHTML = "";
					var rowNameSpan = document.createElement('span');
					rowNameSpan.className = "rowHeader";
					rowNameSpan.innerHTML = $scope.indices[rowIndex] == "..." ? "..." : parseInt($scope.indices[rowIndex]) + 1;

					domElement.firstChild.appendChild(rowNameSpan);
				}
			};

		$scope.seperatorRowRenderer =
			function(instance, td, row, col, prop, value, cellProperties)
			{
				Handsontable.renderers.TextRenderer.apply(this, arguments);
		    td.style.background = '#EEE';
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
					rowHeaders: true,
					colHeaders: $scope.columns,
					width: window.innerWidth - 380,
					height: window.innerHeight - 113,
					stretchH: 'all',
					cells: function (row, col, prop) {
			      var cellProperties = {};
			      if ($scope.indices != null) {
				      if ($scope.indices[row] == "...") {
				        cellProperties.renderer = $scope.seperatorRowRenderer;
				      }
				    }
			      return cellProperties;
			    }
				});
				$scope.hot.addHook('afterSelection', $scope.userDidSelect);
				$scope.hot.addHook('afterGetColHeader', $scope.renderTableColumnHeader);
				$scope.hot.addHook('afterGetRowHeader', $scope.renderTableRowHeader);
				document.getElementById('cleanSidenav').style.height = (window.innerHeight - 113) + "px";
				document.getElementById('tableStatus').style.width = (window.innerWidth - 380) + "px";
				window.onresize =
					function()
					{
						$scope.hot.updateSettings(
							{
								width: window.innerWidth - 380,
								height: window.innerHeight - 113 - ($scope.dataFiltered ? $scope.tableHeightOffset : 0)
							}
						);
						document.getElementById('cleanSidenav').style.height = (window.innerHeight - 113) + "px";
						document.getElementById('tableStatus').style.width = (window.innerWidth - 380) + "px";
						//$scope.hot.render();
					}
				$scope.invalidValuesFilterColumns = [];
				$scope.dataFiltered = false;
				$scope.tableHeightOffset = 30 + 15 + 4;
			};

		$scope.changeSelection =
			function(selection)
			{
				if(typeof selection === 'object')
				{
					$scope.hot.removeHook('afterSelection', $scope.userDidSelect);
					$scope.hot.selectCell(selection.rowStart, selection.columnStart, selection.rowEnd, selection.columnEnd);
					$scope.selectedCells = selection;
					$scope.hot.addHook('afterSelection', $scope.userDidSelect);
				}
			};

		$scope.showToast = 
			function(message, delay)
			{
				message = (typeof message === 'undefined') ? 'Loading...' : message;
				delay = (typeof delay === 'undefined') ? false : delay;
		    $mdToast.show(
		    	$mdToast.simple()
		    		.position('top right')
		        .content(message)
		        .hideDelay(delay)
        );
		  };

		$scope.hideToast = 
			function(message)
			{
		    $mdToast.hide();
		  };

		$scope.showInterpolationDialog = 
			function(ev)
			{
		    $mdDialog.show({
		      templateUrl: 'directives/interpolation.dialog.html',
		      parent: angular.element(document.body),
		      targetEvent: ev,
		      clickOutsideToClose:true,
		      controller: DialogController
		    });
		  };

		$scope.showLoadingDialog = 
			function(ev)
			{
		    $mdDialog.show({
		      templateUrl: 'directives/loading.dialog.html',
		      parent: angular.element(document.body),
		      targetEvent: ev,
		      clickOutsideToClose:false,
		      controller: DialogController
		    });
		  };

		$scope.closeDialog =
			function()
			{
				$mdDialog.hide();
			}

		function DialogController($scope, $mdDialog)
	    {
	    	$scope.closeDialog = 
	    		function()
	    		{
	    			$mdDialog.hide();
	    		}
	    }

		$scope.init();
	}]);