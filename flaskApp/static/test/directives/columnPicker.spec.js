describe("columnPicker directive", function() {
	beforeEach(module('dcs'));
	beforeEach(module('templates'));

	var $compile, $rootScope, $httpBackend, element, scope, mockSession;

	beforeEach(module(function ($provide) {
	    $provide.service('session', function () { 
	        this.columns = ["Hello", "World", "Yes"];
	        this.subscribeToMetadata = function() {
	        	return function() { };
	        };
    	});
    }));

	beforeEach(inject(function($injector) {
		$compile = $injector.get('$compile');
		$rootScope = $injector.get('$rootScope');
		$httpBackend = $injector.get('$httpBackend');
		session = $injector.get('session'); 
		element = $compile("<column-picker></column-picker>")($rootScope);
		$rootScope.$digest();	
		scope = element.isolateScope();
		scope.$digest();
	}));

	it('gets compiled into correct HTML', function() {
		expect(element.html()).toContain('ng-model="selection"');
	});

	describe('scope.init', function() {
		it('initializes correctly', function() {
			spyOn(scope, 'setSearchColumns');
			scope.init();
			expect(scope.selection).toEqual([]);
			expect(scope.setSearchColumns).toHaveBeenCalled();
			expect(typeof scope.unsubscribe).toBe('function');
		});
	})

	describe('scope.setSearchColumns', function() {
		it('sets scope.searchColumns correctly without filter', function() {
			scope.setSearchColumns();
			expect(scope.searchColumns).toEqual(session.columns);
		});

		it('sets scope.searchColumns correctly with filter', function() {
			scope.filter = function(column) {
				return column == "Hello";
			}
			scope.setSearchColumns();
			expect(scope.searchColumns).toEqual(["Hello"]);
		});

		it('removes selections if columns were deleted', function() {
			scope.selection = ["Hello", "Yes"];
			session.columns = ["World", "Yes"];
			scope.setSearchColumns();
			expect(scope.selection).toEqual(["Yes"]);
		});
	});
})