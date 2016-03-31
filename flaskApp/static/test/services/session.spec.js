describe("session service", function() {
	beforeEach(module('dcs'));

	beforeEach(module(function ($provide) {
	    $provide.service('socketConnection', function () { 
	        this.initialize = this.request = this.registerListener = function() { }; 
    	});
    }));

    var session, socketConnection, $rootScope;

	beforeEach(inject(function($injector) {
		socketConnection = $injector.get('socketConnection');
		$roootScope = $injector.get('$rootScope');
		session = $injector.get('session');
	}));

	describe('self.initialize', function() {
		it('should initialize socketConnection', function() {
			spyOn(socketConnection, 'initialize');
			var sessionID = "tungstenTest12345";
			session.initialize(sessionID, function(){ });
			expect(socketConnection.initialize).toHaveBeenCalledWith(sessionID);
		});

		it("should register as a 'dataChanged' event listener on socketConnection", function() {
			spyOn(socketConnection, 'registerListener');
			session.initialize("", function(){ });
			expect(socketConnection.registerListener).toHaveBeenCalledWith('dataChanged', session.dataChanged);
		});

		it("should request new metadata", function() {
			spyOn(session, 'metadata');
			session.initialize("", function(){ });
			expect(session.metadata).toHaveBeenCalled();
		});

		describe('on successful initialization / successful metadata', function() {
			beforeEach(function() {
				spyOn(session, 'metadata').and.callFake(function(options, callback) { callback("dataSize", "columns", "columnInfo", "undoAvailable"); });
			});

			it("should set variables accordingly", function() {
				session.initialize("session", function(){ });
				expect(session.dataSize).toBe("dataSize");
				expect(session.columns).toBe("columns");
				expect(session.columnInfo).toBe("columnInfo");
				expect(session.undoAvailable).toBe("undoAvailable");
				expect(session.__testonly__.getSessionID()).toBe("session");
			});

			it('should callback true', function() {
				session.initialize("session", function(success) {
					expect(success).toBe(true);
				});
			});
		})

		it('should callback false on failed initialization / failed metadata', function() {
			spyOn(session, 'metadata').and.callFake(function(options, callback) { callback(null, null, null, null); });
			session.initialize("session", function(success) {
				expect(success).toBe(false);
			});
		});
	});

	describe('self.subscribeToMetadata', function() {
		describe('return value', function() {
			it('should be null if options parameter is not an object', function() {
				expect(session.subscribeToMetadata(null, function() { })).toBeNull();
				expect(session.subscribeToMetadata(undefined, function() { })).toBeNull();
				expect(session.subscribeToMetadata(-5.3, function() { })).toBeNull();
				expect(session.subscribeToMetadata("whatever", function() { })).toBeNull();
				expect(session.subscribeToMetadata(function() { }, function() { })).toBeNull();
			});

			it('should be null if callback parameter is not an function', function() {
				expect(session.subscribeToMetadata({}, null)).toBeNull();
				expect(session.subscribeToMetadata({}, undefined)).toBeNull();
				expect(session.subscribeToMetadata({}, {})).toBeNull();
				expect(session.subscribeToMetadata({}, 2.7)).toBeNull();
				expect(session.subscribeToMetadata({}, "whatever")).toBeNull();
			});

			it('should be a function if parameters are valid', function() {
				expect(session.subscribeToMetadata({}, function() {})).toEqual(jasmine.any(Function));
			});

			it('should be a function if parameters are valid', function() {
				expect(session.subscribeToMetadata({}, function() {})).toEqual(jasmine.any(Function));
			});
		});

		it('should increment subscriber count to generate unique ID', function() {
			expect(session.__testonly__.getSubscriberCount()).toBe(0);
			session.subscribeToMetadata({}, function() { });
			expect(session.__testonly__.getSubscriberCount()).toBe(1);
		});

		it('should add subscriber to metadataSubscribers dictionary', function() {
			var newListener = {options: {test: true}, callback: function(success) { console.log(success); }};
			session.subscribeToMetadata(newListener.options, newListener.callback);
			var keys = Object.keys(session.__testonly__.getMetadataSubscribers());
			expect(keys.length).toEqual(1);

			var foundSubscriber = false;
			for(var index = 0 ; index < keys.length ; index++) {
				var subscriber = session.__testonly__.getMetadataSubscribers()[index];
				if(subscriber.options === newListener.options && subscriber.callback === newListener.callback)
					foundSubscriber = true;
			}

			expect(foundSubscriber).toBe(true);
		})

		it('should immediately call subscriber with current metadata', function() {
			spyOn(session, 'metadata');
			var newListener = {options: {test: true}, callback: function(success) { console.log(success); }};
			session.subscribeToMetadata(newListener.options, newListener.callback);
			expect(session.metadata).toHaveBeenCalledWith(newListener.options, newListener.callback);
		});

		it('should return a function that unsubscribes/deletes subscriber', function() { 
			var others = 10;
			for(var index = 0 ; index < others ; index++)
				session.subscribeToMetadata({}, function() { });
			var newListener = {options: {test: true}, callback: function(success) { console.log(success); }};
			var unsubscribe = session.subscribeToMetadata(newListener.options, newListener.callback);
			expect(Object.keys(session.__testonly__.getMetadataSubscribers()).length).toEqual(others + 1);

			unsubscribe();
			var keys = Object.keys(session.__testonly__.getMetadataSubscribers());
			expect(keys.length).toEqual(others);
			var foundSubscriber = false;
			for(var index = 0 ; index < keys.length ; index++) {
				var subscriber = session.__testonly__.getMetadataSubscribers()[index];
				if(subscriber.options === newListener.options && subscriber.callback === newListener.callback)
					foundSubscriber = true;
			}
			expect(foundSubscriber).toBe(false);
		});
	});	

	describe('self.dataChanged', function() {
		it('should request new metadata', function() {
			spyOn(session, 'metadata');
			session.dataChanged();
			expect(session.metadata).toHaveBeenCalled();
		});

		describe('on successful initialization / successful metadata', function() {
			beforeEach(function() {
				spyOn(session, 'metadata').and.callFake(function(options, callback) { callback("dataSize", "columns", "columnInfo", "undoAvailable"); });
			});

			it("should set variables accordingly", function() {
				session.dataChanged();
				expect(session.dataSize).toBe("dataSize");
				expect(session.columns).toBe("columns");
				expect(session.columnInfo).toBe("columnInfo");
				expect(session.undoAvailable).toBe("undoAvailable");
			});

			it('should notify general metadata subscribers immediately', function() {
				var newListener = {options: {}, callback: function() { } };
				spyOn(newListener, 'callback');
				session.__testonly__.getMetadataSubscribers()[0] = newListener;
				session.dataChanged();
				expect(newListener.callback).toHaveBeenCalledWith("dataSize", "columns", "columnInfo", "undoAvailable");
			});

			it('should request new metadata for specialized metadata subscribers', function() {
				var newListener = {options: {sorted: true}, callback: function() { } };
				session.__testonly__.getMetadataSubscribers()[0] = newListener;
				session.dataChanged();
				expect(session.metadata).toHaveBeenCalledWith(newListener.options, newListener.callback);
			});
		});
	});
})