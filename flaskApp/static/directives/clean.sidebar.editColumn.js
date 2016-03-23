angular.module('dcs.directives').directive('cleanSidebarEditColumn', ['session', '$timeout', 'dialogs', function(session, $timeout, dialogs) {
	return {
		restrict: 'E',
		scope: 
			{
				'tableSelection': '=',
				'onColumnChange': '&'
			},
		templateUrl: "directives/clean.sidebar.editColumn.html",
		link: function(scope, element, attr) {
			var self = element;

			scope.$watchCollection('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.type.indexOf("column") >= 0;
				if( scope.shouldShow )
				{
					scope.singleColumn = selection.columns.length == 1;
					scope.text = selection.columns.length == 1 ? "Column" : "Columns";

					if(selection.columns[0] != scope.columnName) {
						scope.columnName = selection.columns[0];
						scope.reset();
					} else {
						self.update();
					}
				}
			});

			self.init = function()
				{
					self.unsubscribe = session.subscribeToMetadata({}, 
						function(dataSize, columns, columnInfo)
						{
							$timeout(
								function()
								{
									scope.columns = columns;
									scope.userSetNewName(scope.newName);
									scope.$digest();
								}, 0, false);
						});
				};

			scope.save = function()
				{
					if(scope.validNewDataType && scope.validNewName) {
						scope.requestChangeColumnDataType(function(success) {
							if(success) {
								scope.requestRenameColumn();
								scope.reset();
							}
						});
					} else {
						if(scope.validNewName)
							scope.requestRenameColumn();
						if(scope.validNewDataType)
							scope.requestChangeColumnDataType();
						scope.reset();
					}
				}

			self.allowedAlternativeDataTypeForDataType = function(column) {
				var dictionary =
					   {'int': ['float64', 'str'],
						'float': ['int64', 'str'],
						'object': ['datetime64', 'float64', 'int64'],
						'datetime': ['str']};
				var dataType = session.columnInfo[column].dataType;

				var types = Object.keys(dictionary);
				for(var index = 0 ; index < types.length ; index++) {
					if(dataType.indexOf(types[index]) >= 0) {
						var allowedDataTypes = dictionary[types[index]];
						if(allowedDataTypes.indexOf('int64') >= 0 && session.columnInfo[column].invalidValues > 0) {
							// can only convert to int if there are no invalid values
							allowedDataTypes.splice(allowedDataTypes.indexOf('int64'), 1);
						} 

						return allowedDataTypes;
					}
				}
			};

			self.update = function() {
				scope.columnDataType = session.columnInfo[scope.columnName].dataType;
				scope.allowedAlternativeDataTypes = self.allowedAlternativeDataTypeForDataType(scope.columnName);
			}

			scope.reset = 
				function()
				{
					self.update();
					scope.newName = "";
					scope.newDataType = "";
					scope.validNewName = scope.validNewDataType = scope.canSave = false;
					scope.editColumnForm.$setPristine();
				};

			scope.requestRenameColumn = 
				function()
				{
					scope.$emit('showToast', "Renaming column...");
					scope.$emit('showLoadingDialog');
					session.renameColumn(scope.columnName, scope.newName, 
						function(success, error, errorDescription)
						{
							if(!success) {
								scope.$emit('showToast', 'Rename column operation failed', 3000);
								dialogs.errorDialog("Rename column", error, errorDescription);
							}
							else {
								scope.$emit('hideLoadingDialogAfterLoad');
								scope.$emit('showToast', 'Successfully renamed column. Loading changes...', 3000);
							}
						}); 
				}; 

			scope.requestChangeColumnDataType = 
				function(callback)
				{
					var data = {};
					if(scope.newDataType == 'datetime64' && typeof scope.dateFormatString === 'string' && scope.dateFormatString.length > 0)
						data.dateFormat = scope.dateFormatString;

					scope.$emit('showToast', "Changing data type...");
					scope.$emit('showLoadingDialog');
					session.changeColumnDataType(scope.columnName, scope.newDataType, data,
						function(success, error, errorDescription)
						{
							if(!success) {
								scope.$emit('showToast', 'Change column operation failed', 3000);
								dialogs.errorDialog("Change column data type", error, errorDescription);
							} else {
								scope.$emit('hideLoadingDialogAfterLoad');
								scope.$emit('showToast', "Successfully changed data type. Loading changes...", 3000);
							}

							if(typeof callback === 'function')
								callback(success);
						});
				};

			scope.userChangedColumn = 
				function(columnName)
				{
					if( typeof session.columns === 'object' && session.columns.indexOf(columnName) >= 0 )
					{
						scope.onColumnChange({column: columnName, digest: false});
						console.log("calling reset");
						scope.reset();
					}
				};

			scope.userSetNewName =
				function(newName)
				{
					scope.validNewName = typeof newName !== 'undefined' && newName.length > 0 && session.columns.indexOf(newName) < 0;
					scope.canSave = scope.validNewName || scope.validNewDataType;
				};

			scope.userSetNewDataType =
				function(newDataType)
				{
					scope.validNewDataType = scope.allowedAlternativeDataTypes.indexOf(newDataType) >= 0;
					scope.canSave = scope.validNewName || scope.validNewDataType;
				};

			scope.deleteSelectedColumns = function()
			{
				scope.$emit('showToast', scope.tableSelection.columns.length > 1 ? "Deleting columns..." : "Deleting column");
				scope.$emit('showLoadingDialog');
				session.deleteColumns(scope.tableSelection.columns,
					function(success, error, errorDescription)
					{
						scope.$emit('selectFirstCellOfCurrentSelection');
						if(!success) {
							scope.$emit('showToast', "Delete column(s) failed", 3000);
							dialogs.errorDialog("Delete column(s)", error, errorDescription);
						} else {
							scope.$emit('hideLoadingDialogAfterLoad');
							scope.$emit('showToast', "Successfully deleted column. Loading changes...", 3000);
						}
					});
			}

			scope.emptyStringToNan =
				function()
				{
					scope.$emit('showToast', "Converting empty strings to 'null'...");
					scope.$emit('showLoadingDialog');
					session.emptyStringToNan(session.columns.indexOf(scope.tableSelection.columns[0]),
						function(success, error, errorDescription)
						{
							if(!success)
							{
								scope.$emit('showToast', "Convert empty strings to 'null' failed", 3000);
								dialogs.errorDialog("Convert empty strings to 'null'", error, errorDescription);
							} else {
								scope.$emit('hideLoadingDialogAfterLoad');
								scope.$emit('showToast', "Operation successful. Loading changes...", 3000);
							}
						});
				}

			scope.$on('destroy', 
				function()
				{
					if( typeof self.unsubscribe === 'function' )
						self.unsubscribe();
				});

			self.init();
		}
	}
}]);