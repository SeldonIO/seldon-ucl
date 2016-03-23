angular.module('dcs.directives').directive('cleanSidebarMissingValues', ['session', 'dialogs', function(session, dialogs) {
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
		templateUrl: "directives/clean.sidebar.missingValues.html",
		link: function(scope, element, attr) {
			scope.$watchCollection('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.type.indexOf("column") >= 0 && selection.columns.length == 1;
				if(scope.shouldShow)
					scope.shouldShowInterpolation = session.isNumericColumn(selection.columns[0]) || session.isDateColumn(selection.columns[0]);

			});

			element.init = function()
			{
				scope.missingValsInterpolationMethods = ['Linear', 'Spline', 'Polynomial', 'PCHIP'];
				scope.interpolationMethod = scope.missingValsInterpolationMethods[0];
				scope.splineOrder = 1;
				scope.polynomialOrder = 1;
			}

			element.init();

			scope.requestFill = function(method) {
				scope.$emit('showToast', "Filling missing values...");
				scope.$emit('showLoadingDialog');
				session.fillDown(session.columns.indexOf(scope.tableSelection.columns[0]), session.columns.indexOf(scope.tableSelection.columns[scope.tableSelection.columns.length - 1]), method,
					function(success, error, errorDescription) { 
						if(!success) {
							scope.$emit('showToast', "Fill missing values failed", 3000);
							dialogs.errorDialog("Fill missing values", error, errorDescription);
						} else {
							scope.$emit('showToast', "Successfully filled missing values. Loading changes...", 3000);
							scope.$emit('hideLoadingDialogAfterLoad');
						}
					});
			};

			scope.interpolate = function() {
				method = scope.interpolationMethod;
				if (method == 'Spline') {
					order = scope.splineOrder;
				} else {
					order = scope.polynomialOrder;
				}
				order = order == null ? 1 : order;

				scope.$emit('showToast', "Interpolating missing values...");
				scope.$emit('showLoadingDialog');
				session.interpolate(session.columns.indexOf(scope.tableSelection.columns[0]), method, order,
					function(success, error, errorDescription) { 
						if(!success) {
							scope.$emit('showToast', "Interpolate missing values failed", 3000);
							dialogs.errorDialog("Interpolate missing values", error, errorDescription);
						} else {
							scope.$emit('showToast', "Successfully interpolated missing values. Loading changes...", 3000);
							scope.$emit('hideLoadingDialogAfterLoad');
						}
					});
			};

			scope.fillWithCustomValue = function() {
				var newValue = scope.customNewValue;

				scope.$emit('showToast', "Filling missing values...");
				scope.$emit('showLoadingDialog');
				session.fillWithCustomValue(session.columns.indexOf(scope.tableSelection.columns[0]), newValue,
					function(success, error, errorDescription) { 
						if(!success) {
							scope.$emit('showToast', "Fill missing values failed", 3000);
							dialogs.errorDialog("Fill missing values", error, errorDescription);
						} else {
							scope.$emit('showToast', "Successfully filled missing values. Loading changes...", 3000);
							scope.$emit('hideLoadingDialogAfterLoad');
						}
					});
			}

			scope.fillWithAverage = function(metric) {
				scope.$emit('showToast', "Filling missing values with average...");
				scope.$emit('showLoadingDialog');
				session.fillWithAverage(session.columns.indexOf(scope.tableSelection.columns[0]), metric,
					function(success, error, errorDescription) { 
						if(!success) {
							scope.$emit('showToast', "Fill missing values with average failed", 3000);
							dialogs.errorDialog("Fill missing values with average", error, errorDescription);
						} else {
							scope.$emit('showToast', "Successfully filled missing values with average. Loading changes...", 3000);
							scope.$emit('hideLoadingDialogAfterLoad');
						}
					});
			}

			scope.deleteRowsWithNA = function() {
				scope.$emit('showToast', "Deleting rows with missing values...");
				scope.$emit('showLoadingDialog');
				session.deleteRowsWithNA(session.columns.indexOf(scope.tableSelection.columns[0]),
					function(success, error, errorDescription) { 
						if(!success) {
							scope.$emit('showToast', "Delete rows with missing values failed", 3000);
							dialogs.errorDialog("Delete rows with missing values", error, errorDescription);
						} else {
							scope.$emit('showToast', "Successfully deleted rows with missing values. Loading changes...", 3000);
							scope.$emit('hideLoadingDialogAfterLoad');
						}
					});
			}
		}
	}
}]);