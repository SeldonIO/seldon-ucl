angular.module('dcs.services').service('session', ['socketConnection', '$http',
	function(socketConnection, $http)
	{
		var sessionID = null;

		var subscriberCount = 0;
		var subscribers = {};

		var self = this;

		// Returns function to unsubscribe (or null if failed to subscribe)
		this.subscribeToData = 
			function(callback)
			{
				var id = subscriberCount++;

				subscribers[id] = callback;

				if(typeof self.data === 'object')
				{
					callback({ data: self.data, dataTypes: self.dataTypes, columns: self.columns, invalidValues: self.invalidValues});
				}

				return 	(function(subscriberID)
						{
							return function()
							{
								delete subscribers[subscriberID];
							}
						})(id);
			};

		var getColumns = 
			function(data)
			{
				toReturn = [];
				if(typeof data === 'object' && data.length > 0)
					for(var key in data[0])
						toReturn.push(key);
				return toReturn;
			}

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
						if(success && typeof callback === 'function')
						{
							sessionID = newSessionID;
							callback(true);
						}
						else if(!success && typeof callback === 'function')
							callback(false);
					});
			};

		this.fullJSON = 
			function(callback)
			{
				// console.log('requesting fullJSON');
				socketConnection.request('fullJSON', {},
					function(response)
					{
						if(response["success"])
						{
							//self.data = JSON.parse(response["data"]);
							self.data = JSON.parse(response["data"]);
							self.dataTypes = response["dataTypes"];
							self.columns = getColumns(self.data);
							self.invalidValues = response["invalidValues"];
							console.log(self.dataTypes);
							for(var id in subscribers)
								if(typeof subscribers[id] === 'function')
									subscribers[id]({data: self.data, dataTypes: self.dataTypes, columns: self.columns, invalidValues: self.invalidValues});

							if(typeof callback === 'function')
								callback(true);
						}
						else
						{
							socketConnection.disconnect();
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
				
				console.log(JSON.stringify(data));
				
				socketConnection.request('changeColumnDataType', data,
					function(response)
					{
						console.log(JSON.stringify(response));
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
			function(rowIndices, callback)
			{
				socketConnection.request('deleteRows', {'rowIndices': rowIndices},
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
						console.log("received interpolation reply: " + JSON.stringify(response));
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

		this.standardize =
			function(columnIndex, callback)
			{
				socketConnection.request('standardize', {'columnIndex': columnIndex},
					function(response)
					{
						console.log("received standardize reply");
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

		this.normalize =
			function(columnIndex, rangeFrom, rangeTo, callback)
			{
				socketConnection.request('normalize', {'columnIndex': columnIndex, 'rangeFrom': rangeFrom, 'rangeTo': rangeTo},
					function(response)
					{
						console.log("received normalize reply");
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

		this.deleteRowsWithNA =
			function(columnIndex, callback)
			{
				socketConnection.request('deleteRowsWithNA', {'columnIndex': columnIndex},
					function(response)
					{
						console.log("received deleteRowsWithNA reply");
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

		// Returns object on success, null on failure
		this.analyze = 
			function(column, callback)
			{
				socketConnection.request('analyze', {'column': column},
					function(response)
					{
						// console.log('received analyze reply');
						if(response["success"])
							callback(response["data"]);
						else
							callback(null);
					});
			}

	}]);