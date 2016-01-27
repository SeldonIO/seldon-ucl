angular.module('dcs.directives').directive('cleanSidebarFeatureScaling', ['$rootScope', 'session', function($rootScope, session) {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: "directives/clean.sidebar.featureScaling.html",
		link: function(scope, element, attr) {
			scope.$watch('selectedCells', function(newSelection, oldSelection)
			{
				scope.update();
			}, true);

			$rootScope.$watch('dataTypes', function(newVal, oldVal)
			{
				scope.update()
			}, true);

			scope.update = function()
			{
				if(typeof scope.selectedCells === 'object')
				{
					var dataType = $rootScope.dataTypes[scope.columns[scope.selectedCells.columnStart]];
					scope.shouldShow = (scope.numericalDataTypes.indexOf(dataType) >= 0) && (typeof scope.selectedCells === 'object' ? scope.selectionIsColumn(scope.selectedCells) : false);
				}
			}

			scope.init = function() 
			{
				scope.featureScalingMethod = null;
				scope.featureScalingText = "Apply";
				scope.rangeFrom = 0;
				scope.rangeTo = 1;
				scope.numericalDataTypes = ['int64', 'float64', 'datetime64'];
				scope.update();
			}

			scope.updateButtonLabel = function()
			{
				if (scope.featureScalingMethod == "normalization")
				{
					scope.featureScalingText = "Normalize";
				}
				else if (scope.featureScalingMethod == "standardization")
				{
					scope.featureScalingText = "Standardize"
				}
				else
				{
					scope.featureScalingText = "Something's wrong..."
				}
			}

			scope.featureScale = function()
			{
				if (scope.featureScalingMethod == 'normalization')
				{
					scope.normalize();
				}
				else
				{
					scope.standardize();
				}
			}

			scope.standardize = function()
			{
				session.standardize(scope.selectedCells.columnStart,
						function(success)
						{
							if(!success)
							{
								alert("standardize failed");
								scope.hideToast();
								scope.closeDialog();
							}
							else
							{
								scope.showToast("Successfully standardized data.", 3000);
								scope.closeDialog();
							}
						});
					scope.showToast("Standardizing...");
					scope.showLoadingDialog();
			}

			scope.normalize = function()
			{
				session.normalize(scope.selectedCells.columnStart, scope.rangeFrom, scope.rangeTo,
						function(success)
						{
							if(!success)
							{
								alert("normalize failed");
								scope.hideToast();
								scope.closeDialog();
							}
							else
							{
								scope.showToast("Successfully normalized data.", 3000);
								scope.closeDialog();
							}
						});
					scope.showToast("Normalizing...");
					scope.showLoadingDialog();
			}

	    scope.$watch('invalidValuesFilterColumns', 
	    	function(newVal, oldVal)
	    	{
	    		scope.setInvalidValuesFilterColumns(newVal);
	    	}, true);

			scope.init();
		}
	}
}]);