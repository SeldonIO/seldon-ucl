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
				scope.shouldShow = typeof selection === 'object' && selection.columns.length == 1 && scope.tableSelection.rows.length > 1;

			}, true);

			element.init = function()
			{
				scope.valuesToReplace = [];
				scope.replacements = [];
				scope.matchRegex = false;
			}

			element.init();

			scope.addReplacement =
				function()
				{
					scope.batchExp = true;
					scope.valuesToReplace.push((typeof scope.toReplace === 'undefined') ? "" : scope.toReplace);
					scope.replacements.push((typeof scope.replaceWith === 'undefined') ? "" : scope.replaceWith);
				}

			scope.moveUp =
				function(index)
				{
					if (index > 0) {
						var tempToReplace = scope.valuesToReplace[index-1];
						var tempReplaceWith = scope.replacements[index-1];
						scope.valuesToReplace[index-1] = scope.valuesToReplace[index];
						scope.replacements[index-1] = scope.replacements[index];
						scope.valuesToReplace[index] = tempToReplace;
						scope.replacements[index] = tempReplaceWith;
					}
				}

			scope.moveDown =
				function(index)
				{
					if (index < scope.replacements.length-1 ) {
						var tempToReplace = scope.valuesToReplace[index+1];
						var tempReplaceWith = scope.replacements[index+1];
						scope.valuesToReplace[index+1] = scope.valuesToReplace[index];
						scope.replacements[index+1] = scope.replacements[index];
						scope.valuesToReplace[index] = tempToReplace;
						scope.replacements[index] = tempReplaceWith;
					}
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
					scope.editExp = false;
					scope.valuesToReplace = []
					scope.replacements = []
				}

			scope.deleteReplacement =
				function(index)
				{
					scope.valuesToReplace.splice(index, 1);
					scope.replacements.splice(index, 1);
					if (scope.replacements.length == 0) scope.editExp = false;
				}

			scope.findReplace =
				function()
				{
					session.findReplace(session.columns.indexOf(scope.tableSelection.columns[0]), scope.valuesToReplace, scope.replacements, scope.matchRegex,
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