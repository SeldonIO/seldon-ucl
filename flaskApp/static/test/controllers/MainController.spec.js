describe("MainController", function() {
	beforeEach(module('dcs'));

	var $controller;

	beforeEach(inject(function(_$controller_) {
		$controller = _$controller_;
	}));

	var $scope, controller, $state, $stateParams, $mdDialog, session, dialogs, $timeout, $rootScope;
	var sessionID = "123456789012345678901234567890";

    beforeEach(inject(function($injector) {
		$stateParams = {sessionID: sessionID};
		$rootScope = $injector.get('$rootScope')
		$scope = $rootScope.$new();
		$state = $injector.get('$state');
		$timeout = $injector.get('$timeout');
		$mdDialog = {show: function() { }, hide: function() { }};
		session = { undo: function() {}, initialize: function() {}, subscribeToMetadata: function() {} };
		dialogs = { errorDialog: function() {} };
		controller = $controller('MainController', { $scope: $scope, $stateParams: $stateParams, $state: $state, session: session, $mdDialog: $mdDialog, $timeout: $timeout, dialogs: dialogs });
    }));

	describe('$scope.init', function() {
	    it('should redirect to upload page if session ID invalid', function() {
	    	spyOn($state, 'go');

	    	$stateParams.sessionID = undefined;
	    	$scope.init();
	    	expect($state.go).toHaveBeenCalledWith('upload');

	    	$stateParams.sessionID = null;
	    	$scope.init();
	    	expect($state.go).toHaveBeenCalledWith('upload');

	    	$stateParams.sessionID = "1234567890123456789012345";
	    	$scope.init();
	    	expect($state.go).toHaveBeenCalledWith('upload');
	    });

	    it('should not redirect to upload page if session ID valid', function() {
	    	spyOn($state, 'go');
	    	$scope.init();
	    	expect($state.go).not.toHaveBeenCalled();
	    });

	    it('should set $scope variables', function() {
	    	expect($scope.docName).toEqual(sessionID);
	    	expect($scope.initialLoad).toEqual(true);
	    });

	    it('should call self.showLoadingDialog', function() {
	    	spyOn(controller, 'showLoadingDialog');
	    	$scope.init();
	    	expect(controller.showLoadingDialog).toHaveBeenCalled();
	    });

	    it('should call session.initialize', function() {
	    	spyOn(session, 'initialize');
	    	$scope.init();
	    	expect(session.initialize).toHaveBeenCalled();
	    });

	    it('should call self.fatalError on unsuccessful session.initialize', function() {
	    	session.initialize = function(a, success) { success(false); };
	    	spyOn(controller, 'fatalError');
	    	$scope.init();
	    	expect(controller.fatalError).toHaveBeenCalled();
	    });

	    describe('successful session.initialize', function() {
	    	beforeEach(function() {
	    		session.initialize = function(a, success) { success(true); };
	    		spyOn(session, 'subscribeToMetadata');
	    		$scope.init();
	    	});

	    	it('should set scope.dataLoaded to true', function() {
	    		expect($scope.dataLoaded).toBe(true);
	    	});

	    	it('should call session.subscribeToMetadata', function() {
	    		expect(session.subscribeToMetadata).toHaveBeenCalled();
	    	});
	    });
	});

	describe('self.metadataCallbackHandler', function() {
		it('should set $scope.undoAvailable to new value', function() {
			controller.metadataCallbackHandler(null, null, null, true);
			$timeout.flush();
			expect($scope.undoAvailable).toBe(true);
		});
	});

	describe('$rootScope.$on(fatalError)', function() {
		it("should call self.fatalError", function() {
			spyOn(controller, 'fatalError');
			$rootScope.$broadcast("fatalError");
			expect(controller.fatalError).toHaveBeenCalled();
		});
	});

	describe('$scope.$on(firstLoad)', function() {
		it("should call self.hideLoadingDialog", function() {
			spyOn(controller, 'hideLoadingDialog');
			$rootScope.$broadcast("firstLoad");
			$timeout.flush();
			expect(controller.hideLoadingDialog).toHaveBeenCalled();
		});
	});

	describe('self.fatalError', function() {
		it('should call self.hideLoadingDialog', function() {
			spyOn(controller, 'hideLoadingDialog');
			controller.fatalError();
			expect(controller.hideLoadingDialog).toHaveBeenCalled();
		});

		it('should redirect to upload page', function() {
			spyOn($state, 'go');
			controller.fatalError();
			expect($state.go).toHaveBeenCalledWith('upload');
		})
	})

	describe('self.showLoadingDialog', function() {
		it('should call $mdDialog.show', function() {
			spyOn($mdDialog, 'show');
			controller.showLoadingDialog();
			expect($mdDialog.show).toHaveBeenCalled();
		});
	});

	describe('self.hideLoadingDialog', function() {
		it('should call $mdDialog.hide', function() {
			spyOn($mdDialog, 'hide');
			controller.hideLoadingDialog();
			expect($mdDialog.hide).toHaveBeenCalled();
		});
	});

	describe('$scope.undo', function() {
		it('should show loading dialog', function() {
			spyOn(controller, 'showLoadingDialog');
			$scope.undo();
			expect(controller.showLoadingDialog).toHaveBeenCalled();
		});

		it('should show operation toast', function() {
			spyOn($scope, '$broadcast');
			$scope.undo();
			expect($scope.$broadcast).toHaveBeenCalledWith('showToast', jasmine.any(String));
		});

		it('should call session.undo', function() {
			spyOn(session, 'undo');
			$scope.undo();
			expect(session.undo).toHaveBeenCalled();
		});

		it('should broadcast hideLoadingDialogAfterLoad on successful undo', function() {
			spyOn($scope, '$broadcast');
			session.undo = function(callback) { callback(true); };
			$scope.undo();
			expect($scope.$broadcast).toHaveBeenCalledWith('hideLoadingDialogAfterLoad');
		});

		it('should show error toast on failed undo', function() {
			session.undo = function(callback) { callback(false); };
			spyOn($scope, '$broadcast');
			$scope.undo();
			expect($scope.$broadcast).toHaveBeenCalledWith('showToast', jasmine.any(String), jasmine.any(Number));
		});

		it('should show error dialog on failed undo', function() {
			var error = "NameError";
			var errorDescription = "Traceback";
			session.undo = function(callback) { callback(false, error, errorDescription) };
			spyOn(dialogs, 'errorDialog');
			$scope.undo();
			expect(dialogs.errorDialog).toHaveBeenCalledWith("Undo", error, errorDescription);
		})
	});

	describe('$scope.showExportOptions', function() {
		it('should an mdDialog with export options', function() {
			spyOn($mdDialog, 'show');
			$scope.showExportOptions();
			expect($mdDialog.showExportOptions).toHaveBeenCalled();
		});
	});
})