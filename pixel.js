/* =========================================================================
 * pixel.js — utilitários de pixel art procedural
 *  - sprite(): pinta em grade e gera contorno automático
 *  - fonte bitmap 3x5 para letreiros neon dentro do Canvas
 * ========================================================================= */
(function (AF) {
  'use strict';

  var rgbCache = {};
  function hexToRgb(hex) {
    if (rgbCache[hex]) return rgbCache[hex];
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    var v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache[hex] = v;
    return v;
  }

  var FONT = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
    E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
    I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
    M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
    Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
    Y: '101101010010010', Z: '111001010100111',
    '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
    '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010',
    '8': '111101111101111', '9': '111101111001110',
    '-': '000000111000000', '.': '000000000000010', ':': '000010000010000', '!': '010010010000010',
    '/': '001001010100100', '|': '010010010010010', '?': '111001010000010', '<': '001010100010001', '>': '100010001010100', ' ': '000000000000000',
    '+': '000010111010000', '=': '000111000111000'
  };

  var P = AF.Pix = {
    hexToRgb: hexToRgb,

    canvas: function (w, h) {
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      return c;
    },

    /* Pinta numa grade w×h; outline=true adiciona contorno escuro automático */
    sprite: function (w, h, paint, outline, outlineColor) {
      var grid = new Array(w * h).fill(null);
      var api = {
        w: w, h: h,
        px: function (x, y, c) { if (c && x >= 0 && y >= 0 && x < w && y < h) grid[y * w + x] = c; },
        rect: function (x, y, rw, rh, c) {
          for (var j = 0; j < rh; j++) for (var i = 0; i < rw; i++) api.px(x + i, y + j, c);
        },
        get: function (x, y) { return (x >= 0 && y >= 0 && x < w && y < h) ? grid[y * w + x] : null; },
        clear: function (x, y) { if (x >= 0 && y >= 0 && x < w && y < h) grid[y * w + x] = null; }
      };
      paint(api);
      if (outline) {
        var oc = outlineColor || AF.PAL.outline;
        var src = grid.slice();
        for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
          if (src[y * w + x]) continue;
          var n = (x > 0 && src[y * w + x - 1]) || (x < w - 1 && src[y * w + x + 1]) ||
                  (y > 0 && src[(y - 1) * w + x]) || (y < h - 1 && src[(y + 1) * w + x]);
          if (n) grid[y * w + x] = oc;
        }
      }
      var c = P.canvas(w, h);
      var ctx = c.getContext('2d');
      var img = ctx.createImageData(w, h);
      for (var k = 0; k < grid.length; k++) {
        if (!grid[k]) continue;
        var rgb = hexToRgb(grid[k]);
        img.data[k * 4] = rgb[0]; img.data[k * 4 + 1] = rgb[1]; img.data[k * 4 + 2] = rgb[2]; img.data[k * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      return c;
    },

    /* Pinta pixel a pixel via função fn(x,y) -> cor (ou null) */
    field: function (w, h, fn) {
      var c = P.canvas(w, h);
      var ctx = c.getContext('2d');
      var img = ctx.createImageData(w, h);
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var col = fn(x, y);
        if (!col) continue;
        var rgb = hexToRgb(col), k = (y * w + x) * 4;
        img.data[k] = rgb[0]; img.data[k + 1] = rgb[1]; img.data[k + 2] = rgb[2]; img.data[k + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      return c;
    },

    flipH: function (src) {
      var c = P.canvas(src.width, src.height);
      var ctx = c.getContext('2d');
      ctx.translate(src.width, 0); ctx.scale(-1, 1);
      ctx.drawImage(src, 0, 0);
      return c;
    },

    /* Gerador pseudoaleatório determinístico (mulberry32) */
    rng: function (seed) {
      var a = seed >>> 0;
      return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        var t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    hash: function (x, y) {
      var h = (x * 374761393 + y * 668265263) >>> 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      return (h ^ (h >>> 16)) >>> 0;
    },

    /* Retângulo rápido num contexto 2D */
    R: function (ctx) {
      return function (x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    },

    /* Texto em fonte bitmap 3x5 */
    text: function (ctx, str, x, y, color, scale) {
      scale = scale || 1;
      ctx.fillStyle = color;
      str = String(str).toUpperCase();
      for (var i = 0; i < str.length; i++) {
        var g = FONT[str[i]] || FONT[' '];
        for (var j = 0; j < 15; j++) {
          if (g[j] === '1') ctx.fillRect(x + (j % 3) * scale + i * 4 * scale, y + Math.floor(j / 3) * scale, scale, scale);
        }
      }
    },
    textWidth: function (str, scale) { return (String(str).length * 4 - 1) * (scale || 1); },

    shade: function (hex, amt) {
      var c = hexToRgb(hex);
      var f = function (v) { return Math.max(0, Math.min(255, Math.round(v + amt))); };
      return '#' + [f(c[0]), f(c[1]), f(c[2])].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join('');
    }
  };
})(window.AF);
