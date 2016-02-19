angular.module('dcs.directives').directive('cleanSidebarFeatureScaling', ['session', function(session) {
	return {
		restrict: 'E',
		scope: 
			{
				tableSelection: '=',
				showToast: '&',
				showLoadingDialog: '&',
				hideToast: '&',
				hideDialog: '&'
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
				if( typeof scope.tableSelection === 'object' && scope.tableSelection.columns.length == 1 && scope.tableSelection.rows.length > 1 && scope.tableSelection.columns[0] in session.columnInfo)
				{
					var dataType = session.columnInfo[scope.tableSelection.columns[0]].dataType;
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
				self.unsubscribe = session.subscribeToMetadata({}, self.update);
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
				scope.showToast({message: "Standardizing..."});
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
								scope.showToast({message: "Successfully standardized data. Loading changes...", delay: 3000});
								scope.hideDialog();
							}
						});
			}

			self.normalize = function()
			{
				scope.showToast({message: "Normalizing..."});
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
							scope.showToast({message: "Successfully normalized data. Loading changes...", delay: 3000});
							scope.hideDialog();
						}
					});
			}

			self.init();
		}
	}
}]);