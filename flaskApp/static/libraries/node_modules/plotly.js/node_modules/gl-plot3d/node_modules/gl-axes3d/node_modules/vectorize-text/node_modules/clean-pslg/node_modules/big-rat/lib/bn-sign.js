'use strict'

var bn = require('bn.js')

module.exports = sign

function sign(x) {
  return x.cmp(new bn(0))
}
