angular.module('dcs.directives').directive('cleanSidebarFeatureScaling', ['$rootScope', 'session', function($rootScope, session) {
	return {
		restrict: 'E',
		scope: 
			{
				tableSelection: '='
			},
		templateUrl: "directives/clean.sidebar.featureScaling.html",
		link: function(scope, element, attr) {
			var self = this;

			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				self.update();
			}, true);

			self.update = function()
			{
				if( typeof scope.tableSelection === 'object' && scope.tableSelection.columns.length == 1 && scope.tableSelection.rows.length > 1)
				{
					var dataType = session.dataTypes[scope.tableSelection.columns[0]];
					scope.shouldShow = (self.numericalDataTypes.indexOf(dataType) >= 0);
					self.reset();
				}
				else
					scope.shouldShow = false;
			}

			self.reset = function()
			{
				scope.featureScalingMethod = null;
				scope.featureScalingText = "Apply";
				scope.rangeFrom = 0;
				scope.rangeTo = 1;
			}

			self.init = function() 
			{
				self.unsubscribe = session.subscribeToData(
					function(data)
					{
						self.update();
					});

				self.numericalDataTypes = ['int64', 'float64', 'datetime64'];
				self.reset();
			}

			scope.updateButtonLabel = function()
			{
				if (scope.featureScalingMethod == "normalization")
					scope.featureScalingText = "Apply Min-Max Scaling";
				else if (scope.featureScalingMethod == "standardization")
					scope.featureScalingText = "Apply Standardization"
				else
					scope.featureScalingText = "Something's wrong..."
			}

			scope.featureScale = function()
			{
				if (scope.featureScalingMethod == 'normalization')
					self.normalize();
				else
					self.standardize();
			}

			self.standardize = function()
			{
				scope.showToast("Standardizing...");
				scope.showLoadingDialog();
				session.standardize(session.columns.indexOf(scope.tableSelection.columns[0]),
						function(success)
						{
							if(!success)
							{
								alert("standardize failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast("Successfully standardized data.", 3000);
								scope.hideDialog();
							}
						});
			}

			self.normalize = function()
			{
				scope.showToast("Normalizing...");
				scope.showLoadingDialog();
				session.normalize(session.columns.indexOf(scope.tableSelection.columns[0]), scope.rangeFrom, scope.rangeTo,
					function(success)
					{
						if(!success)
						{
							alert("normalize failed");
							scope.hideToast();
							scope.hideDialog();
						}
						else
						{
							scope.showToast("Successfully normalized data.", 3000);
							scope.hideDialog();
						}
					});
			}

			self.init();
		}
	}
}]);