/* =========================================================================
 * characters.js — personagens 16×22 em pixel art gerados por código
 * 4 direções × 3 quadros (parado, passo A, passo B), cabelos e roupas
 * ========================================================================= */
(function (AF) {
  'use strict';
  var W = 16, H = 22, OY = 5;
  var EYE = '#140a14';

  /* ---------- Cabelos ---------- */
  var HAIR = {
    afro: function (g, s, dir, o) {
      var h = s.hair, hl = s.hairL;
      if (dir === 'down') {
        g.rect(4, o - 3, 8, 1, h); g.rect(3, o - 2, 10, 3, h);
        g.rect(3, o + 1, 1, 3, h); g.rect(12, o + 1, 1, 3, h); g.rect(4, o + 1, 8, 1, h);
        g.px(5, o - 2, hl); g.px(6, o - 2, hl); g.px(4, o - 1, hl);
      } else if (dir === 'up') {
        g.rect(4, o - 3, 8, 1, h); g.rect(3, o - 2, 10, 6, h); g.rect(4, o + 4, 8, 1, h);
        g.px(5, o - 2, hl); g.px(6, o - 2, hl); g.px(4, o - 1, hl);
      } else {
        g.rect(4, o - 3, 7, 1, h); g.rect(3, o - 2, 9, 3, h); g.rect(3, o + 1, 4, 3, h);
        g.rect(7, o + 1, 4, 1, h); g.px(6, o - 2, hl); g.px(7, o - 2, hl);
      }
    },
    locs: function (g, s, dir, o) {
      var h = s.hair, hl = s.hairL, b = s.accent;
      var x, y;
      if (dir === 'down') {
        g.rect(4, o - 1, 8, 2, h); g.px(5, o + 1, h); g.px(10, o + 1, h);
        for (y = o; y <= o + 7; y++) { g.px(3, y, (y % 2) ? h : hl); g.px(12, y, (y % 2) ? hl : h); }
        g.px(3, o + 8, b); g.px(12, o + 8, b);
      } else if (dir === 'up') {
        g.rect(4, o - 1, 8, 2, h);
        for (x = 3; x <= 12; x++) {
          for (y = o + 1; y <= o + 7; y++) g.px(x, y, ((x + y) % 3 === 0) ? hl : h);
          g.px(x, o + 8, (x % 2) ? b : h);
        }
      } else {
        g.rect(4, o - 1, 7, 2, h); g.rect(9, o + 1, 2, 1, h);
        for (x = 3; x <= 5; x++) for (y = o + 1; y <= o + 7; y++) g.px(x, y, ((x + y) % 2) ? h : hl);
        g.px(3, o + 8, b); g.px(5, o + 8, b);
      }
    },
    turbante: function (g, s, dir, o) {
      var a = s.wrap || s.accent, b = s.wrap2 || s.hair;
      if (dir !== 'right') {
        g.rect(5, o - 4, 6, 1, a); g.rect(4, o - 3, 8, 1, b); g.rect(4, o - 2, 8, 1, a);
        g.rect(3, o - 1, 10, 1, b); g.rect(4, o, 8, 1, a);
        for (var x = 5; x < 11; x += 2) g.px(x, o - 2, b);
        if (dir === 'down') { g.px(10, o - 4, b); g.px(11, o - 4, a); }
      } else {
        g.rect(5, o - 4, 5, 1, a); g.rect(4, o - 3, 7, 1, b); g.rect(3, o - 2, 8, 1, a);
        g.rect(3, o - 1, 8, 1, b); g.rect(4, o, 7, 1, a); g.rect(2, o - 3, 2, 2, a);
        g.px(6, o - 2, b); g.px(8, o - 2, b);
      }
    },
    curto: function (g, s, dir, o) {
      var h = s.hair;
      if (dir === 'down') { g.rect(4, o - 1, 8, 2, h); g.px(4, o + 1, h); g.px(11, o + 1, h); }
      else if (dir === 'up') { g.rect(4, o - 1, 8, 5, h); g.rect(5, o + 4, 6, 1, h); }
      else { g.rect(4, o - 1, 7, 2, h); g.rect(4, o + 1, 3, 2, h); }
    },
    raspado: function (g, s, dir, o) {
      var a = s.accent;
      if (dir === 'down') { g.px(11, o + 1, a); g.px(11, o + 2, a); g.px(10, o, a); }
      else if (dir === 'up') { g.px(6, o + 1, a); g.px(7, o + 2, a); g.px(8, o + 2, a); g.px(9, o + 1, a); }
      else { g.px(5, o + 1, a); g.px(5, o + 2, a); g.px(6, o + 3, a); }
    },
    /* dois puffs no alto da cabeça */
    puffs: function (g, s, dir, o) {
      var h = s.hair, hl = s.hairL;
      function puff(x, y) { g.rect(x + 1, y, 2, 1, h); g.rect(x, y + 1, 4, 2, h); g.rect(x + 1, y + 3, 2, 1, h); g.px(x + 1, y + 1, hl); }
      if (dir === 'right') { g.rect(4, o - 1, 7, 2, h); g.px(4, o + 1, h); puff(2, o - 4); }
      else { g.rect(4, o - 1, 8, 2, h); if (dir === 'up') g.rect(4, o + 1, 8, 3, h); puff(1, o - 4); puff(11, o - 4); }
    },
    /* cachos médios */
    cacheado: function (g, s, dir, o) {
      var h = s.hair, hl = s.hairL, y;
      if (dir === 'right') {
        g.rect(4, o - 2, 7, 3, h); g.rect(3, o + 1, 3, 4, h);
        for (y = o - 1; y <= o + 4; y += 2) g.px(3 + (y % 3), y, hl);
      } else {
        g.rect(4, o - 2, 8, 2, h); g.rect(3, o, 10, 1, h);
        g.rect(3, o + 1, 1, 4, h); g.rect(12, o + 1, 1, 4, h);
        if (dir === 'up') g.rect(4, o + 1, 8, 4, h);
        for (var x = 4; x <= 11; x += 2) g.px(x, o - 2, hl);
        g.px(3, o + 2, hl); g.px(12, o + 3, hl);
      }
    },
    /* tranças longas (box braids) */
    trancas: function (g, s, dir, o) {
      var h = s.hair, hl = s.hairL, b = s.accent, x, y;
      if (dir === 'down') {
        g.rect(4, o - 2, 8, 3, h);
        for (y = o + 1; y <= o + 9; y++) { g.px(3, y, y % 2 ? h : hl); g.px(12, y, y % 2 ? hl : h); }
        g.px(3, o + 10, b); g.px(12, o + 10, b);
      } else if (dir === 'up') {
        g.rect(4, o - 2, 8, 3, h);
        for (x = 3; x <= 12; x++) { for (y = o + 1; y <= o + 9; y++) g.px(x, y, (x % 2) ? h : hl); g.px(x, o + 10, (x % 3) ? h : b); }
      } else {
        g.rect(4, o - 2, 7, 3, h);
        for (x = 3; x <= 5; x++) for (y = o + 1; y <= o + 9; y++) g.px(x, y, ((x + y) % 2) ? h : hl);
        g.px(4, o + 10, b);
      }
    },
    /* trança nagô (rente ao couro cabeludo) */
    nago: function (g, s, dir, o) {
      var h = s.hair, hl = s.hairL, x;
      if (dir === 'down') { g.rect(4, o - 1, 8, 2, h); for (x = 5; x <= 10; x += 2) g.px(x, o - 1, hl); }
      else if (dir === 'up') { g.rect(4, o - 1, 8, 5, h); for (x = 5; x <= 10; x += 2) g.rect(x, o - 1, 1, 5, hl); g.rect(6, o + 4, 4, 2, h); }
      else { g.rect(4, o - 1, 7, 2, h); g.rect(4, o + 1, 2, 2, h); for (x = 5; x <= 10; x += 2) g.px(x, o - 1, hl); g.px(4, o + 1, hl); }
    },
    coque: function (g, s, dir, o) {
      var h = s.hair, hl = s.hairL;
      if (dir === 'right') { g.rect(4, o - 1, 7, 2, h); g.rect(4, o + 1, 2, 2, h); g.rect(2, o - 3, 3, 3, h); g.px(3, o - 3, hl); }
      else { g.rect(4, o - 1, 8, 2, h); if (dir === 'up') g.rect(4, o + 1, 8, 2, h); g.rect(6, o - 4, 4, 3, h); g.px(7, o - 4, hl); g.px(6, o - 3, hl); }
    },
    liso: function (g, s, dir, o) {
      var h = s.hair, hl = s.hairL;
      if (dir === 'down') { g.rect(4, o - 1, 8, 2, h); g.rect(3, o, 2, 9, h); g.rect(11, o, 2, 9, h); g.rect(5, o + 1, 2, 1, h); g.px(4, o + 2, hl); g.px(11, o + 3, hl); }
      else if (dir === 'up') { g.rect(4, o - 1, 8, 2, h); g.rect(3, o + 1, 10, 8, h); g.rect(5, o + 1, 1, 7, hl); g.rect(9, o + 2, 1, 6, hl); }
      else { g.rect(4, o - 1, 7, 2, h); g.rect(3, o + 1, 4, 8, h); g.rect(4, o + 2, 1, 6, hl); }
    },
    moicano: function (g, s, dir, o) {
      var h = s.hair, hl = s.hairL;
      if (dir === 'down') { g.rect(6, o - 3, 4, 3, h); g.rect(7, o - 3, 2, 1, hl); g.px(4, o + 1, s.skinD); g.px(11, o + 1, s.skinD); }
      else if (dir === 'up') { g.rect(7, o - 3, 2, 8, h); g.px(7, o - 3, hl); }
      else { g.rect(4, o - 3, 6, 2, h); g.rect(4, o - 1, 2, 3, h); g.px(6, o - 3, hl); }
    },
    careca: function (g, s, dir, o) {
      if (dir !== 'up') g.px(dir === 'right' ? 7 : 6, o, AF.Pix.shade(s.skin, 26));
      else g.px(7, o + 1, AF.Pix.shade(s.skin, 20));
    }
  };

  /* ---------- Chapéus e acessórios de cabeça ---------- */
  var HATS = {
    bone: function (g, s, dir, o, c, a) {
      var cd = AF.Pix.shade(c, -30);
      if (dir === 'right') { g.rect(4, o - 2, 7, 2, c); g.rect(9, o, 4, 1, cd); g.px(6, o - 1, a); }
      else if (dir === 'up') { g.rect(4, o - 2, 8, 3, c); g.px(7, o, a); g.px(8, o, a); }
      else { g.rect(4, o - 2, 8, 2, c); g.rect(3, o, 10, 1, cd); g.px(7, o - 1, a); g.px(8, o - 1, a); }
    },
    palha: function (g, s, dir, o, c, a) {
      var cd = AF.Pix.shade(c, -36);
      if (dir === 'right') { g.rect(1, o, 14, 1, c); g.rect(4, o - 3, 7, 3, c); g.rect(4, o - 1, 7, 1, a); }
      else { g.rect(2, o, 12, 1, c); g.rect(4, o - 3, 8, 3, c); g.rect(4, o - 1, 8, 1, a); }
      for (var x = 2; x < 14; x += 3) g.px(x, o, cd);
      g.px(6, o - 3, cd); g.px(9, o - 2, cd);
    },
    panama: function (g, s, dir, o, c, a) {
      if (dir === 'right') { g.rect(2, o, 12, 1, c); g.rect(4, o - 3, 7, 3, c); g.rect(4, o - 1, 7, 1, a); }
      else { g.rect(3, o, 10, 1, c); g.rect(4, o - 3, 8, 3, c); g.rect(4, o - 1, 8, 1, a); g.px(7, o - 3, AF.Pix.shade(c, -20)); }
    },
    torco: function (g, s, dir, o, c, a) { HAIR.turbante(g, { wrap: c, wrap2: a, accent: c, hair: a }, dir, o); },
    fone: function (g, s, dir, o, c, a) {
      if (dir === 'right') { g.rect(5, o - 2, 5, 1, c); g.rect(5, o + 1, 2, 3, c); g.px(5, o + 2, a); }
      else { g.rect(4, o - 2, 8, 1, c); g.rect(3, o + 1, 1, 3, c); g.rect(12, o + 1, 1, 3, c); g.px(3, o + 2, a); g.px(12, o + 2, a); }
    },
    touca: function (g, s, dir, o, c) {
      var hl = AF.Pix.shade(c, 30);
      if (dir === 'right') { g.rect(5, o - 2, 5, 1, c); g.rect(4, o - 1, 7, 3, c); g.px(7, o - 1, hl); }
      else if (dir === 'up') { g.rect(5, o - 2, 6, 1, c); g.rect(4, o - 1, 8, 5, c); g.px(6, o, hl); }
      else { g.rect(5, o - 2, 6, 1, c); g.rect(4, o - 1, 8, 2, c); g.px(6, o - 1, hl); }
    }
  };
  function lighten(hex, k) {
    var c = AF.Pix.hexToRgb(hex), t = [240, 214, 200];
    return '#' + c.map(function (v, i) { return ('0' + Math.round(v + (t[i] - v) * k).toString(16)).slice(-2); }).join('');
  }

  /* ---------- Corpo ---------- */
  function paint(g, s, dir, f) {
    var o = OY;
    var side = dir === 'right', up = dir === 'up', down = dir === 'down';
    var sk = s.skin, skd = s.skinD, top = s.top, topd = s.topD;
    var ac = s.accent, ac2 = s.accent2 || s.accentD || s.accent;
    var pn = s.pants, bt = s.barefoot ? skd : s.boots;
    var ot = s.outfit || 'jacket';
    var coat = ot === 'coat', swim = ot === 'swim', sunga = swim && s.swimV === 'sunga';
    var bw = s.body === 'largo' ? 1 : 0;
    var shorts = !!s.shorts || swim;
    var vit = s.marks === 'vitiligo' ? lighten(sk, 0.55) : null;
    var ext = s.extras || [];
    var legTop = swim ? (sunga ? pn : top) : pn;            /* primeira linha das pernas */

    /* Pernas: calça, bermuda ou pele (traje de banho) */
    function legRect(x, y, w, h) {
      for (var yy = y; yy < y + h; yy++) g.rect(x, yy, w, 1, yy === o + 11 ? legTop : (shorts && yy >= o + 12 ? sk : pn));
    }
    if (ot === 'dress') {
      if (side) {
        g.rect(6, o + 10, 4, 1, top); g.rect(5, o + 11, 6, 2, top); g.rect(5, o + 13, 6, 1, topd);
        var fx = f === 1 ? 8 : (f === 2 ? 5 : 6);
        g.rect(fx, o + 14, 3, 1, bt);
      } else {
        g.rect(5, o + 10, 6, 1, top); g.rect(4, o + 11, 8, 2, top); g.rect(4, o + 13, 8, 1, topd);
        g.rect(5, o + 14 - (f === 1 ? 1 : 0), 2, 1, bt); g.rect(9, o + 14 - (f === 2 ? 1 : 0), 2, 1, bt);
      }
      if (s.pattern === 'kente') {
        for (var kx = (side ? 5 : 4); kx < (side ? 11 : 12); kx++) g.px(kx, o + 12, (kx % 2) ? ac : ac2);
      }
      if (s.print === 'floral') { g.px(side ? 6 : 5, o + 12, '#ffe08a'); g.px(side ? 9 : 10, o + 11, '#ff9ac4'); if (!side) g.px(7, o + 13, '#ffe08a'); }
    } else if (side) {
      if (f === 0) { legRect(6, o + 11, 3, 3); g.rect(6, o + 14, 4, 1, bt); }
      else if (f === 1) { legRect(8, o + 11, 2, 3); g.rect(8, o + 14, 3, 1, bt); legRect(5, o + 11, 2, 2); g.rect(4, o + 13, 2, 1, bt); }
      else { legRect(5, o + 11, 2, 3); g.rect(5, o + 14, 3, 1, bt); legRect(8, o + 11, 2, 2); g.rect(9, o + 13, 2, 1, bt); }
    } else {
      g.rect(7, o + 11, 2, 1, legTop);
      var lUp = f === 1 ? 1 : 0, rUp = f === 2 ? 1 : 0;
      legRect(5, o + 11, 2, 3 - lUp); g.rect(5, o + 14 - lUp, 2, 1, bt);
      legRect(9, o + 11, 2, 3 - rUp); g.rect(9, o + 14 - rUp, 2, 1, bt);
    }
    if (ot === 'bata') {                                   /* túnica longa até o joelho */
      if (side) { g.rect(6 - bw, o + 11, 4 + bw, 2, top); g.rect(6 - bw, o + 12, 4 + bw, 1, topd); }
      else { g.rect(5 - bw, o + 11, 6 + 2 * bw, 2, top); g.rect(5 - bw, o + 12, 6 + 2 * bw, 1, topd); }
    }

    /* Tronco */
    var tc = sunga ? sk : top, tcd = sunga ? skd : topd;
    if (side) {
      if (coat) { g.rect(5 - bw, o + 7, 5 + bw, 6, s.coat); g.rect(5 - bw, o + 7, 1, 6, s.coatD); g.rect(9, o + 8, 1, 3, top); }
      else {
        g.rect(6 - bw, o + 7, 4 + bw, 4, tc); g.rect(6 - bw, o + 7, 1, 4, tcd);
        if (sunga) g.rect(6 - bw, o + 10, 4 + bw, 1, pn);
        else if (ot !== 'dress' && !swim) g.px(9, o + 8, ac);
        if (s.print === 'neon') g.rect(9, o + 7, 1, 4, ac);
      }
    } else {
      var tx = 5 - bw, tw = 6 + 2 * bw;
      if (coat) {
        g.rect(4 - bw, o + 7, 8 + 2 * bw, 6, s.coat); g.rect(11 + bw, o + 7, 1, 6, s.coatD);
        if (!up) { g.rect(7, o + 7, 2, 4, top); g.px(7, o + 8, ac); g.px(8, o + 8, ac); }
      } else {
        g.rect(tx, o + 7, tw, 4, tc); g.rect(tx + tw - 1, o + 7, 1, 4, tcd);
        if (sunga) { g.rect(tx, o + 10, tw, 1, pn); if (!up) { g.px(6, o + 8, skd); g.px(9, o + 8, skd); } }
        else if (!up) {
          if (swim) { g.px(7, o + 7, sk); g.px(8, o + 7, sk); }
          else if (ot === 'regata') { g.px(7, o + 7, sk); g.px(8, o + 7, sk); }
          else { g.px(7, o + 7, ac); g.px(8, o + 7, ac); }
          if (ot === 'dress') { g.px(6, o + 8, ac2); g.px(9, o + 8, ac2); g.px(7, o + 9, ac); g.px(8, o + 9, ac); }
          else if (ot === 'jacket' || ot === 'macacao' || ot === 'lycra') { g.px(7, o + 9, ac); g.px(8, o + 9, ac); }
          if (ot === 'macacao') g.rect(tx, o + 10, tw, 1, ac2);
          /* estampas */
          if (s.print === 'listras') { g.rect(tx, o + 8, tw - 1, 1, s.printC || '#ffc940'); g.rect(tx, o + 10, tw - 1, 1, s.printC2 || '#3dff9a'); }
          else if (s.print === 'bloco') { g.px(6, o + 8, '#10a860'); g.px(9, o + 8, '#10a860'); g.px(7, o + 9, '#d8243a'); g.px(8, o + 9, '#1e1c28'); g.px(6, o + 10, '#d8243a'); g.px(9, o + 10, '#1e1c28'); }
          else if (s.print === 'floral') { g.px(tx, o + 8, '#ffe08a'); g.px(9, o + 9, '#ff9ac4'); g.px(6, o + 10, '#ff9ac4'); g.px(8, o + 8, '#ffe08a'); }
          else if (s.print === 'kente') { for (var kk = tx; kk < tx + tw - 1; kk++) { g.px(kk, o + 9, (kk % 2) ? '#10a860' : '#1e1c28'); } g.rect(tx, o + 10, tw - 1, 1, '#d8243a'); }
          else if (s.print === 'neon') { g.rect(tx, o + 7, 1, 4, ac); g.rect(tx + tw - 2, o + 7, 1, 4, ac); }
          if (ot === 'lycra') g.rect(tx, o + 9, tw - 1, 1, ac2);
        } else {
          g.rect(tx, o + 7, tw, 1, tcd);
          if (sunga) g.rect(tx, o + 10, tw, 1, pn);
        }
      }
    }

    /* Braços: mangas compridas, curtas ou sem manga */
    var armC = coat ? s.coat : top, armD = coat ? s.coatD : topd;
    var sleeves = (ot === 'regata' || swim) ? 0 : (ot === 'tee' ? 1 : (ot === 'bata' ? 2 : 3));
    var pro = ext.indexOf('protese') >= 0, proC = '#9aa4c0', proD = '#6e7896';
    function armCol(row, dark, left) {                     /* row: 0..2 a partir do ombro */
      if (left && pro) return row === 0 && sleeves ? (dark ? armD : armC) : (dark ? proD : proC);
      if (row < sleeves) return dark ? armD : armC;
      return dark ? skd : sk;
    }
    if (side) {
      var ad = function (r) { return armCol(r, true, false); };
      if (f === 1) { g.rect(8, o + 7, 2, 1, ad(0)); g.rect(8, o + 8, 2, 1, ad(1)); g.rect(9, o + 9, 2, 1, ad(2)); g.px(10, o + 10, pro ? ac : sk); }
      else if (f === 2) { g.rect(6, o + 7, 2, 1, ad(0)); g.rect(6, o + 8, 2, 1, ad(1)); g.rect(5, o + 9, 2, 1, ad(2)); g.px(5, o + 10, pro ? ac : sk); }
      else { g.rect(7, o + 7, 2, 1, ad(0)); g.rect(7, o + 8, 2, 1, ad(1)); g.rect(7, o + 9, 2, 1, ad(2)); g.rect(7, o + 10, 2, 1, pro ? proC : sk); if (pro) g.px(8, o + 10, ac); }
      if (vit && sleeves < 3) g.px(7 + (f === 1 ? 2 : 0), o + 9, vit);
      if (s.wrist) g.px(f === 1 ? 10 : (f === 2 ? 5 : 8), o + 9, s.wrist);
    } else {
      var la = f === 2 ? 1 : 0, ra = f === 1 ? 1 : 0;
      var lx = (coat ? 3 : 4) - bw, rx = (coat ? 12 : 11) + bw;
      for (var r1 = 0; r1 < 3 - la; r1++) g.px(lx, o + 7 + r1, armCol(r1, false, true));
      g.px(lx, o + 10 - la, pro ? ac : sk);
      for (var r2 = 0; r2 < 3 - ra; r2++) g.px(rx, o + 7 + r2, armCol(r2, true, false));
      g.px(rx, o + 10 - ra, skd);
      if (vit) g.px(rx, o + 10 - ra, vit);
      if (s.wrist) g.px(pro ? rx : lx, o + 9 - (pro ? ra : la), s.wrist);
      if (ext.indexOf('bengala') >= 0) {                    /* bengala-guia branca, com ponta vermelha */
        var cx = rx + 1;
        g.rect(cx, o + 9 - ra, 1, 6 + ra, '#f2f0f8'); g.px(cx, o + 12, '#ff4d6a'); g.px(cx, o + 14, '#ff4d6a');
      }
    }
    if (side && ext.indexOf('bengala') >= 0) { g.rect(11, o + 9, 1, 6, '#f2f0f8'); g.px(11, o + 12, '#ff4d6a'); g.px(11, o + 14, '#ff4d6a'); }

    /* Pescoço e cabeça */
    g.rect(7, o + 6, 2, 1, skd);
    if (side) {
      g.rect(5, o, 6, 1, sk); g.rect(4, o + 1, 7, 4, sk); g.rect(5, o + 5, 5, 1, sk); g.px(11, o + 3, sk);
      g.rect(4, o + 1, 1, 4, skd);
      if (s.visor) g.rect(8, o + 2, 4, 1, s.visor);
      else { g.px(9, o + 2, EYE); g.px(9, o + 3, EYE); }
      if (vit) { g.px(5, o + 1, vit); g.px(6, o + 1, vit); g.px(5, o + 2, vit); g.px(10, o + 4, vit); }
      if (s.marks === 'sardas') { g.px(8, o + 4, skd); g.px(10, o + 3, skd); }
    } else {
      g.rect(5, o, 6, 1, sk); g.rect(4, o + 1, 8, 4, sk); g.rect(5, o + 5, 6, 1, sk);
      g.rect(11, o + 1, 1, 4, skd); g.px(10, o + 5, skd);
      if (down) {
        if (s.visor) g.rect(4, o + 2, 8, 1, s.visor);
        else { g.px(6, o + 2, EYE); g.px(6, o + 3, EYE); g.px(9, o + 2, EYE); g.px(9, o + 3, EYE); }
        if (vit) { g.px(4, o + 1, vit); g.px(5, o + 1, vit); g.px(4, o + 2, vit); g.px(10, o + 4, vit); g.px(9, o + 5, vit); }
        if (s.marks === 'sardas') { g.px(5, o + 4, skd); g.px(10, o + 4, skd); g.px(7, o + 3, skd); }
      } else if (vit) { g.px(5, o + 2, vit); g.px(10, o + 3, vit); }
    }
    if (!s.hideHair) (HAIR[s.hairStyle] || HAIR.curto)(g, s, dir, o);
    if (s.hat && HATS[s.hat]) HATS[s.hat](g, s, dir, o, s.hatC, s.hatA || ac);
    if (ext.indexOf('aparelho') >= 0) {                     /* aparelho auditivo */
      if (side) { g.px(5, o + 2, '#e8e6ff'); g.px(5, o + 3, ac); }
      else if (down) { g.px(3, o + 2, '#e8e6ff'); g.px(12, o + 2, '#e8e6ff'); g.px(12, o + 3, ac); }
      else { g.px(3, o + 2, '#e8e6ff'); g.px(12, o + 2, '#e8e6ff'); }
    }
    if (s.glasses && !s.visor) {
      var gs = s.glassesStyle || 'redondo', gc = s.glasses;
      if (gs === 'natacao') {
        if (down) { g.rect(4, o + 2, 8, 1, '#1e1c28'); g.rect(5, o + 2, 2, 2, gc); g.rect(9, o + 2, 2, 2, gc); }
        else if (side) { g.rect(4, o + 2, 5, 1, '#1e1c28'); g.rect(8, o + 2, 3, 2, gc); }
        else g.rect(4, o + 2, 8, 1, '#1e1c28');
      } else if (gs === 'escuro') {
        if (down) { g.rect(5, o + 2, 3, 2, gc); g.rect(8, o + 2, 3, 2, gc); g.px(5, o + 2, '#6a6a8a'); g.px(8, o + 2, '#6a6a8a'); }
        else if (side) { g.rect(8, o + 2, 3, 2, gc); g.px(9, o + 2, '#6a6a8a'); }
      } else if (gs === 'quadrado') {
        if (down) { g.rect(4, o + 2, 4, 2, gc); g.rect(8, o + 2, 4, 2, gc); g.px(6, o + 3, EYE); g.px(9, o + 3, EYE); }
        else if (side) { g.rect(8, o + 2, 4, 2, gc); g.px(9, o + 3, EYE); }
      } else {
        if (down) { g.rect(5, o + 2, 3, 2, gc); g.rect(8, o + 2, 3, 2, gc); g.px(6, o + 3, EYE); g.px(9, o + 3, EYE); }
        else if (side) { g.rect(8, o + 2, 3, 2, gc); g.px(9, o + 3, EYE); }
      }
    }
    if (s.beard && !up) {
      var bs = s.beardStyle || 'cheia', bc = s.beard;
      if (bs === 'bigode') { if (side) { g.px(9, o + 4, bc); g.px(10, o + 4, bc); } else g.rect(6, o + 4, 4, 1, bc); }
      else if (bs === 'cavanhaque') {
        if (side) { g.px(9, o + 4, bc); g.px(10, o + 4, bc); g.px(8, o + 5, bc); g.px(9, o + 5, bc); }
        else { g.rect(6, o + 4, 4, 1, bc); g.rect(7, o + 5, 2, 1, bc); }
      } else {
        if (side) { g.rect(5, o + 4, 6, 2, bc); g.px(9, o + 4, s.skin); }
        else { g.rect(5, o + 4, 6, 2, bc); g.rect(7, o + 4, 2, 1, s.skinD); }
      }
    }
    if (s.necklace && down) { g.px(6, o + 7, s.necklace); g.px(9, o + 7, s.necklace); g.px(7, o + 8, s.necklace); g.px(8, o + 8, s.necklace); }
    if (s.beads && down) { var bd = s.beads; g.px(6, o + 7, bd[0]); g.px(7, o + 8, bd[1]); g.px(8, o + 8, bd[2]); g.px(9, o + 7, bd[0]); }
  }

  AF.Chars = {
    W: W, H: H,
    build: function (spec) {
      var out = {};
      ['down', 'up', 'right'].forEach(function (dir) {
        out[dir] = [0, 1, 2].map(function (f) {
          return AF.Pix.sprite(W, H, function (g) { paint(g, spec, dir, f); }, true);
        });
      });
      out.left = out.right.map(function (c) { return AF.Pix.flipH(c); });
      return out;
    },
    /* Retrato: recorte de cabeça + tronco do quadro de frente */
    portrait: function (spec) {
      var full = AF.Pix.sprite(W, H, function (g) { paint(g, spec, 'down', 0); }, true);
      var c = AF.Pix.canvas(16, 16);
      c.getContext('2d').drawImage(full, 0, 0, 16, 16, 0, 0, 16, 16);
      return c;
    },
    /* look: características da ficha · eq: peças compradas (slot → id) · opts.swim: traje de banho */
    playerSpec: function (look, eq, opts) {
      var L = AF.LOOKS, lk = Object.assign({}, AF.LOOK_DEFAULT, look || {});
      function f(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return list[0]; }
      var skin = f(L.skins, lk.skin), acc = f(L.accents, lk.accent), hc = f(L.hairColors, lk.hairColor);
      var tp = f(L.tops, lk.top), pt = f(L.pants, lk.pants);
      var s = {
        skin: skin.base, skinD: skin.shade, hair: hc.c, hairL: hc.l, hairStyle: lk.hair,
        wrap: acc.color, wrap2: tp.c,
        top: tp.c, topD: tp.d, accent: acc.color, accentD: acc.dark,
        pants: lk.outfit === 'macacao' ? tp.c : pt.c, boots: '#0d0d18', outfit: lk.outfit,
        body: lk.body, marks: lk.marks, extras: (lk.extras || []).slice(),
        beard: lk.beard !== 'nenhuma' ? hc.c : null, beardStyle: lk.beard,
        glasses: lk.glasses !== 'nenhum' ? '#2a2a3a' : null, glassesStyle: lk.glasses
      };
      if (lk.outfit === 'coat') { s.coat = '#d8dcec'; s.coatD = '#a2a8c4'; }
      if (lk.outfit === 'dress') s.accent2 = acc.dark;
      function apply(patch) {
        Object.keys(patch).forEach(function (k) {
          var v = patch[k];
          s[k] = v === 'accent' ? acc.color : v;
        });
      }
      eq = eq || {};
      Object.keys(eq).forEach(function (slot) {
        var it = AF.SHOP_BY_ID && AF.SHOP_BY_ID[eq[slot]];
        if (it) apply(it.patch);
      });
      if (opts && opts.swim) {                         /* traje de natação */
        var v = opts.swim;
        s.outfit = v === 'bermuda' ? 'lycra' : 'swim'; s.swimV = v;
        s.top = v === 'maio' ? '#00a9c4' : '#1a6a9a'; s.topD = v === 'maio' ? '#006a80' : '#104a6e';
        s.pants = v === 'sunga' ? '#e8701a' : (v === 'bermuda' ? '#1a2a5a' : '#00a9c4');
        s.shorts = true; s.barefoot = true; s.print = null; s.beads = null; s.visor = null;
        s.hat = 'touca'; s.hatC = '#ffc940'; s.hideHair = s.hairStyle !== 'careca';
        s.glasses = '#3aa0ff'; s.glassesStyle = 'natacao';
        if (s.extras.indexOf('bengala') >= 0) s.extras = s.extras.filter(function (e) { return e !== 'bengala'; });
      }
      return s;
    }
  };

  /* Personagens não jogáveis */
  AF.SPECS = {
    dandara: { skin: '#4a2a1c', skinD: '#331a12', hair: '#1a1018', hairL: '#2e1e28', hairStyle: 'turbante',
      wrap: '#ffc940', wrap2: '#a8186a', top: '#6a1a4a', topD: '#4a1034', accent: '#ffc940', accentD: '#b07a10',
      accent2: '#3dff9a', pants: '#2a1830', boots: '#1a1020', outfit: 'dress', pattern: 'kente' },
    iasmin: { skin: '#6e4230', skinD: '#4e2c20', hair: '#20141c', hairL: '#3e2c38', hairStyle: 'locs',
      top: '#1a4a6a', topD: '#103450', accent: '#00e5ff', accentD: '#0089a8', pants: '#1c2034', boots: '#141420',
      outfit: 'coat', coat: '#d8dcec', coatD: '#a2a8c4' },
    jamal: { skin: '#5a3424', skinD: '#3f2218', hair: '#140c12', hairL: '#2c2028', hairStyle: 'afro',
      top: '#1f6a4a', topD: '#145034', accent: '#3dff9a', accentD: '#10a860', pants: '#1c2034', boots: '#141420',
      outfit: 'jacket' },
    cici: { skin: '#4a2a1c', skinD: '#331a12', hair: '#1a1018', hairL: '#2e1e28', hairStyle: 'turbante',
      wrap: '#ecebf6', wrap2: '#c4c0dc', top: '#ecebf6', topD: '#b8b4d0', accent: '#ff3fa4', accentD: '#a8186a',
      accent2: '#ffc940', pants: '#ecebf6', boots: '#8a6a4a', outfit: 'dress', pattern: 'kente', necklace: '#ffc940' },
    hohenfeld: { skin: '#b07e5e', skinD: '#8a5e44', hair: '#17101a', hairL: '#33242e', hairStyle: 'curto',
      top: '#1a6a9a', topD: '#104a6e', accent: '#ffc940', accentD: '#b07a10', accent2: '#ffc940', pants: '#e8701a', boots: '#6a4a32',
      outfit: 'lycra', shorts: true, barefoot: true, beard: '#17101a', beardStyle: 'cavanhaque', wrist: '#3dff9a' },
    zeza: { skin: '#5a3424', skinD: '#3f2218', hair: '#1a1018', hairL: '#2e1e28', hairStyle: 'turbante',
      wrap: '#3dff9a', wrap2: '#10a860', top: '#ffc940', topD: '#b07a10', accent: '#3dff9a', accentD: '#10a860',
      accent2: '#ff3fa4', pants: '#2a1830', boots: '#6a4a32', outfit: 'dress', pattern: 'kente', necklace: '#ff3fa4' },
    socorro: { skin: '#6a4030', skinD: '#4a2a20', hair: '#d8d4e0', hairL: '#f0eef8', hairStyle: 'afro',
      top: '#8a3a2a', topD: '#5a2418', accent: '#ffc940', accentD: '#b07a10', pants: '#4a3a2a', boots: '#3a2418',
      outfit: 'dress', necklace: '#ffc940' },
    davi: { skin: '#5a3424', skinD: '#3f2218', hair: '#1a1018', hairL: '#3a2a30', hairStyle: 'raspado',
      top: '#ffc940', topD: '#b07a10', accent: '#2c744e', accentD: '#1a4a32', pants: '#2a3a6a', boots: '#ecebf6', outfit: 'jacket' },
    aluna: { skin: '#4a2a1c', skinD: '#331a12', hair: '#1a1018', hairL: '#3a2a30', hairStyle: 'afro',
      top: '#ecebf6', topD: '#b8b4d0', accent: '#1a4a9a', accentD: '#103470', pants: '#1a3a7a', boots: '#ecebf6', outfit: 'jacket' },
    aluno: { skin: '#8a5a3a', skinD: '#6a4028', hair: '#1a1018', hairL: '#3a2a30', hairStyle: 'raspado',
      top: '#ecebf6', topD: '#b8b4d0', accent: '#1a4a9a', accentD: '#103470', pants: '#1a3a7a', boots: '#2a2f45', outfit: 'jacket' },
    miayo: { skin: '#3a2014', skinD: '#28140c', hair: '#17101a', hairL: '#33242e', hairStyle: 'locs', hideHair: true,
      top: '#00a9c4', topD: '#006a80', accent: '#ffc940', accentD: '#b07a10', pants: '#00a9c4', boots: '#28140c',
      outfit: 'swim', swimV: 'maio', shorts: true, barefoot: true, hat: 'touca', hatC: '#ff3fa4', necklace: '#ffc940',
      glasses: '#3aa0ff', glassesStyle: 'natacao' },
    lu: { skin: '#5c3624', skinD: '#40241a', hair: '#8a8698', hairL: '#c4c0d0', hairStyle: 'coque',
      top: '#d8243a', topD: '#a01428', accent: '#ffc940', accentD: '#b07a10', accent2: '#3dff9a', pants: '#2a1830', boots: '#6a4a32',
      outfit: 'dress', print: 'floral', beads: ['#ffc940', '#3dff9a', '#ff4d6a'], glasses: '#ffc940', glassesStyle: 'quadrado' },
    didi: { skin: '#5a3424', skinD: '#3f2218', hair: '#c4c0d0', hairL: '#f2f0f8', hairStyle: 'careca',
      top: '#ecebf6', topD: '#b8b4d0', accent: '#1a4a9a', accentD: '#103470', pants: '#2a3a6a', boots: '#3f2218',
      outfit: 'regata', shorts: true, barefoot: true, hat: 'palha', hatC: '#d8b060', hatA: '#8a3418', beard: '#c4c0d0', beardStyle: 'cheia' },
    kaua: { skin: '#7a4a32', skinD: '#5a3424', hair: '#1a1018', hairL: '#3a2a30', hairStyle: 'curto',
      top: '#a8186a', topD: '#7a1050', accent: '#00e5ff', accentD: '#0089a8', pants: '#20243a', boots: '#e8e6ff',
      outfit: 'jacket', visor: '#00e5ff' }
  };
})(window.AF);
