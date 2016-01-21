var dcsServices = angular.module('dcsServices', []);

dcsServices.service('session', ['$rootScope', 'socketConnection', 
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
						if(response["success"])
						{
							$rootScope.$apply(
								function()
								{	
									$rootScope.data = JSON.parse(response["data"]);
									$rootScope.dataTypes = response["dataTypes"];
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

	}]);

dcsServices.service('socketConnection', 
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
				var messages = ['fullJSON', 'renameColumn', 'deleteRows'];
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