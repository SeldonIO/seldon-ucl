describe("columnPicker directive", function() {
	beforeEach(module('dcs'));
	beforeEach(module('templates'));

	var $compile, $rootScope, $timeout, element, scope, mockSession;

	beforeEach(module(function ($provide) {
	    $provide.service('session', function () { 
	        this.columns = ["Hello", "World", "Yes", "Hello, World", "No Yes", "xyz"];
	        this.subscribeToMetadata = function() {
	        	return function() { };
	        };
    	});
    }));

	beforeEach(inject(function($injector) {
		$compile = $injector.get('$compile');
		$rootScope = $injector.get('$rootScope');
		$timeout = $injector.get('$timeout');
		session = $injector.get('session'); 
		element = $compile("<column-picker></column-picker>")($rootScope);
		$rootScope.$digest();	
		scope = element.isolateScope();
		scope.$digest();
	}));

	it('should compile into correct HTML', function() {
		expect(element.html()).toContain('ng-model="selection"');
	});

	describe('scope.init', function() {
		it('should initialize correctly', function() {
			spyOn(scope, 'setSearchColumns');
			scope.init();
			expect(scope.selection).toEqual([]);
			expect(scope.setSearchColumns).toHaveBeenCalled();
			expect(typeof scope.unsubscribe).toBe('function');
		});
	})

	describe('scope.setSearchColumns', function() {
		it('should set scope.searchColumns correctly without filter', function() {
			scope.setSearchColumns();
			expect(scope.searchColumns).toEqual(session.columns);
		});

		it('should set scope.searchColumns correctly with filter', function() {
			scope.filter = function(column) {
				return column == "Hello";
			}
			scope.setSearchColumns();
			expect(scope.searchColumns).toEqual(["Hello"]);
		});

		it('should remove selections if columns were deleted', function() {
			scope.selection = ["Hello", "Yes"];
			session.columns = ["World", "Yes"];
			scope.setSearchColumns();
			expect(scope.selection).toEqual(["Yes"]);
		});
	});

	describe('scope.updateEnabled', function() {
		describe('disables element', function() {
			it('should disable element when set to true', function() {
				scope.disabled = true;
			});

			it('should disable element when enabled set to false', function() {
				scope.enabled = false;
			});

			it('should disable element when selection at maximum', function() {
				scope.max = 2;
				scope.selection = [1, 2];
			});

			it('should disable element when selection beyond maximum', function() {
				scope.max = 2;
				scope.selection = [1, 2, 3];
			});

			afterEach(function() {
				scope.updateEnabled();
				$timeout.flush();
				expect(element[0].getElementsByTagName("md-autocomplete")[0].disabled).toBe(true);
				expect(element[0].getElementsByTagName("md-autocomplete")[0].style.display).toEqual("none");
			});
		});


		describe('enables element', function() {
			it('when disabled set to false', function() {
				scope.disabled = false;
			});

			it('when enabled set to true', function() {
				scope.enabled = true;
			});

			it('when selection below maximum', function() {
				scope.max = 2;
				scope.selection = [1];
			});

			afterEach(function() {
				scope.updateEnabled();
				$timeout.flush();
				expect(element[0].getElementsByTagName("md-autocomplete")[0].disabled).toBe(false);
				expect(element[0].getElementsByTagName("md-autocomplete")[0].style.display).toEqual("block");
			});
		});
	});

	describe('scope.querySearch', function() {
		beforeEach(function() { 
			scope.setSearchColumns();
		});

		it('should match complete column names', function() {
			expect(scope.querySearch("xyz")).toEqual(["xyz"]);
		});

		it('should match beginnings of column names', function() {
			expect(scope.querySearch("Hello")).toEqual(["Hello", "Hello, World"]);
		});

		it('should match middle of column names', function() {
			expect(scope.querySearch(", ")).toEqual(["Hello, World"]);
		});

		it('should match end of column names', function() {
			expect(scope.querySearch("Yes")).toEqual(["Yes", "No Yes"]);
		});

		it('should fail to match non-existing columns', function() {
			expect(scope.querySearch("foo")).toEqual([]);
		});

		it('should ignore case', function() {
			expect(scope.querySearch("XYz")).toEqual(["xyz"]);
		});
	});

	describe('scope.$watch(ngDisabled)', function() {
		it('should call scope.updateEnabled on valid boolean', function() {
			spyOn(scope, 'updateEnabled');
			scope.ngDisabled = true;
			scope.$digest();
			expect(scope.updateEnabled).toHaveBeenCalled();
		});

		it('should not call scope.updateEnabled on invalid boolean', function() {
			spyOn(scope, 'updateEnabled');
			scope.ngDisabled = null;
			scope.$digest();
			expect(scope.updateEnabled).not.toHaveBeenCalled();
		});
	});

	describe('scope.$watch(ngEnabled)', function() {
		it('should call scope.updateEnabled on valid boolean', function() {
			spyOn(scope, 'updateEnabled');
			scope.ngEnabled = true;
			scope.$digest();
			expect(scope.updateEnabled).toHaveBeenCalled();
		});

		it('should not call scope.updateEnabled on invalid boolean', function() {
			spyOn(scope, 'updateEnabled');
			scope.ngEnabled = null;
			scope.$digest();
			expect(scope.updateEnabled).not.toHaveBeenCalled();
		});
	});

	describe('scope.$watch(max)', function() {
		it('should convert scope.max to an integer', function() {
			scope.max = "5.4";
			scope.$digest();
			expect(scope.max).toBe(5);
		});

		it('should splice scope.selection to appropriate length if needed', function() {
			scope.max = 2;
			scope.selection = [1, 2, 3];
			scope.$digest();
			expect(scope.selection).toEqual([1, 2]);
		});

		it('should call scope.updateEnabled', function() {
			spyOn(scope, 'updateEnabled');
			scope.max = 1;
			scope.$digest();
			expect(scope.updateEnabled).toHaveBeenCalled();
		});
	});

	describe('scope.$watch(filter)', function() {
		it('should call scope.setSearchColumns', function() {
			spyOn(scope, 'setSearchColumns');
			scope.filter = function() { };
			scope.$digest();
			expect(scope.setSearchColumns).toHaveBeenCalled();
		});
	});
})