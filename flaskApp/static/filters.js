var dcsFilters = angular.module('dcs.filters', []);

// filter that converts number in bytes to human readable format
// e.g. 2048 => 2 kB
// optionally takes a precision parameter (number of decimal places)
dcsFilters.filter('bytes', function() {
	return function(bytes, precision) {
		bytes = parseFloat(bytes);
		if( isNaN(bytes) || !isFinite(bytes) || bytes < 0 )
			return "-";
		
		precision = parseInt(precision);
		if (typeof precision !== 'number' || precision < 0 )
			precision = 0;

		var units = ['bytes', 'kB', 'MB', 'GB'];
		var index = 0;
		while( parseFloat(bytes.toFixed(precision)) >= 1024 && index < units.length - 1 ) {
			bytes /= 1024.0;
			index++;
		}

		return bytes.toFixed(precision) + ' ' + units[index];
	}
});