angular.module('dcs.directives').directive('cleanSidebarColumnOperations', ['session', function(session) {
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
		templateUrl: "directives/clean.sidebar.columnOperations.html",
		link: function(scope, element, attr) {
			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.type.indexOf("column") >= 0;
			}, true);

			element.init = function()
			{
				scope.columnsToCombine = [];
				scope.disableCombine = scope.columnsToCombine.length < 2 || scope.newName == null || scope.newName == '' || $.inArray(scope.newName, session.columns) > -1;
			}

			element.init();

			scope.updateDisabled = 
				function()
				{
					scope.disableCombine = scope.columnsToCombine.length < 2 || scope.newName == null || scope.newName == '' || $.inArray(scope.newName, session.columns) > -1;
				}

			scope.insertDuplicateColumn =
				function()
				{
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
					session.insertDuplicateColumn(session.columns.indexOf(scope.tableSelection.columns[0]),
						function(success)
						{
							if(!success)
							{
								alert("Duplicate column failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast({message: "Successfully duplicated column. Loading changes...", delay: 3000});
								scope.hideDialog();
							}
						});
				}

			scope.splitColumn =
				function()
				{
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
					session.splitColumn(session.columns.indexOf(scope.tableSelection.columns[0]), scope.delimiter, scope.regex == undefined ? false : scope.regex,
						function(success)
						{
							if(!success)
							{
								alert("Split column failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast({message: "Successfully splitted column. Loading changes...", delay: 3000});
								scope.hideDialog();
							}
						});
				}

			scope.combineColumns =
				function()
				{
					if ($.inArray(scope.newName, session.columns) > -1) {
						alert("Column header already taken.");
						scope.newName = null;
						return;
					}
					for (var i = 0; i < scope.columnsToCombine.length; i++) {
						if ($.inArray(scope.columnsToCombine[i], session.columns) < 0) {
							alert("Some selected columns don't exist anymore.");
							scope.columnsToCombine = [];
							return;
						}
					}
					if (scope.columnsToCombine.length < 2) {
						alert("Two or more columns required to perform combination.");
						return;
					}
					//if (scope.newName == null || scope.columnsToCombine.length < 2)
					scope.showToast({message: "Applying changes..."});
					scope.showLoadingDialog();
					/*var revisedColumns = [];
					for (var i = 0; i < scope.columnsToCombine.length; i++) {
						if ($.inArray(scope.columnsToCombine[i], session.columns) > -1) {
							revisedColumns.push(scope.columnsToCombine[i]);
						}
					}*/
					session.combineColumns(scope.columnsToCombine, scope.seperator == undefined ? "" : scope.seperator, scope.newName, session.columns.indexOf(scope.tableSelection.columns[0]),
						function(success)
						{
							if(!success)
							{
								alert("Combine columns failed");
								scope.hideToast();
								scope.hideDialog();
							}
							else
							{
								scope.showToast({message: "Successfully combined columns. Loading changes...", delay: 3000});
								scope.hideDialog();
							}
						});
					scope.newName = null;
				}

			scope.addColumn =
				function()
				{
					scope.columnsToCombine.push(scope.selectedColumn);
					scope.searchQuery = "";
					scope.selectedColumn = null;
					scope.updateDisabled();
				}

			scope.moveUp =
				function(index)
				{
					if (index > 0) {
						var tempToCombine = scope.columnsToCombine[index-1];
						scope.columnsToCombine[index-1] = scope.columnsToCombine[index];
						scope.columnsToCombine[index] = tempToCombine;
					}
				}

			scope.moveDown =
				function(index)
				{
					if (index < scope.columnsToCombine.length-1 ) {
						var tempToCombine = scope.columnsToCombine[index+1];
						scope.columnsToCombine[index+1] = scope.columnsToCombine[index];
						scope.columnsToCombine[index] = tempToCombine;
					}
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
					scope.columnsToCombine = []
				}

			scope.deleteReplacement =
				function(index)
				{
					scope.columnsToCombine.splice(index, 1);
					scope.updateDisabled();
				}

			scope.querySearch = function(query)
			{
	      var results = query ? session.columns.filter(scope.createFilterFor(query)) : [];
	      return results;
	    }

			scope.createFilterFor = function(query)
			{
				var lowercaseQuery = angular.lowercase(query);
				return function filterFn(currentColumnName)
				{
					return currentColumnName.toLowerCase().indexOf(lowercaseQuery) >= 0;
				};
			}

		}
	}
}]);