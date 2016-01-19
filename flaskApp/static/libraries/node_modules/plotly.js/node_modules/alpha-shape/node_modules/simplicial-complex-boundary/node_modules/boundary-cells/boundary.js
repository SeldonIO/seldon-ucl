"use strict"

module.exports = boundary

function boundary(cells) {
  var n = cells.length
  var sz = 0
  for(var i=0; i<n; ++i) {
    sz += cells[i].length
  }
  var result = new Array(sz)
  var ptr = 0
  for(var i=0; i<n; ++i) {
    var c = cells[i]
    var d = c.length
    for(var j=0; j<d; ++j) {
      var b = result[ptr++] = new Array(d-1)
      for(var k=1; k<d; ++k) {
        b[k-1] = c[(j+k)%d]
      }
    }
  }
  return result
}
