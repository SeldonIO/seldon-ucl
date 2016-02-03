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
					self.allowedAlternativeDataTypesDictionary = {'int64': ['float64', 'str'], 'float64': ['int64', 'str'], 'object': ['datetime64', 'float64', 'int64']};
					self.unsubscribe = session.subscribeToData(
						function(data)
						{
							$timeout(function()
							{
								scope.columns = data.columns;
								scope.$digest();
							}, 0, false);
						});
				};

			scope.save = function()
				{
					if(scope.validNewName)
						scope.requestRenameColumn();
					if(scope.validNewDataType)
						scope.requestChangeColumnDataType();
				};

			scope.reset = 
				function()
				{
					scope.columnDataType = session.dataTypes[scope.columnName];
					scope.allowedAlternativeDataTypes = self.allowedAlternativeDataTypesDictionary[scope.columnDataType];
					scope.newName = "";
					scope.newDataType = "";
					scope.editColumnForm.$setPristine();
				};

			scope.requestRenameColumn = 
				function()
				{
					session.renameColumn(scope.columnName, scope.newName, 
						function(success)
						{
							if(!success)
								alert("renaming failed");

							scope.columnName = scope.newName;
							scope.reset();
						}); 
				}; 

			scope.requestChangeColumnDataType = 
				function()
				{
					session.changeColumnDataType(scope.columnName, scope.newDataType, {},
						function(success)
						{
							if(!success)
								alert("changing column type failed");

							scope.reset();
						}) 
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
					scope.validNewDataType = typeof newDataType !== 'undefined' && newDataType.length > 0 && scope.allowedAlternativeDataTypes[scope.columnDataType].indexOf(newDataType) >= 0;
					scope.canSave = scope.validNewName || scope.validNewDataType;
				};

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