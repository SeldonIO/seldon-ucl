angular.module('dcs.services').service('socketConnection', 
	function()
	{
		var self = this;

		var pendingCallbacks = {};
		var listeners = {};

		var requestCounter = 0;
		var requestIDLength = 8;

		this.socket = null;

		var generateUniqueID =
			function()
			{
				requestBase64 = (requestCounter++).toString(16);
				requestPadded = (Array(requestIDLength + 1).join("0") + requestBase64).slice(-requestIDLength);
				return requestPadded;
			};

		this.setupEvents = 
			function()
			{
				var messages = ['metadata', 'data', 'renameColumn', 'deleteRows', 'deleteColumns', 'changeColumnDataType', 'fillDown', 'interpolate', 'fillWithCustomValue', 'fillWithAverage', 'normalize', 'standardize', 'deleteRowsWithNA', 'findReplace', 'analyze', 'dataChanged', 'generateDummies', 'visualize', 'insertDuplicateColumn', 'splitColumn', 'combineColumns','executeCommand'];
				messages.forEach(
					function(message)
					{
						self.socket.on(message,
							function(data)
							{
								// console.log("Received " + message);
								if( data["sessionID"] !== 'undefined' && typeof data["requestID"] !== 'undefined' && data["requestID"] in pendingCallbacks )
								{				
									var callback = pendingCallbacks[data["requestID"]];

									delete pendingCallbacks[data["requestID"]];
									delete data["sessionID"];
									delete data["requestID"];

									if(typeof callback === 'function')
										callback(data);
								} 

								if(message in listeners && typeof listeners[message] === 'object')
								{
									for(var index = 0 ; index < listeners[message].length ; index++ )
									{
										var listener = listeners[message][index];
										if(typeof listener === 'function')
											listener(data); 
									}
								}
							}); 
					});
			};

		this.initialize = 
			function(sessionID)
			{
				self.sessionID = sessionID;
				self.socket = io("http://localhost:5000/");
				self.setupEvents();
			};

		this.registerListener = 
			function(message, callback)
			{
				if(typeof message !== 'string' || typeof callback !== 'function')
					return;

				if(typeof listeners[message] !== 'object')
					listeners[message] = [];
				listeners[message].push(callback);
			};

		// Returns requestID : String
		this.request = 
			function(request, data, callback)
			{
				if(typeof data !== 'object')
					data = {};

				var requestID = generateUniqueID();
				data["sessionID"] = self.sessionID;
				data["requestID"] = requestID;
				pendingCallbacks[requestID] = callback;
				self.socket.emit(request, data);	

				return requestID;	
			};

		this.disconnect = 
			function()
			{
				self.socket.disconnect();
				self.sessionID = null;
				self.socket = null;
			};
	});