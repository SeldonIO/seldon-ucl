angular.module('dcs.controllers').controller('VisualizeController', ['$scope', '$rootScope', '$state', 'session', 
	function($scope, $rootScope, $state, session)
	{
		$rootScope.$watch('data',
			function(newVal, oldVal)
			{
				if(typeof newVal !== 'undefined')
				{
					$scope.columns = $scope.getColumns($rootScope.data);
				}
			}, true);

		$rootScope.$watch('dataTypes',
			function(newVal, oldVal)
			{
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

		$scope.init = 
			function()
			{
				$scope.cacheEnabled = true;
				$scope.columns = $scope.getColumns($rootScope.data);
				$scope.chartTypes = ["Bar Chart", "Histogram", "Line Chart"];
				$scope.xAxisColumns = [];
				$scope.yAxisColumns = [];
				$scope.yAxisColumnsPlaceholder = "type to select columns";
				$scope.chartTypeAllowedDataTypes =
					{
						"Bar Chart": {x: ["object"], y: ["int64", "float64"]},
						"Histogram": {x: ["int64", "float64", "datetime64"], y: ["int64", "float64"]},
						"Line Chart": {x: ["int64", "float64", "datetime64"], y: ["int64", "float64"]}
					};
			};

		$scope.querySearch = 
			function(list, query)
			{
				console.log("filtering " + query + " from " + list);
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

		$scope.setUpColumnPicker =
			function()
			{
				if($scope.selectedChartType && $scope.columns)
				{
					$scope.allowedXAxisColumns = $scope.columns.filter(
						function(currentColumn)
						{
							return $scope.chartTypeAllowedDataTypes[$scope.selectedChartType].x.indexOf($rootScope.dataTypes[currentColumn]) >= 0;
						});
					console.log(JSON.stringify($scope.allowedXAxisColumns));
					$scope.allowedYAxisColumns = $scope.columns.filter(
						function(currentColumn)
						{
							return $scope.chartTypeAllowedDataTypes[$scope.selectedChartType].y.indexOf($rootScope.dataTypes[currentColumn]) >= 0;
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
					$scope.updateChartDisplay();
				}
			};

		$scope.$watch('selectedChartType', 
			function(newVal, oldVal)
			{
				if(newVal && $scope.chartTypes)
				{
					$scope.shouldShowColumnPickers = $scope.chartTypes.indexOf(newVal) >= 0; 
					$scope.setUpColumnPicker();
				}
			});

		$scope.$watch('xAxisColumns', 
			function(newVal, oldVal)
			{
				if($scope.xAxisColumns && $scope.xAxisColumns.length == 1)
				{
					$("#xAxisColumnAutocomplete").prop('disabled', true);
					$("#xAxisColumnAutocomplete").css('display', 'none');
					$scope.xAxisReady = true;
				}
				else if($scope.xAxisColumns && $scope.xAxisColumns.length == 0)
				{
					$("#xAxisColumnAutocomplete").prop('disabled', false);
					$("#xAxisColumnAutocomplete").css('display', 'block');
					$scope.xAxisReady = false;
				}
				
				$scope.updateChartDisplay();
			}, true);
		
		$scope.$watch('yAxisColumns', 
			function(newVal, oldVal)
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

				$scope.yAxisReady = $scope.yAxisColumns && $scope.yAxisColumns.length > 0 && ($scope.selectedChartType != "Histogram" || $scope.validHistogramBinSize );

				$scope.updateChartDisplay();
			}, true);

		$scope.validHistogramBinSize = 
			function()
			{
				return (typeof $scope.histogramBinSize === 'object' && $scope.histogramBinSize == null) || (typeof $scope.histogramBinSize === 'number' && $scope.histogramBinSize > 0);
			};

		$scope.$watch('histogramBinSize',
			function(newVal, oldVal)
			{
				$scope.updateChartDisplay();
			});
	
		$scope.updateChartDisplay =
			function()
			{
				if($scope.xAxisReady && $scope.yAxisReady)
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

						for(var dataIndex = 0 ; dataIndex < $rootScope.data.length ; dataIndex++)
						{
							currentData.x.push($scope.data[dataIndex][xColumn]);
							currentData.y.push($scope.data[dataIndex][yColumn]);
						}
						plotData.push(currentData);
					}

					console.log(JSON.stringify(plotData));
					
					Plotly.newPlot('plotlyChart', plotData, {barmode: 'group'}, {showLink: false, displaylogo: false, displayModeBar: true});
					
					$scope.shouldShowChart = true;
				}
				else
					$scope.shouldShowChart = false;
			};

		$scope.histogramChanged = 
			function()
			{
				console.log(typeof $scope.histogramBinSize + ":" + $scope.histogramBinSize);
			}

		$scope.init();
	}]);