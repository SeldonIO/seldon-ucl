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
							if(typeof response === 'object' && listenColumn in subscribers && id in subscribers[listenColumn])
								callback(response);
						});

					return function()
						{
							if(listenColumn in subscribers && subscriberID in subscribers[listenColumn])
								delete subscribers[listenColumn][subscriberID];
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

		var Statistic =
			function(metric, value, detail)
			{
				this.metric = metric;
				this.value = value;
				this.detail = detail;
			}

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
									var analysis = {};
									analysis.raw = response; 
									
									analysis.general = [];
									analysis.general.push(new Statistic("Unique values", response.unique_count, null));
									analysis.general.push(new Statistic("Missing/Invalid values", response.invalid, (100.0 * response.invalid / session.dataSize.rows).toFixed(1) + "%"));
									
									if(response.mode != null && response.mode != undefined && response.mode.length > 0)
									{
										var modes = "";
										modes += response.mode[0];
										for( var index = 1 ; index < response.mode.length ; index++ )
										{
											if(index >= 3)
											{
												modes += ", ...";
												break;
											}
											else
												modes += ", " + response.mode[index];
										}

										analysis.general.push(new Statistic(response.mode.length > 1 ? "Modes" : "Mode", modes, response.mode_frequency + " occurrences"));
									}
									else
										analysis.general.push(new Statistic("Mode", "None", null));

									if("word_unique_count" in response)
									{
										// TEXT column
										analysis.text = [];
										analysis.text.push(new Statistic("Total words", response.word_total, null));
										analysis.text.push(new Statistic("Unique words", response.word_unique_count, null));
										
										if(response.word_mode != null && response.word_mode != undefined && response.word_mode.length > 0)
										{
											var words = "";
											words += response.word_mode[0];
											for( var index = 1 ; index < response.word_mode.length ; index++ )
											{
												if(index >= 3)
												{
													words += ", ...";
													break;
												}
												else
													words += ", " + response.word_mode[index];
											}

											analysis.text.push(new Statistic(response.word_mode.length > 1 ? "Most prominent words" : "Most prominent word", words, response.word_mode_frequency + " occurrences"));
										}
										else
											analysis.text.push(new Statistic("Most prominent word", "None", null));

										analysis.text.push(new Statistic("Word lengths", response.word_length_min + " to " + response.word_length_max + " letters", null));
										analysis.text.push(new Statistic("Average word length", Number(response.word_length_average).toFixed(2) + " letters", null));
										analysis.text.push(new Statistic("Words per row", response.word_count_min + " to " + response.word_count_max + " words", null));
										analysis.text.push(new Statistic("Average words per row", Number(response.word_count_average).toFixed(2) + " words", null));
									}
									else if("mean" in response)
									{
										// NUMBER column
										analysis.numerical = [];
										analysis.numerical.push(new Statistic("Mean", Number(response.mean).toFixed(2), null));
										analysis.numerical.push(new Statistic("Standard deviation", Number(response.std).toFixed(2), null));
										analysis.numerical.push(new Statistic("Minimum", Number(response.min).toFixed(2), null));
										analysis.numerical.push(new Statistic("Lower quartile", Number(response["25%"]).toFixed(2), null));
										analysis.numerical.push(new Statistic("Median", Number(response["50%"]).toFixed(2), null));
										analysis.numerical.push(new Statistic("Upper quartile", Number(response["75%"]).toFixed(2), null));
										analysis.numerical.push(new Statistic("Maximum", Number(response.max).toFixed(2), null));
									}
									else
									{
										// DATE column
										analysis.date = [];
										analysis.date.push(new Statistic("Minimum", response.min, null));
										analysis.date.push(new Statistic("Median", response.median, null));
										analysis.date.push(new Statistic("Maximum", response.max, null));
									}

									callback(analysis);
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

		session.subscribeToMetadata({}, 
			function(data)
			{
				deleteNonexistentColumnSubscribers();
				updateAndPublishAnalyses();
			});
	}]);