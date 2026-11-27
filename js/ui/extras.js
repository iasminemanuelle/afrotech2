/* =========================================================================
 * extras.js — atividades da v0.8
 *   AF.Swim       · aula de natação de Mi Ayô na Prainha (traje e boias)
 *   AF.Panorama   · mirante do Alto do Cruzeiro, em Jacobina (20 CQ)
 *   AF.NucleoWait · recalibração de 1min30s entre as etapas do protocolo no Núcleo
 *   AF.Home       · descansar em casa, na Ribeira
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;

  /* ---------------- Natação ---------------- */
  AF.Swim = {
    NAMES: { maio: 'maiô', sunga: 'sunga', bermuda: 'bermuda e camisa de lycra' },
    start: function (v) {
      S.d.swim = v;
      AF.World.buoys = {};
      AF.World.refreshPlayer();
      AF.Audio.play('splash');
      AF.Toast.show('Traje de natação: ' + this.NAMES[v] + ', touca e óculos', 'cyan');
      AF.HUD.refresh();
    },
    stop: function (auto) {
      if (!S.d || !S.d.swim) return;
      S.d.swim = null;
      AF.World.refreshPlayer();
      if (auto) AF.Toast.show('Você trocou de roupa no vestiário da praia', 'dim');
      AF.HUD.refresh();
    },
    buoy: function (n) {
      AF.Toast.show('Boia ' + n + ' de 3!', 'gold');
      if (n < 3) return;
      AF.Audio.play('success');
      if (!S.flag('natacao')) {
        S.setFlag('natacao'); S.addCredits(4); S.heal(15);
        S.addJournal('Aula de natação', 'Mi Ayô chamou todo mundo para nadar na Prainha. Vesti o traje, touca e óculos e nadei até as três boias. No mar, como no laboratório, o segredo é respirar no ritmo certo.');
      }
      setTimeout(function () { if (!AF.Dialogue.active) AF.Dialogue.start('miayo_fim'); }, 600);
    }
  };

  /* ---------------- Mirante do Cruzeiro ---------------- */
  function paintPanorama(cv) {
    var x = cv.getContext('2d'), W = cv.width, H = cv.height, P = AF.Pix;
    x.imageSmoothingEnabled = false;
    var g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#120a3a'); g.addColorStop(0.45, '#6a2a6a'); g.addColorStop(0.62, '#ff8a5a'); g.addColorStop(0.7, '#ffc070');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    var r = P.rng(99);
    for (var s = 0; s < 70; s++) { x.fillStyle = 'rgba(255,255,240,' + (0.3 + r() * 0.7).toFixed(2) + ')'; x.fillRect(Math.floor(r() * W), Math.floor(r() * H * 0.4), 1, 1); }
    x.fillStyle = '#ffe08a'; x.fillRect(W * 0.18, H * 0.58, 14, 3);                          /* último raio de sol */
    function ridge(base, amp, f, col, ph) {
      x.fillStyle = col;
      for (var i = 0; i < W; i++) { var h = base - amp * (0.55 + 0.45 * Math.sin(i / f + ph)) - 6 * Math.sin(i / 13 + ph * 2); x.fillRect(i, h, 1, H - h); }
    }
    ridge(H * 0.62, 34, 40, '#4a2a6a', 1.3);                                                  /* serras distantes */
    ridge(H * 0.7, 26, 28, '#3a2050', 0.4);
    ridge(H * 0.8, 18, 22, '#2a1a3a', 2.1);
    /* o vale com a cidade */
    x.fillStyle = '#1a1230'; x.fillRect(0, H * 0.8, W, H * 0.2);
    for (var l = 0; l < 90; l++) {
      var lx = W * 0.25 + r() * W * 0.55, ly = H * 0.8 + r() * H * 0.12;
      x.fillStyle = r() < 0.2 ? '#7af9ff' : '#ffd890'; x.fillRect(Math.floor(lx), Math.floor(ly), 1, 1);
    }
    /* rio do ouro brilhando */
    x.fillStyle = 'rgba(255,201,64,0.7)';
    for (var rv = 0; rv < W; rv += 2) x.fillRect(rv, Math.round(H * 0.9 + 3 * Math.sin(rv / 18)), 2, 1);
    /* antena da Estação Receptora */
    x.fillStyle = '#00e5ff'; x.fillRect(W * 0.62, H * 0.74, 2, 12); x.fillRect(W * 0.62 - 3, H * 0.74, 8, 1);
    x.fillStyle = 'rgba(0,229,255,0.25)'; x.beginPath(); x.arc(W * 0.62 + 1, H * 0.74, 9, 0, 7); x.fill();
    /* o cruzeiro em primeiro plano */
    x.fillStyle = '#0a0614'; x.fillRect(W * 0.86, H * 0.45, 6, H * 0.55); x.fillRect(W * 0.86 - 12, H * 0.55, 30, 5);
    x.fillRect(0, H * 0.96, W, H * 0.04);
  }
  AF.Panorama = {
    open: function () {
      var body = AF.el('div', 'pano');
      body.innerHTML = '<canvas width="384" height="200"></canvas>' +
        '<p>Do alto do Cruzeiro, as serras que cercam Jacobina ficam roxas no fim da tarde. Lá embaixo, as luzes da cidade acendem ao longo do vale, o Rio do Ouro brilha com o último sol e, no meio delas, pisca em ciano a antena da Estação Receptora de Jamal.</p>' +
        '<p class="dim">Jacobina fica no Piemonte da Chapada Diamantina. Nasceu da corrida do ouro no período colonial, e até hoje se tira ouro do subsolo das serras.</p>' +
        '<div class="btn-row"><button class="btn primary pano-ok">Descer os degraus<span class="k"> [E]</span></button></div>';
      var m = AF.UI.modal({ title: 'MIRANTE DO ALTO DO CRUZEIRO · JACOBINA', body: body, cls: 'modal-md',
        onKey: function (e, a) { if (a === 'interact') { m.close(); return true; } return false; } });
      paintPanorama(body.querySelector('canvas'));
      body.querySelector('.pano-ok').addEventListener('click', function () { m.close(); });
      AF.Audio.play('quantum');
      return m;
    }
  };

  /* ---------------- Núcleo: recalibração entre as etapas ---------------- */
  var FACTS = [
    'Cada etapa deixa um pouco de calor no chip: os pulsos de controle e as medidas esquentam o estágio mais frio. O refrigerador de diluição precisa voltar a cerca de 10 mK antes da próxima rodada.',
    'Calibração: qubits supercondutores são "afinados" em frequências de alguns gigahertz. As frequências e as amplitudes dos pulsos de micro-ondas são medidas de novo de tempos em tempos.',
    'Tempo de coerência: um qubit supercondutor costuma manter a superposição por dezenas a centenas de microssegundos. O circuito inteiro precisa caber nesse tempo.',
    'Reset: antes de uma nova rodada, cada qubit é levado de volta a |0⟩. Sem isso, a rodada seguinte começaria com o estado errado.',
    'Para estimar a fidelidade, o mesmo circuito é repetido milhares de vezes. Cada repetição dá um resultado sorteado pela regra de Born; a estatística revela o estado.',
    'O Nobel de Física de 2025 foi para John Clarke, Michel Devoret e John Martinis: nos anos 1980 eles mostraram efeitos quânticos num circuito supercondutor do tamanho de uma mão — a semente dos qubits supercondutores.',
    'A base teórica desses experimentos veio, em parte, do físico brasileiro Amir Caldeira, que estudou como o ambiente apaga os efeitos quânticos: a decoerência.'
  ];
  var NW = AF.NucleoWait = {
    LABEL: { validacao: 'Etapa 2: validação ao vivo', relatorio: 'Etapa 3: Relatório de Consultoria' },
    timer: function () { return S.d && S.d.timers && S.d.timers.nucleo; },
    remaining: function () { var t = this.timer(); return t ? Math.max(0, Math.ceil((t.until - Date.now()) / 1000)) : 0; },
    ready: function () { return this.remaining() <= 0; },
    fmt: function (s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); },
    start: function (next) {
      S.d.timers.nucleo = { until: Date.now() + AF.CONFIG.NUCLEO_WAIT * 1000, next: next };
      S.save();
      this.watch();
      this.open();
    },
    /* relógio: atualiza o objetivo no HUD e avisa quando terminar */
    watch: function () {
      clearInterval(this._iv);
      this._iv = setInterval(function () {
        if (!S.d) { clearInterval(NW._iv); return; }
        AF.HUD.refresh();
        if (NW.ready()) {
          clearInterval(NW._iv);
          AF.Audio.play('success');
          AF.Toast.show('Núcleo recalibrado: ' + (NW.LABEL[(NW.timer() || {}).next] || 'próxima etapa') + ' liberada', 'cyan');
        }
      }, 1000);
    },
    resume: function () { if (this.timer() && !this.ready()) this.watch(); },
    go: function () {
      var t = this.timer();
      if (!t) return;
      if (t.next === 'validacao') AF.Sim.open('final');
      else if (t.next === 'relatorio') AF.Quiz.relatorio(function () { AF.Game.victory(); });
    },
    open: function () {
      var t = this.timer();
      if (!t) return null;
      var body = AF.el('div', 'nuc-wait'), total = AF.CONFIG.NUCLEO_WAIT, fi = 0, iv;
      body.innerHTML = '<div class="dim">PROTOCOLO SALVADOR 2495 · recalibrando os qubits</div><div class="clock"></div><div class="bar"><i></i></div>' +
        '<div class="fact"></div><div class="btn-row"><button class="btn nw-walk">Explorar enquanto isso</button><button class="btn primary nw-go" disabled></button></div>';
      var m = AF.UI.modal({ title: 'NÚCLEO · RECALIBRAÇÃO', body: body, cls: 'modal-md',
        onClose: function () { clearInterval(iv); },
        onKey: function (e, a) { if (a === 'interact' && NW.ready()) { m.close(true); NW.go(); return true; } return false; } });
      var go = body.querySelector('.nw-go');
      go.textContent = 'Iniciar ' + (NW.LABEL[t.next] || 'próxima etapa');
      go.addEventListener('click', function () { m.close(true); NW.go(); });
      body.querySelector('.nw-walk').addEventListener('click', function () { m.close(); });
      function upd() {
        var left = NW.remaining();
        body.querySelector('.clock').textContent = NW.fmt(left);
        body.querySelector('.bar i').style.width = Math.round((1 - left / total) * 100) + '%';
        go.disabled = left > 0;
        if (left <= 0) body.querySelector('.clock').textContent = 'PRONTO';
      }
      function fact() { body.querySelector('.fact').textContent = FACTS[fi % FACTS.length]; fi++; }
      upd(); fact();
      var n = 0;
      iv = setInterval(function () { upd(); if (++n % 10 === 0) fact(); }, 1000);
      return m;
    }
  };

  /* ---------------- Casa na Ribeira: dormir (e os créditos finais) ---------------- */
  var BED = { x: 4 * 16, y: 11 * 16 - 24 };              /* canto da cama na tela do mapa */
  var Home = AF.Home = {
    busy: false,
    /* primeira chegada depois da missão: o(a) agente entra em casa e vai dormir; sobem os créditos */
    endSequence: function () {
      if (this.busy || AF.World.mapId !== 'ribeira') return;
      this.busy = true;
      AF.Toast.show('Missão cumprida. Hora de descansar, ' + S.d.name + '.', 'gold');
      AF.World.walkTo([[24.5, 14.6], [16, 14.6], [16, 15.5], [9, 15.5], [9, 12.6], [6.5, 12.4]], function () { Home.sleep(true); });
    },
    rest: function () { this.sleep(false); },
    sleep: function (credits) {
      var W = AF.World;
      this.busy = true;
      if (AF.Dialogue.active) AF.Dialogue.close();
      W.auto = null;
      W.player.x = 6.5 * 16; W.player.y = 12.4 * 16; W.player.dir = 'down';
      W.sleeping = { x: BED.x, y: BED.y };
      AF.Audio.play('snore');
      clearInterval(this._sn);
      this._sn = setInterval(function () { AF.Audio.play('snore'); }, 2200);
      var t0 = performance.now(), dur = credits ? 4500 : 3000;
      (function dim() {
        var k = Math.min(1, (performance.now() - t0) / dur);
        W.night = k;
        if (k < 1) requestAnimationFrame(dim); else after();
      })();
      function after() {
        S.heal(9999); S.inc('noites');
        if (!S.flag('casa')) {
          S.setFlag('casa');
          S.addJournal('Descanso na Ribeira', 'Depois da missão peguei o VLT da Baía até a Ribeira e dormi em casa, na beira da praia. Acordei com o barulho dos saveiros e o cheiro de maresia. Estabilidade restaurada.');
        }
        S.save();
        if (credits) {
          clearInterval(Home._sn);
          S.setFlag('creditsSeen');
          setTimeout(function () { AF.Credits.roll(function () { Home.wake(); }); }, 400);
        } else setTimeout(function () { Home.wake(); }, 900);
      }
    },
    wake: function () {
      var W = AF.World;
      clearInterval(this._sn);
      AF.FX.fade(true, 300);
      setTimeout(function () {
        W.sleeping = null; W.night = 0;
        if (W.player) { W.player.x = 6.5 * 16; W.player.y = 12.4 * 16; W.player.dir = 'down'; W.snapCamera(); }
        Home.busy = false;
        S.save();
        AF.FX.fade(false, 700);
        AF.HUD.refresh();
        AF.Audio.play('chime');
        setTimeout(function () { AF.Dialogue.start('casa_acorda'); }, 800);
      }, 320);
    }
  };
})(window.AF);
