angular.module('dcs.services').service('socketConnection', 
	function()
	{
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
				var messages = ['fullJSON', 'renameColumn', 'deleteRows', 'changeColumnDataType', 'fillDown', 'interpolate', 'fillWithCustomValue'];
				for(var index = 0 ; index < messages.length ; index++)
				{
					var message = new String(messages[index]);
					this.socket.on(message,
						function(data)
						{
							if( data["sessionID"] !== 'undefined' && typeof data["requestID"] !== 'undefined' )
							{								
								var callback = pendingCallbacks[data["requestID"]];
								delete pendingCallbacks[data["requestID"]];
								delete data["sessionID"];
								delete data["requestID"];

								if(typeof callback === 'function')
									callback(data);
								
								for(listener in listeners[message])
									if(typeof listener === 'function')
										listener(data); 
							} 
						}); 
				}
			};

		this.initialize = 
			function(sessionID)
			{
				this.sessionID = sessionID;
				this.socket = io("http://localhost:5000/");
				this.setupEvents();
			};

		this.registerListener = 
			function(message, callback)
			{
				if(typeof listeners[message] === 'undefined')
					listeners[message] = [];
				
				listeners[message].push(callback);
			};

		this.request = 
			function(request, data, callback)
			{
				var requestID = generateUniqueID();
				data["sessionID"] = this.sessionID;
				data["requestID"] = requestID;

				pendingCallbacks[requestID] = callback;
				this.socket.emit(request, data);
			};

		this.disconnect = 
			function()
			{
				this.socket.disconnect();
				this.sessionID = null;
				this.socket = null;
			};
	});