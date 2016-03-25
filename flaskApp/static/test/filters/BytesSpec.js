describe("bytes filter", function() {
	beforeEach(module('dcs'));

	var $filter;
	var invalidParameters = [null, undefined, NaN, "asdf", "-2.3", -2.3, Infinity, -Infinity];

	beforeEach(inject(function(_$filter_) {
		$filter = _$filter_;
	}));

	it("returns '-' on invalid bytes parameter", function() {
		var bytes = $filter('bytes');
		for(var index = 0 ; index < invalidParameters.length ; index++)
			expect(bytes(invalidParameters[index], 1)).toEqual("-");
	});

	it("ignores invalid precision parameter", function() {
		var bytes = $filter('bytes');
		for(var index = 0 ; index < invalidParameters.length ; index++)
			expect(bytes(2048, invalidParameters[index])).toBe("2 kB");
	});

	it("converts bytes within range correctly", function() {
		var bytes = $filter('bytes');
		expect(bytes(0, 0)).toBe("0 bytes");
		expect(bytes(183.9, 0)).toBe("184 bytes");
		expect(bytes(1023, 0)).toBe("1023 bytes");
		expect(bytes(1023.9, 0)).toBe("1 kB");
		expect(bytes(1024, 0)).toBe("1 kB");
		expect(bytes(1023.4 * 1024, 0)).toBe("1023 kB");
		expect(bytes(1024 * 1024, 0)).toBe("1 MB");
		expect(bytes(1024 * 1024 * 73, 0)).toBe("73 MB");
		expect(bytes(1024 * 1024 * 1023, 0)).toBe("1023 MB");
		expect(bytes(Math.pow(1024, 3), 0)).toBe("1 GB");
		expect(bytes(Math.pow(1024, 3) * 193.4, 0)).toBe("193 GB");
		expect(bytes(Math.pow(1024, 3) * 1023.4, 0)).toBe("1023 GB");
	});

	it("converts bytes above range correctly", function() {
		var bytes = $filter('bytes');
		expect(bytes(1024 * 1024 * 1024 * 2048, 0)).toBe("2048 GB");
	});
})