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
				if( typeof scope.tableSelection === 'object' && selection.type.indexOf("column") >= 0 && scope.tableSelection.columns[0] in session.columnInfo )
				{
					var dataType = session.columnInfo[scope.tableSelection.columns[0]].dataType;
					// do not show card for datetime data type
					scope.shouldShow = dataType.indexOf("datetime") < 0;
					self.reset();
				}
				else
					scope.shouldShow = false;

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

			scope.importReplacements =
				function()
				{
					var arr = [];
					var jsonString = prompt("Enter JSON string","");
					if (jsonString != null) {
						try {
							arr = JSON.parse(jsonString);
						} catch(e) {
							alert("JSON parsing failed.");
							return
						}
						if ((arr[0].constructor === Array) && (arr[1].constructor === Array) && (arr[0].length == arr[1].length)) {
							scope.valuesToReplace = arr[0];
							scope.replacements = arr[1];
						} else {
							alert("Length of arrays do not match.");
						}
					}
				}

			scope.exportReplacements =
				function()
				{
					var arr = [scope.valuesToReplace, scope.replacements];
					var jsonString = JSON.stringify(arr);
					prompt("Copy and save this JSON string", jsonString);
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
								scope.showToast({message: "Successfully replaced values. Loading changes...", delay: 3000});
								scope.hideDialog();
							}
						});
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
				}

		}
	}
}]);