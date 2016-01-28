angular.module('dcs.directives').directive('cleanSidebarEditColumn', ['$rootScope', 'session', function($rootScope, session) {
	return {
		restrict: 'E',
		scope: true,
		templateUrl: "directives/clean.sidebar.editColumn.html",
		link: function(scope, element, attr) {
			scope.$watch('selectedCells', function(newSelection, oldSelection)
			{
				scope.update();
			}, true);

			scope.update = function()
			{
				scope.shouldShow = typeof scope.selectedCells === 'object' ? scope.selectionIsColumn(scope.selectedCells) : false;
				if(scope.shouldShow)
				{
					scope.columnName = scope.columns[scope.selectedCells.columnStart];
					scope.reset();
				}
			}

			scope.init = function()
			{
				scope.allowedAlternativeDataTypesDictionary = {'int64': ['float64', 'str'], 'float64': ['int64', 'str'], 'object': ['datetime64', 'float64', 'int64']};
				scope.update();
			};

			scope.init();

			scope.save = 
				function()
				{
					if(scope.validNewName)
						scope.requestRenameColumn();
					if(scope.validNewDataType)
						scope.requestChangeColumnDataType();
				};

			scope.requestRenameColumn = 
				function()
				{
					console.log('renaming ' + scope.columnName + ' to ' + scope.newName);
					session.renameColumn(scope.columnName, scope.newName, 
						function(success)
						{
							if(!success)
								alert("renaming failed");

							scope.columnName = scope.newName;
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

			scope.reset = 
				function()
				{
					scope.columnDataType = $rootScope.dataTypes[scope.columnName];
					scope.allowedAlternativeDataTypes = scope.allowedAlternativeDataTypesDictionary[scope.columnDataType];
					scope.newName = "";
					scope.newDataType = "";
					scope.editColumnForm.$setPristine();
				};

			scope.$watch('columnName', 
				function(newVal, oldVal)
				{
					if(typeof newVal !== 'undefined' && typeof $rootScope.data !== 'undefined')
					{
						var index = scope.columns.indexOf(scope.columnName);
						scope.changeSelection({rowStart: 0 , rowEnd: scope.hot.getData().length - 1, columnStart: index, columnEnd: index});
						scope.reset();
					}
				});

			scope.$watch('newName', 
				function(newVal, oldVal)
				{
					scope.validNewName = typeof scope.newName !== 'undefined' && scope.newName.length > 0 && scope.newName != scope.columnName; 
					scope.canSave = scope.validNewName || scope.validNewDataType;
				});

			scope.$watch('newDataType',
				function(newVal, oldVal)
				{
					scope.validNewDataType = typeof scope.newDataType !== 'undefined' && scope.newDataType.length > 0 && scope.newDataType != scope.columnDataType;
					scope.canSave = scope.validNewName || scope.validNewDataType;
				});
		}
	}
}]);





