angular.module('dcs.controllers').controller('VisualizeController', ['$scope', 'analysis', 'session', '$timeout',  
	function($scope, analysis, session, $timeout)
	{
		var self = this;

		$scope.init = 
			function()
			{
				$scope.chartTypes = ["Line Chart", "Scatter Plot", "Time Series", "Histogram", "Frequency", "Pie Chart"];
				$scope.xAxisColumns = [];
				$scope.yAxisColumns = [];
				$scope.yAxisColumnsPlaceholder = "type to select columns";
				self.chartTypeAllowedDataTypes =
					{
						"Line Chart": {x: ["int64", "float64", "datetime64"], y: ["int64", "float64"]},
						"Scatter Plot": {x: ["int64", "float64"], y: ["int64", "float64"]},
						"Time Series": {x: ["datetime64"], y: ["int64", "float64"]},
						"Histogram": {x: ["int64", "float64", "datetime64"], y:[]},
						"Frequency": {x: ["object"], y: []}, 
						"Pie Chart": {x: ["object"], y: []}
					};
				session.subscribeToMetadata({}, self.setUpColumnPicker);
			};

		$scope.querySearch = 
			function(list, query)
			{
				if(list && query)
				{
					return list.filter(
						function(currentElement)
						{
							return currentElement.toLowerCase().indexOf(query.toLowerCase()) >= 0;
						});
				}
				else
					return [];
			};

		self.setUpColumnPicker =
			function()
			{
				if($scope.selectedChartType)
				{
					$scope.axis = undefined;
					$scope.allowedXAxisColumns = session.columns.filter(
						function(currentColumn)
						{
							var types = self.chartTypeAllowedDataTypes[$scope.selectedChartType].x;
								for(var index = 0 ; index < types.length ; index++ )
									if(session.columnInfo[currentColumn].dataType.indexOf(types[index]) >= 0)
										return true;
								return false;
						});

					$scope.xAxisColumns = $scope.xAxisColumns.filter(
							function(currentColumn)
							{
								return $scope.allowedXAxisColumns.indexOf(currentColumn) >= 0;
							});

					if($scope.shouldShowPickerY) {
						$scope.allowedYAxisColumns = session.columns.filter(
							function(currentColumn)
							{
								var types = self.chartTypeAllowedDataTypes[$scope.selectedChartType].y;
								for(var index = 0 ; index < types.length ; index++ )
									if(session.columnInfo[currentColumn].dataType.indexOf(types[index]) >= 0)
										return true;
								return false;
							});

						$scope.yAxisColumns = $scope.yAxisColumns.filter(
							function(currentColumn)
							{
								return $scope.allowedYAxisColumns.indexOf(currentColumn) >= 0;
							});
					}

					self.updateChartDisplay();
				}
			};

	    $scope.userDidSelectChartType = 
	    	function(selection)
	    	{
	    		if( typeof $scope.chartTypes === 'object' )
	    		{
	    			$scope.shouldShowColumnPickers = $scope.chartTypes.indexOf(selection) >= 0; 
	    			$scope.shouldShowPickerY = $scope.selectedChartType != "Histogram" && $scope.selectedChartType != "Word Frequency";
					self.setUpColumnPicker();
	    		}
	    	};

	    $scope.$watch('xAxisColumns',
	    	function(columns, oldVal)
	    	{
	    		if(typeof columns === 'object')
	    		{
		    		if(columns.length == 1)
					{
						if($scope.selectedChartType != "Histogram")
						{
							$("#xAxisColumnAutocomplete").prop('disabled', true);
							$("#xAxisColumnAutocomplete").css('display', 'none');
						}
						self.xAxisReady = true;
					}
					else if(columns.length == 0)
					{
						$("#xAxisColumnAutocomplete").prop('disabled', false);
						$("#xAxisColumnAutocomplete").css('display', 'block');
						self.xAxisReady = false;
						$scope.axis = undefined;
					}
					
					self.updateChartDisplay();
				}
	    	}, true);

	    $scope.$watch('yAxisColumns',  
	    	function(columns, oldVal)
	    	{
	    		if(typeof columns === 'object')
	    		{
	    			if(columns.length > 0) {
					 	/* $("#yAxisColumnAutocomplete").prop('disabled', true);
						$("#yAxisColumnAutocomplete").css('display', 'none'); */
						self.yAxisReady = true;
					} else if(columns.length == 0) {
						/* $("#yAxisColumnAutocomplete").prop('disabled', false);
						$("#yAxisColumnAutocomplete").css('display', 'block'); */
						self.yAxisReady = false;
						$scope.axis = undefined;
					}		
		    		self.updateChartDisplay();
		    	}
	    	}, true);

		$scope.userDidChangeHistogramBins =
			function(binSize)
			{
				$scope.histogramBins = parseInt($scope.histogramBins);
				self.updateChartDisplay();
			}

		self.validHistogramBins = 
			function()
			{
				var value = $scope.histogramBins;
				return typeof value === 'number' && value >= 1;
			}

		self.validOrEmptyHistogramBins = 
			function()
			{
				var value = $scope.histogramBins;
				return typeof value === 'undefined' || (typeof $scope.histogramBins === 'object' && value == null) || self.validHistogramBins();
			};

		self.validAxis = 
			function()
			{
				var axis = $scope.axis;
				if(typeof axis === 'object' && typeof axis.x === 'object' && typeof axis.y === 'object')
					if(typeof axis.x.start === 'number' && typeof axis.x.end === 'number' && axis.x.start < axis.x.end)
						if(typeof axis.y.start === 'number' && typeof axis.y.end === 'number' && axis.y.start < axis.y.end)
							return true;

				return false;
			};

		self.validOrEmptyAxis = 
			function()
			{
				var axis = $scope.axis;
				return typeof axis === 'undefined' || (typeof axis === 'object' && axis == null) || self.validAxis();
			};

		$scope.userChangedAxisSettings = 
			function()
			{
				self.updateChartDisplay();
			}

	    self.updateChartDisplay =
			function()
			{
				if( $scope.selectedChartType == "Histogram" ) {
					if( self.xAxisReady && self.validOrEmptyHistogramBins() &&  self.validOrEmptyAxis() ) {
						var options = {type: 'histogram', 'columnIndices': session.columnsToColumnIndices($scope.xAxisColumns)};
						if( typeof $scope.histogramBins === 'number' && $scope.histogramBins >= 1 )
							options.numberOfBins = $scope.histogramBins;
						if( self.validAxis($scope.axis) )
							options.axis = $scope.axis;

						session.visualize(options, function(data) {
							$timeout(function() {
								if(data.success) {
									$scope.staticChartData = "data:image/png;base64," + data.image;
									$scope.shouldShowChart = true;
									$scope.axis = data.axis;
								}
								else
									$scope.shouldShowChart = false;
								$scope.$digest();
							}, 0, false);

						});
					}
					else
						$scope.shouldShowChart = false;
				} else if( $scope.selectedChartType == "Scatter Plot" || $scope.selectedChartType == "Line Chart") {
					if( self.xAxisReady && self.yAxisReady ) {
						var options = {type: $scope.selectedChartType == "Scatter Plot" ? 'scatter' : 'line', 'xColumnIndex': session.columnToColumnIndex($scope.xAxisColumns[0]), 'yColumnIndices': session.columnsToColumnIndices($scope.yAxisColumns)};
						if( self.validAxis($scope.axis) )
							options.axis = $scope.axis;
						session.visualize(options, function(data) {
							$timeout(function() {
								if(data.success) {
									$scope.staticChartData = "data:image/png;base64," + data.image;
									$scope.shouldShowChart = true;
									$scope.axis = data.axis;
								}
								else
									$scope.shouldShowChart = false;
								$scope.$digest();
							}, 0, false);
						});
					}
					else
						$scope.shouldShowChart = false;
				} else if( $scope.selectedChartType == "Bar Chart" || $scope.selectedChartType == "Line Chart") {
					if( self.xAxisReady && self.yAxisReady ) {
						var options = {type: $scope.selectedChartType == "Scatter Plot" ? 'scatter' : 'line', xColumnIndex: session.columnToColumnIndex($scope.xAxisColumns[0]), 'yColumnIndices': session.columnsToColumnIndices($scope.yAxisColumns)};
						if( self.validAxis($scope.axis) )
							options.axis = $scope.axis;
						session.visualize(options, function(data) {
							$timeout(function() {
								if(data.success) {
									$scope.staticChartData = "data:image/png;base64," + data.image;
									$scope.shouldShowChart = true;
									$scope.axis = data.axis;
								}
								else
									$scope.shouldShowChart = false;
								$scope.$digest();
							}, 0, false);
						});
					}
					else
						$scope.shouldShowChart = false;
				} else if( $scope.selectedChartType == "Time Series" ) {
					if( self.xAxisReady && self.yAxisReady ) {
						var options = {type: 'date', xColumnIndex: session.columnToColumnIndex($scope.xAxisColumns[0]), yColumnIndices: session.columnsToColumnIndices($scope.yAxisColumns)};
						session.visualize(options, function(data) {
							$timeout(function() {
								if(data.success) {
									$scope.staticChartData = "data:image/png;base64," + data.image;
									$scope.shouldShowChart = true;
								}
								else
									$scope.shouldShowChart = false;
								$scope.$digest();
							}, 0, false)
						});
					}
				}


				/* 
				if(self.xAxisReady && self.yAxisReady )
				{
					session.getData({'sortedSample': 10, 'sampleColumn': session.columnToColumnIndex($scope.xAxisColumns[0]), 'dataColumns': session.columnsToColumnIndices($scope.yAxisColumns)},
						function(data, indices)
						{
							var xColumn = $scope.xAxisColumns[0];
							var plotData = [];

							for(var yIndex = 0 ; yIndex < $scope.yAxisColumns.length ; yIndex++)
							{
								var yColumn = $scope.yAxisColumns[yIndex];
								var currentData = {x: [], y: [], name: yColumn};

								if($scope.selectedChartType == "Bar Chart")
									currentData.type = "bar";
								else if($scope.selectedChartType == "Line Chart")
									currentData.type = "scatter";
								else if($scope.selectedChartType == "Histogram")
								{
									currentData.type = "histogram";
									if(typeof $scope.histogramBinSize === 'number' && $scope.histogramBinSize > 0)
									{
										currentData.autobinx = false;
										currentData.xbins =
											{
												size: $scope.histogramBinSize
											};
									}
								}
								
								for(var dataIndex = 0 ; dataIndex < data.length ; dataIndex++)
								{
									currentData.x.push(data[dataIndex][xColumn]);
									currentData.y.push(data[dataIndex][yColumn]);
								}
								plotData.push(currentData); 
							}
							
							Plotly.newPlot('plotlyChart', plotData, {barmode: 'group'}, {showLink: false, displaylogo: false, displayModeBar: true});
							
							$scope.shouldShowChart = true;
						});
				}
				else if( self.xAxisReady && ($scope.selectedChartType == "Word Frequency"))
				{
					var xColumn = $scope.xAxisColumns[0];
					
					if(typeof self.unsub === 'function')
						self.unsub();
					self.unsub = analysis.subscribe(xColumn,
						function(analysis)
						{
							var plotData = [];
							var currentData = {x: [], y: [], name: xColumn, type: "bar"};
							
							var wordFrequencies = analysis.raw.word_frequencies;
							for(var key in wordFrequencies){
								currentData.x.push(wordFrequencies[key][0]);
								currentData.y.push(wordFrequencies[key][1]);
							}

							plotData.push(currentData);
							Plotly.newPlot('plotlyChart', plotData, {barmode: 'group'}, {showLink: false, displaylogo: false, displayModeBar: true});
							$scope.shouldShowChart = true;
						});	
				}
				else
				{
					Plotly.newPlot('plotlyChart', []);
					$scope.shouldShowChart = false;
				} */
			};

		$scope.init();
	}]);