/* =========================================================================
 * simulator.js — Simulador de Teletransporte Quântico / Correção de Erro
 * Segue o "Roteiro de Operação Teletransporte" (Apêndice 1 do manual).
 * Cada etapa é uma ação do(a) jogador(a), num registro real de 3 qubits:
 *   1 carregar |ψ⟩ em q0 · 2 H em q1 e CNOT q1→q2 · 3 CNOT q0→q1 e H em q0
 *   4 medir q0 e q1 · 5 enviar os bits · 6 corrigir com X e Z · 7 verificar
 * As esferas mostram o estado reduzido de cada qubit: a seta encolhe quando
 * ele se emaranha e volta inteira quando a medição desfaz o emaranhamento.
 *  - Estação Dandara: estado original (some na medição!)
 *  - Canal: os dois bits clássicos (única pista)
 *  - Estação Jamal: SETA VERMELHA (onde o qubit está) e SOMBRA VERDE
 *    (onde deveria estar). Use X e Z até alinhar e clique em Verificar.
 *  modo 'treino': descobrir o código para 00, 01, 10, 11 (tabela da verdade)
 *  modo 'final' : validação ao vivo no Núcleo — sem seta e sem sombra,
 *                 como na vida real: 5 acertos seguidos, com tempo
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State, Q = AF.Q;

  var EXPLAIN = {
    '00': 'Bits <b>00</b> → nenhuma correção (I): o q2 já chegou como |ψ⟩.',
    '01': 'Bits <b>01</b> → <b>Porta X</b>: b₂ = 1 (de q1) indica inversão de bit (|0⟩ ↔ |1⟩).',
    '10': 'Bits <b>10</b> → <b>Porta Z</b>: b₁ = 1 (de q0, após o H) indica inversão de fase (sinal de β).',
    '11': 'Bits <b>11</b> → <b>Z e X</b> (ZX): inversão de bit E de fase. X→Z ou Z→X diferem só por uma fase global (−1), invisível em qualquer medida.'
  };
  var WORKED = { none: 'Nada (I)', X: 'Porta X', Z: 'Porta Z', XZ: 'X + Z' };
  var HINT1 = 'Observe a seta: <b>X</b> gira 180° em torno do eixo x (troca |0⟩ ↔ |1⟩); <b>Z</b> gira 180° em torno do eixo z.';
  var HINT2 = 'Dica do fragmento de Dandara: um dos bits conta o que aconteceu com o <b>bit</b> (X); o outro, com a <b>fase</b> (Z). Qual é qual?';
  var ROLE = {
    sistemas: 'Engenheiro(a) de Sistemas: observe as três estações — Dandara, Canal e Jamal.',
    hardware: 'Especialista em Hardware: teste a Porta X e a Porta Z e veja como a seta se move.',
    dados: 'Analista de Dados: a tabela de rodadas está pronta ao lado. Anote tudo!'
  };
  var STEPS = [
    ['prep', '1 Preparar'], ['bell', '2 Emaranhar'], ['ops', '3 CNOT+H'], ['measure', '4 Medir'],
    ['send', '5 Enviar bits'], ['choose', '6 Corrigir'], ['verify', '7 Verificar']
  ];

  /* ações do roteiro, agrupadas por etapa; nas etapas 2 e 3 a ordem importa */
  var OPS = {
    prep: 'Carregar |ψ⟩ em q0', h1: 'H em q1', cn12: 'CNOT q1 → q2', cn01: 'CNOT q0 → q1', h0: 'H em q0',
    m0: 'Medir q0 → b₁', m1: 'Medir q1 → b₂', send: 'Enviar b₁b₂ pela fibra'
  };
  var GROUPS = [
    { step: 'prep', ops: ['prep'] }, { step: 'bell', ops: ['h1', 'cn12'], ordered: true },
    { step: 'ops', ops: ['cn01', 'h0'], ordered: true }, { step: 'measure', ops: ['m0', 'm1'] }, { step: 'send', ops: ['send'] }
  ];
  var WRONG = {
    bell: 'No roteiro, primeiro vem o <b>H em q1</b> e só depois a <b>CNOT q1 → q2</b>: com q1 ainda em |0⟩, a CNOT não faz nada e não sai par emaranhado nenhum.',
    ops: 'Primeiro a <b>CNOT q0 → q1</b>, depois o <b>H em q0</b>: é a CNOT que amarra |ψ⟩ ao par; o H vem em seguida para que a medição de q0 carregue a informação de fase.'
  };

  function $(id) { return document.getElementById(id); }
  function frame() { return new Promise(function (r) { requestAnimationFrame(r); }); }

  var Sim = AF.Sim = {
    m: null, mode: 'treino', round: 0, streak: 0, token: 0, phase: 'idle', busy: false,
    psi: null, bits: null, jam: null, cur: null, applied: [], done: {}, group: -1, reg: null, vecA: null, ghostA: null, vecB: null, bView: 'mixed', ghost: null,
    okNow: false, timer: 0, timerMax: 0, raf: 0, last: 0, log: [],

    visible: function () { return this.mode !== 'final'; },
    fast: function () { var c = $('sim-fast'); return !!(c && c.checked); },
    appliedKey: function () {
      var x = 0, z = 0;
      this.applied.forEach(function (g) { if (g === 'X') x++; else z++; });
      return (x % 2 ? 'X' : '') + (z % 2 ? 'Z' : '') || 'none';
    },

    open: function (mode) {
      if (!S.flag('terminal')) { AF.Toast.show('Terminal Quântico offline — fale com Dandara na Torre', 'dim'); return; }
      if (mode === 'treino' && !S.flag('quizDone')) { AF.Toast.show('Complete o quiz da Prof.ª Iasmin para liberar o simulador', 'dim'); return; }
      if (this.m && !this.m.closed) return;
      this.mode = mode; this.round = 0; this.streak = 0; this.log = [];
      var final = mode === 'final';
      var box = AF.el('div', 'sim' + (final ? ' sim-final' : ''));
      box.innerHTML =
        '<div class="sim-head">' +
          '<div class="sim-badge">' + (final ? 'VALIDAÇÃO AO VIVO · PROTOCOLO SALVADOR 2495' : 'ROTEIRO DE OPERAÇÃO · TREINO') + '</div>' +
          '<div class="sim-round">Rodada <b id="sim-round">1</b></div>' +
          (final ? '<div class="sim-streak">Sequência <b id="sim-streak">0</b>/5</div><div class="sim-timer"><div id="sim-timer-fill"></div></div>' : '') +
          '<div class="sim-steps" id="sim-steps">' + STEPS.map(function (s) { return '<span data-s="' + s[0] + '">' + s[1] + '</span>'; }).join('') + '</div>' +
        '</div>' +
        '<div class="sim-stations">' +
          '<div class="station"><div class="st-title"><i class="dot cyan"></i>ESTAÇÃO SALVADOR · Dandara</div>' +
            '<canvas id="sim-bloch-a" width="240" height="210"></canvas>' +
            '<div class="st-state" id="sim-psi"></div><div class="st-note" id="sim-psi-note">Estado original (informação da cápsula D-7)</div></div>' +
          '<div class="station st-channel"><div class="st-title"><i class="dot mag"></i>CANAL</div>' +
            '<div class="ch-quantum"><div class="wave"></div><span>par emaranhado |β₀₀⟩ · q1 ⟷ q2</span></div>' +
            '<div class="ch-bits"><div class="bit" id="sim-b1">?</div><div class="bit" id="sim-b2">?</div></div>' +
            '<div class="ch-labels">b₁ vem de q0 · b₂ vem de q1</div>' +
            '<div class="ch-classic"><div class="track"><div class="packet" id="sim-packet">··</div></div>' +
              '<span>fibra óptica · ~300 km ≈ 1 ms (luz)</span></div>' +
            '<div class="ch-hist hidden" id="sim-hist"></div></div>' +
          '<div class="station"><div class="st-title"><i class="dot green"></i>ESTAÇÃO JACOBINA · Jamal</div>' +
            '<canvas id="sim-bloch-b" width="240" height="210"></canvas>' +
            '<div class="st-state" id="sim-jam">q2 — aguardando</div>' +
            '<div class="gates" id="sim-gates">' +
              '<button class="btn gate" data-g="X" disabled><span class="num">X</span>Porta X</button>' +
              '<button class="btn gate" data-g="Z" disabled><span class="num">Z</span>Porta Z</button>' +
              '<button class="btn gate" data-g="reset" disabled><span class="num">R</span>Reiniciar</button>' +
              '<button class="btn gate primary" data-g="verify" disabled><span class="num">↵</span>Verificar</button>' +
            '</div>' +
            '<div class="applied" id="sim-applied">Portas aplicadas: —</div>' +
            '<div class="fid"><div class="fid-fill" id="sim-fid"></div><span id="sim-fid-text">Fidelidade —</span></div></div>' +
        '</div>' +
        '<div class="circ-wrap"><canvas id="sim-circuit" width="1200" height="128"></canvas></div>' +
        '<div class="sim-bottom">' +
          '<div class="sim-left"><div class="sim-narr" id="sim-narr"></div><div class="sim-ops" id="sim-ops"></div></div>' +
          '<div class="sim-side"><div class="tt-title">TABELA DA VERDADE <small id="sim-tt-sub"></small></div>' +
            '<table class="tt" id="sim-table"></table><div class="sim-log" id="sim-log"></div></div>' +
        '</div>' +
        '<div class="sim-foot">' +
          '<label class="chk"><input type="checkbox" id="sim-fast"> Animações rápidas</label><div class="spacer"></div>' +
          (final ? '' : '<button class="btn" id="sim-repeat" disabled><span class="k">R · </span>Repetir rodada</button>') +
          '<button class="btn primary" id="sim-next" disabled><span class="k">Espaço · </span>Próxima rodada</button>' +
        '</div>';

      var self = this;
      this.m = AF.UI.modal({
        title: 'SIMULADOR DE TELETRANSPORTE QUÂNTICO', body: box, cls: 'modal-sim',
        onKey: function (e, a) {
          if (self.group >= 0 && GROUPS[self.group] && self.phase === GROUPS[self.group].step && !self.busy) {
            var dm = /^(?:Digit|Numpad)(\d)$/.exec(e.code || '');
            var left = GROUPS[self.group].ops.filter(function (o) { return !self.done[o]; });
            if (dm) { var all = GROUPS[self.group].ops, id = all[+dm[1] - 1]; if (id) self.doOp(id); return true; }
            if (a === 'interact' && left.length === 1) { self.doOp(left[0]); return true; }
          }
          if (self.phase === 'choose') {
            if (e.code === 'KeyX') { self.gate('X'); return true; }
            if (e.code === 'KeyZ') { self.gate('Z'); return true; }
            if (e.code === 'KeyR') { self.resetQ2(); return true; }
            if (a === 'interact') { self.verify(false); return true; }
          }
          if (self.phase === 'done') {
            if (a === 'interact') { self.newRound(false); return true; }
            if (e.code === 'KeyR' && self.mode === 'treino') { self.newRound(true); return true; }
          }
          return a === 'interact';
        },
        onClose: function () {
          var won = self.phase === 'won';
          self.token++; cancelAnimationFrame(self.raf); self.phase = 'idle'; self.busy = false;
          if (self.mode === 'final' && !won && !S.flag('validated')) AF.Toast.show('Validação interrompida — retome no Núcleo', 'dim');
          S.save();
        }
      });
      try { var fs = localStorage.getItem('afrotech_sim_fast'); if (fs === '1') $('sim-fast').checked = true; } catch (e) { /* ok */ }
      $('sim-fast').addEventListener('change', function () { try { localStorage.setItem('afrotech_sim_fast', this.checked ? '1' : '0'); } catch (e) { /* ok */ } });
      box.querySelectorAll('.gate').forEach(function (b) {
        b.addEventListener('click', function () {
          var g = b.getAttribute('data-g');
          if (g === 'verify') self.verify(false); else if (g === 'reset') self.resetQ2(); else self.gate(g);
        });
      });
      $('sim-next').addEventListener('click', function () { self.newRound(false); });
      if ($('sim-repeat')) $('sim-repeat').addEventListener('click', function () { self.newRound(true); });
      S.unlock('bloch'); S.unlock('circuito');
      this.last = performance.now();
      var loop = function (now) {
        var dt = Math.min(0.1, (now - self.last) / 1000); self.last = now;
        self.tick(dt);
        self.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
      this.newRound(false);
    },

    /* ---------- Rodadas ---------- */
    newRound: function (repeat) {
      if (this.phase !== 'done' && this.phase !== 'idle') return;
      ++this.token;
      this.forced = null;
      if (!repeat || !this.psi) { this.psi = Q.randomState(); this.round++; }
      else if (this.bits) this.forced = this.bits;          /* repetir: mesmo |ψ⟩ e os mesmos bits */
      this.bits = null; this.jam = null; this.cur = null; this.reg = null; this.done = {}; this.group = 0;
      this.applied = []; this.okNow = false; this.busy = false;
      this.vecA = { x: 0, y: 0, z: 1 }; this.ghostA = null; this.aMixed = false; this.aColor = '#8a84c0';
      this.vecB = { x: 0, y: 0, z: 1 }; this.ghost = null; this.bView = 'vec';
      $('sim-round').textContent = this.round;
      $('sim-psi').innerHTML = 'q0 = |0⟩ <span class="dim">(vazio)</span>';
      $('sim-psi-note').textContent = 'Estado original (informação da cápsula D-7)';
      $('sim-jam').textContent = 'q2 = |0⟩ — aguardando o par';
      var chq = document.querySelector('.modal-sim .ch-quantum'); if (chq) chq.classList.add('off');
      $('sim-b1').textContent = '?'; $('sim-b2').textContent = '?';
      $('sim-b1').className = 'bit'; $('sim-b2').className = 'bit';
      var pk = $('sim-packet'); pk.classList.remove('go'); pk.textContent = '··';
      this.setFid(null);
      this.enableGates(false);
      this.updateApplied();
      $('sim-next').disabled = true; if ($('sim-repeat')) $('sim-repeat').disabled = true;
      this.renderTable(); this.renderLog(); this.renderHist();
      if (this.mode === 'final') { this.timerMax = 25 + 5 * S.level('busca'); this.timer = this.timerMax; this.updateTimer(); }
      this.setPhase('prep');
      this.narr((this.round === 1 && this.mode === 'treino' && S.d.role ? '<i>' + ROLE[S.d.role] + '</i><br>' : '') + this.groupText(0));
      this.renderOps();
    },

    /* ---------- O roteiro, ação por ação ---------- */
    groupText: function (gi) {
      var fin = this.mode === 'final';
      return [
        '<b>1. Preparação.</b> Dandara recebeu a informação da cápsula D-7: um estado desconhecido |ψ⟩ = α|0⟩ + β|1⟩. Carregue-o no qubit q0. Ela não conhece α e β, e não pode medi-los sem destruir o estado.',
        fin ? '<b>2. Emaranhar o par.</b> Prepare o par |β₀₀⟩ entre q1 (Salvador) e q2 (Jacobina), na ordem certa.'
          : '<b>2. Emaranhar o par.</b> Crie o par |β₀₀⟩ entre q1 (Salvador) e q2 (com Jamal, em Jacobina): primeiro <b>H em q1</b>, depois <b>CNOT q1 → q2</b>.',
        fin ? '<b>3. Operação local de Dandara.</b> Aplique as duas portas de Dandara, na ordem certa.'
          : '<b>3. Operação local de Dandara.</b> Agora Dandara amarra |ψ⟩ ao par: <b>CNOT q0 → q1</b> e, depois, <b>H em q0</b>.',
        '<b>4. Medição em Salvador.</b> Dandara mede q0 e q1. Cada medida dá 0 ou 1, com 50% de chance — e nenhuma delas revela α ou β.',
        '<b>5. Canal clássico.</b> Envie os bits <b>' + (this.bits || '??') + '</b> pela fibra óptica até Jacobina: ~300 km em cerca de 1 ms, nunca mais rápido que a luz. Sem eles, Jamal não sabe o que fazer.'
      ][gi];
    },
    renderOps: function () {
      var el = $('sim-ops'), self = this;
      if (!el) return;
      var G = GROUPS[this.group];
      if (!G || this.phase !== G.step) { el.innerHTML = ''; return; }
      el.innerHTML = '<span class="dim">Sua ação:</span> ' + G.ops.map(function (id, i) {
        var d = self.done[id];
        return '<button class="btn op' + (d ? ' did' : ' primary') + '" data-op="' + id + '"' + (d ? ' disabled' : '') + '><span class="num">' + (d ? '✓' : (i + 1)) + '</span>' + OPS[id].replace('b₁b₂', self.bits || 'b₁b₂') + '</button>';
      }).join('');
      el.querySelectorAll('.op').forEach(function (b) { b.addEventListener('click', function () { self.doOp(b.getAttribute('data-op')); }); });
      this.reveal('sim-ops');
    },
    doOp: function (id) {
      var G = GROUPS[this.group];
      if (!G || this.phase !== G.step || this.busy || this.done[id] || G.ops.indexOf(id) < 0) return;
      if (G.ordered) {
        var next = G.ops.filter(function (o) { return !this.done[o]; }, this)[0];
        if (id !== next) { AF.Audio.play('hurt'); this.narr('<b class="mag">Ordem errada!</b> ' + WRONG[G.step] + '<br>' + this.groupText(this.group)); return; }
      }
      var Hm = Q.GATES.H, reg = this.reg, msg = '', fin = this.mode === 'final', self = this;
      this.done[id] = true;
      AF.Audio.play(id === 'm0' || id === 'm1' ? 'quantum' : 'select');
      if (id === 'prep') {
        reg = this.reg = new Q.Register(3);
        reg.v[0] = this.psi[0]; reg.v[4] = this.psi[1];
        $('sim-psi').innerHTML = '|ψ⟩ = ' + Q.fmtState(this.psi);
        msg = '|ψ⟩ carregado em q0: é a seta vermelha de Dandara.';
      } else if (id === 'h1') { reg.apply1(1, Hm); msg = 'O H colocou q1 em superposição: (|0⟩ + |1⟩)/√2.'; }
      else if (id === 'cn12') {
        reg.cnot(1, 2);
        var cq = document.querySelector('.modal-sim .ch-quantum'); if (cq) cq.classList.remove('off');
        $('sim-jam').textContent = 'q2 emaranhado com q1 — sem direção própria';
        msg = 'q1 e q2 agora formam o par |β₀₀⟩ = (|00⟩ + |11⟩)/√2. Repare na esfera de Jamal: a seta de q2 encolheu até o centro — sozinho, ele não tem direção.';
      } else if (id === 'cn01') { reg.cnot(0, 1); msg = 'A CNOT puxou q0 para o emaranhado: a seta de Dandara encolheu (sobrou só a parte de cima/baixo).'; }
      else if (id === 'h0') { reg.apply1(0, Hm); msg = 'A informação de |ψ⟩ ficou espalhada pelos três qubits. E q2, sozinho, continua sem direção: ainda não dá para ler nada em Jacobina.'; }
      else if (id === 'm0' || id === 'm1') {
        var q = id === 'm0' ? 0 : 1, want = this.forced ? +this.forced[q] : null;
        var bit = reg.measure(q, want === null ? null : function () { return want ? 0 : 0.9999; });
        var el = $(q ? 'sim-b2' : 'sim-b1'); el.textContent = bit; el.className = 'bit on';
        msg = (q ? 'q1 deu <b>b₂ = ' : 'q0 deu <b>b₁ = ') + bit + '</b>.';
        if (this.done.m0 && this.done.m1) {
          var b1 = +$('sim-b1').textContent, b2 = +$('sim-b2').textContent, base = (b1 << 2) | (b2 << 1);
          this.bits = '' + b1 + b2;
          this.jam = [reg.v[base], reg.v[base | 1]]; this.cur = this.jam;
          S.d.simHistogram[this.bits]++; this.renderHist(); this.renderTable();
          this.ghostA = Q.bloch(this.psi);
          $('sim-psi').innerHTML = '<span class="mag">|ψ⟩ destruído na medição</span>';
          $('sim-psi-note').textContent = 'Não-clonagem: não sobra cópia em Salvador';
          msg = 'Bits medidos: <b>b₁b₂ = ' + this.bits + '</b>. A seta de Dandara caiu num polo: o |ψ⟩ original foi destruído (não-clonagem). ' +
            (fin ? 'O q2 de Jamal saltou para uma de quatro versões de |ψ⟩ — mas ele não consegue ver qual.' : 'O q2 de Jamal saltou para uma de quatro versões de |ψ⟩: veja a seta dele.');
        }
      } else if (id === 'send') {
        this.busy = true;
        var pk = $('sim-packet'), ms = this.fast() ? 220 : 900, tok = this.token;
        pk.textContent = this.bits; pk.style.transitionDuration = ms + 'ms';
        void pk.offsetWidth; pk.classList.add('go');
        $('sim-ops').innerHTML = '<span class="dim">Bits a caminho de Jacobina…</span>';
        setTimeout(function () { if (tok !== self.token) return; self.busy = false; self.toChoose(); }, ms + 120);
        this.views();
        return;
      }
      this.views();
      if (G.ops.every(function (o) { return self.done[o]; })) {
        this.group++;
        this.setPhase(GROUPS[this.group].step);
        this.narr(msg + '<br>' + this.groupText(this.group));
      } else this.narr(msg + (G.ordered ? '' : ' Agora a outra medida.'));
      this.renderOps();
    },
    /* esferas: estado reduzido de q0 (Dandara) e de q2 (Jamal) */
    views: function () {
      var reg = this.reg;
      if (!reg) return;
      var a = Q.reduced(reg, 0), la = Math.hypot(a.x, a.y, a.z);
      this.aMixed = la < 0.08; this.vecA = a;
      this.aColor = this.done.m0 ? '#8a84c0' : '#ff4d6a';
      var measured = this.done.m0 && this.done.m1;
      if (measured) {
        if (this.visible()) { this.vecB = Q.bloch(this.jam); this.ghost = Q.bloch(this.psi); this.bView = 'vec'; $('sim-jam').innerHTML = 'q2 = ' + Q.fmtState(this.jam); }
        else { this.bView = 'fog'; $('sim-jam').textContent = 'q2 — Jamal não vê o estado'; }
        return;
      }
      var b = Q.reduced(reg, 2), lb = Math.hypot(b.x, b.y, b.z);
      if (lb < 0.08) this.bView = 'mixed'; else { this.bView = 'vec'; this.vecB = b; }
      if (this.done.m0) $('sim-jam').textContent = 'q2 — ainda indefinido (falta b₂)';
    },
    toChoose: function () {
      var b = this.bits;
      this.setPhase('choose');
      $('sim-ops').innerHTML = '';
      this.enableGates(true);
      if (this.mode === 'final') {
        this.narr('<b>Rodada ' + (this.streak + 1) + ' de 5.</b> Bits recebidos: <b class="big">' + b + '</b>. Sem seta e sem sombra — como na vida real. Aplique a correção pela regra e clique em <b>Verificar</b> antes do tempo acabar.' +
          (S.level('armazenamento') >= 1 ? '' : '<br><i>A tabela foi apagada pelo pulso: confie no código que você decifrou.</i>'));
      } else {
        this.narr('<b>6. Sua vez, Jamal!</b> Bits recebidos: <b class="big">' + b + '</b>. Use <b>X</b> e <b>Z</b> até a <span class="mag">seta vermelha</span> ficar sobre a <span class="ok">sombra verde</span>; depois, <b>Verificar</b>.' +
          (this.round <= 2 ? '<br><i>Roteiro: teste cada porta sozinha. O que a X faz com a seta? E a Z?</i>' : '') +
          '<br><i>Na vida real, Jamal não vê a seta nem a sombra — só os bits. Aqui é simulação: use-a para descobrir a regra.</i>');
      }
    },

    gate: async function (g) {
      if (this.phase !== 'choose' || this.busy) return;
      this.busy = true;
      var tok = this.token;
      AF.Audio.play('blip');
      var start = this.vecB || Q.bloch(this.cur);
      if (this.bView === 'vec') {
        var dur = this.fast() ? 200 : 520, t0 = performance.now();
        while (true) {
          var k = Math.min(1, (performance.now() - t0) / dur);
          var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          this.vecB = AF.Bloch.rotate(start, Q.AXIS[g], Math.PI * e);
          if (k >= 1) break;
          await frame();
          if (tok !== this.token) return;
        }
      }
      this.cur = Q.apply2(this.cur, Q.GATES[g]);
      this.vecB = Q.bloch(this.cur);
      this.applied.push(g);
      if (this.bView === 'vec') $('sim-jam').innerHTML = 'q2 = ' + Q.fmtState(this.cur);
      this.updateApplied();
      this.busy = false;
    },

    resetQ2: function () {
      if (this.phase !== 'choose' || this.busy) return;
      this.cur = this.jam; this.applied = [];
      if (this.bView === 'vec') { this.vecB = Q.bloch(this.cur); $('sim-jam').innerHTML = 'q2 = ' + Q.fmtState(this.cur); }
      this.updateApplied();
      AF.Audio.play('close');
    },

    updateApplied: function () {
      var el = $('sim-applied'); if (!el) return;
      el.innerHTML = 'Portas aplicadas: ' + (this.applied.length ? '<b>' + this.applied.join(' → ') + '</b>' : '—');
    },

    verify: function (timeout) {
      if (this.phase !== 'choose' || this.busy) return;
      var b = this.bits;
      var fid = Q.fidelity(this.psi, this.cur);
      var ok = !timeout && fid > 0.99;
      var key = this.appliedKey();
      this.setFid(fid, ok);
      S.d.stats.simRounds++;

      if (this.mode === 'treino') {
        if (!ok) {
          var fails = ++S.d.simFails[b];
          this.narr('<b class="mag">✘ Ruído quântico!</b> Fidelidade ' + Math.round(fid * 100) + '%: a seta vermelha não está sobre a sombra verde. Continue testando (R reinicia o q2). ' + (fails >= 3 ? HINT2 : HINT1));
          S.damage(3, 'correção errada');
          return;
        }
        S.d.stats.simCorrect++;
        this.setPhase('verify'); this.okNow = true;
        this.enableGates(false);
        this.log.unshift({ n: this.round, bits: b, g: key, ok: true });
        if (this.log.length > 10) this.log.pop();
        AF.Audio.play('success');
        if (key.indexOf('X') >= 0) S.unlock('porta_x');
        if (key.indexOf('Z') >= 0) S.unlock('porta_z');
        S.unlock('fidelidade');
        var html = '<b class="ok">✔ Teletransporte perfeito!</b> Fidelidade 100%. Para os bits <b>' + b + '</b>, funcionou: <b>' + WORKED[key] + '</b>. Anote e compare com as outras rodadas: que padrão aparece?';
        if (this.applied.length > 2) html += ' <i>(Repare: aplicar a mesma porta duas vezes desfaz o efeito.)</i>';
        if (!S.d.table[b]) S.d.table[b] = key;
        if (S.tableProgress() === 4 && !S.flag('tableDone')) {
          S.setFlag('tableDone'); S.addCredits(10);
          S.addJournal('Tabela da verdade completa', 'Descobri, testando, o que corrige cada par de bits: 00 → nada · 01 → X · 10 → Z · 11 → X e Z. O campo de contenção do Núcleo caiu.',
            'Crônica: quatro linhas numa tabela. Parece pouco — mas é o que separa o ruído da voz de uma cidade.');
          AF.Toast.show('Campo de contenção do Núcleo liberado!', 'gold');
          html += '<div class="sim-done">TABELA COMPLETA! Feche o simulador e mostre seus registros à <b>Prof.ª Iasmin</b>: ela vai pedir a REGRA (Decifrando o Código).</div>';
        }
        this.phase = 'done';
        $('sim-next').disabled = false; $('sim-repeat').disabled = false;
        this.narr(html);
        this.reveal('sim-next');
        this.renderTable(); this.renderLog(); this.renderHist();
        return;
      }

      /* modo final (validação ao vivo) */
      this.setPhase('verify');
      this.enableGates(false);
      this.bView = 'vec'; this.vecB = Q.bloch(this.cur); this.ghost = Q.bloch(this.psi); this.okNow = ok;
      $('sim-jam').innerHTML = 'q2 final = ' + Q.fmtState(this.cur);
      this.log.unshift({ n: this.round, bits: b, g: timeout ? 'timeout' : key, ok: ok });
      if (this.log.length > 10) this.log.pop();
      var msg;
      if (ok) {
        S.d.stats.simCorrect++; this.streak++;
        AF.Audio.play('success');
        msg = '<b class="ok">✔ Fidelidade 100%.</b> ' + EXPLAIN[b];
      } else {
        this.streak = 0;
        msg = '<b class="mag">✘ Ruído quântico!</b> ' + (timeout ? 'O tempo acabou e o estado decoeriu. ' : 'Fidelidade ' + Math.round(fid * 100) + '%. ') +
          'A correção certa para ' + b + ' era <b>' + WORKED[Q.CORRECT[b]] + '</b>. <i>Sequência zerada.</i>';
      }
      $('sim-streak').textContent = this.streak;
      this.renderTable(); this.renderLog();
      if (this.streak >= 5) {
        this.phase = 'won';
        S.setFlag('validated');
        S.addJournal('Validação ao vivo', 'Cinco teletransportes perfeitos seguidos, sem ver a seta: o protocolo foi validado no Núcleo.');
        this.narr(msg + '<div class="sim-done">PROTOCOLO VALIDADO! O Núcleo recalibra por ' + AF.NucleoWait.fmt(AF.CONFIG.NUCLEO_WAIT) + ' antes da última etapa: o Relatório de Consultoria Afrotech.</div>');
        AF.Audio.play('victory');
        var self = this, tok = this.token;
        setTimeout(function () { if (tok !== self.token) return; self.m.close(true); AF.NucleoWait.start('relatorio'); }, 2400);
        return;
      }
      this.phase = 'done';
      $('sim-next').disabled = false;
      this.narr(msg);
      this.reveal('sim-next');
      if (!ok) S.damage(8, 'protocolo instável');
    },

    /* ---------- UI ---------- */
    /* celular: rola a janela até a parte que importa agora */
    reveal: function (id) {
      if (!AF.Touch || !AF.Touch.on) return;
      var el = $(id);
      if (el && el.scrollIntoView) { try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { el.scrollIntoView(false); } }
    },
    setPhase: function (p) {
      this.phase = p;
      if (p === 'choose') this.reveal('sim-gates');
      var map = { prep: 'prep', bell: 'bell', ops: 'ops', measure: 'measure', send: 'send', choose: 'choose', verify: 'verify', done: 'verify', won: 'verify' };
      var cur = STEPS.findIndex(function (x) { return x[0] === map[p]; });
      document.querySelectorAll('#sim-steps span').forEach(function (s) {
        var idx = STEPS.findIndex(function (x) { return x[0] === s.getAttribute('data-s'); });
        s.className = idx < cur ? 'past' : (idx === cur ? 'cur' : '');
      });
    },
    narr: function (h) { $('sim-narr').innerHTML = h; },
    enableGates: function (on) {
      document.querySelectorAll('#sim-gates .gate').forEach(function (b) { b.disabled = !on; });
    },
    setFid: function (f, ok) {
      var fill = $('sim-fid'), tx = $('sim-fid-text');
      if (f === null) { fill.style.width = '0%'; fill.className = 'fid-fill'; tx.textContent = 'Fidelidade —'; return; }
      fill.style.width = Math.round(f * 100) + '%';
      fill.className = 'fid-fill ' + (ok ? 'ok' : 'bad');
      tx.textContent = 'Fidelidade ' + Math.round(f * 100) + '%';
    },
    renderTable: function () {
      var final = this.mode === 'final', show = !final || S.level('armazenamento') >= 1;
      $('sim-tt-sub').textContent = final ? (show ? '· retida no buffer (Armazenamento)' : '· apagada pelo pulso')
        : '· ' + S.tableProgress() + '/4 · rodadas: ' + this.round + ' (roteiro: 10)';
      var html = '<tr><th>Bits</th><th>Jamal ativa…</th></tr>';
      var self = this;
      ['00', '01', '10', '11'].forEach(function (k) {
        var g = S.d.table[k];
        var cell = !show ? '▒▒▒▒' : (g ? WORKED[Q.CORRECT[k]] : '?');
        var cur = self.bits === k ? ' class="cur"' : '';
        html += '<tr' + cur + '><td>' + k + '</td><td class="' + (g && show ? 'ok' : 'dim') + '">' + cell + '</td></tr>';
      });
      $('sim-table').innerHTML = html;
    },
    renderLog: function () {
      $('sim-log').innerHTML = this.log.map(function (l) {
        return '<div class="' + (l.ok ? 'ok' : 'mag') + '">Rodada ' + l.n + ' · bits ' + l.bits + ' · ' + (l.g === 'timeout' ? 'tempo esgotado' : WORKED[l.g]) + ' ' + (l.ok ? '✔' : '✘') + '</div>';
      }).join('');
    },
    renderHist: function () {
      var el = $('sim-hist');
      var on = S.d.classId === 'analista' || S.level('armazenamento') >= 2;
      el.classList.toggle('hidden', !on);
      if (!on) return;
      var h = S.d.simHistogram, tot = h['00'] + h['01'] + h['10'] + h['11'] || 1;
      el.innerHTML = '<div class="h-title">Histograma de medições</div>' + ['00', '01', '10', '11'].map(function (k) {
        var p = h[k] / tot * 100;
        return '<div class="h-row"><span>' + k + '</span><div class="h-bar"><i style="width:' + p + '%"></i></div><span>' + Math.round(p) + '%</span></div>';
      }).join('') + '<div class="h-note">esperado: 25% cada (aleatório)</div>';
    },
    updateTimer: function () {
      var f = $('sim-timer-fill');
      if (f) { f.style.width = (this.timer / this.timerMax * 100) + '%'; f.className = this.timer < 6 ? 'crit' : ''; }
    },

    tick: function (dt) {
      if (!this.m || this.m.closed) return;
      if (this.mode === 'final' && this.phase === 'choose' && !this.busy) {
        this.timer -= dt; this.updateTimer();
        if (this.timer <= 0) { this.timer = 0; this.verify(true); }
      }
      var a = $('sim-bloch-a'), b = $('sim-bloch-b');
      if (a) {
        var oa = { color: this.aColor || '#ff4d6a', glow: !this.done.m0 && !!this.reg, ghost: this.ghostA, ghostColor: 'rgba(160,150,200,0.55)' };
        if (this.aMixed) oa.mixed = true; else oa.vec = this.vecA;
        AF.Bloch.draw(a, oa);
      }
      if (b) {
        var o = { color: this.okNow ? '#3dff9a' : '#ff4d6a', ghost: this.ghost, ghostColor: 'rgba(61,255,154,0.9)', glow: this.okNow };
        if (this.bView === 'mixed') o.mixed = true;
        else if (this.bView === 'fog') o.fog = true;
        else if (this.bView === 'vec') o.vec = this.vecB;
        AF.Bloch.draw(b, o);
      }
      this.drawCircuit();
    },

    drawCircuit: function () {
      var cv = $('sim-circuit');
      if (!cv) return;
      var ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
      var y0 = 32, y1 = 66, y2 = 102;
      var X = { prep: 150, h1: 232, cn12: 300, cnot: 385, h: 462, meas: 555, sep: 660, cx: 830, cz: 945, out: 1075 };
      var ph = this.phase, bits = this.bits || '??', dn = this.done || {}, self = this;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0920'; ctx.fillRect(0, 0, W, H);

      /* destaque da etapa atual */
      var hl = { prep: ['prep'], bell: ['h1', 'cn12'], ops: ['cnot', 'h'], measure: ['meas'], send: ['classic'], choose: ['cx', 'cz'], verify: ['out'], done: ['out'], won: ['out'] }[ph] || [];
      ctx.fillStyle = 'rgba(0,229,255,0.12)';
      hl.forEach(function (k) {
        if (k === 'classic') { ctx.fillRect(X.meas + 20, 14, X.cz - X.meas, H - 18); return; }
        ctx.fillRect(X[k] - 34, 14, 68, H - 18);
      });

      ctx.font = '24px VT323, monospace'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillStyle = '#00e5ff'; ctx.fillText('q0  |ψ⟩', 14, y0);
      ctx.fillStyle = '#ff3fa4'; ctx.fillText('q1', 14, y1);
      ctx.fillStyle = '#3dff9a'; ctx.fillText('q2', 14, y2);
      ctx.fillStyle = '#8a84c0'; ctx.font = '20px VT323, monospace';
      ctx.fillText('SALVADOR (Dandara)', X.prep - 40, 9); ctx.fillText('JACOBINA (Jamal)', X.cx - 30, 9);

      function line(x1, y, x2, col, dbl) {
        ctx.strokeStyle = col; ctx.lineWidth = 2;
        if (dbl) { ctx.beginPath(); ctx.moveTo(x1, y - 2); ctx.lineTo(x2, y - 2); ctx.moveTo(x1, y + 2); ctx.lineTo(x2, y + 2); ctx.stroke(); }
        else { ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); }
      }
      function vline(x, ya, yb, col, dbl) {
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
        if (dbl) { ctx.moveTo(x - 2, ya); ctx.lineTo(x - 2, yb); ctx.moveTo(x + 2, ya); ctx.lineTo(x + 2, yb); }
        else { ctx.moveTo(x, ya); ctx.lineTo(x, yb); }
        ctx.stroke();
      }
      function gbox(x, y, label, col, fillc, w) {
        w = w || 40;
        ctx.fillStyle = fillc || '#161438'; ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.fillRect(x - w / 2, y - 13, w, 26); ctx.strokeRect(x - w / 2, y - 13, w, 26);
        ctx.fillStyle = col; ctx.font = '26px VT323, monospace'; ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 1); ctx.textAlign = 'left';
      }
      function cnot(x, yc, yt, col) {
        vline(x, Math.min(yc, yt) - (yc < yt ? 0 : 12), Math.max(yc, yt) + (yc < yt ? 12 : 0), col);
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, yc, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, yt, 12, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 12, yt); ctx.lineTo(x + 12, yt); ctx.stroke();
      }
      function meter(x, y, col) {
        ctx.fillStyle = '#161438'; ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.fillRect(x - 20, y - 13, 40, 26); ctx.strokeRect(x - 20, y - 13, 40, 26);
        ctx.beginPath(); ctx.arc(x, y + 7, 11, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + 7); ctx.lineTo(x + 8, y - 7); ctx.stroke();
      }
      /* cor de cada porta: feita (forte), da etapa atual (dourada) ou ainda por fazer (apagada) */
      var curOps = (GROUPS[this.group] && ph === GROUPS[this.group].step) ? GROUPS[this.group].ops : [];
      function c(id, on) { return dn[id] ? on : (curOps.indexOf(id) >= 0 ? '#ffc940' : '#3a3870'); }

      var measured = dn.m0 && dn.m1;
      line(110, y0, X.meas - 20, '#3a4488'); line(110, y1, X.meas - 20, '#3a4488'); line(110, y2, W - 40, '#3a4488');
      var ccol = dn.send ? '#ffc940' : (measured ? '#8a7a40' : '#3a3460');
      line(X.meas + 20, y0, X.cz, ccol, true); vline(X.cz, y0, y2 - 13, ccol, true);
      line(X.meas + 20, y1, X.cx, ccol, true); vline(X.cx, y1, y2 - 13, ccol, true);

      ctx.setLineDash([4, 6]); ctx.strokeStyle = '#5a5498'; ctx.beginPath(); ctx.moveTo(X.sep, 18); ctx.lineTo(X.sep, H - 6); ctx.stroke(); ctx.setLineDash([]);

      gbox(X.prep, y0, 'ψ', c('prep', '#00e5ff'));
      gbox(X.h1, y1, 'H', c('h1', '#ff3fa4'));
      cnot(X.cn12, y1, y2, c('cn12', '#ff3fa4'));
      if (dn.cn12) { ctx.fillStyle = '#ff3fa4'; ctx.font = '18px VT323, monospace'; ctx.textAlign = 'center'; ctx.fillText('|β₀₀⟩', X.cn12 + 2, y2 + 22); ctx.textAlign = 'left'; }
      cnot(X.cnot, y0, y1, c('cn01', '#e8e6ff'));
      gbox(X.h, y0, 'H', c('h0', '#ffc940'));
      meter(X.meas, y0, c('m0', '#e8e6ff')); meter(X.meas, y1, c('m1', '#e8e6ff'));
      ctx.fillStyle = '#ffc940'; ctx.font = '25px VT323, monospace';
      if (dn.m0) ctx.fillText('b₁=' + (measured ? bits[0] : $('sim-b1').textContent), X.meas + 26, y0 - 11);
      if (dn.m1) ctx.fillText('b₂=' + (measured ? bits[1] : $('sim-b2').textContent), X.meas + 26, y1 - 11);
      var showApplied = ph === 'choose' || ph === 'verify' || ph === 'done' || ph === 'won';
      var akey = this.appliedKey();
      var applied = showApplied ? (akey === 'none' ? '-' : akey) : '';
      var col = function (g) {
        if (applied.indexOf(g) < 0) return ph === 'choose' ? '#ffc940' : '#8a84c0';
        if (ph === 'choose') return '#ffc940';
        return Q.fidelity(self.psi, self.cur) > 0.99 ? '#3dff9a' : '#ff3fa4';
      };
      gbox(X.cx, y2, applied ? (applied.indexOf('X') >= 0 ? 'X' : '—') : 'X^b₂', col('X'), null, 64);
      gbox(X.cz, y2, applied ? (applied.indexOf('Z') >= 0 ? 'Z' : '—') : 'Z^b₁', col('Z'), null, 64);
      var done = ph === 'verify' || ph === 'done' || ph === 'won';
      var okNow = done && this.okNow;
      ctx.font = '28px VT323, monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = done ? (okNow ? '#3dff9a' : '#ff3fa4') : '#8a84c0';
      ctx.fillText(done ? (okNow ? '|ψ⟩ ✔' : 'ruído ✘') : '|ψ⟩ ?', X.out, y2);
      ctx.textAlign = 'left';
    }
  };
})(window.AF);
