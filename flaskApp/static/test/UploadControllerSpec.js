describe("UploadController", function() {
	beforeEach(module('dcs'));

	var $controller;

	beforeEach(inject(function(_$controller_) {
		$controller = _$controller_;
	}));

	describe('$scope.submit', function() {
		var $scope, controller;

	    beforeEach(function() {
			$scope = {};
			controller = $controller('UploadController', { $scope: $scope });
	    });

	    it('should call $scope.upload if $scope.file is defined', function() {
	    	$scope.file = new Blob();
	    	spyOn($scope, 'upload');
	    	$scope.submit();
	    	expect($scope.upload).toHaveBeenCalled();
	    });

	    it('should not call $scope.upload if $scope.file is undefined', function() {
	    	spyOn($scope, 'upload');
	    	$scope.submit();
	    	expect($scope.upload).not.toHaveBeenCalled();
	    });
	});

	describe('$scope.upload', function() {
		var $scope, controller, $httpBackend, $location;

		beforeEach(inject(function($injector) {
			$scope = {file: new Blob()};
			$location = $injector.get('$location');
			$httpBackend = $injector.get('$httpBackend');
			controller = $controller('UploadController', { $scope: $scope, $location: $location });			
		}));

		it('should change browser URL/location change on successful upload', function() {
			var sessionID = "tungstenTest12345";
		    $httpBackend.expectPOST('upload/')
						.respond({success: true, sessionID: sessionID});
			spyOn($location, 'path');
			$scope.upload();
			$httpBackend.flush()
			expect($location.path).toHaveBeenCalledWith("/" + sessionID);
		});

		it('should redirect back to upload page and report error on failed upload', function() {
		    $httpBackend.expectPOST('upload/')
						.respond({success: false});
			$httpBackend.expectGET('partials/upload.html')
						.respond({});
			$scope.upload();
			$httpBackend.flush();
			expect($scope.file).toBeNull();
			expect($scope.uploadProgress).toBeNull();
			expect($scope.error).toEqual("Could not parse file");
		});
	})
})