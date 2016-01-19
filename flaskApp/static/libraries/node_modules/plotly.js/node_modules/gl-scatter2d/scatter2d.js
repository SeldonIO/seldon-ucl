'use strict'

var createShader = require('gl-shader')
var createBuffer = require('gl-buffer')
var bsearch = require('binary-search-bounds')
var snapPoints = require('snap-points-2d')

var pool = require('typedarray-pool')

var SHADERS = require('./lib/shader')

module.exports = createScatter2D

function Scatter2D(plot, offsetBuffer, pickBuffer, weightBuffer, shader, pickShader) {
  this.plot           = plot
  this.offsetBuffer   = offsetBuffer
  this.pickBuffer     = pickBuffer
  this.weightBuffer   = weightBuffer
  this.shader         = shader
  this.pickShader     = pickShader
  this.scales         = []
  this.size           = 12.0
  this.borderSize     = 1.0
  this.pointCount     = 0
  this.color          = [1,0,0,1]
  this.borderColor    = [0,0,0,1]
  this.bounds         = [Infinity,Infinity,-Infinity,-Infinity]
  this.pickOffset     = 0
  this.points         = null
  this.xCoords        = null
}

var proto = Scatter2D.prototype

proto.dispose = function() {
  this.shader.dispose()
  this.pickShader.dispose()
  this.offsetBuffer.dispose()
  this.pickBuffer.dispose()
  if(this.xCoords) {
    pool.free(this.xCoords)
  }
  this.plot.removeObject(this)
}

proto.update = function(options) {
  options = options || {}

  function dflt(opt, value) {
    if(opt in options) {
      return options[opt]
    }
    return value
  }

  this.size         = dflt('size', 12.0)
  this.color        = dflt('color', [1,0,0,1]).slice()
  this.borderSize   = dflt('borderSize', 1)
  this.borderColor  = dflt('borderColor', [0,0,0,1]).slice()

  //Update point data
  if(this.xCoords) {
    pool.free(this.xCoords)
  }
  var data          = options.positions
  var packed        = pool.mallocFloat32(data.length)
  var packedId      = pool.mallocInt32(data.length>>>1)
  packed.set(data)
  var packedW       = pool.mallocFloat32(data.length)
  this.points       = data
  this.scales       = snapPoints(packed, packedId, packedW, this.bounds)
  this.offsetBuffer.update(packed)
  this.pickBuffer.update(packedId)
  this.weightBuffer.update(packedW)
  var xCoords      = pool.mallocFloat32(data.length>>>1)
  for(var i=0,j=0; i<data.length; i+=2,++j) {
    xCoords[j] = packed[i]
  }
  pool.free(packedId)
  pool.free(packed)
  pool.free(packedW)

  this.xCoords = xCoords

  this.pointCount = data.length >>> 1
  this.pickOffset = 0
}

proto.drawPick = (function() {
  var MATRIX = [1,0,0,
                0,1,0,
                0,0,1]
  var PICK_VEC4 = [0,0,0,0]
return function(pickOffset) {
  var plot          = this.plot
  var shader        = this.pickShader
  var scales        = this.scales
  var offsetBuffer  = this.offsetBuffer
  var pickBuffer    = this.pickBuffer
  var bounds        = this.bounds
  var size          = this.size
  var borderSize    = this.borderSize
  var gl            = plot.gl
  var pixelRatio    = plot.pickPixelRatio
  var viewBox       = plot.viewBox
  var dataBox       = plot.dataBox

  if(this.pointCount === 0) {
    return pickOffset
  }

  var boundX  = bounds[2] - bounds[0]
  var boundY  = bounds[3] - bounds[1]
  var dataX   = dataBox[2] - dataBox[0]
  var dataY   = dataBox[3] - dataBox[1]
  var screenX = (viewBox[2] - viewBox[0]) * pixelRatio / plot.pixelRatio
  var screenY = (viewBox[3] - viewBox[1]) * pixelRatio / plot.pixelRatio

  var pixelSize   = Math.min(dataX / screenX, dataY / screenY)
  var targetScale = pixelSize


  MATRIX[0] = 2.0 * boundX / dataX
  MATRIX[4] = 2.0 * boundY / dataY
  MATRIX[6] = 2.0 * (bounds[0] - dataBox[0]) / dataX - 1.0
  MATRIX[7] = 2.0 * (bounds[1] - dataBox[1]) / dataY - 1.0

  this.pickOffset = pickOffset
  PICK_VEC4[0] = ( pickOffset      & 0xff)
  PICK_VEC4[1] = ((pickOffset>>8)  & 0xff)
  PICK_VEC4[2] = ((pickOffset>>16) & 0xff)
  PICK_VEC4[3] = ((pickOffset>>24) & 0xff)

  shader.bind()
  shader.uniforms.matrix      = MATRIX
  shader.uniforms.color       = this.color
  shader.uniforms.borderColor = this.borderColor
  shader.uniforms.pointSize   = pixelRatio * (size + borderSize)
  shader.uniforms.pickOffset  = PICK_VEC4

  if(this.borderSize === 0) {
    shader.uniforms.centerFraction = 2.0;
  } else {
    shader.uniforms.centerFraction = size / (size + borderSize + 1.25)
  }

  offsetBuffer.bind()
  shader.attributes.position.pointer()
  pickBuffer.bind()
  shader.attributes.pickId.pointer(gl.UNSIGNED_BYTE)

  var xCoords = this.xCoords
  var xStart = (dataBox[0] - bounds[0] - pixelSize * size * pixelRatio) / boundX
  var xEnd   = (dataBox[2] - bounds[0] + pixelSize * size * pixelRatio) / boundX

  for(var scaleNum = scales.length-1; scaleNum >= 0; --scaleNum) {
    var lod     = scales[scaleNum]
    if(lod.pixelSize < pixelSize && scaleNum > 1) {
      continue
    }

    var intervalStart = lod.offset
    var intervalEnd   = lod.count + intervalStart

    var startOffset = bsearch.ge(xCoords, xStart, intervalStart, intervalEnd-1)
    var endOffset   = bsearch.lt(xCoords, xEnd, startOffset, intervalEnd-1)+1

    gl.drawArrays(gl.POINTS, startOffset, endOffset - startOffset)
  }

  return pickOffset + this.pointCount
}
})()

proto.draw = (function() {
  var MATRIX = [1, 0, 0,
                0, 1, 0,
                0, 0, 1]

  return function() {
    var plot          = this.plot
    var shader        = this.shader
    var scales        = this.scales
    var offsetBuffer  = this.offsetBuffer
    var bounds        = this.bounds
    var size          = this.size
    var borderSize    = this.borderSize
    var gl            = plot.gl
    var pixelRatio    = plot.pixelRatio
    var viewBox       = plot.viewBox
    var dataBox       = plot.dataBox

    if(this.pointCount === 0) {
      return
    }

    var boundX  = bounds[2] - bounds[0]
    var boundY  = bounds[3] - bounds[1]
    var dataX   = dataBox[2] - dataBox[0]
    var dataY   = dataBox[3] - dataBox[1]
    var screenX = viewBox[2] - viewBox[0]
    var screenY = viewBox[3] - viewBox[1]

    var pixelSize   = Math.min(dataX / screenX, dataY / screenY)
    var targetScale = pixelSize

    MATRIX[0] = 2.0 * boundX / dataX
    MATRIX[4] = 2.0 * boundY / dataY
    MATRIX[6] = 2.0 * (bounds[0] - dataBox[0]) / dataX - 1.0
    MATRIX[7] = 2.0 * (bounds[1] - dataBox[1]) / dataY - 1.0

    shader.bind()
    shader.uniforms.matrix      = MATRIX
    shader.uniforms.color       = this.color
    shader.uniforms.borderColor = this.borderColor
    shader.uniforms.pointSize   = pixelRatio * (size + borderSize)
    shader.uniforms.useWeight   = 1

    if(this.borderSize === 0) {
      shader.uniforms.centerFraction = 2.0;
    } else {
      shader.uniforms.centerFraction = size / (size + borderSize + 1.25)
    }

    offsetBuffer.bind()
    shader.attributes.position.pointer()

    this.weightBuffer.bind()
    shader.attributes.weight.pointer()

    var xCoords = this.xCoords
    var xStart = (dataBox[0] - bounds[0] - pixelSize * size * pixelRatio) / boundX
    var xEnd   = (dataBox[2] - bounds[0] + pixelSize * size * pixelRatio) / boundX

    var firstLevel = true

    for(var scaleNum = scales.length-1; scaleNum >= 0; --scaleNum) {
      var lod     = scales[scaleNum]
      if(lod.pixelSize < pixelSize && scaleNum > 1) {
        continue
      }

      var intervalStart = lod.offset
      var intervalEnd   = lod.count + intervalStart

      var startOffset = bsearch.ge(xCoords, xStart, intervalStart, intervalEnd-1)
      var endOffset   = bsearch.lt(xCoords, xEnd, startOffset, intervalEnd-1)+1

      gl.drawArrays(gl.POINTS, startOffset, endOffset - startOffset)

      if(firstLevel) {
        firstLevel = false
        shader.uniforms.useWeight = 0
      }
    }
  }
})()

proto.pick = function(x, y, value) {
  var pickOffset = this.pickOffset
  var pointCount = this.pointCount
  if(value < pickOffset || value >= pickOffset + pointCount) {
    return null
  }
  var pointId = value - pickOffset
  var points = this.points
  return {
    object:  this,
    pointId: pointId,
    dataCoord: [ points[2*pointId], points[2*pointId+1] ]
  }
}

function createScatter2D(plot, options) {
  var gl     = plot.gl
  var buffer = createBuffer(gl)
  var pickBuffer = createBuffer(gl)
  var weightBuffer = createBuffer(gl)
  var shader = createShader(gl, SHADERS.pointVertex, SHADERS.pointFragment)
  var pickShader = createShader(gl, SHADERS.pickVertex, SHADERS.pickFragment)

  var result = new Scatter2D(
    plot, buffer, pickBuffer, weightBuffer, shader, pickShader)
  result.update(options)

  //Register with plot
  plot.addObject(result)

  return result
}
