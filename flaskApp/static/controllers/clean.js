angular.module('dcs.controllers').controller('CleanController', ['$scope', '$state', '$rootScope', 'session', 
	function($scope, $state, $rootScope, session)
	{
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
				return selection.rowStart == 0 && selection.rowEnd == $rootScope.data.length - 1 && selection.columnStart == selection.columnEnd;
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

				$scope.$apply(
					function()
					{
						$scope.selectedCells = {rowStart: rowStart, columnStart: columnStart, rowEnd: rowEnd, columnEnd: columnEnd}; 
					});
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
					stretchH: 'all'
				});
				$scope.hot.addHook('afterSelection', $scope.userDidSelect);
				$scope.hot.addHook('afterGetColHeader', $scope.renderTableHeader);
				console.log(document.getElementById('cleanSidenav').offsetWidth);
				document.getElementById('cleanSidenav').style.height = (window.innerHeight - 113) + "px";
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
			}

		$scope.init();
	}]);