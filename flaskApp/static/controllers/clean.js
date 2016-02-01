angular.module('dcs.controllers').controller('CleanController', ['$scope', '$state', '$mdToast', '$mdDialog', 'session', 
	function($scope, $state, $mdToast, $mdDialog, session)
	{
		var self = this;

		$scope.showLoadingDialog = 
			function()
			{
				$mdDialog.show({
					templateUrl: 'directives/loading.dialog.html',
					parent: angular.element(document.body),
					clickOutsideToClose:false
				});
			};  

		$scope.hideDialog =
			function()
			{
				$mdDialog.hide();
			};

		this.invalidIndicesForColumns =
			function(columns)
			{
				var invalidIndexFrequencies = {};
				for( var i = 0 ; i < columns.length ; i++ )
				{
					var column = columns[i];
					if( session.invalidValues[column].hasInvalidValues )
					{
						for( var j = 0 ; j < session.invalidValues[column].invalidIndices.length ; j++ )
						{
							var index = session.invalidValues[column].invalidIndices[j];
							invalidIndexFrequencies[index] = index in invalidIndexFrequencies ? invalidIndexFrequencies[index] + 1 : 1;
						}
					}
				}

				var invalidIndices = [];
				for( index in invalidIndexFrequencies )
					if( invalidIndexFrequencies[index] == columns.length )
						invalidIndices.push(parseInt(index));

				invalidIndices.sort( function(a, b) { return a - b; } );

				return invalidIndices;
			}

		self.reloadDataAndIndices = 
			function()
			{
				self.hot.updateSettings({colHeaders: session.columns});

				var filteredData = [];
				if( typeof $scope.invalidValuesFilterColumns !== 'object' || $scope.invalidValuesFilterColumns.length == 0 )
				{
					$scope.dataFiltered = false;
					self.hot.updateSettings({ height: window.innerHeight - self.toolbarTabInspectorHeight });
					if( typeof session.data === 'object' )
					{
						self.indices = null;
						filteredData = session.data;
					}
				}
				else
				{
					$scope.dataFiltered = true;

					self.hot.updateSettings({height: window.innerHeight - self.toolbarTabInspectorHeight - self.tableHeightOffset});
					
					var invalidIndices = self.invalidIndicesForColumns($scope.invalidValuesFilterColumns);

					for( var i = 0 ; i < invalidIndices.length ; i++ )
						filteredData.push( session.data[invalidIndices[i]] );
					
					// Segment contiguous ranges with "..."" on invalid indices array and filteredData dictionary
					var emptyRow = {};
					for ( var i = 0 ; i < session.columns.length ; i++ )
						emptyRow[session.columns[i]] = "...";

					var prevIndex = 0;
					var i = 1;
					while( i < invalidIndices.length )
					{
						if (invalidIndices[i] > invalidIndices[prevIndex] + 1)
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

					self.indices = invalidIndices;
				}

				self.hot.removeHook('afterSelection', self.userDidSelect);
				self.hot.loadData(filteredData);
				self.hot.addHook('afterSelection', self.userDidSelect);
			}

		$scope.setInvalidValuesFilterColumns =
			function(columns)
			{
				$scope.invalidValuesFilterColumns = columns;
				self.reloadDataAndIndices();
			};

		var Selection = 
			function(rowStart, columnStart, rowEnd, columnEnd)
			{
				this.columns = [];
				this.rows = [];

				for(var index = columnStart ; index <= columnEnd ; index++)
				{
					this.columns.push(session.columns[index]);
				}

				if($scope.dataFiltered)
				{
					for(var index = rowStart ; index <= rowEnd ; index++)
						if(self.indices[index] != "...")
							this.rows.push(self.indices[index]);
				}
				else
				{
					for(var index = rowStart ; index <= rowEnd ; index++)
						this.rows.push(index);
				}
			};

		this.userDidSelect = 
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

				$scope.selectedIndices = new Selection(rowStart, columnStart, rowEnd, columnEnd);				

				$scope.$digest();
			};

		this.renderTableColumnHeader =
			function(columnIndex, domElement)
			{
				 
			};

		this.renderTableRowHeader =
			function(rowIndex, domElement)
			{
				if(self.indices != null)
				{
					domElement.firstChild.innerHTML = "";
					var rowNameSpan = document.createElement('span');
					rowNameSpan.className = "rowHeader";
					rowNameSpan.innerHTML = self.indices[rowIndex] == "..." ? "..." : parseInt(self.indices[rowIndex]) + 1;

					domElement.firstChild.appendChild(rowNameSpan);
				}
			};

		this.separatorRowRenderer =
			function(instance, td, row, col, prop, value, cellProperties)
			{
				Handsontable.renderers.TextRenderer.apply(this, arguments);
		    	td.style.background = '#EEE';
			}

		this.init = 
			function()
			{
				self.unsubscribe = session.subscribeToData(
					function(data)
					{
						// frontend model changed
						self.reloadDataAndIndices();

						if(self.initialLoad)
						{
							self.initialLoad = false;
							self.resizeToolTabs();
						}
					});

				$scope.invalidValuesFilterColumns = [];
				$scope.dataFiltered = false;
				// $scope.showInspector = true;

				// self.toolbarTabInspectorHeight = 113 + ($scope.showInspector ? 30 : 0);
				self.toolbarTabInspectorHeight = 113 + 30;

				self.tableHeightOffset = 30 + 15 + 4;
				self.initialLoad = true;

				self.hot = new Handsontable(document.getElementById('hotTable'), 
				{
					data: [],
					allowInsertColumn: false,
					readOnly: true,
					contextMenu: false,
					className: 'htCenter',
					allowInsertRow: false,
					allowRemoveRow: false,
					allowRemoveColumn: false,
					outsideClickDeselects: false,
					rowHeaders: true,
					colHeaders: true,
					width: window.innerWidth - 380,
					height: window.innerHeight - self.toolbarTabInspectorHeight,
					stretchH: 'all',
					cells: 
						function (row, col, prop)
						{
			    			var cellProperties = {};
			     			if (self.indices != null)
			     			{
				      			if (self.indices[row] == "...")
				      			{
				        			cellProperties.renderer = self.separatorRowRenderer;
				      			}
				    		}
			      			return cellProperties;
			    		} 
				});

				self.hot.addHook('afterSelection', self.userDidSelect);
				self.hot.addHook('afterGetColHeader', self.renderTableColumnHeader);
				self.hot.addHook('afterGetRowHeader', self.renderTableRowHeader);
				document.getElementById('cleanSidenav').style.height = (window.innerHeight - 113) + "px";
				document.getElementById('tableStatus').style.width = (window.innerWidth - 380) + "px";
				window.onresize =
					function()
					{
						self.hot.updateSettings(
							{
								width: window.innerWidth - 380,
								height: window.innerHeight - self.toolbarTabInspectorHeight - ($scope.dataFiltered ? self.tableHeightOffset : 0)
							}
						);
						document.getElementById('cleanSidenav').style.height = (window.innerHeight - 113) + "px";
						document.getElementById('tableStatus').style.width = (window.innerWidth - 380) + "px";
						self.resizeToolTabs();
					}
			};

		this.resizeToolTabs =
			function()
			{
				var toolTabs = document.getElementsByClassName('toolTab');
				for (var i=0; i < toolTabs.length; i++)
					toolTabs[i].style.height = (window.innerHeight - 113 - 48) + "px";
			};

		$scope.selectFirstCellOfCurrentSelection =
			function(digest)
			{	
				if(digest == false)
					self.hot.removeHook('afterSelection', self.userDidSelect);

				var selection = self.hot.getSelected();
				self.hot.selectCell(selection[0], 0, selection[0], 0);

				if(digest == false)
				{
					$scope.selectedIndices = new Selection(selection[0], 0, selection[0], 0);
					self.hot.addHook('afterSelection', self.userDidSelect);
				}
			};

		$scope.selectColumn = 
			function(columnName, digest)
			{
				var columnIndex = typeof session.columns === 'object' ? session.columns.indexOf(columnName) : -1;
				if( columnIndex >= 0 )
				{
					if(digest == false)
						self.hot.removeHook('afterSelection', self.userDidSelect);
					
					self.hot.selectCell(0, columnIndex, self.hot.getData().length - 1, columnIndex);

					if(digest == false)
					{
						$scope.selectedIndices = new Selection(0, columnIndex, self.hot.getData().length - 1, columnIndex);
						self.hot.addHook('afterSelection', self.userDidSelect);
					}
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
			        .hideDelay(delay));
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
					clickOutsideToClose:true
				});
			};

		self.init();
	}]);