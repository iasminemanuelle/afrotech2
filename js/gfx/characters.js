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
    }
  };

  /* ---------- Corpo ---------- */
  function paint(g, s, dir, f) {
    var o = OY;
    var side = dir === 'right', up = dir === 'up', down = dir === 'down';
    var sk = s.skin, skd = s.skinD, top = s.top, topd = s.topD;
    var ac = s.accent, ac2 = s.accent2 || s.accentD || s.accent;
    var pn = s.pants, bt = s.boots;
    var coat = s.outfit === 'coat';

    /* Pernas / saia */
    if (s.outfit === 'dress') {
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
    } else if (side) {
      if (f === 0) { g.rect(6, o + 11, 3, 3, pn); g.rect(6, o + 14, 4, 1, bt); }
      else if (f === 1) { g.rect(8, o + 11, 2, 3, pn); g.rect(8, o + 14, 3, 1, bt); g.rect(5, o + 11, 2, 2, pn); g.rect(4, o + 13, 2, 1, bt); }
      else { g.rect(5, o + 11, 2, 3, pn); g.rect(5, o + 14, 3, 1, bt); g.rect(8, o + 11, 2, 2, pn); g.rect(9, o + 13, 2, 1, bt); }
    } else {
      g.rect(7, o + 11, 2, 1, pn);
      var lUp = f === 1 ? 1 : 0, rUp = f === 2 ? 1 : 0;
      g.rect(5, o + 11, 2, 3 - lUp, pn); g.rect(5, o + 14 - lUp, 2, 1, bt);
      g.rect(9, o + 11, 2, 3 - rUp, pn); g.rect(9, o + 14 - rUp, 2, 1, bt);
    }

    /* Tronco */
    if (side) {
      if (coat) { g.rect(5, o + 7, 5, 6, s.coat); g.rect(5, o + 7, 1, 6, s.coatD); g.rect(9, o + 8, 1, 3, top); }
      else { g.rect(6, o + 7, 4, 4, top); g.rect(6, o + 7, 1, 4, topd); if (s.outfit !== 'dress') g.px(9, o + 8, ac); }
    } else {
      if (coat) {
        g.rect(4, o + 7, 8, 6, s.coat); g.rect(11, o + 7, 1, 6, s.coatD);
        if (!up) { g.rect(7, o + 7, 2, 4, top); g.px(7, o + 8, ac); g.px(8, o + 8, ac); }
      } else {
        g.rect(5, o + 7, 6, 4, top); g.rect(10, o + 7, 1, 4, topd);
        if (!up) {
          g.px(7, o + 7, ac); g.px(8, o + 7, ac);
          if (s.outfit === 'dress') { g.px(6, o + 8, ac2); g.px(9, o + 8, ac2); g.px(7, o + 9, ac); g.px(8, o + 9, ac); }
          else { g.px(7, o + 9, ac); g.px(8, o + 9, ac); }
        } else { g.rect(5, o + 7, 6, 1, topd); }
      }
    }

    /* Braços */
    var armC = coat ? s.coat : top, armD = coat ? s.coatD : topd;
    if (side) {
      if (f === 1) { g.rect(8, o + 7, 2, 2, armD); g.rect(9, o + 9, 2, 1, armD); g.px(10, o + 10, sk); }
      else if (f === 2) { g.rect(6, o + 7, 2, 2, armD); g.rect(5, o + 9, 2, 1, armD); g.px(5, o + 10, sk); }
      else { g.rect(7, o + 7, 2, 3, armD); g.rect(7, o + 10, 2, 1, sk); }
    } else {
      var la = f === 2 ? 1 : 0, ra = f === 1 ? 1 : 0;
      var lx = coat ? 3 : 4, rx = coat ? 12 : 11;
      g.rect(lx, o + 7, 1, 3 - la, armC); g.px(lx, o + 10 - la, sk);
      g.rect(rx, o + 7, 1, 3 - ra, armD); g.px(rx, o + 10 - ra, skd);
    }

    /* Pescoço e cabeça */
    g.rect(7, o + 6, 2, 1, skd);
    if (side) {
      g.rect(5, o, 6, 1, sk); g.rect(4, o + 1, 7, 4, sk); g.rect(5, o + 5, 5, 1, sk); g.px(11, o + 3, sk);
      g.rect(4, o + 1, 1, 4, skd);
      if (s.visor) g.rect(8, o + 2, 4, 1, s.visor);
      else { g.px(9, o + 2, EYE); g.px(9, o + 3, EYE); }
    } else {
      g.rect(5, o, 6, 1, sk); g.rect(4, o + 1, 8, 4, sk); g.rect(5, o + 5, 6, 1, sk);
      g.rect(11, o + 1, 1, 4, skd); g.px(10, o + 5, skd);
      if (down) {
        if (s.visor) g.rect(4, o + 2, 8, 1, s.visor);
        else { g.px(6, o + 2, EYE); g.px(6, o + 3, EYE); g.px(9, o + 2, EYE); g.px(9, o + 3, EYE); }
      }
    }
    (HAIR[s.hairStyle] || HAIR.curto)(g, s, dir, o);
    if (s.glasses) {                       /* óculos de professor */
      if (down) { g.rect(5, o + 2, 3, 2, s.glasses); g.rect(8, o + 2, 3, 2, s.glasses); g.px(6, o + 3, EYE); g.px(9, o + 3, EYE); }
      else if (side) { g.rect(8, o + 2, 3, 2, s.glasses); g.px(9, o + 3, EYE); }
    }
    if (s.beard && !up) {
      if (side) { g.rect(5, o + 4, 6, 2, s.beard); g.px(9, o + 4, s.skin); }
      else { g.rect(5, o + 4, 6, 2, s.beard); g.rect(7, o + 4, 2, 1, s.skinD); }
    }
    if (s.necklace && down) { g.px(6, o + 7, s.necklace); g.px(9, o + 7, s.necklace); g.px(7, o + 8, s.necklace); g.px(8, o + 8, s.necklace); }
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
    playerSpec: function (look) {
      var skin = AF.LOOKS.skins.find(function (s) { return s.id === look.skin; }) || AF.LOOKS.skins[0];
      var acc = AF.LOOKS.accents.find(function (a) { return a.id === look.accent; }) || AF.LOOKS.accents[0];
      return {
        skin: skin.base, skinD: skin.shade, hair: '#17101a', hairL: '#33242e', hairStyle: look.hair,
        wrap: acc.color, wrap2: '#232a52',
        top: '#232a52', topD: '#171c3a', accent: acc.color, accentD: acc.dark,
        pants: '#161a2e', boots: '#0d0d18', outfit: 'jacket'
      };
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
    hohenfeld: { skin: '#b07e5e', skinD: '#8a5e44', hair: '#c8c4d4', hairL: '#ecebf6', hairStyle: 'curto',
      top: '#d8e4ec', topD: '#a8b8c8', accent: '#1a4a6a', accentD: '#103450', pants: '#3a4a5e', boots: '#6a4a32',
      outfit: 'jacket', glasses: '#2a2a3a', beard: '#b8b4c4' },
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
    kaua: { skin: '#7a4a32', skinD: '#5a3424', hair: '#1a1018', hairL: '#3a2a30', hairStyle: 'curto',
      top: '#a8186a', topD: '#7a1050', accent: '#00e5ff', accentD: '#0089a8', pants: '#20243a', boots: '#e8e6ff',
      outfit: 'jacket', visor: '#00e5ff' }
  };
})(window.AF);
