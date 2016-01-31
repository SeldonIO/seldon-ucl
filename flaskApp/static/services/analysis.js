angular.module('dcs.services').service('analysis', ['$rootScope', 'session', 
	function($rootScope, session)
	{
		var subscribers = {};
		var pendingCallbacks = [];
		var analyses = {};
		var columns;
		var self = this;

		var subscriberCount = 0;

		// Returns function to unsubscribe (or null if failed to subscribe)
		this.subscribe = 
			function(listenColumn, callback)
			{
				if(typeof listenColumn === 'string' && columns.indexOf(listenColumn) >= 0)
				{
					if(typeof subscribers[listenColumn] === 'undefined')
					{
						subscribers[listenColumn] = {};
					}

					var id = subscriberCount++;
					subscribers[listenColumn][id] = callback;

					getAnalysisForColumn(listenColumn, true, 
						function(response)
						{
							if(typeof response === 'object')
								callback(response);
						});

					return 	function() 
							{
								delete subscribers[listenColumn][id];
							};
				}
				else
					return null;
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

		var deleteNonexistentColumnSubscribers = 
			function()
			{
				for(listenerColumn in subscribers)
					if(columns.indexOf(listenerColumn) < 0)
						delete registeredListeners[listenerColumn];
			};

		var getAnalysisForColumn = 
			function(column, useCache, callback)
			{
				if(columns.indexOf(column) >= 0)
				{
					if(useCache == false || !(column in analyses))
						session.analyze(column, 
							function(response)
							{
								if(response != null)
								{
									response["invalid"] = $rootScope.invalidValues[column].hasInvalidValues ? $rootScope.invalidValues[column].invalidIndices.length : 0;									
									callback(response);
								}
								else
									callback(null);
							});
					else
						callback(analyses[column]);
				}
				else
					callback(null);
			}

		var updateAndPublishAnalyses = 
			function(useCached)
			{
				Object.keys(subscribers).forEach(
					function(listenerColumn)
					{
						if(Object.keys(subscribers[listenerColumn]).length > 0)
							getAnalysisForColumn(listenerColumn, false,
								function(response)
								{
									if( typeof response === 'object' )
									{
										analyses[listenerColumn] = response;
										for(subscriberID in subscribers[listenerColumn])
											if(typeof subscribers[listenerColumn][subscriberID] === 'function')
												subscribers[listenerColumn][subscriberID](analyses[listenerColumn]);
									}
									else
										delete analyses[listenerColumn];
								});
					});
			};

		$rootScope.$watch('data',
			function(newVal, oldVal)
			{
				if( typeof newVal === 'object')
				{
					columns = getColumns(newVal);
					deleteNonexistentColumnSubscribers();
					updateAndPublishAnalyses();
				}
			}, true);
	}]);