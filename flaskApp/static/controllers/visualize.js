angular.module('dcs.controllers').controller('VisualizeController', ['$scope', 'session', 
	function($scope, session)
	{
		var self = this;

		session.subscribeToData(
			function(data)
			{	
				self.setUpColumnPicker();
			});

		$scope.init = 
			function()
			{
				$scope.chartTypes = ["Bar Chart", "Histogram", "Line Chart"];
				$scope.xAxisColumns = [];
				$scope.yAxisColumns = [];
				$scope.yAxisColumnsPlaceholder = "type to select columns";
				self.chartTypeAllowedDataTypes =
					{
						"Bar Chart": {x: ["object"], y: ["int64", "float64"]},
						"Histogram": {x: ["int64", "float64", "datetime64"], y: ["int64", "float64"]},
						"Line Chart": {x: ["int64", "float64", "datetime64"], y: ["int64", "float64"]}
					};
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
					$scope.allowedXAxisColumns = session.columns.filter(
						function(currentColumn)
						{
							return self.chartTypeAllowedDataTypes[$scope.selectedChartType].x.indexOf(session.dataTypes[currentColumn]) >= 0;
						});

					$scope.allowedYAxisColumns = session.columns.filter(
						function(currentColumn)
						{
							return self.chartTypeAllowedDataTypes[$scope.selectedChartType].y.indexOf(session.dataTypes[currentColumn]) >= 0;
						});

					$scope.xAxisColumns = $scope.xAxisColumns.filter(
							function(currentColumn)
							{
								return $scope.allowedXAxisColumns.indexOf(currentColumn) >= 0;
							});

					$scope.yAxisColumns = $scope.yAxisColumns.filter(
							function(currentColumn)
							{
								return $scope.allowedYAxisColumns.indexOf(currentColumn) >= 0;
							});

					self.updateChartDisplay();
				}
			};

	    $scope.userDidSelectChartType = 
	    	function(selection)
	    	{
	    		if( typeof $scope.chartTypes === 'object' )
	    		{
	    			$scope.shouldShowColumnPickers = $scope.chartTypes.indexOf(selection) >= 0; 
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
						$("#xAxisColumnAutocomplete").prop('disabled', true);
						$("#xAxisColumnAutocomplete").css('display', 'none');
						self.xAxisReady = true;
					}
					else if(columns.length == 0)
					{
						$("#xAxisColumnAutocomplete").prop('disabled', false);
						$("#xAxisColumnAutocomplete").css('display', 'block');
						self.xAxisReady = false;
					}
					
					self.updateChartDisplay();
				}
	    	}, true);

	    $scope.$watch('yAxisColumns',  
	    	function(columns, oldVal)
	    	{
	    		/*
				if($scope.yAxisColumns && $scope.yAxisColumns.length == 1)
				{
				 	$("#yAxisColumnAutocomplete").prop('disabled', true);
					$("#yAxisColumnAutocomplete").css('display', 'none');
					$scope.yAxisReady = true;
				}
				else if($scope.yAxisColumns && $scope.yAxisColumns.length == 0)
				{
					$("#yAxisColumnAutocomplete").prop('disabled', false);
					$("#yAxisColumnAutocomplete").css('display', 'block');
					$scope.yAxisReady = false;
				} */

				self.yAxisReady = columns && columns.length > 0; 

				self.updateChartDisplay();
	    	}, true);

		$scope.userDidChangeHistogramBinSize =
			function(binSize)
			{
				self.updateChartDisplay();
			}

		self.validHistogramBinSize = 
			function(value)
			{
				return (typeof value === 'undefined') || (typeof value === 'object' && value == null) || (typeof value === 'number' && value > 0);
			};

	    self.updateChartDisplay =
			function()
			{
				if( self.xAxisReady && self.yAxisReady && ($scope.selectedChartType != "Histogram" || self.validHistogramBinSize($scope.histogramBinSize)) )
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
										start: 0,
										end: 100,
										size: $scope.histogramBinSize
									};
							}
						}

						for(var dataIndex = 0 ; dataIndex < session.data.length ; dataIndex++)
						{
							currentData.x.push(session.data[dataIndex][xColumn]);
							currentData.y.push(session.data[dataIndex][yColumn]);
						}
						plotData.push(currentData);
					}
					
					Plotly.newPlot('plotlyChart', plotData, {barmode: 'group'}, {showLink: false, displaylogo: false, displayModeBar: true});
					
					$scope.shouldShowChart = true;
				}
				else
				{
					Plotly.newPlot('plotlyChart', []);
					$scope.shouldShowChart = false;
				}
			};

		$scope.init();
	}]);