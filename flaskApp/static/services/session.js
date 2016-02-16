angular.module('dcs.services').service('session', ['socketConnection', '$http',
	function(socketConnection, $http)
	{
		var sessionID = null;

		var subscriberCount = 0;
		var metadataSubscribers = {};
		var dataSubscribers = {};

		var self = this;

		// Returns function to unsubscribe (or null if failed to subscribe)
		this.subscribeToMetadata = 
			function(options, callback)
			{
				if(typeof options === 'object' && typeof callback === 'function')
				{
					var id = subscriberCount++;
					metadataSubscribers[id] = {callback: callback, options: options};

					self.metadata(options, callback);

					return 	(function(subscriberID)
							{
								return function()
								{
									delete metadataSubscribers[subscriberID];
								}
							})(id);
				}
				else
					return null;
			};

		// Returns function to unsubscribe (or null if failed to subscribe)
		this.subscribeToData = 
			function(options, callback)
			{
				if(typeof options === 'object' && typeof callback === 'function')
				{
					var id = subscriberCount++;
					dataSubscribers[id] = {callback: callback, options: options};

					self.data(options, callback);

					return 	(function(subscriberID)
							{
								return function()
								{
									delete dataSubscribers[subscriberID];
								}
							})(id);
				}
				else
					return null;
			};

		this.getData = 
			function(options, callback)
			{
				if(typeof options === 'object' && typeof callback === 'function')
					self.data(options, callback);
			};
 
		var getColumns = 
			function(data)
			{
				toReturn = [];
				if(typeof data === 'object' && data.length > 0)
					for(var key in data[0])
						toReturn.push(key);
				return toReturn;
			};

		this.getSessionID =
			function()
			{
				return new String(sessionID);
			};

		this.dataChanged = 
			function()
			{
				console.log("Data changed");

				// update internal model
				self.metadata({}, 
					function(dataSize, columns, columnInfo)
					{
						self.dataSize = dataSize;
						self.columns = columns;
						self.columnInfo = columnInfo;
					});

				// notify listeners
				for(var id in metadataSubscribers)
				{
					if(Object.keys(metadataSubscribers[id].options).length == 0)
						metadataSubscribers[id].callback(self.dataSize, self.columns, self.columnInfo);
					else
						self.metadata(metadataSubscribers[id].options, metadataSubscribers[id].callback);
				}

				for(var id in dataSubscribers)
					self.data(dataSubscribers[id].options, dataSubscribers[id].callback);
			};

		this.initialize = 
			function(newSessionID, callback)
			{	
				socketConnection.initialize(newSessionID);
				socketConnection.registerListener('dataChanged', self.dataChanged);
				self.metadata({}, 
					function(dataSize, columns, columnInfo)
					{
						if(dataSize != null && columns != null && columnInfo != null)
						{
							self.dataSize = dataSize;
							self.columns = columns;
							self.columnInfo = columnInfo;
							sessionID = newSessionID;
							if(typeof callback === 'function')
								callback(true);
						}
						else if(typeof callback === 'function')
							callback(false);
					});
			};

		this.data =
			function(options, callback)
			{
				socketConnection.request('data', options,
					function(response)
					{
						if(response["success"] && typeof callback === 'function')
							callback(JSON.parse(response.data).data, JSON.parse(response.data).index);
					});
			}

		this.metadata = 
			function(options, callback)
			{
				// console.log('requesting metadata');
				socketConnection.request('metadata', options,
					function(response)
					{
						if(response["success"] && typeof callback === 'function')
							callback(response.dataSize, response.columns, response.columnInfo);
						else
						{
							socketConnection.disconnect();
							sessionID = null;
							console.log("metadata failed -> BAD problem");
							callback(null, null, null);
						}
					});
			};

		this.renameColumn = 
			function(columnName, newName, callback)
			{
				socketConnection.request('renameColumn', {'column': columnName, 'newName': newName}, 
					function(response)
					{
						if(typeof callback === 'function')
							callback(response["success"]);
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
						if(typeof callback === 'function')
							callback(response["success"]);
					});
			}

		this.deleteRows =
			function(rowIndices, callback)
			{
				socketConnection.request('deleteRows', {'rowIndices': rowIndices},
					function(response)
					{
						if(typeof callback === 'function')
							callback(response["success"]);
					});
			};

		this.fillDown =
			function(columnFrom, columnTo, method, callback)
			{
				socketConnection.request('fillDown', {'columnFrom': columnFrom, 'columnTo': columnTo, 'method': method},
					function(response)
					{
						if(typeof callback === 'function')
							callback(response["success"]);
					});
			};

		this.interpolate =
			function(columnIndex, method, order, callback)
			{
				socketConnection.request('interpolate', {'columnIndex': columnIndex, 'method': method, 'order': order},
					function(response)
					{
						console.log("received interpolation reply: " + JSON.stringify(response));
						if(typeof callback === 'function')
							callback(response["success"]);
					});
			};

		this.fillWithCustomValue =
			function(columnIndex, newValue, callback)
			{
				socketConnection.request('fillWithCustomValue', {'columnIndex': columnIndex, 'newValue': newValue},
					function(response)
					{
						console.log("received fill custom value reply");
						if(typeof callback === 'function')
							callback(response["success"]);
					});
			}

		this.fillWithAverage =
			function(columnIndex, metric, callback)
			{
				socketConnection.request('fillWithAverage', {'columnIndex': columnIndex, 'metric': metric},
					function(response)
					{
						console.log("received fill average value reply");
						if(typeof callback === 'function')
							callback(response["success"]);
					});
			}

		this.standardize =
			function(columnIndex, callback)
			{
				socketConnection.request('standardize', {'columnIndex': columnIndex},
					function(response)
					{
						console.log("received standardize reply");
						if(typeof callback === 'function')
							callback(response["success"]);
					});
			}

		this.normalize =
			function(columnIndex, rangeFrom, rangeTo, callback)
			{
				socketConnection.request('normalize', {'columnIndex': columnIndex, 'rangeFrom': rangeFrom, 'rangeTo': rangeTo},
					function(response)
					{
						console.log("received normalize reply");
						if(typeof callback === 'function')
							callback(response["success"]);
					});
			}

		this.deleteRowsWithNA =
			function(columnIndex, callback)
			{
				socketConnection.request('deleteRowsWithNA', {'columnIndex': columnIndex},
					function(response)
					{
						console.log("received deleteRowsWithNA reply");
						if(typeof callback === 'function')
							callback(response["success"]);
					});
			}

		this.findReplace =
			function(columnIndex, toReplace, replaceWith, matchRegex, callback)
			{
				socketConnection.request('findReplace', {'columnIndex': columnIndex, 'toReplace': toReplace, 'replaceWith': replaceWith, 'matchRegex': matchRegex},
					function(response)
					{
						console.log("received findReplace reply");
						if(typeof callback === 'function')
							callback(response["success"]);
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
						if(typeof callback === 'function' && response["success"])
							callback(response["data"]);
					});
			}



		self.columnToColumnIndex = 
			function(column)
			{
				return self.columns.indexOf(column);
			}

		self.columnsToColumnIndices = 
			function(columns)
			{
				columnIndices = [];
				for(var index = 0 ; index < columns.length ; index++)
					columnIndices.push(self.columnToColumnIndex(columns[index]));
				return columnIndices;
			}

	}]);