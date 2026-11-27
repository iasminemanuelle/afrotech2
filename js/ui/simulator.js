/* =========================================================================
 * simulator.js — Simulador de Teletransporte Quântico / Correção de Erro
 * Segue o "Roteiro de Operação Teletransporte" (Apêndice 1 do manual):
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

  function $(id) { return document.getElementById(id); }
  function frame() { return new Promise(function (r) { requestAnimationFrame(r); }); }

  var Sim = AF.Sim = {
    m: null, mode: 'treino', round: 0, streak: 0, token: 0, phase: 'idle', busy: false,
    psi: null, bits: null, jam: null, cur: null, applied: [], vecA: null, ghostA: null, vecB: null, bView: 'mixed', ghost: null,
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
          '<div class="sim-narr" id="sim-narr"></div>' +
          '<div class="sim-side"><div class="tt-title">TABELA DA VERDADE <small id="sim-tt-sub"></small></div>' +
            '<table class="tt" id="sim-table"></table><div class="sim-log" id="sim-log"></div></div>' +
        '</div>' +
        '<div class="sim-foot">' +
          '<label class="chk"><input type="checkbox" id="sim-fast"> Animação rápida</label><div class="spacer"></div>' +
          (final ? '' : '<button class="btn" id="sim-repeat" disabled><span class="k">R · </span>Repetir rodada</button>') +
          '<button class="btn primary" id="sim-next" disabled><span class="k">Espaço · </span>Próxima rodada</button>' +
        '</div>';

      var self = this;
      this.m = AF.UI.modal({
        title: 'SIMULADOR DE TELETRANSPORTE QUÂNTICO', body: box, cls: 'modal-sim',
        onKey: function (e, a) {
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
      var tok = ++this.token;
      if (!repeat || !this.psi) {
        this.psi = Q.randomState();
        var r = Q.teleport(this.psi);
        this.bits = r.bits; this.jam = r.jamal;
        this.round++;
        S.d.simHistogram[this.bits]++;
      }
      this.cur = this.jam; this.applied = []; this.okNow = false; this.busy = false;
      this.vecA = Q.bloch(this.psi); this.ghostA = null; this.vecB = null; this.ghost = null; this.bView = 'none';
      $('sim-round').textContent = this.round;
      $('sim-psi').innerHTML = '|ψ⟩ = ' + Q.fmtState(this.psi);
      $('sim-psi-note').textContent = 'Estado original (informação da cápsula D-7)';
      $('sim-jam').textContent = 'q2 — aguardando';
      $('sim-b1').textContent = '?'; $('sim-b2').textContent = '?';
      $('sim-b1').className = 'bit'; $('sim-b2').className = 'bit';
      var pk = $('sim-packet'); pk.classList.remove('go'); pk.textContent = '··';
      this.setFid(null);
      this.enableGates(false);
      this.updateApplied();
      $('sim-next').disabled = true; if ($('sim-repeat')) $('sim-repeat').disabled = true;
      this.renderTable(); this.renderLog(); this.renderHist();
      if (this.mode === 'final') { this.timerMax = 25 + 5 * S.level('busca'); this.timer = this.timerMax; this.updateTimer(); }
      this.run(tok);
    },

    run: async function (tok) {
      var self = this;
      var d = function () { return self.fast() ? 260 : 1200; };
      var w = function (ms) { return new Promise(function (r) { setTimeout(function () { r(tok === self.token); }, ms); }); };
      var b = this.bits, vis = this.visible();

      this.setPhase('prep');
      this.narr((this.round === 1 && this.mode === 'treino' && S.d.role ? '<i>' + ROLE[S.d.role] + '</i><br>' : '') +
        '<b>1. Preparação.</b> Dandara recebeu um estado desconhecido |ψ⟩ = α|0⟩ + β|1⟩ no qubit q0 — a informação da cápsula D-7. Ela não conhece α e β, e não pode descobri-los sem destruir o estado.');
      if (!await w(d())) return;

      this.setPhase('bell'); this.bView = 'mixed';
      $('sim-jam').textContent = 'q2 emaranhado com q1 — sem direção própria';
      this.narr('<b>2. Canal quântico.</b> O par maximamente emaranhado |β₀₀⟩ = (|00⟩ + |11⟩)/√2 já foi distribuído: q1 em Salvador, q2 com Jamal em Jacobina. Sozinho, q2 não tem direção definida — veja o ponto no centro da esfera.');
      if (!await w(d())) return;

      this.setPhase('ops');
      this.narr('<b>3. Operação local de Dandara.</b> Ela aplica <b>CNOT</b> (controle q0 → alvo q1) e depois <b>Hadamard</b> em q0. A informação de |ψ⟩ fica distribuída entre os três qubits.');
      if (!await w(d())) return;

      this.setPhase('measure');
      $('sim-b1').textContent = b[0]; $('sim-b2').textContent = b[1];
      $('sim-b1').className = 'bit on'; $('sim-b2').className = 'bit on';
      AF.Audio.play('quantum');
      this.ghostA = this.vecA; this.vecA = null;
      $('sim-psi').innerHTML = '<span class="mag">|ψ⟩ destruído na medição</span>';
      $('sim-psi-note').textContent = 'Não-clonagem: não sobra cópia em Salvador';
      if (vis) { this.vecB = Q.bloch(this.jam); this.ghost = Q.bloch(this.psi); this.bView = 'vec'; $('sim-jam').innerHTML = 'q2 = ' + Q.fmtState(this.jam); }
      else { this.bView = 'fog'; $('sim-jam').textContent = 'q2 — Jamal não vê o estado'; }
      this.narr('<b>4. Medição em Salvador.</b> Dandara mede q0 e q1 e obtém <b>b₁b₂ = ' + b + '</b>. A seta de Dandara sumiu: o original foi destruído (não-clonagem). O q2 de Jamal saltou para uma de quatro versões de |ψ⟩.');
      if (!await w(d())) return;

      this.setPhase('send');
      var pk = $('sim-packet'); pk.textContent = b; pk.style.transitionDuration = (this.fast() ? 220 : 900) + 'ms';
      void pk.offsetWidth; pk.classList.add('go');
      this.narr('<b>5. Canal clássico.</b> Os bits <b>' + b + '</b> viajam pela fibra óptica até Jacobina — cerca de 1 ms para ~300 km, nunca mais rápido que a luz. Sem eles, Jamal não sabe o que fazer.');
      if (!await w(d())) return;

      this.setPhase('choose');
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
      if (a) AF.Bloch.draw(a, this.vecA ? { vec: this.vecA, color: '#ff4d6a', glow: true } : { ghost: this.ghostA, ghostColor: 'rgba(160,150,200,0.55)' });
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
      var X = { prep: 170, bell: 270, cnot: 390, h: 480, meas: 580, sep: 680, cx: 840, cz: 950, out: 1080 };
      var ph = this.phase, bits = this.bits || '??';
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0920'; ctx.fillRect(0, 0, W, H);

      var hl = { prep: ['prep'], bell: ['bell'], ops: ['cnot', 'h'], measure: ['meas'], send: ['classic'], choose: ['cx', 'cz'], verify: ['out'], done: ['out'], won: ['out'] }[ph] || [];
      ctx.fillStyle = 'rgba(0,229,255,0.12)';
      hl.forEach(function (k) {
        if (k === 'classic') { ctx.fillRect(X.meas + 20, 14, X.cz - X.meas, H - 18); return; }
        ctx.fillRect(X[k] - 38, 14, 76, H - 18);
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
      function meter(x, y) {
        ctx.fillStyle = '#161438'; ctx.strokeStyle = '#e8e6ff'; ctx.lineWidth = 2;
        ctx.fillRect(x - 20, y - 13, 40, 26); ctx.strokeRect(x - 20, y - 13, 40, 26);
        ctx.beginPath(); ctx.arc(x, y + 7, 11, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + 7); ctx.lineTo(x + 8, y - 7); ctx.stroke();
      }

      var measured = ['measure', 'send', 'choose', 'verify', 'done', 'won'].indexOf(ph) >= 0;
      line(110, y0, X.meas - 20, '#3a4488'); line(110, y1, X.meas - 20, '#3a4488'); line(110, y2, W - 40, '#3a4488');
      var ccol = measured ? '#ffc940' : '#3a3460';
      line(X.meas + 20, y0, X.cz, ccol, true); vline(X.cz, y0, y2 - 13, ccol, true);
      line(X.meas + 20, y1, X.cx, ccol, true); vline(X.cx, y1, y2 - 13, ccol, true);

      ctx.setLineDash([4, 6]); ctx.strokeStyle = '#5a5498'; ctx.beginPath(); ctx.moveTo(X.sep, 18); ctx.lineTo(X.sep, H - 6); ctx.stroke(); ctx.setLineDash([]);

      gbox(X.prep, y0, 'ψ', '#00e5ff');
      ctx.fillStyle = '#1c1240'; ctx.strokeStyle = '#ff3fa4'; ctx.lineWidth = 2;
      ctx.fillRect(X.bell - 26, y1 - 13, 52, y2 - y1 + 26); ctx.strokeRect(X.bell - 26, y1 - 13, 52, y2 - y1 + 26);
      ctx.fillStyle = '#ff3fa4'; ctx.font = '26px VT323, monospace'; ctx.textAlign = 'center'; ctx.fillText('|β₀₀⟩', X.bell, (y1 + y2) / 2); ctx.textAlign = 'left';
      vline(X.cnot, y0, y1 + 12, '#e8e6ff');
      ctx.fillStyle = '#e8e6ff'; ctx.beginPath(); ctx.arc(X.cnot, y0, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e8e6ff'; ctx.beginPath(); ctx.arc(X.cnot, y1, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X.cnot - 12, y1); ctx.lineTo(X.cnot + 12, y1); ctx.stroke();
      gbox(X.h, y0, 'H', '#ffc940');
      meter(X.meas, y0); meter(X.meas, y1);
      if (measured) {
        ctx.fillStyle = '#ffc940'; ctx.font = '25px VT323, monospace';
        ctx.fillText('b₁=' + bits[0], X.meas + 26, y0 - 11); ctx.fillText('b₂=' + bits[1], X.meas + 26, y1 - 11);
      }
      var showApplied = ph === 'choose' || ph === 'verify' || ph === 'done' || ph === 'won';
      var akey = this.appliedKey();
      var applied = showApplied ? (akey === 'none' ? '-' : akey) : '';
      var col = function (g) {
        if (applied.indexOf(g) < 0) return '#8a84c0';
        if (ph === 'choose') return '#ffc940';
        return Q.fidelity(Sim.psi, Sim.cur) > 0.99 ? '#3dff9a' : '#ff3fa4';
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
