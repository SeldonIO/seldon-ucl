angular.module('dcs.directives').directive('cleanSidebarColumnOperations', ['session', 'dialogs', function(session, dialogs) {
	return {
		restrict: 'E',
		scope: 
			{
				tableSelection: '='
			},
		templateUrl: "directives/clean.sidebar.columnOperations.html",
		link: function(scope, element, attr) {
			scope.$watchCollection('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.type.indexOf("column") >= 0 && selection.columns.length == 1;
				if(scope.shouldShow)
					scope.shouldShowSplitColumn = !session.isNumericColumn(scope.tableSelection.columns[0]);
			});

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
					scope.$emit('showToast', "Duplicating column...");
					scope.$emit('showLoadingDialog');
					session.insertDuplicateColumn(session.columns.indexOf(scope.tableSelection.columns[0]),
						function(success, error, errorDescription) {
							if(!success) {
								scope.$emit('showToast', "Duplicate column failed", 3000);
								dialogs.errorDialog("Duplicate column", error, errorDescription);
							} else {
								scope.$emit('showToast', "Successfully duplicated column. Loading changes...", 3000);
								scope.$emit('hideLoadingDialogAfterLoad');
							}
						});
				}

			scope.splitColumn =
				function()
				{
					scope.$emit('showToast', "Splitting column...");
					scope.$emit('showLoadingDialog');
					session.splitColumn(session.columns.indexOf(scope.tableSelection.columns[0]), scope.delimiter, scope.regex == undefined ? false : scope.regex,
						function(success, error, errorDescription) {
							if(!success) {
								scope.$emit('showToast', "Split column failed", 3000);
								dialogs.errorDialog("Split column", error, errorDescription);
							} else {
								scope.$emit('showToast', "Successfully split column. Loading changes...", 3000);
								scope.$emit('hideLoadingDialogAfterLoad');
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
					/*var revisedColumns = [];
					for (var i = 0; i < scope.columnsToCombine.length; i++) {
						if ($.inArray(scope.columnsToCombine[i], session.columns) > -1) {
							revisedColumns.push(scope.columnsToCombine[i]);
						}
					}*/
					
					scope.$emit('showToast', "Combining columns...");
					scope.$emit('showLoadingDialog');
					session.combineColumns(scope.columnsToCombine, scope.seperator == undefined ? "" : scope.seperator, scope.newName, session.columns.indexOf(scope.tableSelection.columns[0]),
						function(success, error, errorDescription)
						{
							if(!success) {
								scope.$emit('showToast', "Combine columns failed", 3000);
								dialogs.errorDialog("Combine columns", error, errorDescription);
							} else {
								scope.$emit('showToast', "Successfully combined column. Loading changes...", 3000);
								scope.$emit('hideLoadingDialogAfterLoad');
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