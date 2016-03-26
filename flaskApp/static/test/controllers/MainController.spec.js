describe("MainController", function() {
	beforeEach(module('dcs'));

	var $controller;

	beforeEach(inject(function(_$controller_) {
		$controller = _$controller_;
	}));

	describe('$scope.init', function() {
		var $scope, controller, $state, $stateParams;
		var sessionID = "123456789012345678901234567890";

	    beforeEach(inject(function($injector) {
			$stateParams = {sessionID: sessionID};
			$scope = $injector.get('$rootScope');
			$state = $injector.get('$state');
			controller = $controller('MainController', { $scope: $scope, $stateParams: $stateParams, $state: $state });
	    }));

	    it('should redirect to upload screen if session ID invalid', function() {
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

	    it('should not redirect to upload screen if session ID valid', function() {
	    	spyOn($state, 'go');
	    	$scope.init();
	    	expect($state.go).not.toHaveBeenCalled();
	    });

	    it('should set $scope variables', function() {
	    	expect($scope.docName).toEqual(sessionID);
	    	expect($scope.initialLoad).toEqual(true);
	    });
	});
})