/* =========================================================================
 * art.js — prédios e objetos em pixel art (Cidade Alta barroca, Elevador
 * Lacerda como "Espinhaço" de dados, Torre da Afrotech, Mercado, mobília
 * da Torre, criostato, Núcleo...). Tudo desenhado por código.
 * ========================================================================= */
(function (AF) {
  'use strict';
  var P = AF.Pix, PAL = AF.PAL;
  var cache = {};

  function mk(w, h, fn) {
    var c = P.canvas(w, h);
    var ctx = c.getContext('2d');
    fn(ctx, P.R(ctx), w, h);
    return c;
  }
  function disc(r, cx, cy, rad, col) {
    for (var y = -rad; y <= rad; y++) for (var x = -rad; x <= rad; x++) {
      if (x * x + y * y <= rad * rad + rad * 0.6) r(cx + x, cy + y, 1, 1, col);
    }
  }
  function ring(r, cx, cy, rad, col) {
    for (var a = 0; a < 360; a += 3) {
      var x = Math.round(cx + Math.cos(a * Math.PI / 180) * rad);
      var y = Math.round(cy + Math.sin(a * Math.PI / 180) * rad);
      r(x, y, 1, 1, col);
    }
  }

  /* ---------- Cidade Alta: casarões barrocos + igreja ---------- */
  function house(ctx, r, x, w, col, rng) {
    r(x, 2, w, 6, '#6e3024');
    for (var yy = 3; yy < 8; yy += 2) r(x, yy, w, 1, '#8a3e2e');
    r(x, 2, w, 1, '#a8503a');
    r(x, 8, w, 40, col);
    r(x, 8, 1, 40, P.shade(col, 22)); r(x + w - 1, 8, 1, 40, P.shade(col, -34));
    r(x, 8, w, 2, '#c4bdac'); r(x, 44, w, 4, P.shade(col, -28));
    [13, 28].forEach(function (wy, floor) {
      for (var wx = x + 5; wx + 6 <= x + w - 3; wx += 10) {
        var n = rng();
        var glass = n < 0.34 ? '#ffcf6a' : (n < 0.42 ? '#ff3fa4' : (n < 0.5 ? '#3ff0ff' : '#1b2244'));
        r(wx - 1, wy - 1, 7, 11, '#d8d2c0');
        r(wx, wy, 5, 9, glass);
        r(wx - 1, wy - 1, 1, 1, col); r(wx + 5, wy - 1, 1, 1, col);
        r(wx + 2, wy, 1, 9, '#a8a294'); r(wx, wy + 4, 5, 1, '#a8a294');
        if (floor === 0) { r(wx - 2, wy + 9, 9, 1, '#2a2030'); r(wx - 2, wy + 7, 1, 2, '#2a2030'); r(wx + 6, wy + 7, 1, 2, '#2a2030'); }
      }
    });
    if (w >= 48 && rng() < 0.55) {
      var words = ['BAHIA', '2495', 'AFRO', 'ODARA', 'QBIT'];
      var word = words[Math.floor(rng() * words.length)];
      var neon = rng() < 0.5 ? PAL.magenta : PAL.cyan;
      var tw = P.textWidth(word);
      r(x + 3, 37, tw + 4, 7, '#1a0a2a'); P.text(ctx, word, x + 5, 38, neon);
    }
  }
  function church(ctx, r, x) {
    var wt = '#c8c1b2', wd = '#9a9384', az = '#3a6ab8';
    [x, x + 64].forEach(function (tx) {
      r(tx + 5, 0, 6, 2, az); r(tx + 3, 2, 10, 3, az); r(tx + 2, 5, 12, 3, '#2f58a0');
      r(tx + 1, 8, 14, 40, wt); r(tx + 14, 8, 1, 40, wd);
      r(tx + 5, 13, 6, 9, '#1b2244'); r(tx + 5, 13, 1, 1, wt); r(tx + 10, 13, 1, 1, wt);
      r(tx + 7, 15, 2, 3, '#ffc940');
      r(tx + 5, 30, 6, 8, '#ffcf6a');
    });
    r(x + 16, 12, 48, 36, wt);
    r(x + 36, 4, 8, 2, wt); r(x + 30, 6, 20, 2, wt); r(x + 24, 8, 32, 2, wt); r(x + 18, 10, 44, 2, wt);
    r(x + 39, 0, 2, 5, PAL.gold); r(x + 37, 1, 6, 1, PAL.gold);
    disc(r, x + 40, 20, 5, '#3ff0ff'); disc(r, x + 40, 20, 3, '#0b5a72'); disc(r, x + 40, 20, 1, PAL.magenta);
    r(x + 34, 32, 12, 16, '#3a2218'); r(x + 35, 31, 10, 1, '#3a2218'); r(x + 39, 32, 2, 16, '#2a160f');
    r(x + 22, 28, 5, 8, '#ffcf6a'); r(x + 53, 28, 5, 8, '#ffcf6a');
    r(x + 16, 44, 48, 4, wd);
  }

  var MAKERS = {
    skyline: function () {
      return mk(640, 48, function (ctx, r) {
        var rng = P.rng(42);
        r(0, 0, 640, 48, '#120f2a');
        var facades = ['#b0873a', '#38609e', '#ab5c7a', '#33866a', '#b8b1a0', '#a0523a', '#74569e'];
        var x = 0, ci = 0;
        while (x < 640) {
          if (x >= 232 && x < 300 && ci >= 0) { church(ctx, r, x); x += 80; ci = -1; continue; }
          var w = 40 + Math.floor(rng() * 3) * 8;
          house(ctx, r, x, w, facades[Math.floor(rng() * facades.length)], rng);
          x += w;
        }
      });
    },

    elevador: function () {
      return mk(64, 144, function (ctx, r) {
        var c1 = '#d9d1c5', c2 = '#b8b0a4', c3 = '#8e867c', dk = '#16222c';
        r(14, 0, 36, 6, c2); r(16, 0, 32, 1, c1); r(30, 0, 4, 1, PAL.magenta);
        r(4, 6, 56, 20, c1); r(4, 6, 56, 2, '#efe8dc'); r(56, 6, 4, 20, c3); r(4, 24, 56, 2, c3);
        r(8, 12, 48, 7, '#0b2a3e');
        for (var i = 0; i < 8; i++) r(9 + i * 6, 13, 4, 5, i % 3 === 0 ? '#3ff0ff' : '#0b7a92');
        r(10, 26, 44, 94, c2); r(10, 26, 6, 94, c1); r(48, 26, 6, 94, c3);
        [18, 22, 41, 45].forEach(function (gx) { r(gx, 40, 1, 72, c3); });
        for (var y = 44; y < 112; y += 16) r(10, y, 44, 1, '#a39b90');
        r(28, 40, 2, 70, dk); r(34, 40, 2, 70, dk);
        r(15, 28, 34, 9, '#141428'); r(15, 28, 34, 1, PAL.cyanD); P.text(ctx, 'LACERDA', 19, 30, '#3ff0ff');
        r(14, 112, 36, 8, '#141428'); P.text(ctx, 'ELEVADOR', 17, 113, PAL.gold);
        r(6, 120, 52, 24, c1); r(6, 120, 52, 2, '#efe8dc'); r(54, 120, 4, 24, c3);
        r(20, 124, 24, 20, '#3a3a48'); r(22, 126, 20, 18, '#0b2a3e'); r(31, 126, 2, 18, '#3a3a48');
        r(22, 126, 20, 1, '#3ff0ff'); r(24, 130, 2, 10, '#0b5a72'); r(38, 130, 2, 10, '#0b5a72');
      });
    },

    torre: function () {
      return mk(192, 208, function (ctx, r) {
        var rng = P.rng(77);
        var glass = '#0e1530', grid = '#16224a', mag = PAL.magenta;
        r(94, 0, 4, 10, '#5a6488'); r(95, 0, 2, 3, mag);
        r(56, 10, 80, 8, '#141c3c'); r(56, 10, 80, 1, mag);
        r(48, 18, 96, 8, '#141c3c'); r(48, 18, 96, 1, mag);
        r(24, 26, 144, 128, glass);
        for (var y = 30; y < 150; y += 8) for (var x = 28; x < 164; x += 8) {
          var n = rng();
          r(x, y, 6, 5, n < 0.12 ? '#1d5f7a' : (n < 0.17 ? '#5a2a62' : (n < 0.2 ? '#7a6a34' : grid)));
        }
        r(24, 26, 2, 128, PAL.cyan); r(166, 26, 2, 128, PAL.cyan);
        r(26, 26, 1, 128, PAL.cyanD); r(165, 26, 1, 128, PAL.cyanD);
        r(60, 38, 72, 56, '#080c1c'); r(60, 38, 72, 1, PAL.cyanD); r(60, 93, 72, 1, PAL.cyanD);
        ring(r, 96, 58, 12, PAL.cyan); ring(r, 96, 58, 11, PAL.cyanD);
        disc(r, 96, 58, 3, PAL.cyanL);
        for (var a = 0; a < 360; a += 4) {
          var ex = Math.round(96 + Math.cos(a * Math.PI / 180) * 21), ey = Math.round(58 + Math.sin(a * Math.PI / 180) * 6);
          r(ex, ey, 1, 1, mag);
        }
        r(115, 55, 3, 3, PAL.gold);
        P.text(ctx, 'AFROTECH', 65, 78, PAL.gold, 2);
        r(0, 150, 192, 58, '#151c3a'); r(0, 150, 192, 2, '#3a4a80');
        r(0, 153, 192, 1, PAL.goldD); r(0, 164, 192, 1, PAL.gold);
        for (var dx = 4; dx < 188; dx += 8) {
          r(dx + 3, 155, 2, 1, PAL.gold); r(dx + 2, 156, 4, 1, PAL.gold); r(dx + 1, 157, 6, 2, PAL.gold);
          r(dx + 2, 159, 4, 1, PAL.gold); r(dx + 3, 160, 2, 1, PAL.gold); r(dx + 3, 157, 2, 2, '#151c3a');
        }
        r(10, 172, 44, 24, '#2a3460'); r(12, 174, 40, 20, '#05060f');
        r(138, 172, 44, 24, '#2a3460'); r(140, 174, 40, 20, '#05060f');
        r(60, 168, 72, 40, '#2a3460'); r(62, 170, 68, 2, '#4a5a90');
        r(64, 174, 64, 34, '#05060f');
      });
    },

    mercado: function () {
      return mk(128, 64, function (ctx, r) {
        var wall = '#a8946e', wl = '#c2ad84', wd = '#7a6a4e';
        r(0, 4, 128, 8, '#4a3a30'); r(0, 4, 128, 2, '#6a5444');
        r(44, 0, 40, 6, wall); r(48, 0, 32, 1, wl);
        r(0, 12, 128, 52, wall); r(0, 12, 128, 2, wl); r(126, 12, 2, 52, wd);
        r(34, 13, 60, 9, '#141428'); P.text(ctx, 'MERCADO MODELO', 37, 15, PAL.gold);
        for (var i = 0; i < 7; i++) {
          var ax = 5 + i * 17;
          r(ax, 28, 12, 22, '#2a1a14'); r(ax + 1, 27, 10, 1, '#2a1a14'); r(ax + 3, 26, 6, 1, '#2a1a14');
          r(ax + 2, 32, 8, 18, i % 2 ? '#ffcf6a' : '#d89a4a');
          r(ax + 2, 40, 8, 1, '#a8642a');
          r(ax, 50, 12, 2, wd);
        }
        r(0, 56, 128, 8, wd); r(0, 56, 128, 1, wl);
        var neon = [PAL.magenta, PAL.cyan, PAL.gold];
        for (var x = 2; x < 126; x += 6) r(x, 23 + ((x % 12) < 6 ? 0 : 1), 2, 2, neon[(x / 6 | 0) % 3]);
      });
    },

    palm: function () {
      return P.sprite(32, 44, function (g) {
        for (var y = 14; y < 44; y++) {
          var x = 14 + Math.round(Math.sin((43 - y) / 26) * 3);
          g.rect(x, y, 3, 1, (y % 3 === 0) ? '#4a3222' : '#6a4a32');
          g.px(x + 2, y, '#3a261a');
        }
        var dirs = [[-1, -0.35], [1, -0.35], [-1, 0.15], [1, 0.15], [-0.45, -1], [0.45, -1], [-0.8, 0.55], [0.8, 0.55]];
        dirs.forEach(function (d, k) {
          var cx = 16, cy = 13;
          for (var t = 0; t < 13; t++) {
            var px = Math.round(cx + d[0] * t), py = Math.round(cy + d[1] * t + t * t * 0.045);
            var col = t < 5 ? '#2c744e' : (k % 2 ? '#1f5a3f' : '#2c744e');
            g.px(px, py, col);
            if (t > 2 && t % 2 === 0) g.px(px, py + 1, '#1f5a3f');
            if (t < 4) g.px(px, py - 1, '#4fa86e');
          }
        });
        g.rect(14, 14, 2, 2, '#5a3a1a'); g.rect(17, 15, 2, 2, '#4a2e14');
      }, true);
    },

    /* Forte São Marcelo, no meio da baía, em frente ao Mercado Modelo */
    forte: function () {
      return mk(84, 66, function (ctx, r) {
        function ell(cx, cy, rx, ry, col) {
          for (var y = -ry; y <= ry; y++) {
            var hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
            r(cx - hw, cy + y, hw * 2 + 1, 1, col);
          }
        }
        ell(42, 58, 40, 7, '#0d2a4e');                    /* reflexo/espuma na água */
        ell(42, 57, 36, 5, '#e8f6ff'); ell(42, 57, 34, 4, '#123a64');
        /* muralha circular */
        for (var y = 30; y <= 56; y++) {
          var t = (y - 30) / 26;
          ell(42, y, 35, 6, t < 0.08 ? '#a8a0b8' : (y % 5 === 0 ? '#5e5672' : '#7a7090'));
        }
        ell(42, 30, 35, 6, '#4a4460'); ell(42, 30, 31, 5, '#2e2a40');
        for (var c = -32; c <= 32; c += 6) r(42 + c, 22 + Math.round(Math.abs(c) / 8), 3, 4, '#8a8098');
        /* torre central */
        for (var yy = 8; yy <= 30; yy++) ell(42, yy, 13, 3, yy % 6 === 0 ? '#6a6280' : '#9a90a8');
        ell(42, 8, 13, 3, '#5a5470'); ell(42, 8, 11, 2, '#2a2638');
        for (var k = -10; k <= 10; k += 5) r(42 + k, 16, 2, 4, '#1a1628');
        r(41, 0, 1, 8, '#c8c4dc'); r(42, 0, 7, 4, PAL.magenta); r(42, 2, 7, 1, PAL.gold);
        /* anel de neon (2495) */
        for (var a = 0; a < 360; a += 4) {
          var ax = Math.round(42 + Math.cos(a * Math.PI / 180) * 36), ay = Math.round(38 + Math.sin(a * Math.PI / 180) * 6);
          if (Math.sin(a * Math.PI / 180) > -0.2) r(ax, ay, 1, 1, PAL.cyan);
        }
        for (var w = -24; w <= 24; w += 12) r(42 + w, 44, 3, 4, '#1a1628');
      });
    },

    /* Saveiro — veleiro tradicional da Baía de Todos-os-Santos */
    saveiro: function () {
      return P.sprite(44, 40, function (g) {
        g.rect(20, 2, 2, 30, '#5a3a24');
        for (var y = 4; y < 28; y++) {
          var w = Math.round((y - 3) * 0.72);
          g.rect(22, y, w, 1, y % 7 === 0 ? '#c8c0b0' : '#ece4d2');
        }
        for (var y2 = 8; y2 < 26; y2++) g.rect(19 - Math.round((y2 - 7) * 0.45), y2, Math.round((y2 - 7) * 0.45), 1, '#d8ccb4');
        g.rect(4, 31, 38, 3, '#6a3a24'); g.rect(6, 34, 34, 2, '#4a2618'); g.rect(9, 36, 28, 1, '#2a160e');
        g.rect(4, 30, 38, 1, PAL.gold); g.px(2, 30, '#6a3a24'); g.px(43, 29, '#6a3a24');
        g.rect(28, 12, 6, 1, PAL.magenta);
      }, true);
    },

    /* Barraca de praia: guarda-sol listrado e cadeiras */
    guardasol: function () {
      return P.sprite(36, 34, function (g) {
        for (var y = 0; y < 9; y++) {
          var hw = Math.round(4 + y * 1.8);
          for (var x = -hw; x <= hw; x++) g.px(18 + x, 2 + y, ((x + 40) >> 2) % 2 ? PAL.gold : PAL.magenta);
        }
        g.rect(0, 11, 36, 1, '#7a1050');
        g.rect(17, 12, 2, 20, '#d8d4e8');
        g.rect(2, 24, 10, 2, '#00a9c4'); g.rect(2, 26, 2, 6, '#5a5672'); g.rect(10, 26, 2, 6, '#5a5672'); g.rect(1, 19, 2, 6, '#00a9c4');
        g.rect(24, 24, 10, 2, '#00a9c4'); g.rect(24, 26, 2, 6, '#5a5672'); g.rect(32, 26, 2, 6, '#5a5672'); g.rect(33, 19, 2, 6, '#00a9c4');
        g.rect(14, 30, 8, 3, '#e8701a'); g.rect(15, 29, 6, 1, '#ffc940');
      }, true);
    },

    /* Lousinha de praia do Prof. Hohenfeld */
    cavalete: function () {
      return P.sprite(26, 34, function (g) {
        g.rect(3, 12, 2, 22, '#6a4a32'); g.rect(21, 12, 2, 22, '#6a4a32'); g.rect(12, 10, 2, 22, '#4a3222');
        g.rect(1, 2, 24, 16, '#5a3a24'); g.rect(2, 3, 22, 14, '#1e3a2c');
        for (var x = 3; x < 23; x++) g.px(x, 9 + Math.round(2.4 * Math.sin(x / 1.6)), '#e8e6dc');
        g.rect(4, 5, 1, 3, '#e8e6dc'); g.px(5, 5, '#e8e6dc'); g.px(6, 6, '#e8e6dc'); g.px(5, 7, '#e8e6dc');   /* ψ simplificado */
        g.rect(16, 13, 5, 1, PAL.gold); g.rect(2, 18, 22, 2, '#4a3222');
      }, true);
    },

    placa_praia: function () {
      return mk(34, 30, function (ctx, r) {
        r(15, 12, 3, 18, '#4a3222'); r(0, 0, 34, 13, '#5a3a24'); r(1, 1, 32, 11, '#1e3a2c');
        P.text(ctx, 'PRAIA', 3, 2, '#ffc940'); P.text(ctx, '<<', 24, 2, '#7af9ff');
        r(3, 9, 28, 1, '#2c744e');
      });
    },

    /* ============ SALA DO COMPUTADOR QUÂNTICO (isolada) ============ */
    /* Refrigerador de diluição ("lustre dourado") com o processador quântico no estágio mais frio,
       dentro da lata de vácuo (translúcida aqui) e sobre a base anti-vibração */
    qcomp: function () {
      return mk(64, 64, function (ctx, r) {
        r(4, 0, 56, 5, '#9a94b4'); r(4, 0, 56, 1, '#d8d4e8'); r(4, 4, 56, 1, '#4a4562');
        for (var b = 8; b < 58; b += 8) r(b, 2, 2, 1, '#2a2638');
        r(10, 5, 44, 47, 'rgba(160,200,255,0.10)');                       /* lata de vácuo */
        r(10, 5, 1, 47, 'rgba(200,230,255,0.45)'); r(53, 5, 1, 47, 'rgba(200,230,255,0.25)');
        r(10, 51, 44, 1, 'rgba(200,230,255,0.35)');
        var plates = [[10, 44], [19, 38], [28, 32], [36, 26], [44, 20]];   /* 50 K · 4 K · 1 K · 0,1 K · 10 mK */
        r(31, 5, 2, 41, '#b07a10');
        plates.forEach(function (p, i) {
          var x0 = 32 - p[1] / 2;
          if (i < plates.length - 1) { var nx = 32 - plates[i + 1][1] / 2; r(x0 + 3, p[0] + 2, 2, plates[i + 1][0] - p[0] - 2, '#b07a10'); r(64 - x0 - 5, p[0] + 2, 2, plates[i + 1][0] - p[0] - 2, '#b07a10'); }
          r(x0, p[0], p[1], 3, '#ffc940'); r(x0, p[0], p[1], 1, '#fff0b8'); r(x0, p[0] + 2, p[1], 1, '#a8781a');
        });
        r(9, 5, 1, 1, '#ffffff');
        for (var c = 0; c < 4; c++) {                                       /* cabos coaxiais */
          var cx = 22 + c * 6;
          for (var y = 5; y < 44; y++) if (y % 9 !== 4) r(cx + (y % 9 === 5 ? 1 : 0), y, 1, 1, c % 2 ? '#c8c4dc' : '#d8823a');
        }
        r(26, 47, 12, 5, '#1a1630'); r(27, 48, 10, 3, '#3a2a8a');           /* processador (QPU) */
        r(6, 54, 52, 4, '#3a3456'); r(6, 54, 52, 1, '#6e6890');             /* base anti-vibração */
        for (var k = 0; k < 4; k++) {
          var lx = 9 + k * 14;
          r(lx, 58, 6, 6, '#22202e');
          for (var z = 0; z < 5; z++) r(lx + (z % 2 ? 3 : 1), 58 + z, 2, 1, '#8a84a8');
        }
      });
    },
    armario: function () {
      return P.sprite(18, 28, function (g) {
        g.rect(0, 0, 18, 28, '#4a5068'); g.rect(0, 0, 18, 1, '#7a80a0');
        g.rect(1, 2, 7, 25, '#5a6280'); g.rect(10, 2, 7, 25, '#5a6280');
        g.rect(3, 4, 3, 1, '#2a2f45'); g.rect(3, 6, 3, 1, '#2a2f45'); g.rect(12, 4, 3, 1, '#2a2f45'); g.rect(12, 6, 3, 1, '#2a2f45');
        g.rect(6, 14, 1, 3, '#d8d4e8'); g.rect(11, 14, 1, 3, '#d8d4e8');
        g.rect(12, 19, 4, 4, '#ff4d6a'); g.rect(13, 19, 2, 2, '#5a6280');   /* ímã proibido */
        g.px(12, 23, '#ffc940'); g.px(15, 18, '#ffc940');
      }, true);
    },
    painel_acesso: function () {
      return P.sprite(16, 26, function (g) {
        g.rect(1, 0, 14, 22, '#1a1820'); for (var i = 0; i < 14; i += 2) { g.px(1 + i, 0, '#ffc940'); g.px(1 + i, 21, '#ffc940'); }
        g.rect(3, 3, 10, 7, '#071824'); g.rect(4, 5, 8, 1, '#00e5ff'); g.rect(4, 7, 5, 1, '#3dff9a');
        for (var y = 12; y < 20; y += 3) for (var x = 4; x < 12; x += 3) g.rect(x, y, 2, 2, '#3a4470');
        g.rect(7, 22, 2, 4, '#2a2f45');
      }, true);
    },
    painel_amb: function () {
      return P.sprite(16, 24, function (g) {
        g.rect(0, 0, 16, 20, '#0e1226'); g.rect(1, 1, 14, 18, '#071824');
        g.rect(2, 3, 2, 2, '#7af9ff'); g.rect(5, 3, 8, 2, '#1a3a4a');
        g.rect(2, 8, 2, 2, '#3dff9a'); g.rect(5, 8, 8, 2, '#1a3a2a');
        g.rect(2, 13, 2, 2, '#ffc940'); g.rect(5, 13, 8, 2, '#3a3418');
        g.rect(7, 20, 2, 4, '#2a2f45');
      }, true);
    },
    placa_blind: function () {
      return P.sprite(16, 16, function (g) {
        g.rect(1, 1, 14, 13, '#8a5a34'); g.rect(1, 1, 14, 1, '#e8c080'); g.rect(2, 2, 12, 11, '#3a2616');
        g.rect(4, 4, 2, 6, '#d8d4e8'); g.rect(10, 4, 2, 6, '#d8d4e8'); g.rect(4, 9, 8, 2, '#ff4d6a');
        g.rect(4, 4, 2, 2, '#ff4d6a'); g.rect(10, 4, 2, 2, '#7af9ff');
        for (var k = 0; k < 10; k++) g.px(3 + k, 3 + k, '#ffc940');
      }, true);
    },
    amortecedor: function () {
      return mk(16, 16, function (ctx, r) {
        r(2, 2, 12, 12, '#141a30'); r(2, 2, 12, 1, '#3a4268');
        for (var z = 0; z < 8; z++) r(5 + (z % 2 ? 4 : 0), 4 + z, 3, 1, '#7af9ff');
        r(4, 12, 8, 1, '#8a84a8');
      });
    },
    compressor: function () {
      return P.sprite(32, 36, function (g) {
        g.rect(2, 8, 28, 26, '#3a4058'); g.rect(2, 8, 28, 2, '#6a7090'); g.rect(2, 32, 28, 2, '#1a1e2e');
        for (var y = 13; y < 28; y += 3) g.rect(5, y, 12, 1, '#1a1e2e');
        g.rect(20, 13, 8, 6, '#071824'); g.rect(21, 15, 6, 1, '#ffc940'); g.rect(21, 17, 4, 1, '#3dff9a');
        g.rect(8, 0, 3, 9, '#9a94b4'); g.rect(20, 2, 3, 7, '#9a94b4'); g.rect(8, 0, 15, 2, '#9a94b4');
        g.rect(22, 24, 6, 6, '#ffc940'); g.rect(23, 25, 4, 4, '#1a1820');
      }, true);
    },
    dutos: function () {
      return mk(32, 16, function (ctx, r) {
        r(0, 4, 32, 3, '#9a94b4'); r(0, 4, 32, 1, '#d8d4e8'); r(0, 9, 32, 2, '#d8823a');
        r(12, 2, 8, 12, '#1a1630'); r(13, 3, 6, 10, '#0a2238'); r(14, 7, 4, 2, '#00e5ff');
        r(4, 3, 2, 5, '#6e6888'); r(26, 3, 2, 5, '#6e6888');
      });
    },

    /* ======================= JACOBINA ======================= */
    /* Serras do Piemonte da Diamantina, com veios de ouro e uma cachoeira */
    serra: function () {
      return mk(576, 72, function (ctx, r) {
        var rr = P.rng(777);
        r(0, 0, 576, 72, '#0a0c26');
        for (var i = 0; i < 90; i++) r(Math.floor(rr() * 576), Math.floor(rr() * 30), 1, 1, rr() < 0.3 ? '#ffe08a' : '#c8c4ff');
        function ridge(base, amp, freq, ph, col, top) {
          for (var x = 0; x < 576; x++) {
            var h = base - Math.round(amp * (0.6 * Math.sin(x / freq + ph) + 0.4 * Math.sin(x / (freq * 0.43) + ph * 2)));
            r(x, h, 1, 72 - h, col);
            if (top) r(x, h, 1, 1, top);
          }
        }
        ridge(30, 12, 38, 0.7, '#1e2450', '#3a4a8a');
        ridge(44, 10, 26, 2.1, '#2a2a48', '#4a4a70');
        ridge(56, 6, 17, 4.0, '#3a2c30', '#6a5040');
        for (var v = 0; v < 26; v++) {                           /* veios de ouro */
          var vx = Math.floor(rr() * 560), vy = 50 + Math.floor(rr() * 18);
          r(vx, vy, 2 + Math.floor(rr() * 4), 1, rr() < 0.5 ? '#ffc940' : '#b07a10');
        }
        for (var y = 34; y < 72; y++) {                          /* cachoeira */
          r(118 + Math.round(Math.sin(y / 3) * 1), y, 5, 1, y % 3 ? '#9adcf0' : '#e8f6ff');
        }
        r(112, 68, 18, 4, '#e8f6ff');
      });
    },

    /* Estação Receptora Jacobina: cúpula, antena e a chegada da fibra */
    estacao: function () {
      return mk(120, 96, function (ctx, r) {
        function ell(cx, cy, rx, ry, col, top) {
          for (var y = -ry; y <= (top ? 0 : ry); y++) {
            var hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
            r(cx - hw, cy + y, hw * 2 + 1, 1, col);
          }
        }
        r(6, 58, 108, 38, '#3a3456'); r(6, 58, 108, 3, '#6e6890'); r(6, 92, 108, 4, '#221e34');
        for (var x = 10; x < 110; x += 12) r(x, 64, 8, 10, '#1a1630');
        for (var x2 = 10; x2 < 110; x2 += 12) r(x2 + 1, 65, 6, 3, '#00a9c4');
        ell(60, 58, 40, 30, '#8a84a8', true); ell(60, 58, 36, 27, '#a8a2c8', true);
        for (var a = -32; a <= 32; a += 8) r(60 + a, 34 + Math.abs(a) / 3, 1, 24 - Math.abs(a) / 3, '#6e6890');
        r(48, 72, 24, 24, '#120f22'); r(50, 74, 20, 20, '#0a2238'); r(59, 74, 2, 20, '#00e5ff');
        /* antena parabólica */
        r(84, 16, 3, 20, '#c8c4dc');
        for (var y = 0; y < 14; y++) { var w = 14 - Math.abs(7 - y) * 2; r(88 - Math.floor(w / 2) + y, 4 + y, w, 1, y < 7 ? '#ecebf6' : '#b8b4d0'); }
        r(92, 10, 2, 2, '#ff3fa4');
        P.text(ctx, 'RECEPTORA', 42, 46, '#1a1630');
        r(2, 86, 12, 6, '#00e5ff');                                /* chegada da fibra */
      });
    },

    /* Boca de uma antiga galeria de ouro */
    mina: function () {
      return mk(64, 44, function (ctx, r) {
        r(0, 0, 64, 44, '#2a2234'); r(0, 0, 64, 4, '#3a3048');
        r(14, 10, 36, 34, '#05040a');
        r(10, 6, 6, 38, '#6a4a32'); r(48, 6, 6, 38, '#6a4a32'); r(8, 4, 48, 6, '#7a5638'); r(8, 9, 48, 1, '#3a2418');
        for (var y = 30; y < 44; y += 3) r(18, y, 28, 1, '#4a4060');
        r(22, 30, 2, 14, '#8a8098'); r(40, 30, 2, 14, '#8a8098');
        r(24, 28, 16, 8, '#5a4a3a'); r(24, 28, 16, 2, '#ffc940'); r(26, 36, 3, 3, '#1a1018'); r(35, 36, 3, 3, '#1a1018');
        P.text(ctx, 'MINA VELHA', 13, 0, '#ffc940');
      });
    },

    /* Alto do Cruzeiro: morro, escadaria e o cruzeiro */
    cruzeiro: function () {
      return mk(96, 80, function (ctx, r) {
        for (var y = 18; y < 80; y++) {
          var hw = Math.min(48, Math.round((y - 18) * 1.1 + 6));
          r(48 - hw, y, hw * 2, 1, y % 7 === 0 ? '#5a4a3a' : '#4a3c30');
        }
        for (var s = 0; s < 12; s++) { var yy = 76 - s * 5; r(42, yy, 12, 2, '#b8b0c8'); r(42, yy + 2, 12, 1, '#6e6888'); }
        r(46, 0, 4, 22, '#ecebf6'); r(39, 6, 18, 4, '#ecebf6'); r(46, 0, 1, 22, '#ffffff');
        r(40, 20, 16, 2, '#8a84a8');
      });
    },

    mandacaru: function () {
      return P.sprite(16, 30, function (g) {
        g.rect(6, 4, 4, 26, '#2c744e'); g.rect(7, 4, 1, 24, '#4aa070');
        g.rect(1, 10, 3, 10, '#2c744e'); g.rect(1, 18, 5, 3, '#2c744e');
        g.rect(12, 7, 3, 9, '#2c744e'); g.rect(10, 14, 5, 3, '#2c744e');
        g.px(7, 3, '#ff3fa4'); g.px(2, 9, '#ecebf6'); g.px(13, 6, '#ecebf6');
      }, true);
    },
    arbusto: function () {
      return P.sprite(18, 14, function (g) {
        g.rect(2, 6, 14, 8, '#5a5a2a'); g.rect(4, 3, 10, 6, '#6e6a34'); g.rect(6, 1, 5, 3, '#7a7a3a');
        g.px(4, 5, '#c8a84a'); g.px(12, 4, '#c8a84a'); g.px(9, 9, '#8a3a2a'); g.rect(8, 12, 2, 2, '#3a2418');
      }, true);
    },

    /* Hipertrem Salvador–Jacobina: plataforma e cápsula */
    hipertrem: function () {
      return mk(96, 56, function (ctx, r) {
        r(0, 40, 96, 16, '#3a3456'); r(0, 40, 96, 2, '#9a94b4'); r(0, 52, 96, 4, '#1a1630');
        for (var x = 4; x < 96; x += 10) r(x, 44, 6, 1, '#ffc940');
        r(2, 34, 92, 6, '#0d0b1e'); r(2, 36, 92, 1, '#00e5ff');                       /* trilho magnético */
        r(8, 14, 80, 22, '#d8d4e8'); r(8, 14, 80, 3, '#ffffff'); r(8, 33, 80, 3, '#8a84a8');
        r(4, 18, 6, 14, '#b8b4d0'); r(86, 18, 6, 14, '#b8b4d0'); r(2, 22, 4, 8, '#9a94b4'); r(90, 22, 4, 8, '#9a94b4');
        for (var w = 14; w < 82; w += 14) r(w, 19, 10, 7, '#0a2238');
        for (var w2 = 14; w2 < 82; w2 += 14) r(w2 + 1, 20, 8, 2, '#3a7ab0');
        r(8, 28, 80, 2, '#ff3fa4');
        r(28, 0, 40, 10, '#141428'); P.text(ctx, 'HIPERTREM', 31, 2, '#7af9ff');
        r(47, 10, 2, 4, '#6e6888');
      });
    },

    /* Caixa de emenda da fibra óptica */
    fibra: function () {
      return P.sprite(16, 22, function (g) {
        g.rect(2, 4, 12, 16, '#3a3456'); g.rect(2, 4, 12, 2, '#6e6890'); g.rect(4, 8, 8, 5, '#07060f');
        g.rect(5, 9, 6, 1, '#00e5ff'); g.rect(5, 11, 3, 1, '#ffc940'); g.rect(7, 20, 2, 2, '#00e5ff');
      }, true);
    },
    /* cabo de fibra no chão, vindo de Salvador (oeste) */
    cabo: function () {
      return mk(192, 16, function (ctx, r) {
        for (var x = 0; x < 192; x++) { r(x, 9, 1, 2, '#0a2238'); if (x % 3) r(x, 9, 1, 1, '#00a9c4'); }
        for (var p = 8; p < 192; p += 32) { r(p, 6, 4, 7, '#4a4562'); r(p, 6, 4, 1, '#8a84a8'); }
      });
    },
    placa_rio: function () {
      return mk(52, 30, function (ctx, r) {
        r(24, 12, 3, 18, '#4a3222'); r(0, 0, 52, 13, '#5a3a24'); r(1, 1, 50, 11, '#1e2a4a');
        P.text(ctx, 'RIO DO OURO', 4, 4, '#ffc940');
      });
    },
    placa_jac: function () {
      return mk(68, 34, function (ctx, r) {
        r(32, 16, 3, 18, '#4a3222'); r(0, 0, 68, 17, '#5a3a24'); r(1, 1, 66, 15, '#1e3a2c');
        P.text(ctx, 'JACOBINA', 18, 3, '#ffc940'); P.text(ctx, 'CIDADE DO OURO', 6, 10, '#e8e6dc');
      });
    },

    lamp: function () {
      return P.sprite(16, 40, function (g) {
        g.rect(7, 8, 2, 28, '#2a2f45'); g.px(7, 8, '#3a4060');
        g.rect(5, 35, 6, 4, '#1d2136');
        g.rect(4, 4, 8, 2, '#2a2f45'); g.rect(5, 6, 6, 2, '#7af9ff');
        g.rect(3, 1, 10, 1, '#00a9c4'); g.px(2, 2, '#00a9c4'); g.px(13, 2, '#00a9c4');
      }, true);
    },

    bench: function () {
      return P.sprite(32, 16, function (g) {
        g.rect(1, 2, 30, 2, '#5a3e2a'); g.rect(1, 5, 30, 2, '#6a4a32'); g.rect(1, 8, 30, 2, '#7a5638');
        g.rect(3, 10, 2, 5, '#2a2f45'); g.rect(27, 10, 2, 5, '#2a2f45');
        g.rect(5, 12, 22, 1, PAL.magentaD);
      }, true);
    },

    stall: function () {
      return P.sprite(32, 42, function (g) {
        g.rect(1, 0, 30, 8, '#141428');
        g.rect(2, 9, 2, 26, '#4a3020'); g.rect(28, 9, 2, 26, '#4a3020');
        for (var x = 0; x < 32; x++) g.rect(x, 8, 1, 5, (x >> 2) % 2 ? '#ecebf6' : PAL.magenta);
        g.rect(0, 13, 32, 1, PAL.gold);
        g.rect(1, 27, 30, 8, '#ecebf6'); g.rect(1, 34, 30, 2, '#c4c0dc');
        for (var k = 2; k < 30; k += 4) g.px(k, 30, k % 8 ? PAL.gold : PAL.magenta);
        g.rect(4, 23, 9, 4, '#8a8a9a'); g.rect(5, 23, 7, 2, '#e8701a');
        g.rect(18, 23, 10, 4, '#a87a3a'); g.rect(19, 22, 3, 2, '#c8641e'); g.rect(23, 22, 3, 2, '#c8641e');
        g.rect(3, 36, 2, 5, '#4a3020'); g.rect(27, 36, 2, 5, '#4a3020');
      }, true);
    },

    terminal: function () {
      return P.sprite(16, 34, function (g) {
        g.rect(3, 29, 10, 5, '#1a1e34');
        g.rect(5, 12, 6, 18, '#2a3050'); g.rect(5, 12, 1, 18, '#3a4470');
        g.rect(2, 2, 12, 11, PAL.cyanD); g.rect(3, 3, 10, 9, '#071824');
        g.rect(7, 0, 2, 2, PAL.magenta);
        g.rect(6, 16, 4, 1, PAL.cyan); g.rect(6, 19, 4, 1, PAL.cyanD);
      }, true);
    },

    panel: function () {
      return P.sprite(32, 32, function (g) {
        g.rect(0, 2, 32, 22, '#2a3050'); g.rect(2, 4, 28, 18, '#070b18');
        g.rect(0, 2, 32, 1, '#4a5a90');
        g.rect(6, 24, 2, 8, '#2a3050'); g.rect(24, 24, 2, 8, '#2a3050');
      }, true);
    },

    drone_red: function () { return drone('#ff4d6a'); },
    drone_cyan: function () { return drone('#00e5ff'); },

    /* ---------- Interior ---------- */
    lousa: function () {
      return mk(64, 16, function (ctx, r) {
        r(0, 1, 64, 14, '#5a3a28'); r(0, 1, 64, 1, '#7a5238');
        r(2, 3, 60, 10, '#1d3a2e');
        P.text(ctx, '|Y>=A|0>+B|1>', 4, 5, '#d8e8dc');
        r(56, 5, 3, 1, '#d8e8dc'); r(57, 7, 2, 3, '#d8e8dc');
        r(20, 15, 24, 1, '#3a2418');
      });
    },
    desk: function () {
      return P.sprite(32, 26, function (g) {
        g.rect(4, 0, 11, 9, '#0b3a4e'); g.rect(5, 1, 9, 7, '#0e5068');
        g.rect(6, 3, 6, 1, PAL.cyan); g.rect(6, 5, 4, 1, PAL.cyanD);
        g.rect(18, 2, 10, 7, '#3a0b3a'); g.rect(19, 3, 8, 5, '#5a1a5a'); g.rect(20, 5, 5, 1, PAL.magenta);
        g.rect(0, 11, 32, 5, '#3a2a48'); g.rect(0, 11, 32, 1, '#5a4470');
        g.rect(0, 16, 32, 9, '#2a1e36'); g.rect(8, 13, 16, 2, '#141022'); g.rect(9, 13, 14, 1, PAL.cyanD);
      }, true);
    },
    shelf: function () {
      return P.sprite(32, 30, function (g) {
        g.rect(0, 0, 32, 30, '#3a2620'); g.rect(0, 0, 32, 1, '#5a3a2a');
        var cols = ['#a8186a', '#ffc940', '#3dff9a', '#00a9c4', '#e8e6ff', '#c8641e', '#5a3aa8'];
        [2, 11, 20].forEach(function (sy, si) {
          g.rect(1, sy + 7, 30, 1, '#2a1a14');
          for (var x = 2; x < 30; x += 3) g.rect(x, sy + 1 + ((x + si) % 3 === 0 ? 1 : 0), 2, 6 - ((x + si) % 3 === 0 ? 1 : 0), cols[(x + si * 2) % cols.length]);
        });
      }, true);
    },
    rug: function () {
      return P.field(64, 48, function (x, y) {
        if (x < 2 || y < 2 || x > 61 || y > 45) return '#b07a10';
        if (x < 4 || y < 4 || x > 59 || y > 43) return '#1a1018';
        var bx = (x - 4) >> 3, by = (y - 4) >> 3;
        var pal = ['#ffc940', '#10a860', '#a8186a', '#1a1018'];
        var c = pal[(bx + by * 2) % 4];
        if ((x - 4) % 8 === 0 || (y - 4) % 8 === 0) return '#1a1018';
        if (c === '#1a1018' && ((x + y) % 4 === 0)) return '#ffc940';
        return c;
      });
    },
    plant: function () {
      return P.sprite(16, 26, function (g) {
        g.rect(4, 18, 8, 7, '#a8543a'); g.rect(4, 18, 8, 1, '#c8644a'); g.rect(5, 25, 6, 1, '#7a3a28');
        var leaves = [[7, 4], [3, 8], [11, 7], [5, 12], [10, 12], [8, 9], [2, 13], [13, 13]];
        leaves.forEach(function (l, i) {
          g.rect(l[0], l[1], 3, 5, i % 2 ? '#2c744e' : '#1f5a3f'); g.px(l[0] + 1, l[1], '#4fa86e');
        });
        g.rect(7, 12, 2, 6, '#1f5a3f');
      }, true);
    },
    cryostat: function () {
      return P.sprite(32, 58, function (g) {
        g.rect(2, 0, 28, 4, '#d8a838'); g.rect(2, 0, 28, 1, '#ffe08a');
        g.rect(6, 4, 2, 40, '#b07a10'); g.rect(24, 4, 2, 40, '#b07a10'); g.rect(15, 4, 2, 42, '#b07a10');
        g.rect(4, 12, 24, 3, PAL.gold); g.rect(4, 12, 24, 1, '#ffe9a8');
        g.rect(6, 24, 20, 3, PAL.gold); g.rect(6, 24, 20, 1, '#ffe9a8');
        g.rect(8, 36, 16, 3, PAL.gold); g.rect(8, 36, 16, 1, '#ffe9a8');
        for (var y = 16; y < 36; y += 2) { g.px(10 + (y % 4), y, '#c8641e'); g.px(20 - (y % 4), y, '#c8641e'); }
        g.rect(12, 42, 8, 6, '#e8e6ff'); g.rect(13, 44, 6, 2, PAL.cyan);
        g.rect(0, 50, 32, 8, '#2a3050'); g.rect(0, 50, 32, 1, '#4a5a90'); g.rect(4, 54, 24, 1, PAL.cyanD);
      }, true);
    },
    console: function () {
      return P.sprite(48, 32, function (g) {
        [2, 17, 32].forEach(function (mx, i) {
          g.rect(mx, 0, 14, 12, '#0e1226'); g.rect(mx + 1, 1, 12, 10, '#071824');
          g.rect(mx + 2, 3, 10, 1, i === 1 ? PAL.magenta : PAL.cyan);
          g.rect(mx + 2, 6, 3, 3, PAL.cyanD); g.rect(mx + 7, 6, 4, 1, PAL.gold); g.rect(mx + 7, 8, 3, 1, PAL.cyanD);
          g.rect(mx + 6, 12, 2, 2, '#2a3050');
        });
        g.rect(0, 14, 48, 3, '#3a4470'); g.rect(0, 17, 48, 15, '#1d2240');
        g.rect(6, 19, 36, 2, PAL.cyan); g.rect(4, 24, 40, 1, '#2a3050'); g.rect(20, 26, 8, 4, '#0e1226');
      }, true);
    },
    server: function () {
      return P.sprite(16, 32, function (g) {
        g.rect(1, 0, 14, 32, '#0e1022'); g.rect(1, 0, 14, 1, '#2a3050');
        for (var y = 3; y < 30; y += 4) { g.rect(3, y, 10, 2, '#1d2240'); }
      }, true);
    },
    core: function () {
      return P.sprite(64, 58, function (g) {
        g.rect(10, 8, 4, 34, '#2a2f55'); g.rect(50, 8, 4, 34, '#2a2f55');
        g.rect(10, 8, 1, 34, '#4a5090'); g.rect(50, 8, 1, 34, '#4a5090');
        g.rect(4, 40, 56, 4, '#3a2a8a'); g.rect(4, 40, 56, 1, '#6a5ac8');
        g.rect(8, 44, 48, 14, '#1d1a4a'); g.rect(14, 48, 36, 2, PAL.magentaD);
      }, true);
    },
    sofa: function () {
      return P.sprite(32, 20, function (g) {
        g.rect(0, 0, 32, 8, '#5a2470'); g.rect(0, 0, 32, 1, '#7a3a90');
        g.rect(0, 8, 32, 8, '#4a1a5a'); g.rect(2, 8, 13, 5, '#6a2a80'); g.rect(17, 8, 13, 5, '#6a2a80');
        g.rect(0, 4, 3, 12, '#3a1048'); g.rect(29, 4, 3, 12, '#3a1048');
        g.rect(2, 16, 2, 3, '#1a1020'); g.rect(28, 16, 2, 3, '#1a1020');
      }, true);
    },
    holosign: function () {
      return mk(64, 16, function (ctx, r) {
        r(0, 2, 64, 12, '#080c1c'); r(0, 2, 64, 1, PAL.magenta); r(0, 13, 64, 1, PAL.magenta);
        P.text(ctx, 'AFROTECH', 17, 6, PAL.cyan);
        r(6, 6, 5, 5, PAL.gold); r(7, 7, 3, 3, '#080c1c'); r(53, 6, 5, 5, PAL.gold); r(54, 7, 3, 3, '#080c1c');
      });
    }
  };

  function drone(eye) {
    return P.sprite(16, 14, function (g) {
      g.rect(0, 2, 5, 1, '#9aa0c0'); g.rect(11, 2, 5, 1, '#9aa0c0');
      g.rect(2, 3, 1, 2, '#5a6080'); g.rect(13, 3, 1, 2, '#5a6080');
      g.rect(3, 4, 10, 7, '#5a6080'); g.rect(4, 3, 8, 1, '#7a80a0'); g.rect(3, 4, 10, 1, '#8a90b0');
      g.rect(5, 6, 6, 3, '#141428'); g.rect(6, 7, 4, 1, eye);
      g.rect(5, 11, 6, 1, '#3a4060'); g.px(7, 12, eye); g.px(8, 12, eye);
    }, true);
  }

  /* ---------- Animações dinâmicas sobre os sprites ---------- */
  var ANIM = {
    elevador: function (ctx, sx, sy, t) {
      var restored = AF.State.flag('restored');
      [28, 34].forEach(function (lx, s) {
        for (var k = 0; k < 4; k++) {
          var speed = restored ? 70 : 34;
          var py = 108 - ((t * speed + k * 18 + s * 9) % 68);
          ctx.fillStyle = restored ? '#7af9ff' : (k % 2 ? '#ff3fa4' : '#7af9ff');
          ctx.fillRect(sx + lx, sy + py, 2, 4);
        }
      });
    },
    torre: function (ctx, sx, sy, t) {
      var restored = AF.State.flag('restored');
      var open = AF.State.flag('gateOpen');
      var seed = Math.floor(t * (restored ? 1 : 3));
      var r = P.rng(seed * 13 + 7);
      for (var i = 0; i < (restored ? 30 : 10); i++) {
        var gx = 28 + Math.floor(r() * 17) * 8, gy = 30 + Math.floor(r() * 15) * 8;
        if (gx > 56 && gx < 132 && gy > 34 && gy < 96) continue;
        ctx.fillStyle = restored ? (i % 3 ? '#1f8fb0' : '#a0488a') : (i % 2 ? '#3a1030' : '#1d5f7a');
        ctx.fillRect(sx + gx, sy + gy, 6, 5);
      }
      /* telas laterais */
      var blink = Math.floor(t * 2) % 2 === 0;
      if (restored) { P.text(ctx, 'ONLINE', sx + 20, sy + 182, '#3dff9a'); P.text(ctx, 'ONLINE', sx + 148, sy + 182, '#3dff9a'); }
      else if (blink) { P.text(ctx, 'SILENCIO', sx + 16, sy + 182, '#ff4d6a'); P.text(ctx, 'SILENCIO', sx + 144, sy + 182, '#ff4d6a'); }
      /* portão */
      if (open) {
        ctx.fillStyle = '#0b2a3e'; ctx.fillRect(sx + 64, sy + 174, 64, 34);
        ctx.fillStyle = '#2a3460'; ctx.fillRect(sx + 64, sy + 174, 10, 34); ctx.fillRect(sx + 118, sy + 174, 10, 34);
        ctx.fillStyle = 'rgba(0,229,255,0.35)'; ctx.fillRect(sx + 74, sy + 174, 44, 34);
        ctx.fillStyle = PAL.cyan; ctx.fillRect(sx + 74, sy + 174, 44, 1);
      } else {
        for (var y = 178; y < 206; y += 5) {
          if (Math.random() < 0.08) continue;
          ctx.fillStyle = (y + Math.floor(t * 10)) % 2 ? '#ff4d6a' : '#a8183a';
          ctx.fillRect(sx + 66, sy + y, 60, 1);
        }
      }
    },
    panel: function (ctx, sx, sy, t) {
      if (AF.State.flag('restored')) { P.text(ctx, 'REDE', sx + 9, sy + 6, '#3dff9a'); P.text(ctx, 'ON', sx + 12, sy + 14, '#3dff9a'); }
      else {
        P.text(ctx, 'REDE', sx + 9, sy + 6, '#ff4d6a');
        if (Math.floor(t * 2) % 2) P.text(ctx, '0/512', sx + 6, sy + 14, '#ff4d6a');
      }
    },
    terminal: function (ctx, sx, sy, t) {
      var blink = (t % 4) > 3.85;
      ctx.fillStyle = PAL.cyan; ctx.fillRect(sx + 5, sy + 5, 6, blink ? 1 : 4);
      if (!blink) { ctx.fillStyle = PAL.magenta; ctx.fillRect(sx + 7 + Math.round(Math.sin(t) * 1), sy + 6, 2, 2); }
    },
    lousa: function (ctx, sx, sy) {
      if (AF.State.flag('lousaRead')) return;
      for (var i = 0; i < 26; i++) {
        ctx.fillStyle = ['#ff3fa4', '#00e5ff', '#d8e8dc', '#1d3a2e'][Math.floor(Math.random() * 4)];
        ctx.fillRect(sx + 3 + Math.floor(Math.random() * 58), sy + 4 + Math.floor(Math.random() * 8), 1 + Math.floor(Math.random() * 3), 1);
      }
    },
    server: function (ctx, sx, sy, t) {
      for (var y = 3; y < 30; y += 4) {
        var on = Math.sin(t * 3 + y * 1.7) > 0;
        ctx.fillStyle = on ? (y % 8 ? PAL.green : PAL.cyan) : '#142a20';
        ctx.fillRect(sx + 11, sy + y, 1, 1);
        ctx.fillStyle = on ? PAL.gold : '#2a2010'; ctx.fillRect(sx + 4, sy + y, 1, 1);
      }
    },
    core: function (ctx, sx, sy, t) {
      var restored = AF.State.flag('restored');
      var cx = sx + 32, cy = sy + 22 + Math.round(Math.sin(t * 2) * 1.5);
      var col = restored ? PAL.cyan : (Math.random() < 0.1 ? '#e8e6ff' : PAL.magenta);
      var g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 16);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = restored ? PAL.cyanL : PAL.gold; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, 22, 6, t * (restored ? 0.6 : 1.4), 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = restored ? PAL.green : PAL.cyan;
      ctx.beginPath(); ctx.ellipse(cx, cy, 20, 5, -t * 0.9 + 1.2, 0, Math.PI * 2); ctx.stroke();
    },
    cryostat: function (ctx, sx, sy, t) {
      ctx.fillStyle = 'rgba(122,249,255,' + (0.25 + 0.2 * Math.sin(t * 4)) + ')';
      ctx.fillRect(sx + 13, sy + 44, 6, 2);
    },
    qcomp: function (ctx, sx, sy, t) {
      var restored = AF.State.flag('restored');
      var a = 0.55 + 0.45 * Math.sin(t * 3);
      ctx.fillStyle = restored ? 'rgba(0,229,255,' + a + ')' : (Math.random() < 0.08 ? '#e8e6ff' : 'rgba(255,63,164,' + a + ')');
      ctx.fillRect(sx + 28, sy + 49, 8, 1);
      for (var c = 0; c < 4; c++) {                         /* pulsos de micro-ondas descendo pelos cabos */
        var py = 5 + ((t * 26 + c * 11) % 40);
        ctx.fillStyle = restored ? '#7af9ff' : '#ff9ad0';
        ctx.fillRect(sx + 22 + c * 6, sy + py, 1, 2);
      }
      ctx.fillStyle = Math.sin(t * 2) > 0 ? '#3dff9a' : '#0a3a22'; ctx.fillRect(sx + 56, sy + 55, 2, 2);
    },
    painel_amb: function (ctx, sx, sy, t) {
      var w = [4 + Math.round(Math.sin(t * 1.3)), 2 + Math.round(Math.abs(Math.sin(t * 5)) * 2), 3];
      ctx.fillStyle = '#7af9ff'; ctx.fillRect(sx + 5, sy + 3, w[0], 2);
      ctx.fillStyle = '#3dff9a'; ctx.fillRect(sx + 5, sy + 8, w[1], 2);
      ctx.fillStyle = '#ffc940'; ctx.fillRect(sx + 5, sy + 13, w[2], 2);
    },
    compressor: function (ctx, sx, sy, t) {
      var j = Math.sin(t * 40) > 0 ? 1 : 0;                  /* vibra: por isso fica fora da sala */
      ctx.fillStyle = 'rgba(232,230,255,0.5)';
      ctx.fillRect(sx + 31 + j, sy + 14, 1, 3); ctx.fillRect(sx + j, sy + 20, 1, 3);
    },
    console: function (ctx, sx, sy, t) {
      var k = Math.floor(t * 4) % 10;
      ctx.fillStyle = PAL.cyanL; ctx.fillRect(sx + 4 + k, sy + 8, 1, 1);
      ctx.fillStyle = PAL.gold; ctx.fillRect(sx + 19 + ((k * 3) % 10), sy + 8, 1, 1);
    }
  };

  /* Retratos especiais (Oráculo e drone) */
  var PORTRAITS = {
    oraculo: function () {
      return P.sprite(16, 16, function (g) {
        g.rect(1, 1, 14, 14, '#071824'); g.rect(1, 1, 14, 1, PAL.cyanD);
        g.rect(3, 5, 10, 6, PAL.cyan); g.rect(2, 7, 12, 2, PAL.cyan);
        g.rect(5, 6, 6, 4, '#0b5a72'); g.rect(7, 7, 2, 2, PAL.magenta);
        g.px(4, 3, PAL.magenta); g.px(11, 12, PAL.gold);
      }, true);
    },
    k7: function () {
      var d = drone('#ff4d6a');
      var c = P.canvas(16, 16);
      c.getContext('2d').drawImage(d, 0, 1);
      return c;
    }
  };

  AF.Art = {
    get: function (name) {
      if (!cache[name]) {
        if (!MAKERS[name]) throw new Error('Arte desconhecida: ' + name);
        cache[name] = MAKERS[name]();
      }
      return cache[name];
    },
    anim: ANIM,
    portrait: function (name) {
      var key = 'portrait_' + name;
      if (!cache[key]) cache[key] = PORTRAITS[name]();
      return cache[key];
    }
  };
})(window.AF);
