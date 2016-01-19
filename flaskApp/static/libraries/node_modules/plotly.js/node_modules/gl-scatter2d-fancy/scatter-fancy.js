'use strict'

module.exports = createFancyScatter2D

var createShader = require('gl-shader')
var createBuffer = require('gl-buffer')
var textCache = require('text-cache')
var pool = require('typedarray-pool')
var vectorizeText = require('vectorize-text')
var shaders = require('./lib/shaders')

var BOUNDARIES = {}

function getBoundary(glyph) {
  if(glyph in BOUNDARIES) {
    return BOUNDARIES[glyph]
  }

  var polys = vectorizeText(glyph, {
    polygons: true,
    font: 'sans-serif',
    textAlign: 'left',
    textBaseline: 'alphabetic'
  })

  var coords  = []
  var normals = []

  polys.forEach(function(loops) {
    loops.forEach(function(loop) {
      for(var i=0; i<loop.length; ++i) {
        var a = loop[(i + loop.length - 1) % loop.length]
        var b = loop[i]
        var c = loop[(i + 1) % loop.length]
        var d = loop[(i + 2) % loop.length]

        var dx = b[0] - a[0]
        var dy = b[1] - a[1]
        var dl = Math.sqrt(dx*dx + dy*dy)
        dx /= dl
        dy /= dl

        coords.push(a[0], a[1] + 1.4)
        normals.push(dy, -dx)
        coords.push(a[0], a[1] + 1.4)
        normals.push(-dy, dx)
        coords.push(b[0], b[1] + 1.4)
        normals.push(-dy, dx)

        coords.push(b[0], b[1] + 1.4)
        normals.push(-dy, dx)
        coords.push(a[0], a[1] + 1.4)
        normals.push(dy, -dx)
        coords.push(b[0], b[1] + 1.4)
        normals.push(dy, -dx)

        var ex = d[0] - c[0]
        var ey = d[1] - c[1]
        var el = Math.sqrt(ex*ex + ey*ey)
        ex /= el
        ey /= el

        coords.push(b[0], b[1]+1.4)
        normals.push(dy, -dx)
        coords.push(b[0], b[1]+1.4)
        normals.push(-dy, dx)
        coords.push(c[0], c[1]+1.4)
        normals.push(-ey, ex)

        coords.push(c[0], c[1]+1.4)
        normals.push(-ey, ex)
        coords.push(b[0], b[1]+1.4)
        normals.push(ey, -ex)
        coords.push(c[0], c[1]+1.4)
        normals.push(ey, -ex)
      }
    })
  })

  var bounds = [Infinity, Infinity, -Infinity, -Infinity]
  for(var i=0; i<coords.length; i+=2) {
    for(var j=0; j<2; ++j) {
      bounds[j]   = Math.min(bounds[j],   coords[i+j])
      bounds[2+j] = Math.max(bounds[2+j], coords[i+j])
    }
  }

  return BOUNDARIES[glyph] = {
    coords:  coords,
    normals: normals,
    bounds:  bounds
  }
}


var VERTEX_SIZE       = 9
var VERTEX_SIZE_BYTES = VERTEX_SIZE * 4

function GLScatterFancy(
    plot,
    shader,
    pickShader,
    positionBuffer,
    offsetBuffer,
    colorBuffer,
    idBuffer) {
  this.plot           = plot
  this.shader         = shader
  this.pickShader     = pickShader
  this.positionBuffer = positionBuffer
  this.offsetBuffer   = offsetBuffer
  this.colorBuffer    = colorBuffer
  this.idBuffer       = idBuffer
  this.bounds         = [Infinity, Infinity, -Infinity, -Infinity]
  this.numPoints      = 0
  this.numVertices    = 0
  this.pickOffset     = 0
  this.points         = null
}

var proto = GLScatterFancy.prototype

;(function() {
  var MATRIX = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ];

  var PIXEL_SCALE = [1, 1]

  function calcScales() {
    var plot          = this.plot
    var bounds        = this.bounds

    var viewBox     = plot.viewBox
    var dataBox     = plot.dataBox
    var pixelRatio  = plot.pixelRatio

    var boundX  = bounds[2] - bounds[0]
    var boundY  = bounds[3] - bounds[1]
    var dataX   = dataBox[2] - dataBox[0]
    var dataY   = dataBox[3] - dataBox[1]

    MATRIX[0] = 2.0 * boundX / dataX
    MATRIX[4] = 2.0 * boundY / dataY
    MATRIX[6] = 2.0 * (bounds[0] - dataBox[0]) / dataX - 1.0
    MATRIX[7] = 2.0 * (bounds[1] - dataBox[1]) / dataY - 1.0

    var screenX = (viewBox[2] - viewBox[0])
    var screenY = (viewBox[3] - viewBox[1])

    PIXEL_SCALE[0] = 2.0 * pixelRatio / screenX
    PIXEL_SCALE[1] = 2.0 * pixelRatio / screenY
  }

  proto.draw = function() {
    var plot          = this.plot
    var shader        = this.shader
    var numVertices   = this.numVertices

    var gl          = plot.gl

    calcScales.call(this)

    shader.bind()

    shader.uniforms.pixelScale = PIXEL_SCALE
    shader.uniforms.viewTransform = MATRIX

    this.positionBuffer.bind()
    shader.attributes.position.pointer()

    this.offsetBuffer.bind()
    shader.attributes.offset.pointer()

    this.colorBuffer.bind()
    shader.attributes.color.pointer(gl.UNSIGNED_BYTE, true)

    gl.drawArrays(gl.TRIANGLES, 0, numVertices)
  }

  var PICK_OFFSET = [0,0,0,0]

  proto.drawPick = function(offset) {
    var plot          = this.plot
    var shader        = this.pickShader
    var numVertices   = this.numVertices

    var gl          = plot.gl

    this.pickOffset = offset

    for(var i=0; i<4; ++i) {
      PICK_OFFSET[i] = ((offset>>(i*8)) & 0xff)
    }

    calcScales.call(this)

    shader.bind()

    shader.uniforms.pixelScale    = PIXEL_SCALE
    shader.uniforms.viewTransform = MATRIX
    shader.uniforms.pickOffset    = PICK_OFFSET

    this.positionBuffer.bind()
    shader.attributes.position.pointer()

    this.offsetBuffer.bind()
    shader.attributes.offset.pointer()

    this.idBuffer.bind()
    shader.attributes.id.pointer(gl.UNSIGNED_BYTE, false)

    gl.drawArrays(gl.TRIANGLES, 0, numVertices)

    return offset + this.numPoints
  }
})()

proto.pick = function(x, y, value) {
  var pickOffset = this.pickOffset
  var pointCount = this.numPoints
  if(value < pickOffset || value >= pickOffset + pointCount) {
    return null
  }
  var pointId = value - pickOffset
  var points   = this.points
  return {
    object:     this,
    pointId:    pointId,
    dataCoord: [ points[2*pointId], points[2*pointId+1] ]
  }
}

proto.update = function(options) {
  options = options || {}

  var positions     = options.positions    || []
  var colors        = options.colors       || []
  var glyphs        = options.glyphs       || []
  var sizes         = options.sizes        || []
  var borderWidths  = options.borderWidths || []
  var borderColors  = options.borderColors || []

  this.points = positions

  var bounds = this.bounds = [Infinity, Infinity, -Infinity, -Infinity]
  var numVertices = 0
  for(var i=0; i<glyphs.length; ++i) {
    numVertices += (
      textCache('sans-serif', glyphs[i]).data.length +
      getBoundary(glyphs[i]).coords.length
    )>> 1
    for(var j=0; j<2; ++j) {
      bounds[j]   = Math.min(bounds[j],   positions[2*i+j])
      bounds[2+j] = Math.max(bounds[2+j], positions[2*i+j])
    }
  }

  if(bounds[0] === bounds[2]) {
    bounds[2] += 1
  }
  if(bounds[3] === bounds[1]) {
    bounds[3] += 1
  }

  var sx = 1/(bounds[2] - bounds[0])
  var sy = 1/(bounds[3] - bounds[1])
  var tx = bounds[0]
  var ty = bounds[1]

  var v_position = pool.mallocFloat32(2 * numVertices)
  var v_offset   = pool.mallocFloat32(2 * numVertices)
  var v_color    = pool.mallocUint8(4 * numVertices)
  var v_ids      = pool.mallocUint32(numVertices)
  var ptr = 0

  for(var i=0; i<glyphs.length; ++i) {
    var glyph = textCache('sans-serif', glyphs[i])
    var border = getBoundary(glyphs[i])
    var x = sx * (positions[2*i]   - tx)
    var y = sy * (positions[2*i+1] - ty)
    var s = sizes[i]
    var r = colors[4*i]   * 255.0
    var g = colors[4*i+1] * 255.0
    var b = colors[4*i+2] * 255.0
    var a = colors[4*i+3] * 255.0

    var gx = 0.5*(border.bounds[0] + border.bounds[2])
    var gy = 0.5*(border.bounds[1] + border.bounds[3])

    for(var j=0; j<glyph.data.length; j+=2) {
      v_position[2*ptr]   = x
      v_position[2*ptr+1] = y
      v_offset[2*ptr]     = -s * (glyph.data[j]   - gx)
      v_offset[2*ptr+1]   = -s * (glyph.data[j+1] - gy)
      v_color[4*ptr]      = r
      v_color[4*ptr+1]    = g
      v_color[4*ptr+2]    = b
      v_color[4*ptr+3]    = a
      v_ids[ptr]          = i

      ptr += 1
    }

    var w = borderWidths[i]
    r = borderColors[4*i]   * 255.0
    g = borderColors[4*i+1] * 255.0
    b = borderColors[4*i+2] * 255.0
    a = borderColors[4*i+3] * 255.0

    for(var j=0; j<border.coords.length; j+=2) {
      v_position[2*ptr]   = x
      v_position[2*ptr+1] = y
      v_offset[2*ptr]     = -(s*(border.coords[j]  -gx)+w*border.normals[j])
      v_offset[2*ptr+1]   = -(s*(border.coords[j+1]-gy)+w*border.normals[j+1])
      v_color[4*ptr]      = r
      v_color[4*ptr+1]    = g
      v_color[4*ptr+2]    = b
      v_color[4*ptr+3]    = a
      v_ids[ptr]          = i

      ptr += 1
    }
  }

  this.numPoints = glyphs.length
  this.numVertices = numVertices

  this.positionBuffer.update(v_position)
  this.offsetBuffer.update(v_offset)
  this.colorBuffer.update(v_color)
  this.idBuffer.update(v_ids)

  pool.free(v_position)
  pool.free(v_offset)
  pool.free(v_color)
  pool.free(v_ids)
}

proto.dispose = function() {
  this.shader.dispose()
  this.pickShader.dispose()
  this.positionBuffer.dispose()
  this.offsetBuffer.dispose()
  this.colorBuffer.dispose()
  this.idBuffer.dispose()
  this.plot.removeObject(this)
}

function createFancyScatter2D(plot, options) {
  var gl = plot.gl

  var shader      = createShader(gl, shaders.vertex,     shaders.fragment)
  var pickShader  = createShader(gl, shaders.pickVertex, shaders.pickFragment)

  var positionBuffer  = createBuffer(gl)
  var offsetBuffer    = createBuffer(gl)
  var colorBuffer     = createBuffer(gl)
  var idBuffer        = createBuffer(gl)

  var scatter = new GLScatterFancy(
    plot,
    shader,
    pickShader,
    positionBuffer,
    offsetBuffer,
    colorBuffer,
    idBuffer)

  scatter.update(options)

  plot.addObject(scatter)

  return scatter
}
