angular.module('dcs.services').service('session', ['$rootScope', 'socketConnection', 
	function($rootScope, socketConnection)
	{
		var sessionID = null;

		var self = this;

		this.getSessionID =
			function()
			{
				return new String(sessionID);
			};

		this.initialize = 
			function(newSessionID, callback)
			{	
				socketConnection.initialize(newSessionID);
				self.fullJSON(
					function(success)
					{
						if(success && typeof successCallback === 'function')
						{
							sessionID = newSessionID;
							callback(true);
						}
						else if(!success && typeof errorCallback === 'function')
							callback(false);
					});
			};

		this.fullJSON = 
			function(callback)
			{
				socketConnection.request('fullJSON', {},
					function(response)
					{
						console.log(response["invalidValues"]);
						if(response["success"])
						{
							$rootScope.$apply(
								function()
								{	
									$rootScope.data = JSON.parse(response["data"]);
									$rootScope.dataTypes = response["dataTypes"];
									$rootScope.invalidValues = response["invalidValues"];
								});

							if(typeof callback === 'function')
								callback(true);
						}
						else
						{
							sockets.disconnect();
							sessionID = null;
							console.log("fullJSON failed -> BAD problem");
							if(typeof callback === 'function')
								callback(false);
						}
					});
			};

		this.renameColumn = 
			function(columnName, newName, callback)
			{
				socketConnection.request('renameColumn', {'column': columnName, 'newName': newName}, 
					function(response)
					{
						if(response["success"])
							self.fullJSON(
								function(success)
								{
									callback(success);
								});
						else
							callback(false);
					});
			};

		this.changeColumnDataType = 
			function(columnName, newDataType, options, callback)
			{
				data = {'column': columnName, 'newDataType': newDataType};
				for(var key in options)
					data[key] = options[key];
				
				socketConnection.request('changeColumnDataType', data,
					function(response)
					{
						if(response["success"])
							self.fullJSON(
								function(success)
								{
									callback(success);
								});
						else
							callback(false);
					});
			}

		this.deleteRows =
			function(rowFrom, rowTo, callback)
			{
				socketConnection.request('deleteRows', {'rowFrom': rowFrom, 'rowTo': rowTo},
					function(response)
					{
						if(response["success"])
							self.fullJSON(
								function(success)
								{
									callback(success);
								});
						else
							callback(false);
					});
			};

		this.fillDown =
			function(columnFrom, columnTo, method, callback)
			{
				socketConnection.request('fillDown', {'columnFrom': columnFrom, 'columnTo': columnTo, 'method': method},
					function(response)
					{
						if(response["success"])
							self.fullJSON(
								function(success)
								{
									callback(success);
								});
						else
							callback(false);
					});
			};

		this.interpolate =
			function(columnIndex, method, order, callback)
			{
				console.log("sending interpolation message: " + JSON.stringify({'columnIndex': columnIndex, 'method': method, 'order': order}));
				socketConnection.request('interpolate', {'columnIndex': columnIndex, 'method': method, 'order': order},
					function(response)
					{
						console.log("received interpolation reply");
						if(response["success"])
							self.fullJSON(
								function(success)
								{
									callback(success);
								});
						else
							callback(false);
					});
			};

		this.fillWithCustomValue =
			function(columnIndex, newValue, callback)
			{
				socketConnection.request('fillWithCustomValue', {'columnIndex': columnIndex, 'newValue': newValue},
					function(response)
					{
						console.log("received fill custom value reply");
						if(response["success"])
							self.fullJSON(
								function(success)
								{
									callback(success);
								});
						else
							callback(false);
					});
			}

		this.fillWithAverage =
			function(columnIndex, metric, callback)
			{
				socketConnection.request('fillWithAverage', {'columnIndex': columnIndex, 'metric': metric},
					function(response)
					{
						console.log("received fill average value reply");
						if(response["success"])
							self.fullJSON(
								function(success)
								{
									callback(success);
								});
						else
							callback(false);
					});
			}

	}]);