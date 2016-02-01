angular.module('dcs.directives').directive('cleanSidebarMissingValues', ['session', function(session) {
	return {
		restrict: 'E',
		scope: 
			{
				'tableSelection': '='
			},
		templateUrl: "directives/clean.sidebar.missingValues.html",
		link: function(scope, element, attr) {
			var _this = this;

			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.columns.length == 1;
				if(scope.shouldShow && typeof session.dataTypes === 'object' )
					scope.shouldShowInterpolation = _this.interpolationAllowedDataTypes.indexOf(session.dataTypes[selection.columns[0]]) >= 0;

			}, true);

			_this.init = function()
			{
				_this.interpolationAllowedDataTypes = ['int64', 'float64', 'datetime64'];
				scope.missingValsInterpolationMethods = ['Linear', 'Spline', 'Polynomial', 'PCHIP'];
				scope.interpolationMethod = scope.missingValsInterpolationMethods[0];
				scope.splineOrder = 1;
				scope.polynomialOrder = 1;
			}

			_this.init();

			scope.requestFill =
				function(method)
				{
					session.fillDown(session.columns.indexOf(scope.tableSelection.columns[0]), session.columns.indexOf(scope.tableSelection.columns[scope.tableSelection.columns.length - 1]), method,
						function(success)
						{
							if(!success)
							{
								alert("fill with nearest value failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast("Successfully filled missing values.", 3000);
								scope.hideDialog();
							}
						});
					scope.showToast("Applying changes...");
					scope.showLoadingDialog();
				};

			scope.interpolate =
				function()
				{
					method = scope.interpolationMethod;
					if (method == 'Spline')
					{
						order = scope.splineOrder;
					}
					else
					{
						order = scope.polynomialOrder;
					}
					order = order == null ? 1 : order;
					session.interpolate(session.columns.indexOf(scope.tableSelection.columns[0]), method, order,
						function(success)
						{
							if(!success)
							{
								alert("interpolation failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast("Successfully interpolated values.", 3000);
								scope.hideDialog();
							}
						});
					scope.showToast("Interpolating...");
					scope.showLoadingDialog();
				};

			scope.fillWithCustomValue =
				function()
				{
					newValue = scope.customNewValue;
					session.fillWithCustomValue(session.columns.indexOf(scope.tableSelection.columns[0]), newValue,
						function(success)
						{
							if(!success)
							{
								alert("fill with custom value failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast("Successfully filled missing values.", 3000);
								scope.hideDialog();
							}
						});
					scope.showToast("Applying changes...");
					scope.showLoadingDialog();
				}

			scope.fillWithAverage =
				function(metric)
				{
					session.fillWithAverage(session.columns.indexOf(scope.tableSelection.columns[0]), metric,
						function(success)
						{
							if(!success)
							{
								alert("fill with average value failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast("Successfully filled missing values.", 3000);
								scope.hideDialog();
							}
						});
					scope.showToast("Applying changes...");
					scope.showLoadingDialog();
				}
		}
	}
}]);