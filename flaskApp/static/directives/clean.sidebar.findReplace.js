angular.module('dcs.directives').directive('cleanSidebarFindReplace', ['session', function(session) {
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
		templateUrl: "directives/clean.sidebar.findReplace.html",
		link: function(scope, element, attr) {
			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.columns.length == 1;

			}, true);

			element.init = function()
			{
				scope.valuesToReplace = []
				scope.replacements = []
			}

			element.init();

			scope.addReplacement =
				function()
				{
					scope.valuesToReplace.push(scope.toReplace);
					scope.replacements.push(scope.replaceWith);
				}

			scope.singleReplace =
				function()
				{
					var tempValuesToReplace = scope.valuesToReplace;
					var tempReplacements = scope.replacements;
					scope.resetLists();
					scope.addReplacement();
					scope.findReplace();
					scope.valuesToReplace = tempValuesToReplace;
					scope.replacements = tempReplacements;
				}

			scope.resetForm =
				function()
				{
					scope.toReplace = "";
					scope.replaceWith = "";
				}

			scope.resetLists =
				function()
				{
					scope.valuesToReplace = []
					scope.replacements = []
				}

			scope.deleteReplacement =
				function(index)
				{
					scope.valuesToReplace.splice(index, 1);
					scope.replacements.splice(index, 1);
				}

			scope.findReplace =
				function()
				{
					session.findReplace(session.columns.indexOf(scope.tableSelection.columns[0]), scope.valuesToReplace, scope.replacements,
						function(success)
						{
							if(!success)
							{
								alert("find replace failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast({message: "Successfully replaced values.", delay: 3000});
								scope.hideDialog();
							}
						});
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
				}

		}
	}
}]);