var dcsServices = angular.module('dcsServices', []);

dcsServices.service('session', ['$rootScope', 
	function($rootScope)
	{
		var data = {};
		var types = {};
		var clusters = {};
		var changeCallbacks = [];

		this.registerCallback = 
			function(callback)
			{
				changeCallbacks.push(callback);
			}; 

		this.setData = 
			function(newVal)
			{
				data = newVal;
				for(var i = 0 ; i < changeCallbacks.length ; i++)
					if(typeof changeCallbacks[i] === 'function')
						changeCallbacks[i](data);
			}; 

		this.getData = 
			function()
			{
				return data;
			};
	}]);

dcsServices.service('sockets',
	function()
	{
		this.sessionID = null;

		function request(request, callback)
		{
			this.request = request;
			this.callback = callback;
		}

		var pendingRequests = {};
		this.generateUniqueID =
			function()
			{
				toReturn = Math.floor(Math.random()*Math.pow(2,32)).toString(16) + Math.floor(Math.random()*Math.pow(2,32)).toString(16);
				while(toReturn in pendingRequests)
					toReturn = Math.floor(Math.random()*Math.pow(2,32)).toString(16) + Math.floor(Math.random()*Math.pow(2,32)).toString(16);
				return toReturn;
			};

		this.initialize = 
			function(sessionID)
			{
				this.sessionID = sessionID;
				this.socket = io("http://localhost:5000/");
				this.setupEvents();
			};

		this.setupEvents =
			function()
			{
				this.socket.on('fullJSON',
					function(data)
					{
						var callback = pendingRequests[data["requestID"]].callback;
						if(data["success"])
							callback(data["data"]);
						else
							callback(null);
					});

				this.socket.on('renameColumn',
					function(data)
					{
						var callback = pendingRequests[data["requestID"]].callback;
						callback(data["success"]);
					});
			};

		this.fullJSON =
			function(callback)
			{
				// generate unique ID
				var requestID = this.generateUniqueID();

				this.socket.emit('fullJSON', {'sessionID': this.sessionID, 'requestID':requestID});
				pendingRequests[requestID] = new request('fullJSON', callback);
			};

		this.renameColumn =
			function(columnName, newName, callback)
			{
				var requestID = this.generateUniqueID();
				var toEmit = {'sessionID': this.sessionID, 'requestID':requestID, 'column': columnName, 'newName': newName };
				this.socket.emit('renameColumn', {'sessionID': this.sessionID, 'requestID':requestID, 'column': columnName, 'newName': newName });
				pendingRequests[requestID] = new request('renameColumn', callback);
			};
	});