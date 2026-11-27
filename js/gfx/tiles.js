/* =========================================================================
 * tiles.js — tiles de chão 16×16 (calçada portuguesa, paralelepípedo,
 * asfalto maglev, Baía de Todos os Santos, escarpa, pisos da Torre...)
 * ========================================================================= */
(function (AF) {
  'use strict';
  var P = AF.Pix, T = 16;
  var cache = {};

  function mod(n, m) { return ((n % m) + m) % m; }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function foamTile(frame, side) {
    return P.field(T, T, function (px, py) {
      var x = side ? py : px, y = side ? px : py;
      var edge = 7 + Math.round(2 * Math.sin((x + frame * 3) / 2.6)) + (frame % 2);
      if (y < edge - 3) return mod(x + y, 7) === 0 ? '#8e7c64' : '#8a7860';    /* areia molhada */
      if (y < edge) return '#6e6a7e';
      if (y === edge) return '#e8f6ff';
      if (y === edge + 1) return mod(x + frame, 3) ? '#9adcf0' : '#e8f6ff';
      if (y === edge + 2) return '#2a5a8a';
      return ((px + py * 3 + frame) % 11 === 0) ? '#0f2048' : '#0a1736';
    });
  }

  var MAKERS = {
    /* Calçada portuguesa em ondas — marca de Salvador */
    calcada: function (v) {
      var r = P.rng(101 + v * 17);
      return P.field(T, T, function (x, y) {
        var w = y + 2.6 * Math.sin(2 * Math.PI * x / 16);
        var band = mod(Math.floor(w / 4), 2);
        var cube = ((x >> 1) + (y >> 1)) % 2 === 0;
        var n = r();
        if (band === 0) return n < 0.1 ? '#8f88ad' : (cube && n < 0.45 ? '#a8a1c4' : '#b4adcf');
        return n < 0.1 ? '#363250' : (cube && n < 0.45 ? '#25223a' : '#2b2843');
      });
    },
    /* Paralelepípedo do Comércio / Pelourinho */
    cobble: function (v) {
      var r = P.rng(202 + v * 31);
      var offs = [0, 3, 7, 2];
      var shades = [];
      for (var i = 0; i < 12; i++) shades.push(pick(r, ['#45405c', '#4c4766', '#3e3954', '#524b6c', '#48425f']));
      return P.field(T, T, function (x, y) {
        var row = y >> 2, yy = y & 3;
        if (yy === 3) return '#1d1a2b';
        var rel = mod(x - offs[row], 16);
        if (rel === 0 || rel === 5 || rel === 11) return '#1d1a2b';
        var idx = row * 3 + (rel < 5 ? 0 : (rel < 11 ? 1 : 2));
        var base = shades[idx];
        if (yy === 0) return P.shade(base, 18);
        if (yy === 2 && (rel === 4 || rel === 10 || rel === 15)) return P.shade(base, -14);
        return r() < 0.06 ? P.shade(base, -10) : base;
      });
    },
    asphalt: function (v) {
      var r = P.rng(303 + v * 7);
      return P.field(T, T, function () {
        var n = r();
        return n < 0.08 ? '#272639' : (n < 0.14 ? '#141320' : '#1b1a2a');
      });
    },
    lane: function () {
      var r = P.rng(404);
      return P.field(T, T, function (x, y) {
        if ((y === 7 || y === 8) && x < 9) return y === 7 ? '#3ff0ff' : '#00a9c4';
        var n = r();
        return n < 0.08 ? '#272639' : (n < 0.14 ? '#141320' : '#1b1a2a');
      });
    },
    seawall: function (v) {
      var r = P.rng(505 + v);
      return P.field(T, T, function (x, y) {
        if (y === 0) return '#7a7594';
        if (y === 1) return '#625d7c';
        if (x === (v ? 3 : 11)) return '#3a3650';
        return r() < 0.1 ? '#4e4a66' : '#56526f';
      });
    },
    rail: function () {
      return P.field(T, T, function (x, y) {
        if (y <= 2) return y === 0 ? '#7a7594' : '#56526f';
        if (y <= 4) return y === 3 ? '#b8b2d0' : '#8f89a8';
        if (y >= 13) return y === 13 ? '#6a6484' : '#4a4562';
        if (x % 4 === 1 || x % 4 === 2) return x % 4 === 1 ? '#9a94b4' : '#716b8c';
        return (y + x) % 5 === 0 ? '#1a3070' : '#0d1a3e';
      });
    },
    water: function (frame) {
      var r = P.rng(606);
      var spots = [];
      for (var i = 0; i < 7; i++) spots.push([Math.floor(r() * 16), Math.floor(r() * 16), 2 + Math.floor(r() * 4)]);
      return P.field(T, T, function (x, y) {
        for (var k = 0; k < spots.length; k++) {
          var sx = mod(spots[k][0] + frame * 2 + (k % 2 ? -frame : 0), 16), sy = spots[k][1];
          if (y === sy && mod(x - sx, 16) < spots[k][2]) return k === 3 ? '#5a2a7a' : (k === 5 ? '#0d5a7a' : '#1b3a7c');
        }
        return ((x + y * 3 + frame) % 11 === 0) ? '#0f2048' : '#0a1736';
      });
    },
    cliff: function (v) {
      var r = P.rng(707 + v * 13);
      var bush = [];
      for (var i = 0; i < 4; i++) bush.push([Math.floor(r() * 16), Math.floor(r() * 16), 2 + Math.floor(r() * 4)]);
      var cable = v % 3 === 0 ? 3 + Math.floor(r() * 10) : -1;
      return P.field(T, T, function (x, y) {
        if (x === cable) return (y % 4 === 0) ? '#3ff0ff' : '#0a6f84';
        for (var k = 0; k < bush.length; k++) {
          var dx = x - bush[k][0], dy = y - bush[k][1], rr = bush[k][2];
          if (dx * dx + dy * dy <= rr * rr) {
            if (dy < -rr / 2 && dx < 0) return '#4fa86e';
            return (dx + dy) % 3 === 0 ? '#1f5a3f' : '#2c744e';
          }
        }
        if (y % 5 === 0) return '#2a1f2c';
        return r() < 0.15 ? '#463644' : '#3a2c3a';
      });
    },
    planter: function () {
      return P.field(T, T, function (x, y) {
        if (y < 3) return y === 0 ? '#8a849f' : '#6a6484';
        if (y > 13) return '#3a3650';
        if (x < 1 || x > 14) return '#5a5672';
        var d = (x * 7 + y * 13) % 9;
        return d === 0 ? '#4fa86e' : (d < 4 ? '#2c744e' : '#1f5a3f');
      });
    },

    /* ---------- Prainha da Baía ---------- */
    sand: function (v) {
      var r = P.rng(1313 + v * 19);
      var shells = v === 2 ? [[4, 9], [11, 4]] : (v === 3 ? [[8, 12]] : []);
      return P.field(T, T, function (x, y) {
        for (var k = 0; k < shells.length; k++) {
          var dx = x - shells[k][0], dy = y - shells[k][1];
          if (dx >= 0 && dx < 2 && dy >= 0 && dy < 2) return dx + dy === 0 ? '#f4e8ff' : '#c8b8d8';
        }
        var rip = mod(y * 2 + Math.round(2 * Math.sin((x + v * 5) / 3)), 9) === 0;
        var n = r();
        if (rip) return '#9a8a74';
        return n < 0.07 ? '#c9b48e' : (n < 0.16 ? '#8e7c64' : '#a8957a');
      });
    },
    /* espuma da maré: água embaixo (foam) ou à direita (foam_r) */
    foam: function (frame) { return foamTile(frame, false); },
    foam_r: function (frame) { return foamTile(frame, true); },
    stairs: function () {
      return P.field(T, T, function (x, y) {
        var step = y & 3;
        if (step === 0) return '#9a94b4';
        if (step === 3) return '#3a3650';
        return x === 0 || x === 15 ? '#4a4562' : '#6e6888';
      });
    },
    quay: function (v) {
      var r = P.rng(1414 + v);
      return P.field(T, T, function (x, y) {
        if (y === 0) return '#7a7594';
        if (y >= 13) return y === 13 ? '#2a2638' : '#6a5a48';
        var row = y >> 2, off = row % 2 ? 4 : 0;
        if ((y & 3) === 0 || mod(x + off, 8) === 0) return '#2e2a40';
        return r() < 0.12 ? '#4e4a66' : '#45415c';
      });
    },

    /* ---------- Jacobina (Piemonte da Diamantina) ---------- */
    terra: function (v) {
      var r = P.rng(2121 + v * 31);
      var peb = v === 1 ? [[3, 11], [12, 5]] : (v === 3 ? [[9, 9]] : []);
      return P.field(T, T, function (x, y) {
        for (var k = 0; k < peb.length; k++) {
          var dx = x - peb[k][0], dy = y - peb[k][1];
          if (dx >= 0 && dx < 2 && dy >= 0 && dy < 2) return dy === 0 ? '#b89a7a' : '#6a4a38';
        }
        var n = r();
        if (n < 0.06) return '#8a5a3a';
        if (n < 0.14) return '#5a3426';
        return mod(x * 3 + y * 5 + v, 13) === 0 ? '#6e3e2c' : '#74432e';
      });
    },
    grama: function (v) {
      var r = P.rng(2323 + v * 17);
      return P.field(T, T, function (x, y) {
        var n = r();
        var blade = mod(x * 7 + y * 3 + v * 5, 9) === 0 && y > 2;
        if (blade) return n < 0.5 ? '#c8a84a' : '#a8883a';
        if (n < 0.1) return '#7a6a34';
        return n < 0.55 ? '#6e5a2e' : '#66522a';
      });
    },
    trilha: function (v) {
      var r = P.rng(2525 + v);
      return P.field(T, T, function (x, y) {
        var n = r();
        if (n < 0.05) return '#d8c0a0';
        if (n < 0.14) return '#a88a6a';
        return n < 0.6 ? '#b8987a' : '#b09074';
      });
    },
    ponte: function () {
      return P.field(T, T, function (x, y) {
        if (x === 0 || x === 15) return '#3a2418';
        if (x === 1 || x === 14) return '#8a5a34';
        if ((y & 3) === 3) return '#2e1c12';
        return mod(x + (y >> 2) * 5, 11) === 0 ? '#5a3a24' : '#6e4a2c';
      });
    },

    /* ---------- Sala do Computador Quântico (blindada e isolada) ---------- */
    shield_face: function (v) {                 /* painéis de mu-metal e malha de cobre */
      return P.field(T, T, function (x, y) {
        if (y <= 1) return y === 0 ? '#8a6a4a' : '#5a4030';
        if (y >= 14) return y === 14 ? '#1a120c' : '#2a1c14';
        var px = x % 8, py = (y - 2) % 6;
        if (px === 0 || py === 0) return '#3a2a1e';
        if ((px === 1 || px === 7) && (py === 1 || py === 5)) return '#e8c080';      /* rebites */
        if (v === 1 && x >= 9 && x <= 14 && y >= 4 && y <= 6) return y === 5 ? '#00e5ff' : '#0a2238';  /* sensor */
        return (x + y) % 5 === 0 ? '#9a6a3e' : (py < 3 ? '#8a5a34' : '#7a4e2e');
      });
    },
    shield_top: function () {
      return P.field(T, T, function (x, y) {
        if (x % 4 === 0 || y % 4 === 0) return '#3a2616';
        return '#1a120c';
      });
    },
    iso: function (v) {                         /* piso flutuante sobre amortecedores */
      return P.field(T, T, function (x, y) {
        if (x === 0 || y === 0) return '#05060c';                                   /* junta de dilatação */
        if (x === 1 || y === 1) return '#3a4268';
        if ((x === 3 && y === 3) || (x === 12 && y === 12)) return v === 1 ? '#00e5ff' : '#1a6a7e';
        return ((x * 7 + y * 3) % 23 === 0) ? '#2a3152' : '#232a46';
      });
    },
    porta: function () {                        /* porta externa da antecâmara (aberta) */
      return P.field(T, T, function (x, y) {
        if (y <= 1 || y >= 14) return mod(x + y, 6) < 3 ? '#ffc940' : '#1a1820';
        if (x === 0 || x === 15) return '#3a4470';
        return (y % 4 === 0) ? '#1d2240' : '#262c48';
      });
    },

    /* ---------- Interior da Torre ---------- */
    wall_face: function (v) {
      var r = P.rng(808 + v * 11);
      var trace = 2 + Math.floor(r() * 12);
      return P.field(T, T, function (x, y) {
        if (y <= 2) return y === 0 ? '#3a4470' : '#2b3458';
        if (y >= 14) return y === 14 ? '#0e1226' : '#171c34';
        if (v === 1 && x >= 4 && x <= 11 && y >= 5 && y <= 10) {      // monitor de parede
          if (x === 4 || x === 11 || y === 5 || y === 10) return '#0e1226';
          return (y === 7 && x > 5 && x < 10) ? '#ff3fa4' : '#0b2a3e';
        }
        if (v === 2 && y >= 5 && y <= 10 && (x === 3 || x === 12)) return '#0e1226';
        if (v === 2 && y >= 6 && y <= 9 && x > 3 && x < 12 && y % 2 === 0) return '#151a30';
        if (x === trace && y > 2 && y < 14) return (y % 3 === 0) ? '#3ff0ff' : '#0b7a92';
        if (y === 8 && x > trace && x < trace + 4) return '#0b7a92';
        if (x === 0 || x === 15) return '#1a2040';
        return '#222a48';
      });
    },
    wall_top: function () {
      return P.field(T, T, function (x, y) {
        if (x === 0 || y === 0) return '#171b34';
        return ((x + y) % 8 === 0) ? '#12152b' : '#0d1022';
      });
    },
    floor: function (v) {
      var r = P.rng(909 + v * 5);
      var lamp = v === 3;
      return P.field(T, T, function (x, y) {
        if (x % 8 === 0 || y % 8 === 0) return '#191d31';
        if (x % 8 === 1 && y % 8 === 1) return '#3a4262';
        if (lamp && x >= 6 && x <= 9 && (y === 4 || y === 11)) return '#0b7a92';
        return r() < 0.05 ? '#2a304a' : '#242a42';
      });
    },
    lab: function (v) {
      var r = P.rng(1010 + v);
      return P.field(T, T, function (x, y) {
        if (x === 0 || y === 0) return '#3a4468';
        if (x === 15 || y === 15) return '#262e4a';
        if (v === 1 && x === 8) return '#1d6f86';
        return r() < 0.04 ? '#323b5c' : '#2d3553';
      });
    },
    wood: function (v) {
      var r = P.rng(1111 + v * 3);
      var cols = ['#4a2f26', '#553629', '#432a22', '#4e3226'];
      return P.field(T, T, function (x, y) {
        var row = y >> 2;
        if ((y & 3) === 3) return '#2a1a16';
        var cut = mod(row * 5 + v * 3, 16);
        if (x === cut) return '#2a1a16';
        var c = cols[mod(row + (x > cut ? 1 : 0) + v, 4)];
        return r() < 0.12 ? P.shade(c, -10) : c;
      });
    },
    /* casa colorida da Ribeira: parede de reboco pintado, rodapé e azulejo */
    casa_face: function (v) {
      var r = P.rng(1313 + v * 7);
      var c = '#e8a838';                                                                              /* amarelo-ouro, como os casarões */
      return P.field(T, T, function (x, y) {
        if (y === 0) return '#f2eee0';
        if (y === 1) return P.shade(c, -26);
        if (y >= 13) return y === 13 ? '#f2eee0' : (((x >> 2) + (y & 1)) % 2 ? '#2a5aa0' : '#e8ecf6');    /* barrado de azulejo */
        if (v === 1 && x >= 4 && x <= 11 && y >= 4 && y <= 10) {                                       /* janela de madeira */
          if (x === 4 || x === 11 || y === 4 || y === 10) return '#f2eee0';
          return (x === 7 || x === 8) ? '#5a3a24' : (y % 2 ? '#7a5034' : '#6a4228');
        }
        return r() < 0.08 ? P.shade(c, -10) : (r() < 0.05 ? P.shade(c, 12) : c);
      });
    },
    casa_top: function () {
      return P.field(T, T, function (x, y) {
        var row = y >> 2;
        if ((y & 3) === 3) return '#6a2a1a';
        return ((x + row * 2) % 6 === 0) ? '#8a3a22' : '#b0502e';                                     /* telhado de barro */
      });
    },
    piso_casa: function (v) {
      var r = P.rng(1414 + v);
      return P.field(T, T, function (x, y) {
        var a = ((x >> 3) + (y >> 3)) % 2;
        if (x % 8 === 0 || y % 8 === 0) return '#8a3a2a';
        var c = a ? '#c8603e' : '#b45436';                                                           /* lajota vermelha */
        return r() < 0.06 ? P.shade(c, -12) : c;
      });
    },
    porta_casa: function () {
      return P.field(T, T, function (x, y) {
        if (x <= 1 || x >= 14) return '#5a3a24';
        if (y <= 1) return '#5a3a24';
        return (y % 4 === 0) ? '#8a5a34' : '#a06a3e';
      });
    },
    nucleo: function (frame) {
      return P.field(T, T, function (x, y) {
        var onGrid = x % 8 === 0 || y % 8 === 0;
        if (x % 8 === 0 && y % 8 === 0) return (frame % 2) ? '#ff3fa4' : '#a8186a';
        if (onGrid) return ((x + y + frame * 2) % 8 < 2) ? '#4a2a8a' : '#1d1a4a';
        return '#0c0f26';
      });
    },
    ruido: function (frame) {
      var r = P.rng(1212 + frame * 97);
      return P.field(T, T, function (x, y) {
        var crack = (x === 4 + (y >> 2) || y === 11 - (x >> 3) || (x === 12 && y > 5 && y < 13));
        var n = r();
        if (n < 0.07) return pick(r, ['#ff3fa4', '#00e5ff', '#e8e6ff', '#7a1a5a']);
        if (crack) return '#08080f';
        if (x % 8 === 0 || y % 8 === 0) return '#1a1530';
        return n < 0.3 ? '#2a1838' : '#221a36';
      });
    },
    field: function (frame) {
      return P.field(T, T, function (x, y) {
        var band = mod(x + y * 0 - frame * 2, 6);
        if (y === 0 || y === 15) return '#3a4470';
        if (band === 0) return '#7af9ff';
        if (band === 1) return '#00c8e6';
        return ((y + frame) % 4 === 0) ? '#0a6f84' : '#073f52';
      });
    },
    exit: function () {
      return P.field(T, T, function (x, y) {
        if (y >= 12) return mod(x + y, 6) < 3 ? '#ffc940' : '#1a1820';
        if (x % 8 === 0 || y % 8 === 0) return '#191d31';
        return '#242a42';
      });
    }
  };

  var VARIANTS = { casa_face: 2, piso_casa: 2, calcada: 4, cobble: 4, asphalt: 4, seawall: 2, cliff: 6, wall_face: 3, floor: 4, lab: 2, wood: 4, sand: 4, quay: 2, terra: 4, grama: 4, trilha: 2, shield_face: 2, iso: 2 };
  var FRAMES = { water: 4, nucleo: 4, ruido: 4, field: 4, foam: 4, foam_r: 4 };

  AF.Tiles = {
    init: function () {
      Object.keys(MAKERS).forEach(function (k) {
        var n = VARIANTS[k] || FRAMES[k] || 1;
        cache[k] = [];
        for (var i = 0; i < n; i++) cache[k].push(MAKERS[k](i));
      });
    },
    isAnimated: function (k) { return !!FRAMES[k]; },
    variants: function (k) { return cache[k] ? cache[k].length : 0; },
    get: function (k, i) {
      var arr = cache[k];
      if (!arr) return null;
      return arr[mod(i, arr.length)];
    }
  };
})(window.AF);
