'use strict'

var bn2num = require('./lib/bn-to-num')
var ctz = require('./lib/ctz')

module.exports = roundRat

//Round a rational to the closest float
function roundRat(f) {
  var a = f[0]
  var b = f[1]
  if(a.cmpn(0) === 0) {
    return 0
  }
  var h = a.divmod(b)
  var iv = h.div
  var x = bn2num(iv)
  var ir = h.mod
  if(ir.cmpn(0) === 0) {
    return x
  }
  if(x) {
    var s = ctz(x) + 4
    var y = bn2num(ir.shln(s).divRound(b))

    // flip the sign of y if x is negative
    if (x<0) {
      y = -y;
    }

    return x + y * Math.pow(2, -s)
  } else {
    var ybits = b.bitLength() - ir.bitLength() + 53
    var y = bn2num(ir.shln(ybits).divRound(b))
    if(ybits < 1023) {
      return y * Math.pow(2, -ybits)
    }
    y *= Math.pow(2, -1023)
    return y * Math.pow(2, 1023-ybits)
  }
}
