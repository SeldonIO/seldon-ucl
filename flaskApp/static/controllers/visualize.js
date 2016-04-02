angular.module('dcs.controllers').controller('VisualizeController', ['$scope', 'analysis', 'session', '$timeout', 'dialogs',
	function($scope, analysis, session, $timeout, dialogs)
	{
		var self = this;

		$scope.init = 
			function()
			{
				self.xAxisStartDate = new Pikaday({ field: document.getElementById('xAxisStartDate'), format: "YYYY-MM-DD[T]HH:mm:ssZ"});
				self.xAxisEndDate = new Pikaday({ field: document.getElementById('xAxisEndDate'), format: "YYYY-MM-DD[T]HH:mm:ssZ" });

				$scope.chartTypes = ["Line Chart", "Scatter Plot", "Time Series", "Histogram", "Frequency"];
				$scope.xAxisColumns = [];
				$scope.yAxisColumns = [];
				$scope.yAxisColumnsPlaceholder = "type to select columns";
				self.chartTypeAllowedDataTypes =
					{
						"Line Chart": {x: ["int", "float", "datetime"], y: ["int", "float"]},
						"Scatter Plot": {x: ["int", "float"], y: ["int", "float"]},
						"Time Series": {x: ["datetime"], y: ["int", "float"]},
						"Histogram": {x: ["int", "float", "datetime"], y:[]},
						"Frequency": {x: ["string", "int", "float", "datetime"], y: []}
					};
					
				session.subscribeToMetadata({}, function() {
					$timeout(function() {
						self.setUpColumnPicker();
						$scope.$digest();
						self.updateChartDisplay();
					}, 0, false);
				});
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
				}
			};

	    $scope.userDidSelectChartType = 
	    	function(selection)
	    	{
	    		if( typeof $scope.chartTypes === 'object' )
	    		{
	    			$scope.shouldShowColumnPickers = $scope.chartTypes.indexOf(selection) >= 0; 
	    			$scope.shouldShowPickerY = $scope.selectedChartType != "Histogram" && $scope.selectedChartType != "Frequency" && $scope.selectedChartType != "Pie Chart";
	    			$scope.shouldShowChart = false;
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
						$scope.frequencyShowUseWords = false;
						$scope.axis = undefined;
					}

					$scope.frequencyShowUseWords = $scope.selectedChartType == "Frequency" && columns.length > 0 && session.columnInfo[columns[0]].dataType == "string";
					
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

		$scope.userDidChangeFrequencyCutoff =
			function(frequencyCutoff)
			{
				self.updateChartDisplay();
			}

		$scope.userDidChangeFrequencyUserWords =
			function(frequencyShowUseWords)
			{
				self.updateChartDisplay();
			}

		self.validOrEmptyFrequencyCutoff = function() {
			return typeof $scope.frequencyCutoff === 'undefined' || $scope.frequencyCutoff == null || isNaN($scope.frequencyCutoff) || self.validFrequencyCutoff();
		};

		self.validFrequencyCutoff = function() {
			return typeof $scope.frequencyCutoff === 'number' && $scope.frequencyCutoff > 0 && $scope.frequencyCutoff <= 50;
		};

		self.validOrEmptyHistogramBins = 
			function()
			{
				var value = $scope.histogramBins;
				return typeof value === 'undefined' || value == null || isNaN(value) || self.validHistogramBins();
			};

		self.validHistogramBins = 
			function()
			{
				var value = $scope.histogramBins;
				return typeof value === 'number' && value >= 1;
			}

		self.validAxis = 
			function()
			{
				var axis = $scope.axis;
				if(typeof axis === 'object' && typeof axis.x === 'object' && typeof axis.y === 'object') {
					if(typeof axis.y.start === 'number' && typeof axis.y.end === 'number' && axis.y.start < axis.y.end) {
						if($scope.selectedChartType != "Time Series") {
							if(typeof axis.x.start === 'number' && typeof axis.x.end === 'number' && axis.x.start < axis.x.end)
								return true;
						} else if($scope.selectedChartType == "Time Series") {
							var start = Date.parse(axis.x.start);
							var end = Date.parse(axis.x.end);
							if(typeof !isNaN(start) && !isNaN(end) && start < end)
								return true;
						}
					}					
				}
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
						console.log($scope.histogramBins);
						var options = {type: 'histogram', 'columnIndices': session.columnsToColumnIndices($scope.xAxisColumns)};
						if( self.validHistogramBins() )
							options.numberOfBins = $scope.histogramBins;
						if( self.validAxis() )
							options.axis = $scope.axis;

						session.visualize(options, function(data) {
							$timeout(function() {
								if(data.success) {
									$scope.staticChartData = "data:image/png;base64," + data.image;
									$scope.shouldShowChart = true;
									$scope.axis = data.axis;
								} else {
									dialogs.errorDialog("Plot Histogram", data.error, data.errorDescription);
									$scope.shouldShowChart = false;
								}
								$scope.$digest();
							}, 0, false);

						});
					}
					else
						$scope.shouldShowChart = false;
				} else if( $scope.selectedChartType == "Scatter Plot" || $scope.selectedChartType == "Line Chart") {
					if( self.xAxisReady && self.yAxisReady ) {
						var options = {type: $scope.selectedChartType == "Scatter Plot" ? 'scatter' : 'line', 'xColumnIndex': session.columnToColumnIndex($scope.xAxisColumns[0]), 'yColumnIndices': session.columnsToColumnIndices($scope.yAxisColumns)};
						if( self.validAxis() )
							options.axis = $scope.axis;
						session.visualize(options, function(data) {
							$timeout(function() {
								if(data.success) {
									$scope.staticChartData = "data:image/png;base64," + data.image;
									$scope.shouldShowChart = true;
									$scope.axis = data.axis;
								} else {
									dialogs.errorDialog("Plot Scatter/Line Chart", data.error, data.errorDescription);
									$scope.shouldShowChart = false;
								}
								$scope.$digest();
							}, 0, false);
						});
					}
					else
						$scope.shouldShowChart = false;
				} else if( $scope.selectedChartType == "Time Series" ) {
					if( self.xAxisReady && self.yAxisReady ) {
						var options = {type: 'date', xColumnIndex: session.columnToColumnIndex($scope.xAxisColumns[0]), yColumnIndices: session.columnsToColumnIndices($scope.yAxisColumns)};
						if( self.validAxis() )
							options.axis = $scope.axis;
						session.visualize(options, function(data) {
							$timeout(function() {
								if(data.success) {
									$scope.staticChartData = "data:image/png;base64," + data.image;
									$scope.shouldShowChart = true;
									$scope.axis = data.axis;
									self.xAxisStartDate.setDate(new Date($scope.axis.x.start));
									self.xAxisEndDate.setDate(new Date($scope.axis.x.end));
								} else {
									dialogs.errorDialog("Plot Time Series", data.error, data.errorDescription);
									$scope.shouldShowChart = false;
								}

								$scope.$digest();
							}, 0, false);
						});
					}
					else
						$scope.shouldShowChart = false;
				} else if( $scope.selectedChartType == "Frequency" ) {
					if( self.xAxisReady && self.validOrEmptyFrequencyCutoff() ) {
						var options = {type: 'frequency', columnIndex: session.columnToColumnIndex($scope.xAxisColumns[0])};
						if( $scope.frequencyShowUseWords && $scope.frequencyUseWords )
							options.useWords = true;
						if( self.validFrequencyCutoff() )
							options.cutoff = $scope.frequencyCutoff;

						session.visualize(options, function(data) {
							$timeout(function() {
								if(data.success) {
									$scope.staticChartData = "data:image/png;base64," + data.image;
									$scope.shouldShowChart = true;
								} else {
									dialogs.errorDialog("Plot Frequency Chart", data.error, data.errorDescription);
									$scope.shouldShowChart = false;
								}
								$scope.$digest();
							}, 0, false);
						});
					}
					else
						$scope.shouldShowChart = false;
				}
			};

		$scope.zoomReset = 
			function()
			{
				$("#staticChart").css({
					"width": "100%",
					"max-width": "900px",
					"min-width": "600px"
				});
			};

		$scope.zoomIn = 
			function()
			{
				var maxWidth = $("#staticChart").width();
				maxWidth += 200;
				$("#staticChart").css({
					"width": maxWidth.toString() + "px",
					"max-width": "none",
					"min-width": "none"
				});
			};

		$scope.zoomOut = 
			function()
			{
				var maxWidth = $("#staticChart").width();
				maxWidth -= 200;
				$("#staticChart").css({
					"width": maxWidth.toString() + "px",
					"max-width": "none",
					"min-width": "none"
				});
			};

		$scope.init();
	}]);
