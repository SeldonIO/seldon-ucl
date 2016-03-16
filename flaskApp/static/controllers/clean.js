angular.module('dcs.controllers').controller('CleanController', ['$scope', '$state', '$mdToast', '$mdDialog', 'session', '$document',
	function($scope, $state, $mdToast, $mdDialog, session, $document)
	{
		var self = this;

		var maxRows = 500;
		var maxColumns = 20;

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
				// hide dialog after data load
				self.hideDialog = true;
			};


		$scope.displayRangeChanged = 
			function(userSetShowingIndices)
			{
				// update internal model (essentially -=1 for 0-based indexing)
				$scope.showingIndices = 
					{
						rows:
							{
								start: userSetShowingIndices.rows.start - 1,
								end: userSetShowingIndices.rows.end - 1,
							},
						columns:
							{
								start: userSetShowingIndices.columns.start - 1,
								end: userSetShowingIndices.columns.end - 1,
							}
					};
				self.fetchDataAndUpdateTable();
			}

		self.insertMoreIndicators = 
			function(data, indices)
			{
				moreRow = [];
				for( var index = 0 ; index < $scope.showingIndices.columns.end - $scope.showingIndices.columns.start + 1 ; index++ )
					moreRow.push("...");

				if($scope.showingIndices.rows.start > 0)
				{
					indices.splice(0, 0, "...");
					data.splice(0, 0, moreRow);
				}

				if($scope.showingIndices.rows.end < $scope.dataSize.rows - 1)
				{
					indices.push("...");
					data.push(moreRow)
				}
			}

		self.insertSeparatorIndicators = 
			function(data, indices)
			{
				if( $scope.dataFiltered && !$scope.dataSorted ) {
					// only add separators in filtered, unsorted mode
					separatorRow = [];
					for( var index = 0 ; index < $scope.showingIndices.columns.end - $scope.showingIndices.columns.start + 1 ; index++ )
						separatorRow.push("-");

					if( self.filterType == "duplicates" ) {
						// insert separators at different values
						var i = 1;
						while( i < indices.length ) {
							if(data[i][self.filterColumnIndices[0]] != data[i - 1][self.filterColumnIndices[0]]) {
								indices.splice(i, 0, "-");
								data.splice(i, 0, separatorRow );
								i += 2;
							} else {
								i++;
							}
						}
					} else {
						// insert separators at non consecutive indices
						var prevIndex = 0;
						var i = 1;
						while( i < indices.length ) {
							if (indices[i] > indices[prevIndex] + 1) {
								indices.splice(i, 0, "-");
								data.splice(i, 0, separatorRow );
								prevIndex = i + 1;
								i += 2;
							} else {
								prevIndex = i;
								i++;
							}
						}
					}
				}				
			};

		self.reselectTable = 
			function(selection)
			{
				if(typeof selection === 'object')
				{
					var canKeepSelection = false;
					var rows = $scope.showingIndices.rows.end - $scope.showingIndices.rows.start + 1;
					var columns = $scope.showingIndices.columns.end - $scope.showingIndices.columns.start + 1;
					selection[0] = selection[0] < rows ? selection[0] : rows - 1;
					selection[1] = selection[1] < columns ? selection[1] : columns - 1;
					selection[2] = selection[2] < rows ? selection[2] : rows - 1;
					selection[3] = selection[3] < columns ? selection[3] : columns - 1;
					self.hot.selectCell(selection[0], selection[1], selection[2], selection[3], false);
				}
			};

		self.performPendingHides = 
			function()
			{
				if(self.hideDialog)
				{
					$mdDialog.hide();
					self.hideDialog = false;
				}

				if(self.hideToast)
				{
					$mdToast.hide();
					self.hideToast = false;
				}
			}

		self.fetchDataAndUpdateTable = 
			function()
			{
				if(typeof self.hot !== 'undefined')
				{
					self.validateShowingIndices();

					var selection = self.hot.getSelected();
					self.hot.deselectCell();

					if($scope.dataSize.rows == 0 || $scope.dataSize.columns == 0)
					{
						self.hot.loadData([]);
						return;
					}

					var hotColumns = [];
					var columnHeaders = [];
					for( var index = $scope.showingIndices.columns.start ; index <= $scope.showingIndices.columns.end && index >= 0 ; index++ )
					{
						if(session.columnInfo[session.columns[index]].dataType.indexOf("int") >= 0)
							hotColumns.push({type: 'numeric', format: '0'})
						else if(session.columnInfo[session.columns[index]].dataType.indexOf("float") >= 0)
							hotColumns.push({type: 'numeric', format: '0.[00000]'});
						else if(session.columnInfo[session.columns[index]].dataType.indexOf("datetime") >= 0)
							hotColumns.push({type: 'date', dateFormat:"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"});
						else
							hotColumns.push({type: 'text'});
						columnHeaders.push(session.columns[index]);
					}

					self.hot.updateSettings({columns: hotColumns});
					self.hot.updateSettings({colHeaders: columnHeaders});

					var dataRequestOptions = self.showingIndicesToOptions($scope.showingIndices);

					if( $scope.dataFiltered  ) {
						// in filter values mode
						dataRequestOptions.filterColumnIndices = self.filterColumnIndices;
						dataRequestOptions.filterType = self.filterType;
					}
					
					if( $scope.dataSorted ) {
						dataRequestOptions.sortColumnIndex = self.sortColumnIndex;
						dataRequestOptions.sortAscending = self.sortAscending;
					}

					if($scope.dataSearched) {
						dataRequestOptions.searchColumnIndices = self.searchColumnIndices;
						dataRequestOptions.searchQuery = $scope.searchQuery;
						dataRequestOptions.searchIsRegex = self.searchIsRegex;
					}
					
					session.getData(dataRequestOptions,  
						function(data, indices)
						{
							self.insertMoreIndicators(data, indices);
							self.insertSeparatorIndicators(data, indices);
							self.indices = indices;
							self.hot.loadData(data);
							self.reselectTable(selection);
							self.performPendingHides();

							$scope.$emit("firstLoad");
							if(self.initialLoad)
							{
								self.initialLoad = false;
								self.resizeToolTabs();
							}
						});
				}
			};

		self.requestMetadata = function() {
			if(typeof self.unsubscribe === 'function')
				self.unsubscribe();
			
			var options = {};
			if($scope.dataFiltered) {
				options.filterColumnIndices = self.filterColumnIndices;
				options.filterType = self.filterType;
				options.outliersStdDev = self.outliersStdDev;
				options.outliersTrimPortion = self.outliersTrimPortion;
			}

			if($scope.dataSorted) {
				options.sortColumnIndex = self.sortColumnIndex;
				options.sortAscending = self.sortAscending;
			}

			if($scope.dataSearched) {
				options.searchColumnIndices = self.searchColumnIndices;
				options.searchQuery = $scope.searchQuery;
				options.searchIsRegex = self.searchIsRegex;
			}

			self.unsubscribe = session.subscribeToMetadata(options, self.metadataCallbackHandler);
		};

		$scope.setSearch = function(columns, query, regex) {
			// reset showing indices when filter changes
			$scope.showingIndices = 
				{
					rows:
						{
							start: 0,
 							end: 49
						},
					columns:
						{
							start: 0,
							end: 9
						}
				};
				
			$scope.searchQuery = query;
			if(columns == "all")
				self.searchColumnIndices = session.columnsToColumnIndices(session.columns);
			else
				self.searchColumnIndices = session.columnsToColumnIndices(columns);
			self.searchIsRegex = regex;
			$scope.dataSearched = self.searchColumnIndices instanceof Array && self.searchColumnIndices.length > 0 && typeof query === "string" && query.length > 0;
			self.resizeTable();

			self.requestMetadata();
		}

		$scope.setSort = function(column, ascending) {
			// reset showing indices when filter changes
			$scope.showingIndices = 
				{
					rows:
						{
							start: 0,
 							end: 49
						},
					columns:
						{
							start: 0,
							end: 9
						}
				};
				
			$scope.sortColumn = column;
			self.sortColumnIndex = session.columnToColumnIndex(column);
			self.sortAscending = ascending;
			$scope.dataSorted = typeof self.sortColumnIndex === 'number' && typeof self.sortAscending === 'boolean';
			self.resizeTable();

			self.requestMetadata();
		};

		$scope.setFilter =
			function(type, columns, outliersStdDev, outliersTrimPortion)
			{
				// reset showing indices when filter changes
				$scope.showingIndices = 
					{
						rows:
							{
								start: 0,
	 							end: 49
							},
						columns:
							{
								start: 0,
								end: 9
							}
					};

				// update internal model
				$scope.dataFiltered = (typeof columns === 'object' && columns.length > 0) || columns == "all";
				if(columns == "all") {
					$scope.filterColumns = ["All Columns"];
					self.filterColumnIndices = session.columnsToColumnIndices(session.columns);
				} else {
					$scope.filterColumns = columns;
					self.filterColumnIndices = session.columnsToColumnIndices(columns);
				}
				self.filterType = type;
				self.outliersStdDev = outliersStdDev;
				self.outliersTrimPortion = outliersTrimPortion;
				self.resizeTable();

				if(self.filterType == "invalid") {
					$scope.filterText = "Showing rows with invalid values in columns: ";
				} else if(self.filterType == "duplicates") {
					$scope.filterText = "Showing rows with duplicate values in columns: ";
				} else if(self.filterType == "outliers") {
					$scope.filterText = "Showing rows with outliers in columns: ";
				}
				
				self.requestMetadata();
			};

		var Selection = 
			function(rowStart, columnStart, rowEnd, columnEnd)
			{
				this.columns = [];
				this.rows = [];

				for(var index = columnStart ; index <= columnEnd ; index++)
					this.columns.push(session.columns[index + $scope.showingIndices.columns.start]);

				for(var index = rowStart ; index <= rowEnd ; index++)
					if(self.indices[index] != "-" && self.indices[index] != '...')
						this.rows.push(self.indices[index]);

				this.type = [];

				if(rowStart == 0 && rowEnd == self.indices.length - 1)
					this.type.push("column");

				if(columnStart == 0 && columnEnd == $scope.showingIndices.columns.end - $scope.showingIndices.columns.start && this.rows.length > 0)
					this.type.push("row");
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
				domElement.firstChild.innerHTML = "";
				var rowNameSpan = document.createElement('span');
				rowNameSpan.className = "rowHeader";
				if(typeof self.indices[rowIndex] !== "number")
					rowNameSpan.innerHTML = self.indices[rowIndex];
				else
					rowNameSpan.innerHTML = self.indices[rowIndex] + 1;

				domElement.firstChild.appendChild(rowNameSpan);
			};

		this.separatorRowRenderer =
			function(instance, td, row, col, prop, value, cellProperties)
			{
				Handsontable.renderers.TextRenderer.apply(this, arguments);
		    	td.style.background = '#EEE';
			};

		this.showingIndicesToOptions =
			function(showingIndices)
			{
				return	{
							rowIndexFrom: showingIndices.rows.start, 
							rowIndexTo: showingIndices.rows.end,
							columnIndexFrom: showingIndices.columns.start,
							columnIndexTo: showingIndices.columns.end
						};
			};

		var min = function(a, b) { return a < b ? a : b; };
		var max = function(a, b) { return a > b ? a : b; };

		this.validateShowingIndices = 
			function()
			{
				// initialize if uninitialized
				if(typeof $scope.showingIndices !== 'object' || typeof $scope.showingIndices.rows !== 'object' || typeof $scope.showingIndices.columns !== 'object')
				{
					// first load -> default valuesbb
					$scope.showingIndices = 
						{
							rows:
								{
									start: 0,
									end: 49
								},
							columns:
								{
									start: 0,
									end: 9
								}
						};
				}

				// if no data to display
				if($scope.dataSize.rows == 0 || $scope.dataSize.columns == 0)
				{
					$scope.showingIndices = {rows: {start: -1, end: -1}, columns: {start: -1, end: -1}};
					$scope.userShowingIndices = {rows: {start: 0, end: 0}, columns: {start: 0, end: 0}};
					return;
				}

				// check within bounds
				$scope.showingIndices.rows.start = min(max(0, $scope.showingIndices.rows.start), $scope.dataSize.rows - 1);
				$scope.showingIndices.rows.end = min(max(0, $scope.showingIndices.rows.end), $scope.dataSize.rows - 1);
				$scope.showingIndices.columns.start = min(max(0, $scope.showingIndices.columns.start), $scope.dataSize.columns - 1);
				$scope.showingIndices.columns.end = min(max(0, $scope.showingIndices.columns.end), $scope.dataSize.columns - 1);

				if($scope.showingIndices.rows.end < $scope.showingIndices.rows.start)
					$scope.showingIndices.rows.end = $scope.showingIndices.rows.start;
				if($scope.showingIndices.rows.end - $scope.showingIndices.rows.start > maxRows - 1)
					$scope.showingIndices.rows.end = $scope.showingIndices.rows.start + maxRows - 1;

				if($scope.showingIndices.columns.end < $scope.showingIndices.columns.start)
					$scope.showingIndices.columns.end = $scope.showingIndices.columns.start;
				if($scope.showingIndices.columns.end - $scope.showingIndices.columns.start > maxColumns - 1)
					$scope.showingIndices.columns.end = $scope.showingIndices.columns.start + maxColumns - 1;

				// update display model (essentially += 1 for more readable 1-based index)
				$scope.userShowingIndices = 
					{
						rows:
							{
								start: $scope.showingIndices.rows.start + 1,
								end: $scope.showingIndices.rows.end + 1,
							},
						columns:
							{
								start: $scope.showingIndices.columns.start + 1,
								end: $scope.showingIndices.columns.end + 1,
							}
					};
			}

		this.metadataCallbackHandler = 
			function(dataSize, columns, columnInfo)
			{
				$scope.dataSize = dataSize;
				self.fetchDataAndUpdateTable();
			};

		this.optimumTableWidth = function() {
			return window.innerWidth - ($scope.showSidebar ? self.sidebarWidth : 0);
		};

		this.optimumTableHeight = function() {
			var height = window.innerHeight - self.toolbarTabInspectorHeight;
			if($scope.dataFiltered)
				height -= self.filterIndicatorHeight;
			if($scope.dataSorted || $scope.dataSearched)
				height -= self.sortIndicatorHeight;
			return height;
		}

		this.init = 
			function()
			{
				$scope.filterColumns = [];
				$scope.dataFiltered = false;

				self.toolbarTabHeight = 24 + 48;
				self.toolbarTabInspectorHeight = self.toolbarTabHeight + 30;

				$scope.showSidebar = true;

				self.filterIndicatorHeight = 30 + 15 + 4;
				self.sortIndicatorHeight = 30;

				self.initialLoad = true;
				self.sidebarWidth = 380;

				self.hot = new Handsontable(document.getElementById("hotTable"), 
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
					width: self.optimumTableWidth(),
					height: self.optimumTableHeight(),							
					rowHeaders: true,
					colHeaders: true,
					stretchH: 'all',
					cells: 
						function (row, col, prop)
						{
			    			var cellProperties = {};
			     			if(typeof self.indices === 'object' && (self.indices[row] == "..." || self.indices[row] == "-" ))
				      			cellProperties.renderer = self.separatorRowRenderer;
			      			return cellProperties;
			    		} 
				});

				self.hot.addHook('afterSelection', self.userDidSelect);
				self.hot.addHook('afterGetColHeader', self.renderTableColumnHeader);
				self.hot.addHook('afterGetRowHeader', self.renderTableRowHeader);

				window.onresize = self.resizeTable;

				self.unsubscribe = session.subscribeToMetadata({}, self.metadataCallbackHandler);
			};

		this.resizeTable = function() {
			if(typeof self.hot === 'object')
				self.hot.updateSettings({
					width: self.optimumTableWidth(),
					height: self.optimumTableHeight()
				});
			$("#hotTable").height(self.optimumTableHeight());
			$("#hotTable").width(self.optimumTableWidth());
			$("#hotTable").css('white-space', 'pre-line');
			$("#tableStatus").width(self.optimumTableWidth());
			self.resizeToolTabs();
			self.resizeAnalyzeContent();
		};

		this.resizeToolTabs =
			function()
			{
				var toolTabs = document.getElementsByClassName('toolTab');
				for (var i=0; i < toolTabs.length; i++)
					toolTabs[i].style.height = (window.innerHeight - self.toolbarTabHeight - 48 - 1) + "px";
				$("#cleanSidenav").height(window.innerHeight - self.toolbarTabHeight);
			};

		this.resizeAnalyzeContent =
			function()
			{
				var tabContent = document.getElementsByClassName('tabContent');
				for (var j = 0; j < tabContent.length; j++)
					tabContent[j].style.height = (window.innerHeight - 24 - 48) + "px";
				document.getElementsByClassName('analyzeControlPanel')[0].style.height = (window.innerHeight - 24 - 48) + "px";
				var analyzePanels = document.getElementsByClassName('analyzePanel');
				for (var i=0; i < analyzePanels.length; i++)
					analyzePanels[i].style.height = (window.innerHeight - 24 - 48) + "px";
			};

		$scope.toggleSidebar =
			function()
			{
				$scope.showSidebar = !$scope.showSidebar;
				self.resizeTable();
			}

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
					
					if( columnIndex >= $scope.showingIndices.columns.start && columnIndex <= $scope.showingIndices.columns.end )
						self.hot.selectCell(0, columnIndex - $scope.showingIndices.columns.start, self.hot.getData().length - 1, columnIndex - $scope.showingIndices.columns.start);
					else
						self.hot.deselectCell();

					if(digest == false)
					{
						$scope.selectedIndices = new Selection(0, columnIndex - $scope.showingIndices.columns.start, self.hot.getData().length - 1, columnIndex - $scope.showingIndices.columns.start);
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
				// hide after data reload
				self.hideToast = true;
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

		$document.ready(
			function()
			{	
				self.init();
			});
	}]);