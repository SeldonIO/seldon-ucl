var dcsServices = angular.module('dcsServices', []);

dcsServices.service('sockets', 
	function sockets()
	{
		this.sessionID = null;
		function request(request, callback)
		{
			this.request = request;
			this.callback = callback;
		}
		var pendingRequests = {};
		this.generateID =
			function()
			{
				return Math.floor(Math.random()*Math.pow(2,32)).toString(16);
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
						callback(data["data"]);
					});
			};

		this.requestFullJSON =
			function(callback)
			{
				var requestID = this.generateID();
				while(requestID in pendingRequests)
				{
					requestID = this.generateID();
				}
				this.socket.emit('fullJSON', {'sessionID': this.sessionID, 'requestID':requestID});
				pendingRequests[requestID] = new request('fullJSON', callback);
				console.log(requestID);
			};
	});