angular.module('dcs.directives').directive('cleanSidebarEditColumn', ['session', '$timeout', function(session, $timeout) {
	return {
		restrict: 'E',
		scope: 
			{
				'tableSelection': '=',
				'onColumnChange': '&',
				showToast: '&',
				showLoadingDialog: '&',
				hideToast: '&',
				hideDialog: '&'
			},
		templateUrl: "directives/clean.sidebar.editColumn.html",
		link: function(scope, element, attr) {
			var self = this;

			scope.$watch('tableSelection', function(selection, oldSelection)
			{
				scope.shouldShow = typeof selection === 'object' && selection.columns.length == 1;
				if( scope.shouldShow && selection.columns[0] != scope.columnName )
				{
					scope.columnName = selection.columns[0];
					scope.reset();
				}
			}, true);

			self.init = function()
				{
					self.allowedAlternativeDataTypesDictionary =
					   {'int64': ['float64', 'str'],
						'float64': ['int64', 'str'],
						'object': ['datetime64', 'float64', 'int64'],
						'datetime64': ['str']};
					self.unsubscribe = session.subscribeToMetadata({}, 
						function(dataSize, columns, columnInfo)
						{
							$timeout(
								function()
								{
									scope.columns = columns;
									scope.$digest();
								}, 0, false);
						});
				};

			scope.save = function()
				{
					if(scope.validNewDataType)
						scope.requestChangeColumnDataType();
					if(scope.validNewName)
						scope.requestRenameColumn();
					scope.reset();
				};

			scope.reset = 
				function()
				{
					scope.columnDataType = session.columnInfo[scope.columnName].dataType;
					scope.allowedAlternativeDataTypes = self.allowedAlternativeDataTypesDictionary[scope.columnDataType];
					scope.newName = "";
					scope.newDataType = "";
					scope.editColumnForm.$setPristine();
				};

			scope.requestRenameColumn = 
				function()
				{
					scope.showToast({message: "Renaming column..."});
					scope.showLoadingDialog();
					session.renameColumn(scope.columnName, scope.newName, 
						function(success)
						{
							scope.hideDialog();
							if(!success)
								scope.showToast({message: "Renaming column failed.", delay: 3000});
							else
								scope.showToast({message: "Successfully renamed column. Loading changes...", delay: 3000});

							scope.columnName = scope.newName;
						}); 
				}; 

			scope.requestChangeColumnDataType = 
				function()
				{
					var data = {};
					if(scope.newDataType == 'datetime64' && typeof scope.dateFormatString === 'string' && scope.dateFormatString.length > 0)
						data.dateFormat = scope.dateFormatString;

					scope.showToast({message: "Changing data type..."});
					scope.showLoadingDialog();
					session.changeColumnDataType(scope.columnName, scope.newDataType, data,
						function(success)
						{
							scope.hideDialog();
							if(!success)
								scope.showToast({message: "Changing data type failed.", delay: 3000});
							else
								scope.showToast({message: "Successfully changed data type. Loading changes...", delay: 3000});
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
					scope.validNewName = typeof newName !== 'undefined' && newName.length > 0 && newName != scope.columnName; 
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
				scope.showToast({message: "Deleting column..."});
				scope.showLoadingDialog();
				session.deleteColumns(scope.tableSelection.columns,
					function(success)
					{
						scope.hideDialog();
						if(!success)
							scope.showToast({message: "Deleting failed.", delay: 3000});
						else
							scope.showToast({message: "Successfully deleted column. Loading changes...", delay: 3000});
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