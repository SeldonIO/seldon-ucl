angular.module('dcs.services').service('analysis', ['$rootScope', 'session', 
	function($rootScope, session)
	{
		var subscribers = {};
		var analyses = {};
		var self = this;

		var subscriberCount = 0;

		// Returns function to unsubscribe (or null if failed to subscribe)
		this.subscribe = 
			function(listenColumn, callback)
			{
				if((typeof listenColumn === 'string' && session.columns.indexOf(listenColumn) >= 0) || typeof session.columns !== 'object')
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

		var deleteNonexistentColumnSubscribers = 
			function()
			{
				for(listenerColumn in subscribers)
					if(session.columns.indexOf(listenerColumn) < 0)
						delete subscribers[listenerColumn];
			};

		var getAnalysisForColumn = 
			function(column, useCache, callback)
			{
				if(typeof session.columns === 'object' && session.columns.indexOf(column) >= 0)
				{
					if(useCache == false || !(column in analyses))
						session.analyze(column, 
							function(response)
							{
								if(response != null)
								{
									response["invalid"] = session.invalidValues[column].hasInvalidValues ? session.invalidValues[column].invalidIndices.length : 0;									
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

		session.subscribeToData(
			function(data)
			{
				deleteNonexistentColumnSubscribers();
				updateAndPublishAnalyses();
			});
	}]);