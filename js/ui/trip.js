/* =========================================================================
 * trip.js — viagens animadas: o(a) agente embarca, o percurso passa pela
 * janela e o(a) agente desembarca no destino.
 *   casa           · VLT da Baía, Comércio → Ribeira (1 minuto de percurso)
 *   casa_volta     · VLT da Baía, Ribeira → Comércio
 *   jacobina       · Hipertrem, Salvador → Jacobina (10 segundos)
 *   jacobina_volta · Hipertrem, Jacobina → Salvador (10 segundos)
 * Na primeira vez de cada trajeto a viagem é inteira; depois dá para pular.
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State, C = AF.CONFIG, P = AF.Pix;
  var BOARD = 2.2, ALIGHT = 2.0;

  var ROUTES = {
    casa: {
      vehicle: 'vlt', sky: 'tarde', dur: 60, music: 'praia', dest: ['ribeira', 'vlt'],
      title: 'VLT da Baía · Comércio → Ribeira',
      stops: [
        [0.5, 'comercio', 'Comércio', 'Partida em frente ao Mercado Modelo. Lá no alto, o Elevador Lacerda brilha em ciano: o canal quântico voltou.'],
        [8.5, 'agua', 'Água de Meninos', 'Aqui funcionava a antiga Feira de Água de Meninos, à beira da baía. Depois de um incêndio nos anos 1960, a feira se mudou para São Joaquim.'],
        [17, 'feira', 'Feira de São Joaquim', 'Saveiros chegam do Recôncavo com farinha, frutas e a cerâmica de Maragogipinho. Cheiro de dendê, coentro e maresia.'],
        [26, 'calcada', 'Calçada', 'Da estação da Calçada partia o Trem do Subúrbio, que corria pela beira da baía até Paripe.'],
        [35, 'roma', 'Largo de Roma', 'O Santuário de Santa Dulce dos Pobres, a Irmã Dulce, que cuidou dos mais pobres de Salvador por toda a vida.'],
        [44, 'bonfim', 'Colina Sagrada · Bonfim', 'A Basílica do Senhor do Bonfim no alto da colina. Em janeiro, na Lavagem do Bonfim, baianas de branco lavam as escadarias com água de cheiro.'],
        [54, 'ribeira', 'Ribeira', 'Chegando em casa: saveiros, a sorveteria da orla e o pôr do sol na Enseada dos Tainheiros.']
      ]
    },
    casa_volta: {
      vehicle: 'vlt', sky: 'manha', dur: 20, music: 'praca', dest: ['praca', 'from_vlt'], reverse: true,
      title: 'VLT da Baía · Ribeira → Comércio',
      stops: [
        [0.5, 'ribeira', 'Ribeira', 'Bom dia, Enseada dos Tainheiros!'],
        [4, 'bonfim', 'Bonfim', 'A Colina Sagrada fica para trás.'],
        [8, 'roma', 'Largo de Roma', 'Santuário de Santa Dulce dos Pobres.'],
        [11, 'feira', 'São Joaquim', 'Saveiros descarregando na feira.'],
        [15.5, 'comercio', 'Comércio', 'Próxima parada: Praça Cairu, Mercado Modelo e Elevador Lacerda.']
      ]
    },
    jacobina: {
      vehicle: 'trem', sky: 'viagem', dur: 10, music: 'jacobina', dest: ['jacobina', 'chegada'],
      title: 'Hipertrem · Salvador → Jacobina (cerca de 300 km)',
      stops: [
        [0.3, 'sal', 'Salvador', 'O Hipertrem sai do Comércio e corre sobre o trilho magnético.'],
        [2.4, 'rec', 'BR-324 · Recôncavo', 'Canaviais e morros verdes do Recôncavo.'],
        [4.6, 'feira_s', 'Feira de Santana', 'A segunda maior cidade da Bahia passa num piscar de olhos.'],
        [6.8, 'sertao', 'Sertão', 'Caatinga, mandacarus e o céu ficando roxo.'],
        [8.9, 'serra', 'Jacobina', 'As serras da Cidade do Ouro e as luzes da Estação Receptora.']
      ]
    },
    jacobina_volta: {
      vehicle: 'trem', sky: 'volta', dur: 10, music: 'praca', dest: ['praca', 'from_jac'], reverse: true,
      title: 'Hipertrem · Jacobina → Salvador',
      stops: [
        [0.3, 'serra', 'Jacobina', 'Até logo, Cidade do Ouro!'],
        [2.6, 'sertao', 'Sertão', 'Mandacarus ao luar.'],
        [5, 'feira_s', 'Feira de Santana', 'Metade do caminho.'],
        [7.2, 'rec', 'Recôncavo', 'O dia clareando no Recôncavo.'],
        [9.1, 'sal', 'Salvador', 'Chegando ao Comércio.']
      ]
    }
  };

  function ease(x) { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function mix(a, b, k) {
    var A = P.hexToRgb(a), B = P.hexToRgb(b);
    return 'rgb(' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * k); }).join(',') + ')';
  }
  function rng(seed) { return P.rng(seed); }

  /* ---------------- marcos do caminho (desenhados por código) ---------------- */
  var MARK = {
    comercio: function (x, gy, r) {
      r(x - 40, gy - 26, 54, 26, '#e8c48a'); r(x - 40, gy - 30, 54, 4, '#b0502e');
      for (var i = 0; i < 5; i++) r(x - 36 + i * 10, gy - 20, 5, 8, '#6a4228');
      r(x + 26, gy - 92, 12, 92, '#c8c4d8'); r(x + 22, gy - 96, 20, 8, '#e8e6f6'); r(x + 31, gy - 92, 2, 92, '#00e5ff');
      r(x + 38, gy - 92, 30, 4, '#c8c4d8');
    },
    agua: function (x, gy, r) {
      for (var i = 0; i < 3; i++) { r(x - 50 + i * 34, gy - 22, 30, 22, '#8a7a8e'); r(x - 52 + i * 34, gy - 26, 34, 4, '#5a4a6a'); r(x - 44 + i * 34, gy - 14, 10, 14, '#3a2a4a'); }
    },
    feira: function (x, gy, r) {
      var cols = ['#ff3fa4', '#ffc940', '#3dff9a', '#3a9ab0', '#e8701a'];
      for (var i = 0; i < 7; i++) { var c = cols[i % 5]; r(x - 60 + i * 18, gy - 16, 16, 3, c); r(x - 58 + i * 18, gy - 13, 12, 13, '#4a3a2a'); r(x - 56 + i * 18, gy - 9, 3, 4, '#ffe08a'); }
    },
    calcada: function (x, gy, r) {
      r(x - 56, gy - 24, 112, 24, '#d8c8a8'); r(x - 58, gy - 28, 116, 4, '#8a3a22');
      r(x - 8, gy - 44, 16, 20, '#d8c8a8'); r(x - 10, gy - 47, 20, 3, '#8a3a22');
      r(x - 4, gy - 40, 8, 8, '#f2f0f8'); r(x - 1, gy - 39, 1, 4, '#1e1c28'); r(x - 1, gy - 36, 3, 1, '#1e1c28');
      for (var i = 0; i < 8; i++) r(x - 52 + i * 14, gy - 18, 6, 10, '#3a5a8a');
    },
    roma: function (x, gy, r) {
      r(x - 30, gy - 30, 60, 30, '#f2eee0'); r(x - 6, gy - 52, 12, 22, '#f2eee0'); r(x - 4, gy - 58, 8, 6, '#3a9ab0'); r(x - 1, gy - 64, 2, 6, '#ffc940');
      r(x - 5, gy - 14, 10, 14, '#3a6ab0'); for (var i = 0; i < 4; i++) r(x - 26 + i * 14 + (i > 1 ? 12 : 0), gy - 24, 5, 7, '#3a6ab0');
    },
    bonfim: function (x, gy, r) {
      for (var i = -90; i <= 90; i++) { var h = Math.round(34 * Math.cos(i / 90 * Math.PI / 2)); r(x + i, gy - h, 1, h, '#5a8a4a'); }
      var cy = gy - 34;
      r(x - 26, cy - 26, 52, 26, '#f2eee0'); r(x - 30, cy - 46, 12, 46, '#f2eee0'); r(x + 18, cy - 46, 12, 46, '#f2eee0');
      r(x - 29, cy - 50, 10, 4, '#3a9ab0'); r(x + 19, cy - 50, 10, 4, '#3a9ab0');
      r(x - 8, cy - 34, 16, 8, '#f2eee0'); r(x - 1, cy - 40, 2, 6, '#ffc940');
      r(x - 5, cy - 14, 10, 14, '#6a4228');
      var fc = ['#3dff9a', '#ffc940', '#ff3fa4', '#3a9ab0', '#f2f0f8', '#d8243a'];
      for (var k = 0; k < 24; k++) r(x - 48 + k * 4, cy + 2, 2, 4 + (k % 3), fc[k % 6]);         /* fitinhas na grade */
    },
    ribeira: function (x, gy, r) {
      var cols = ['#e8a838', '#3a9ab0', '#d86a8a', '#8ac04a'];
      for (var i = 0; i < 5; i++) { r(x - 60 + i * 22, gy - 26, 20, 26, cols[i % 4]); r(x - 60 + i * 22, gy - 29, 20, 3, '#b0502e'); r(x - 54 + i * 22, gy - 18, 6, 8, '#3a2a4a'); }
      for (var u = 0; u < 7; u++) { var hw = 4 + u; r(x + 54 - hw, gy - 40 + u, hw * 2, 1, u % 2 ? '#f2f0f8' : '#3a9ab0'); }
      r(x + 53, gy - 33, 2, 20, '#d8d4e8'); r(x + 46, gy - 14, 16, 14, '#f2f0f8');
    }
  };

  var T = AF.Trip = {
    cur: null, ui: null,

    play: function (id) {
      var R = ROUTES[id];
      if (!R || this.cur) return;
      var key = 'trip_' + id, seen = S.count(key) > 0;
      this.cur = { id: id, R: R, t: 0, total: BOARD + R.dur + ALIGHT, canSkip: seen, stop: -1, done: false, sounds: {} };
      this.music = R.music;
      AF.World.target = null;
      AF.Game.mode = 'trip';
      var bn = document.getElementById('banner'); if (bn) { bn.classList.add('hidden'); bn.classList.remove('show'); }
      AF.Input.clear();
      this.buildUI();
      this.caption(R.title, seen ? 'Toque em Pular ou aperte E para pular a viagem.' : 'Aproveite a vista pela janela.');
      AF.FX.fade(false, 300);
    },

    buildUI: function () {
      if (!this.ui) {
        this.ui = AF.el('div', '');
        this.ui.id = 'trip-ui';
        this.ui.innerHTML = '<div class="trip-cap"></div><button class="btn btn-sm" id="trip-skip">Pular ▸</button>';
        document.getElementById('stage').appendChild(this.ui);
        this.ui.querySelector('#trip-skip').addEventListener('click', function () { T.skip(); });
      }
      this.ui.classList.remove('hidden');
      this.ui.querySelector('#trip-skip').style.display = this.cur.canSkip ? '' : 'none';
    },
    caption: function (title, text) {
      if (this.ui) this.ui.querySelector('.trip-cap').innerHTML = '<b>' + title + '</b>' + text;
    },
    skip: function () {
      var c = this.cur;
      if (!c || !c.canSkip || c.done) return;
      c.t = Math.max(c.t, c.total - 0.6);
    },

    update: function (dt) {
      var c = this.cur;
      if (!c) return;
      if (c.canSkip && AF.Input.consume('interact')) this.skip();
      AF.Input.consume('menu');
      c.t += dt;
      var R = c.R, tt = c.t - BOARD;
      /* sons de embarque e desembarque */
      if (!c.sounds.close && c.t > 1.3) { c.sounds.close = 1; AF.Audio.play('door_close'); }
      if (!c.sounds.go && c.t > BOARD - 0.4) { c.sounds.go = 1; AF.Audio.play('chime'); }
      if (!c.sounds.arrive && tt > R.dur - 0.3) { c.sounds.arrive = 1; AF.Audio.play('chime'); }
      if (!c.sounds.open && tt > R.dur + 0.3) { c.sounds.open = 1; AF.Audio.play('door_open'); }
      /* legendas: a parada atual */
      var si = -1;
      R.stops.forEach(function (s, i) { if (tt >= s[0]) si = i; });
      if (si !== c.stop && si >= 0) {
        c.stop = si;
        var st = R.stops[si];
        this.caption(st[2], st[3]);
        if (si > 0) AF.Audio.play('note');
      }
      if (c.t >= c.total && !c.done) this.finish();
    },

    finish: function () {
      var c = this.cur;
      c.done = true;
      S.inc('trip_' + c.id);
      AF.FX.fade(true, 260);
      setTimeout(function () {
        T.cur = null; T.music = null;
        if (T.ui) T.ui.classList.add('hidden');
        AF.Game.mode = 'play';
        AF.Game.arrive(c.R.dest[0], c.R.dest[1]);
      }, 300);
    },

    /* ---------------- desenho ---------------- */
    render: function (ctx) {
      var c = this.cur;
      if (!c) return;
      var W = C.W, H = C.H, R = c.R, tt = c.t - BOARD;
      var k = Math.max(0, Math.min(1, tt / R.dur));
      var dist = ease(k) * this.total(R);
      if (R.reverse) dist = -dist;
      var r = function (x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
      ctx.save();
      if (R.vehicle === 'vlt') this.drawCity(ctx, r, W, H, dist, k, c);
      else this.drawCountry(ctx, r, W, H, dist, k, c);
      ctx.restore();
    },

    /* distância total percorrida na tela (px): devagar no VLT, para dar tempo de ver cada lugar */
    total: function (R) { return R.vehicle === 'vlt' ? R.dur * 34 : 4200; },

    sky: function (ctx, W, H, top, mid, low) {
      var g = ctx.createLinearGradient(0, 0, 0, H * 0.72);
      g.addColorStop(0, top); g.addColorStop(0.6, mid); g.addColorStop(1, low);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    },

    /* VLT pela beira da baía: céu, Cidade Alta, marcos, trilho elevado e o mar */
    drawCity: function (ctx, r, W, H, dist, k, c) {
      var R = c.R, morning = R.sky === 'manha';
      this.sky(ctx, W, H, morning ? '#3a6ab0' : mix('#3a2a7a', '#1a1040', k), morning ? '#9ac4e8' : mix('#e8705a', '#a83a6a', k), morning ? '#ffe0b0' : mix('#ffc070', '#ff8a5a', k));
      var sunY = morning ? H * (0.42 - 0.1 * k) : H * (0.3 + 0.16 * k);
      ctx.fillStyle = 'rgba(255,224,138,0.25)'; ctx.beginPath(); ctx.arc(W * 0.72, sunY, 22, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(W * 0.72, sunY, 11, 0, 7); ctx.fill();
      var gy = Math.round(H * 0.6);                        /* chão da cidade */
      /* escarpa da Cidade Alta (paralaxe lenta) */
      var off = dist * 0.15, rr = rng(77);
      for (var x = -40; x < W + 40; x += 4) {
        var wx = x + off, h = 30 + 14 * Math.sin(wx / 90) + 8 * Math.sin(wx / 31);
        r(x, gy - h - 18, 4, h + 18, '#3a2a5a');
        if (((wx / 4) | 0) % 9 === 0) r(x + 1, gy - h - 22, 2, 4, '#f2eee0');
      }
      void rr;
      /* casario intermediário */
      var off2 = dist * 0.55, cols = ['#e8a838', '#3a9ab0', '#d86a8a', '#f2eee0', '#8ac04a', '#e8701a', '#b07aff'];
      var start = Math.floor((off2 - 40) / 26);
      for (var i = start; i < start + Math.ceil(W / 26) + 4; i++) {
        var bx = i * 26 - off2, hh = 14 + ((i * 7919) % 17), col = cols[((i % 7) + 7) % 7];
        r(bx, gy - hh, 24, hh, col); r(bx, gy - hh - 3, 24, 3, '#a04a2a'); r(bx + 4, gy - hh + 4, 4, 5, '#3a2a4a'); r(bx + 15, gy - hh + 4, 4, 5, '#3a2a4a');
      }
      /* marcos do caminho: cada um passa no centro da tela na hora da legenda */
      var span = Math.abs(dist), TOT = this.total(R), dirS = R.reverse ? -1 : 1;
      R.stops.forEach(function (st) {
        /* o lugar entra pela lateral quando a legenda aparece e passa pelo centro uns 3 s depois */
        var kp = ease(Math.min(1, (st[0] + 3) / R.dur)) * TOT, lx = W / 2 + (kp - span) * dirS;
        if (lx > -160 && lx < W + 160 && MARK[st[1]]) MARK[st[1]](lx, gy, r);
      });
      r(0, gy, W, 6, '#5a4a6a');
      /* trilho elevado e pilares */
      var ty = Math.round(H * 0.7);
      r(0, ty, W, 5, '#9a94b4'); r(0, ty + 5, W, 2, '#5a5672');
      var poff = ((dist % 48) + 48) % 48;
      for (var px = -poff; px < W + 48; px += 48) { r(px, ty + 7, 6, H, '#6e6888'); r(px - 2, ty + 7, 10, 2, '#9a94b4'); }
      /* mar da baía em primeiro plano */
      var sy = ty + 12;
      r(0, sy, W, H - sy, morning ? '#1a5a9a' : mix('#2a4a8a', '#1a2a5a', k));
      var woff = dist * 1.4;
      for (var yy = sy + 2; yy < H; yy += 5) {
        for (var wx2 = -((woff + yy * 7) % 40); wx2 < W; wx2 += 40) r(wx2, yy, 10, 1, morning ? '#7ac8f0' : '#ffb08a');
      }
      var boatX = ((-(dist * 1.2) % (W + 200)) + W + 200) % (W + 200) - 100;
      this.saveiro(r, boatX, H - 4);
      this.vehicle(ctx, r, W / 2, ty, c, 'vlt');
    },

    saveiro: function (r, x, y) {
      r(x - 16, y - 4, 32, 4, '#6a3a24'); r(x - 14, y, 28, 2, '#4a2618');
      for (var i = 0; i < 14; i++) r(x, y - 6 - i, Math.round(i * 0.8), 1, '#ece4d2');
      r(x - 1, y - 22, 2, 18, '#5a3a24');
    },

    /* Hipertrem pelo interior: Recôncavo verde, sertão, serra à noite */
    drawCountry: function (ctx, r, W, H, dist, k, c) {
      var R = c.R, kk = R.reverse ? 1 - k : k;            /* kk: 0 = Salvador, 1 = Jacobina */
      this.sky(ctx, W, H, mix('#3a8ad8', '#0b0a2a', ease(kk)), mix('#9ad0f0', '#3a1a5a', ease(kk)), mix('#f2e8c0', '#a8406a', kk));
      if (kk > 0.7) {                                    /* estrelas do sertão */
        var a = (kk - 0.7) / 0.3, rs = rng(5);
        for (var s = 0; s < 60; s++) { ctx.fillStyle = 'rgba(255,255,240,' + (a * (0.4 + rs() * 0.6)).toFixed(2) + ')'; ctx.fillRect(Math.floor(rs() * W), Math.floor(rs() * H * 0.45), 1, 1); }
      }
      var gy = Math.round(H * 0.66);
      /* serras ao fundo (crescem perto de Jacobina) */
      var off = dist * 0.12, sh = 10 + 40 * kk;
      for (var x = 0; x < W; x += 3) {
        var wx = x + off, h = sh * (0.6 + 0.4 * Math.sin(wx / 70)) + 6 * Math.sin(wx / 23);
        r(x, gy - h, 3, h, mix('#4a8a6a', '#3a2a5a', kk));
      }
      /* chão: verde → caatinga */
      r(0, gy, W, H - gy, mix('#3a8a3a', '#8a6a3a', Math.min(1, kk * 1.4)));
      /* vegetação passando rápido */
      var off2 = dist * 1.6, start = Math.floor((off2 - 30) / 34);
      for (var i = start; i < start + Math.ceil(W / 34) + 3; i++) {
        var bx = i * 34 - off2, seed = ((i * 2654435761) >>> 0) % 100;
        var dry = (seed / 100) < kk;
        if (dry) {                                       /* mandacaru */
          r(bx + 6, gy - 22, 4, 22, '#2c744e'); r(bx, gy - 16, 3, 8, '#2c744e'); r(bx, gy - 16, 6, 3, '#2c744e'); r(bx + 12, gy - 18, 3, 8, '#2c744e'); r(bx + 9, gy - 12, 6, 3, '#2c744e');
        } else {                                         /* palmeira / cana */
          r(bx + 8, gy - 26, 2, 26, '#6a4a32');
          for (var l = -2; l <= 2; l++) r(bx + 9 + l * 4, gy - 28 + Math.abs(l) * 2, 4, 2, '#3a9a4a');
        }
      }
      if (kk < 0.2) {                                    /* prédios de Salvador na saída */
        var a2 = 1 - kk / 0.2;
        ctx.globalAlpha = a2;
        for (var b = 0; b < 8; b++) r(W * 0.05 + b * 30 - dist * 0.3, gy - 30 - (b % 3) * 12, 22, 30 + (b % 3) * 12, '#5a5a8a');
        ctx.globalAlpha = 1;
      }
      if (kk > 0.85) {                                   /* luzes da estação de Jacobina */
        var a3 = (kk - 0.85) / 0.15;
        ctx.fillStyle = 'rgba(0,229,255,' + (0.6 * a3).toFixed(2) + ')';
        ctx.fillRect(W * 0.78, gy - 30, 30, 4); ctx.fillRect(W * 0.78 + 13, gy - 50, 4, 20);
      }
      /* linhas de velocidade */
      var speed = Math.sin(Math.min(1, k) * Math.PI);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.18 * speed).toFixed(2) + ')';
      for (var sl = 0; sl < 10; sl++) ctx.fillRect(((sl * 97 - dist * 3) % W + W) % W, gy - 60 + sl * 7, 30, 1);
      var ty = Math.round(H * 0.74);
      r(0, ty + 5, W, 3, '#0d0b1e'); r(0, ty + 6, W, 1, '#00e5ff');
      var poff = ((dist * 1.0 % 40) + 40) % 40;
      for (var px = -poff; px < W + 40; px += 40) r(px, ty + 8, 4, H, '#3a3456');
      this.vehicle(ctx, r, W / 2, ty + 5, c, 'trem');
    },

    /* composição + embarque/desembarque do(a) agente */
    vehicle: function (ctx, r, cx, ty, c, kind) {
      var R = c.R, len = kind === 'vlt' ? 150 : 170, x0 = Math.round(cx - len / 2), hgt = kind === 'vlt' ? 30 : 26, y0 = ty - hgt;
      var body = kind === 'vlt' ? '#ffc940' : '#e8e6f6', stripe = kind === 'vlt' ? '#1a8a9a' : '#ff3fa4';
      var tt = c.t - BOARD, moving = tt > 0 && tt < R.dur;
      var shake = moving ? Math.round(Math.sin(c.t * 40) * 0.6) : 0;
      y0 += shake;
      if (kind === 'trem') { r(x0 - 10, y0 + 6, 12, hgt - 8, body); r(x0 + len - 2, y0 + 6, 12, hgt - 8, body); }
      else { r(x0 - 4, y0 + 4, 6, hgt - 6, '#e8b830'); r(x0 + len - 2, y0 + 4, 6, hgt - 6, '#e8b830'); }
      r(x0, y0, len, hgt, body); r(x0, y0, len, 3, '#ffffff'); r(x0, y0 + hgt - 7, len, 2, stripe);
      /* janelas com passageiros */
      var faces = ['#4a2a1c', '#9a6646', '#6e4230', '#d2a07a', '#3a2014', '#84523a'];
      var doorX = x0 + Math.round(len * 0.42);
      for (var w = 0; w < 9; w++) {
        var wx = x0 + 8 + w * 16;
        if (Math.abs(wx - doorX) < 12) continue;
        r(wx, y0 + 6, 11, 9, '#0a2238'); r(wx + 1, y0 + 7, 9, 2, '#3a7ab0');
        if (w % 3 !== 1) { r(wx + 3, y0 + 10, 4, 4, faces[w % 6]); r(wx + 3, y0 + 9, 4, 2, '#17101a'); }
      }
      /* porta e o(a) agente */
      var doorOpen = c.t < 1.3 || tt > R.dur + 0.3;
      r(doorX - 6, y0 + 5, 13, hgt - 7, doorOpen ? '#1a1630' : '#0a2238');
      if (!doorOpen) r(doorX, y0 + 5, 1, hgt - 7, body);
      var fr = AF.World.playerFrames;
      if (fr) {
        var px, dir = 'right', fi = [1, 0, 2, 0][Math.floor(c.t * 8) % 4];
        if (c.t < 1.2) { px = doorX - 46 + c.t / 1.2 * 46; }                       /* caminha até a porta */
        else if (tt > R.dur + 0.4) { px = doorX + (tt - R.dur - 0.4) / 1.4 * 50; } /* desce no destino */
        else { px = doorX; fi = 0; dir = 'down'; }
        if (c.t < 1.2 || tt > R.dur + 0.4) ctx.drawImage(fr[dir][fi], Math.round(px - 8), ty - 22);
        else ctx.drawImage(fr.down[0], 0, 0, 16, 12, Math.round(doorX - 8), y0 + 6, 16, 12);           /* na janela da porta */
      }
      if (c.t < BOARD) {                                 /* plataforma */
        ctx.fillStyle = 'rgba(14,11,36,0.6)'; ctx.fillRect(0, ty, AF.CONFIG.W, 3);
      }
    },

    musicFor: function () { return this.cur ? this.cur.R.music : null; }
  };
  AF.TRIP_ROUTES = ROUTES;
})(window.AF);
