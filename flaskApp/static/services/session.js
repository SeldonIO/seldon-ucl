angular.module('dcs.services').service('session', ['socketConnection', '$rootScope',
	function(socketConnection, $rootScope)
	{
		var sessionID = null;

		var subscriberCount = 0;
		var metadataSubscribers = {};
		var dataSubscribers = {};
		var pendingRequestCallbacks = {};

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

					return function()
					{
						delete metadataSubscribers[id];
					}
				}
				else
					return null;
			};

		// Returns function to unsubscribe (or null if failed to subscribe)
		/*
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
			}; */

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
			function(data)
			{
				// update internal model
				self.metadata({}, 
					function(dataSize, columns, columnInfo, undoAvailable)
					{
						self.dataSize = dataSize;
						self.columns = columns;
						self.columnInfo = columnInfo;
						self.undoAvailable = undoAvailable;
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

				if("requestID" in data && typeof pendingRequestCallbacks[data["requestID"]] === 'function')
					pendingRequestCallbacks[data["requestID"]]();
			};

		this.initialize = 
			function(newSessionID, callback)
			{	
				socketConnection.initialize(newSessionID);
				socketConnection.registerListener('dataChanged', self.dataChanged);
				self.metadata({}, 
					function(dataSize, columns, columnInfo, undoAvailable)
					{
						if(dataSize != null && columns != null && columnInfo != null)
						{
							self.dataSize = dataSize;
							self.columns = columns;
							self.columnInfo = columnInfo;
							self.undoAvailable = undoAvailable;
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
							callback(response.dataSize, response.columns, response.columnInfo, response.undoAvailable);
						else
						{
							socketConnection.disconnect();
							sessionID = null;
							$rootScope.$emit('fatalError');
						}
					});
			};

		this.renameColumn = 
			function(columnName, newName, callback)
			{
				var requestID = socketConnection.request('renameColumn', {'column': columnName, 'newName': newName}, 
					function(response)
					{
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

		this.changeColumnDataType = 
			function(columnName, newDataType, options, callback)
			{
				data = {'column': columnName, 'newDataType': newDataType};
				for(var key in options)
					data[key] = options[key];
				
				var requestID = socketConnection.request('changeColumnDataType', data,
					function(response)
					{
						if(typeof callback === 'function' && !response["success"]) {
							callback(false, response["error"], response["errorDescription"]);
						}
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			}

		this.newCellValue =
			function(columnIndex, rowIndex, newValue, callback)
			{
				var requestID = socketConnection.request('newCellValue', {'columnIndex': columnIndex, 'rowIndex': rowIndex, 'newValue': newValue},
					function(response)
					{
						console.log("received newCellValue reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

		this.emptyStringToNan =
			function(columnIndex, callback)
			{
				var requestID = socketConnection.request('emptyStringToNan', {'columnIndex': columnIndex},
					function(response)
					{
						console.log("received emptyStringToNan reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

		this.deleteRows =
			function(rowIndices, callback)
			{
				var requestID = socketConnection.request('deleteRows', {'rowIndices': rowIndices},
					function(response)
					{
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

		this.deleteColumns =
			function(columnIndices, callback)
			{
				var requestID = socketConnection.request('deleteColumns', {'columnIndices': columnIndices},
					function(response)
					{
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

		this.fillDown =
			function(columnFrom, columnTo, method, callback)
			{
				var requestID = socketConnection.request('fillDown', {'columnFrom': columnFrom, 'columnTo': columnTo, 'method': method},
					function(response)
					{
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

		this.interpolate =
			function(columnIndex, method, order, callback)
			{
				var requestID = socketConnection.request('interpolate', {'columnIndex': columnIndex, 'method': method, 'order': order},
					function(response)
					{
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

		this.fillWithCustomValue =
			function(columnIndex, newValue, callback)
			{
				var requestID = socketConnection.request('fillWithCustomValue', {'columnIndex': columnIndex, 'newValue': newValue},
					function(response)
					{
						console.log("received fill custom value reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			}

		this.fillWithAverage =
			function(columnIndex, metric, callback)
			{
				var requestID = socketConnection.request('fillWithAverage', {'columnIndex': columnIndex, 'metric': metric},
					function(response)
					{
						console.log("received fill average value reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			}

		this.standardize =
			function(columnIndex, callback)
			{
				var requestID = socketConnection.request('standardize', {'columnIndex': columnIndex},
					function(response)
					{
						console.log("received standardize reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			}

		this.normalize =
			function(columnIndex, rangeFrom, rangeTo, callback)
			{
				var requestID = socketConnection.request('normalize', {'columnIndex': columnIndex, 'rangeFrom': rangeFrom, 'rangeTo': rangeTo},
					function(response)
					{
						console.log("received normalize reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			}

		this.deleteRowsWithNA =
			function(columnIndex, callback)
			{
				var requestID = socketConnection.request('deleteRowsWithNA', {'columnIndex': columnIndex},
					function(response)
					{
						console.log("received deleteRowsWithNA reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true)
					};
			}

		this.findReplace =
			function(columnIndex, toReplace, replaceWith, matchRegex, callback)
			{
				var requestID = socketConnection.request('findReplace', {'columnIndex': columnIndex, 'toReplace': toReplace, 'replaceWith': replaceWith, 'matchRegex': matchRegex},
					function(response)
					{
						console.log("received findReplace reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

		this.generateDummies =
			function(columnIndex, inplace, callback)
			{
				var requestID = socketConnection.request('generateDummies', {'columnIndex': columnIndex, 'inplace': inplace},
					function(response)
					{
						console.log("received generateDummies reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

		this.insertDuplicateColumn =
			function(columnIndex, callback)
			{
				var requestID = socketConnection.request('insertDuplicateColumn', {'columnIndex': columnIndex},
					function(response)
					{
						console.log("received insertDuplicateColumn reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

		this.splitColumn =
			function(columnIndex, delimiter, regex, callback)
			{
				var requestID = socketConnection.request('splitColumn', {'columnIndex': columnIndex, 'delimiter': delimiter, 'regex': regex},
					function(response)
					{
						console.log("received splitColumn reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

		this.combineColumns =
			function(columnsToCombine, seperator, newName, insertIndex, callback)
			{
				var requestID = socketConnection.request('combineColumns', {'columnsToCombine': columnsToCombine, 'seperator': seperator, 'newName': newName, 'insertIndex': insertIndex},
					function(response)
					{
						console.log("received combineColumns reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

			this.discretize =
			function(columnIndex, cutMode, numberOfBins, callback)
			{
				var requestID = socketConnection.request('discretize', {'columnIndex': columnIndex, 'cutMode': cutMode, 'numberOfBins': numberOfBins},
					function(response)
					{
						console.log("received discretize reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
			};

			// HIGHWAY TO THE DANGER ZONE
			this.executeCommand =
			function(command, callback)
			{
				var requestID = socketConnection.request('executeCommand', {'command': command},
					function(response)
					{
						console.log("received execution reply");
						if(typeof callback === 'function' && !response["success"])
							callback(false, response["error"], response["errorDescription"]);
					});

				pendingRequestCallbacks[requestID] = 
					function()
					{
						callback(true);
					};
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

		this.visualize = 
			function(options, callback)
			{
				socketConnection.request('visualize', options, 
					function(response)
					{
						if(typeof callback === 'function')
							callback(response);
					});
			}

		// Returns success Boolean
		this.undo = function(callback) {
			console.log("undoing");
			var requestID = socketConnection.request('undo', {}, function(response) {
				if(typeof callback === 'function' && !response.success)
					callback(false, response["error"], response["errorDescription"]);
			});

			pendingRequestCallbacks[requestID] = function() {
				if(typeof callback === 'function')
					callback(true);
			};
		};

		this.isNumericColumn = function(column) {
			var dataType = self.columnInfo[column].dataType;
			return dataType.indexOf("float") >= 0 || dataType.indexOf("int") >= 0 || dataType.indexOf("double") >= 0;
		}

		this.isDateColumn = function(column) {
			var dataType = self.columnInfo[column].dataType;
			return dataType.indexOf("datetime") >= 0;
		}

		this.columnToColumnIndex = 
			function(column)
			{
				var index = self.columns.indexOf(column);
				return index >= 0 ? index : undefined;
			}

		this.columnsToColumnIndices = 
			function(columns)
			{
				if(typeof columns === 'object' && 'length' in columns) {
					columnIndices = [];
					for(var index = 0 ; index < columns.length ; index++)
						columnIndices.push(self.columnToColumnIndex(columns[index]));
					return columnIndices;
				}
				else
					return undefined;
			}

	}]);