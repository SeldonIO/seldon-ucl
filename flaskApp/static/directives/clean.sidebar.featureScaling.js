angular.module('dcs.directives').directive('cleanSidebarFeatureScaling', ['session', 'dialogs', function(session, dialogs) {
	return {
		restrict: 'E',
		scope: 
			{
				tableSelection: '='
			},
		templateUrl: "directives/clean.sidebar.featureScaling.html",
		link: function(scope, element, attr) {
			var self = element;

			scope.$watchCollection('tableSelection', function(selection, oldSelection)
			{
				self.update();
			});

			self.update = function()
			{
				if( typeof scope.tableSelection === 'object' && scope.tableSelection.type.indexOf("column") >= 0 && scope.tableSelection.columns.length == 1 && scope.tableSelection.columns[0] in session.columnInfo )
				{
					scope.shouldShow = session.isNumericColumn(scope.tableSelection.columns[0]) || session.isDateColumn(scope.tableSelection.columns[0]);
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

			self.standardize = function() {
				scope.$emit('showToast', "Standardizing column...");
				scope.$emit('showLoadingDialog');
				session.standardize(session.columns.indexOf(scope.tableSelection.columns[0]),
					function(success, error, errorDescription) { 
						if(!success) {
							scope.$emit('showToast', "Standardize column failed", 3000);
							dialogs.errorDialog("Standardize column", error, errorDescription);
						} else {
							scope.$emit('showToast', "Successfully standardized column. Loading changes...", 3000);
							scope.$emit('hideLoadingDialogAfterLoad');
						}
					});
			}

			self.normalize = function() {
				scope.$emit('showToast', "Normalizing column...");
				scope.$emit('showLoadingDialog');
				session.normalize(session.columns.indexOf(scope.tableSelection.columns[0]), scope.rangeFrom, scope.rangeTo,
					function(success, error, errorDescription) { 
						if(!success) {
							scope.$emit('showToast', "Normalize column failed", 3000);
							dialogs.errorDialog("Normalize column", error, errorDescription);
						} else {
							scope.$emit('showToast', "Successfully normalized column. Loading changes...", 3000);
							scope.$emit('hideLoadingDialogAfterLoad');
						}
					});
			}
		}
	}
}]);