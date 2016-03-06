angular.module('dcs.controllers').controller('AnalyzeController', ['$scope', 'session', '$timeout', '$document',
	function($scope, session, $timeout, $document)
	{
		var self = this;
		
		this.init = 
			function()
			{
				this.resizeContent();
				$scope.showSidebar = true;
				$scope.gridSize = "twoone";
				//window.onresize = this.resizeContent;
			}

		this.resizeContent =
			function()
			{
				var tabContent = document.getElementsByClassName('tabContent');
				tabContent[0].style.height = (window.innerHeight - 24 - 48) + "px";
				document.getElementsByClassName('analyzeControlPanel')[0].style.height = (window.innerHeight - 24 - 48) + "px";
				var analyzePanels = document.getElementsByClassName('analyzePanel');
				for (var i=0; i < analyzePanels.length; i++)
					analyzePanels[i].style.height = (window.innerHeight - self.toolbarTabHeight - 24 - 48) + "px";
			};

		$scope.querySearch = function(query)
			{
	      var results = query ? $scope.columns.filter($scope.createFilterFor(query)) : [];
	      return results;
	    }

		$scope.createFilterFor = function(query)
		{
			var lowercaseQuery = angular.lowercase(query);
			return function filterFn(currentColumnName)
			{
				return currentColumnName.toLowerCase().indexOf(lowercaseQuery) >= 0;
			};
		}

		this.init();

		self.updateStatistics = 
			function()
			{
				$timeout(
					function()
					{
						$scope.summaryStatistics = {
							"Columns": session.dataSize.columns,
							"Rows": session.dataSize.rows
						};

						$scope.$digest();
					}, 0, false);
			}

		session.subscribeToMetadata({}, 
			function(dataSize, columns, columnInfo)
			{
				$scope.columns = columns;
				self.updateStatistics();
			});

		$document.ready(
			function()
			{	
				self.init();
			});
	}]);