/* =========================================================================
 * minigames.js — minigames que fazem analogias com a missão principal
 *
 *   AF.Mini.acaraje   · Início da missão (tabuleiro de Dona Cici)
 *       "Tem ou não tem pimenta?" — o acarajé de Schrödinger:
 *       superposição, medição/colapso, regra de Born e os limites da analogia
 *   AF.Mini.elevador  · Pós-missão (Elevador Lacerda)
 *       "Elevador de Hadamard" — |0⟩ Cidade Baixa, |1⟩ Cidade Alta:
 *       portas X, H e Z, interferência e fase (as correções de Jamal)
 *   AF.Mini.mercado   · Pós-missão (Mercado Modelo)
 *       "Gincana das Fitinhas" — o desafio de Bell (jogo CHSH):
 *       correlação clássica ≤ 75%, emaranhamento ≈ 85%, sem mensagem
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;
  var S2 = Math.SQRT1_2;

  /* ---------------- utilidades ---------------- */
  function q(root, sel) { return root.querySelector(sel); }
  function fmt(x, d) { return x.toFixed(d === undefined ? 2 : d).replace('.', ','); }
  function sfmt(x) { return (x < -1e-9 ? '−' : '+') + fmt(Math.abs(x)); }
  function pct(x) { return Math.round(x * 100) + '%'; }
  function digit(e) { var m = /^(?:Digit|Numpad)(\d)$/.exec((e && e.code) || ''); return m ? +m[1] : 0; }
  var NAMES = { cici: 'Dona Cici', kaua: 'Kauã', zeza: 'Dona Zeza', jamal: 'Jamal (Jacobina)', iasmin: 'Prof.ª Iasmin', oraculo: 'Oráculo' };

  function say(who, text) {
    return '<div class="mg-say"><canvas class="mg-face" data-who="' + who + '" width="16" height="16"></canvas>' +
      '<div><b>' + NAMES[who] + '</b><p>' + text + '</p></div></div>';
  }
  function faces(root) {
    root.querySelectorAll('canvas.mg-face').forEach(function (c) {
      if (c._done) return; c._done = true;
      var who = c.getAttribute('data-who');
      var img = who === 'oraculo' ? AF.Art.portrait('oraculo') : AF.Chars.portrait(AF.SPECS[who]);
      var x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      if (img) x.drawImage(img, 0, 0, 16, 16);
    });
  }
  function steps(labels, cur) {
    return '<div class="mg-steps">' + labels.map(function (l, i) {
      return '<span class="' + (i + 1 < cur ? 'done' : (i + 1 === cur ? 'on' : '')) + '">' + (i + 1) + ' · ' + l + '</span>';
    }).join('') + '</div>';
  }
  /* rola a janela do minigame até o resultado (celular e telas baixas) */
  function reveal(el) {
    if (!el) return;
    setTimeout(function () {
      try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { /* ok */ }
    }, 30);
  }

  /* Pergunta com alternativas: erro vira ruído leve e explicação; acerto libera "Continuar" */
  function ask(box, ctl, qd, onRight) {
    var done = false, tries = 0;
    box.innerHTML = '<div class="quiz-text">' + qd.q + '</div><div class="quiz-opts">' +
      qd.options.map(function (o, i) { return '<button class="btn quiz-opt" data-i="' + i + '"><span class="num">' + (i + 1) + '</span>' + o.t + '</button>'; }).join('') +
      '</div><div class="quiz-foot"></div>';
    var foot = q(box, '.quiz-foot');
    function pick(i) {
      if (done) return;
      var o = qd.options[i]; if (!o) return;
      var b = box.querySelectorAll('.quiz-opt')[i];
      tries++;
      if (o.ok) {
        done = true; b.classList.add('right'); AF.Audio.play('success');
        if (qd.track) S.record(qd.track[0], qd.track[1], tries);
        foot.innerHTML = '<div class="quiz-fb ok"><b>Isso!</b> ' + o.why + '</div><button class="btn primary mg-next">Continuar<span class="k"> [E]</span></button>';
        q(foot, '.mg-next').addEventListener('click', function () { onRight(); });
        ctl.interact = function () { onRight(); };
      } else {
        b.classList.add('wrong'); b.disabled = true; AF.Audio.play('hurt');
        S.damage(2, 'ideia a revisar'); S.d.stats.quizErrors = (S.d.stats.quizErrors || 0) + 1;
        foot.innerHTML = '<div class="quiz-fb bad"><b>Ruído quântico!</b> ' + o.why + ' Tente outra alternativa.</div>';
      }
      reveal(foot);
    }
    box.querySelectorAll('.quiz-opt').forEach(function (b) { b.addEventListener('click', function () { pick(+b.getAttribute('data-i')); }); });
    ctl.digit = function (n) { pick(n - 1); };
    ctl.interact = null;
  }

  /* Modal comum a todos os minigames */
  function open(title, cls, onClose) {
    var ctl = {};
    var body = AF.el('div', 'mg ' + (cls || ''));
    var m = AF.UI.modal({
      title: title, body: body, cls: 'modal-md modal-mini',
      onKey: function (e, a) {
        var n = digit(e);
        if (n && ctl.digit) { ctl.digit(n); return true; }
        if (a === 'interact' && ctl.interact) { ctl.interact(); return true; }
        if ((a === 'left' || a === 'right') && ctl.arrow) { ctl.arrow(a === 'left' ? -1 : 1); return true; }
        if (ctl.key && ctl.key(e)) return true;
        return false;
      },
      onClose: function () { ctl.dead = true; if (onClose) onClose(); }
    });
    return { m: m, body: body, ctl: ctl };
  }

  /* =====================================================================
   * 1) O ACARAJÉ DE SCHRÖDINGER — tem ou não tem pimenta?
   * ===================================================================== */
  function ellipse(x, cx, cy, rx, ry, col) {
    x.fillStyle = col;
    for (var y = -ry; y <= ry; y++) {
      var hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      x.fillRect(cx - hw, cy + y, hw * 2 + 1, 1);
    }
  }
  /* cena do tabuleiro (112×64): estado 'closed' | 'shake' | 'q' (quente) | 'f' (frio) */
  function drawAcaraje(cv, state, t) {
    var x = cv.getContext('2d'), W = cv.width, H = cv.height;
    x.imageSmoothingEnabled = false;
    x.fillStyle = '#0d0a22'; x.fillRect(0, 0, W, H);
    for (var i = 0; i < 18; i++) { x.fillStyle = i % 3 ? '#1a1640' : '#2a2058'; x.fillRect((i * 37) % W, (i * 13) % 26, 1, 1); }
    /* tabuleiro */
    x.fillStyle = '#ecebf6'; x.fillRect(0, 40, W, 24);
    for (var k = 0; k < W; k += 8) { x.fillStyle = '#ff3fa4'; x.fillRect(k, 40, 4, 3); }
    x.fillStyle = '#ffc940'; x.fillRect(0, 43, W, 1);
    x.fillStyle = '#c4c0dc'; x.fillRect(0, 60, W, 4);
    /* tacho de dendê */
    ellipse(x, 16, 42, 13, 5, '#3a3650'); ellipse(x, 16, 41, 11, 3, '#e8701a'); ellipse(x, 14, 40, 4, 1, '#ffb050');
    /* pimenteira quântica do neto (gadget) */
    x.fillStyle = '#2a3050'; x.fillRect(92, 26, 14, 16); x.fillStyle = '#070b18'; x.fillRect(94, 28, 10, 6);
    var blink = Math.floor(t / 300) % 2;
    x.fillStyle = blink ? '#00e5ff' : '#ff3fa4'; x.fillRect(96, 30, 6, 2);
    x.fillStyle = '#d81e1e'; x.fillRect(97, 21, 4, 5); x.fillStyle = '#3dbb6a'; x.fillRect(98, 19, 2, 2);
    var cx = 56, cy = 40;
    if (state === 'closed' || state === 'shake') {
      var dx = state === 'shake' ? Math.round(Math.sin(t / 30) * 2) : 0;
      ellipse(x, cx + dx, cy + 2, 21, 4, '#b8b0c8');
      ellipse(x, cx + dx, cy - 3, 19, 9, '#e8dcc0');
      x.fillStyle = '#c8b898'; x.fillRect(cx - 14 + dx, cy - 6, 28, 1); x.fillRect(cx - 9 + dx, cy - 1, 18, 1);
      x.fillStyle = '#d8ccb0'; x.fillRect(cx - 3 + dx, cy - 15, 6, 4); x.fillRect(cx - 5 + dx, cy - 17, 3, 2); x.fillRect(cx + 2 + dx, cy - 17, 3, 2);
      /* "?" que pisca entre ciano e magenta: superposição */
      AF.Pix.text(x, '?', cx - 1 + dx, cy - 7, Math.floor(t / 260) % 2 ? '#00e5ff' : '#ff3fa4');
      for (var s = 0; s < 3; s++) {
        var sx = cx - 8 + s * 8 + dx;
        for (var yy = 0; yy < 6; yy++) { x.fillStyle = 'rgba(232,230,255,0.35)'; x.fillRect(sx + Math.round(Math.sin((t / 200) + yy + s) * 1.5), cy - 20 - yy * 2, 1, 1); }
      }
      return;
    }
    /* papel aberto + acarajé */
    ellipse(x, cx, cy + 2, 26, 6, '#f0e6cc'); ellipse(x, cx, cy + 3, 24, 4, '#e2d6b8');
    ellipse(x, cx, cy - 2, 17, 7, '#7a3a12'); ellipse(x, cx, cy - 3, 16, 6, '#b8621e'); ellipse(x, cx - 4, cy - 6, 8, 2, '#d8823a');
    x.fillStyle = '#5a2a0e'; x.fillRect(cx - 15, cy - 2, 30, 1);
    x.fillStyle = '#f0c040'; x.fillRect(cx - 13, cy - 1, 26, 2);                         /* vatapá */
    x.fillStyle = '#ff8a6a'; [[-9, -2], [-1, -3], [7, -2]].forEach(function (p) { x.fillRect(cx + p[0], cy + p[1], 3, 2); });  /* camarão */
    x.fillStyle = '#3dbb6a'; [[-5, 0], [3, 0], [10, -1]].forEach(function (p) { x.fillRect(cx + p[0], cy + p[1], 2, 1); });     /* salada */
    if (state === 'q') {
      x.fillStyle = '#d81e1e'; [[-12, -1], [-6, 0], [0, -1], [5, 0], [11, -1], [-3, -2], [8, -2]].forEach(function (p) { x.fillRect(cx + p[0], cy + p[1], 2, 2); });
      x.fillStyle = '#ff4d3a'; x.fillRect(cx + 20, cy - 10, 6, 3); x.fillRect(cx + 25, cy - 12, 2, 2); x.fillStyle = '#3dbb6a'; x.fillRect(cx + 19, cy - 10, 1, 2);
      AF.Pix.text(x, 'QUENTE', cx - 11, 8, '#ff4d6a');
    } else {
      AF.Pix.text(x, 'FRIO', cx - 7, 8, '#7af9ff');
    }
  }

  var AC_ORDERS = [
    { who: 'Turista de São Paulo', text: '"De cada 4 acarajés, quero só 1 quente. O resto, frio!"', want: 0.25 },
    { who: 'Seu Raimundo, do Pelourinho', text: '"Eu gosto de arder: 3 de cada 4 quentes!"', want: 0.75 }
  ];
  var AC_Q = [
    { track: ['acaraje', 1], q: 'Antes de Dona Cici abrir o papel, o acarajé da <b>pimenteira quântica</b>…', options: [
      { t: 'já tinha ou não tinha pimenta; a gente só não sabia qual.', why: 'Essa é a ideia clássica de "valor escondido". No mundo quântico não é assim: experimentos (os testes de Bell) mostram que os resultados não estão simplesmente escritos de antemão.' },
      { t: 'estava em superposição de quente e frio, com amplitudes; ao abrir (medir), aparece um resultado só.', ok: true, why: 'Antes da medida, o estado é α|frio⟩ + β|quente⟩. A medição dá UM resultado, com probabilidades |α|² e |β|², e depois dela o resultado fica definido.' },
      { t: 'estava "meio apimentado": metade da pimenta de um quente.', why: 'Superposição não é mistura nem média. Ao abrir, sempre aparece um acarajé inteiramente quente ou inteiramente frio, nunca um meio-termo.' }
    ] },
    { track: ['acaraje', 2], q: 'E um acarajé de verdade, no tabuleiro, pode ficar em superposição de quente e frio?', options: [
      { t: 'Pode, enquanto ninguém olhar.', why: 'Não é o "olhar" humano que importa: qualquer interação com o ambiente já conta como uma espécie de medição.' },
      { t: 'Só se ficar dentro de uma caixa bem fechada.', why: 'Mesmo dentro da caixa, o acarajé troca calor e luz com o ar e com o próprio papel. Isso basta para desfazer a superposição.' },
      { t: 'Na prática, não: objetos grandes interagem o tempo todo com o ambiente e perdem a superposição quase na hora (decoerência). Esse era o recado do gato de Schrödinger.', ok: true, why: 'Schrödinger inventou o gato em 1935 justamente para mostrar como seria estranho levar a superposição para o cotidiano. Por isso os qubits da Afrotech vivem isolados e congelados.' }
    ] }
  ];

  function acaraje(onDone) {
    var replay = S.flag('acarajeQ');
    var g = open('Tem ou não tem pimenta? · O Acarajé de Schrödinger', 'mg-ac', function () { if (g.raf) cancelAnimationFrame(g.raf); });
    var body = g.body, ctl = g.ctl;
    var st = { stage: 1, round: 0, hits: 0, view: 'closed', theta: 90, order: 0, results: [] };
    var cv = null;

    function loop(t) {
      if (ctl.dead) return;
      if (cv && document.body.contains(cv)) drawAcaraje(cv, st.view, t);
      g.raf = requestAnimationFrame(loop);
    }
    g.raf = requestAnimationFrame(loop);

    function frame(inner) {
      body.innerHTML = steps(['Aposta', 'Receita da pimenteira', 'Quente ou frio?'], st.stage) + inner;
      faces(body);
      cv = q(body, '.mg-scene canvas');
    }
    function scene(cap) {
      return '<div class="mg-scene"><canvas width="112" height="64"></canvas><div class="mg-cap">' + cap + '</div></div>';
    }

    /* ---------- Etapa 1: apostas ---------- */
    function stage1() {
      st.stage = 1; st.view = 'closed';
      var first = st.round === 0;
      frame('<div class="mg-grid">' + scene('Pimenteira quântica: <b>|ψ⟩ = 0,71·|frio⟩ + 0,71·|quente⟩</b><br>chance de vir quente: <b>50%</b>') +
        '<div class="mg-side">' +
        (first ? say('cici', 'Ó, meu bem: meu neto ligou essa tal pimenteira quântica no meu tacho. Eu embrulho o acarajé no papel e nem eu sei se ele vem <b>quente</b> (com pimenta) ou <b>frio</b>. Só abrindo! Aposta comigo?')
          : say('cici', 'Mais um, quentinho do tacho… ou frio. Aposta!')) +
        '<div class="mg-score">Acarajé ' + (st.round + 1) + ' de 3 · acertos: ' + st.hits + '</div>' +
        '<div class="mg-btns"><button class="btn mg-bet" data-b="q"><span class="num">1</span> Aposto: QUENTE</button>' +
        '<button class="btn mg-bet" data-b="f"><span class="num">2</span> Aposto: FRIO</button></div>' +
        '<div class="mg-out"></div></div></div>');
      body.querySelectorAll('.mg-bet').forEach(function (b) { b.addEventListener('click', function () { bet(b.getAttribute('data-b')); }); });
      ctl.digit = function (n) { if (n === 1) bet('q'); else if (n === 2) bet('f'); };
      ctl.interact = null; ctl.arrow = null;
    }
    function bet(choice) {
      if (st.busy) return;
      st.busy = true; ctl.digit = null;
      body.querySelectorAll('.mg-bet').forEach(function (b) { b.disabled = true; if (b.getAttribute('data-b') === choice) b.classList.add('chosen'); });
      st.view = 'shake'; AF.Audio.play('dice');
      setTimeout(function () {
        if (ctl.dead) return;
        var res = Math.random() < 0.5 ? 'q' : 'f';
        st.view = res; st.round++;
        var hit = res === choice; if (hit) st.hits++;
        if (st.round === 3 && !replay) S.mg('acaraje', { apostas: st.hits });
        AF.Audio.play(hit ? 'success' : 'select');
        var out = q(body, '.mg-out');
        out.innerHTML = '<div class="quiz-fb ' + (hit ? 'ok' : 'bad') + '"><b>' + (res === 'q' ? 'Veio QUENTE!' : 'Veio FRIO!') + '</b> ' +
          (hit ? 'Você acertou a aposta.' : 'Não foi dessa vez.') + ' Com 50% para cada lado, ninguém acerta sempre: cada abertura é um sorteio da natureza.</div>' +
          '<div class="mg-btns">' + (st.round === 1 ? '<button class="btn mg-again">Abrir de novo</button>' : '') +
          '<button class="btn primary mg-go">' + (st.round < 3 ? 'Próximo acarajé' : 'Continuar') + '<span class="k"> [E]</span></button></div>';
        q(body, '.mg-score').textContent = 'Acarajé ' + st.round + ' de 3 · acertos: ' + st.hits;
        var again = q(out, '.mg-again');
        if (again) again.addEventListener('click', function () {
          again.disabled = true;
          out.insertAdjacentHTML('afterbegin', '<div class="mg-note">Continua <b>' + (res === 'q' ? 'quente' : 'frio') + '</b>. Depois de aberto (medido), o resultado fica definido: abrir de novo só confirma. A superposição não volta sozinha.</div>');
          S.unlock('medicao');
        });
        var go = function () { st.busy = false; if (st.round < 3) stage1(); else after1(); };
        q(out, '.mg-go').addEventListener('click', go);
        ctl.interact = go;
        reveal(out);
      }, 650);
    }
    function after1() {
      st.view = 'closed';
      frame('<div class="mg-grid">' + scene('Antes de abrir: as duas possibilidades juntas') + '<div class="mg-side">' +
        say('cici', 'Você acertou ' + st.hits + ' de 3. E olhe que eu não escondi nada de você, viu? Antes de abrir, nem a pimenteira tinha decidido.') +
        say('kaua', 'É igual ao gato daquele físico, o Schrödinger: dentro da caixa, "vivo e morto" ao mesmo tempo. Aqui é <b>quente e frio</b>, em <b>superposição</b>, até alguém abrir o papel — a <b>medição</b>.') +
        '<div class="mg-btns"><button class="btn primary mg-go">Ajustar a pimenteira<span class="k"> [E]</span></button></div></div></div>');
      S.unlock('superposicao');
      var go = function () { stage2(); };
      q(body, '.mg-go').addEventListener('click', go); ctl.interact = go; ctl.digit = null;
    }

    /* ---------- Etapa 2: a receita (regra de Born) ---------- */
    function stage2() {
      st.stage = 2; st.view = 'closed'; st.theta = 90;
      var od = AC_ORDERS[st.order];
      frame('<div class="mg-grid">' + scene('Pedido ' + (st.order + 1) + ' de 2') + '<div class="mg-side">' +
        (st.order === 0 ? say('kaua', 'Cada freguês pede uma receita diferente. O botão da pimenteira gira um <b>ângulo</b> e muda as <b>amplitudes</b>. A chance de vir quente é a amplitude <b>ao quadrado</b>.')
          : say('kaua', 'Mais um freguês exigente. Gira o botão de novo!')) +
        '<div class="mg-order"><b>' + od.who + ':</b> ' + od.text + '<br><span class="gold">Meta: ' + pct(od.want) + ' quentes</span></div>' +
        '<label class="mg-slider"><span>Ângulo da pimenteira: <b class="mg-th">90°</b> <span class="k dim">(← →)</span></span><input type="range" min="0" max="180" step="5" value="90"></label>' +
        '<div class="mg-bars">' +
          '<div class="row"><span>|frio⟩</span><div class="mg-bar"><i class="b0"></i></div><span class="v0"></span></div>' +
          '<div class="row"><span>|quente⟩</span><div class="mg-bar hot"><i class="b1"></i></div><span class="v1"></span></div>' +
        '</div>' +
        '<div class="mg-btns"><button class="btn primary mg-fry">Fritar 20 e entregar<span class="k"> [E]</span></button>' +
        '<button class="btn mg-hint">Dica</button></div>' +
        '<div class="mg-out"></div></div></div>');
      var rng = q(body, 'input[type=range]');
      function upd() {
        st.theta = +rng.value;
        var th = st.theta * Math.PI / 360, a = Math.cos(th), b = Math.sin(th);
        q(body, '.mg-th').textContent = st.theta + '°';
        q(body, '.b0').style.width = (a * a * 100) + '%'; q(body, '.b1').style.width = (b * b * 100) + '%';
        q(body, '.v0').innerHTML = 'amp. ' + fmt(a) + ' → <b>' + pct(a * a) + '</b>';
        q(body, '.v1').innerHTML = 'amp. ' + fmt(b) + ' → <b>' + pct(b * b) + '</b>';
        q(body, '.mg-cap').innerHTML = '|ψ⟩ = ' + fmt(a) + '·|frio⟩ + ' + fmt(b) + '·|quente⟩';
      }
      rng.addEventListener('input', upd); upd();
      ctl.arrow = function (d) { rng.value = Math.max(0, Math.min(180, st.theta + d * 5)); upd(); };
      q(body, '.mg-hint').addEventListener('click', function () {
        var amp = Math.sqrt(od.want);
        q(body, '.mg-out').innerHTML = '<div class="mg-note">Para ' + pct(od.want) + ' de chance, a amplitude do quente precisa ser √' + fmt(od.want) + ' ≈ <b>' + fmt(amp) + '</b>. Procure o ângulo em que a barra do quente mostra amplitude ' + fmt(amp) + '.</div>';
      });
      q(body, '.mg-fry').addEventListener('click', fry);
      ctl.interact = fry; ctl.digit = null;
    }
    function fry() {
      if (st.busy) return;
      var od = AC_ORDERS[st.order];
      var th = st.theta * Math.PI / 360, p = Math.pow(Math.sin(th), 2);
      st.busy = true;
      var out = q(body, '.mg-out');
      out.innerHTML = '<div class="ac-row"></div><div class="mg-tally"></div>';
      var row = q(out, '.ac-row'), n = 0, hot = 0;
      st.view = 'shake';
      var tick = function () {
        if (ctl.dead) return;
        if (n >= 20) { done(); return; }
        var isHot = Math.random() < p; if (isHot) hot++;
        n++;
        row.insertAdjacentHTML('beforeend', '<i class="ac ' + (isHot ? 'q' : 'f') + '"></i>');
        q(out, '.mg-tally').textContent = hot + ' quentes · ' + (n - hot) + ' frios';
        if (n % 4 === 0) AF.Audio.play('select');
        setTimeout(tick, 55);
      };
      tick();
      function done() {
        st.busy = false;
        st.view = hot >= 10 ? 'q' : 'f';
        var okP = Math.abs(p - od.want) < 0.001;
        st.tries = (st.tries || 0) + 1;
        if (okP && !replay) { var o = {}; o['pedido' + (st.order + 1)] = st.tries; S.mg('acaraje', o); }
        if (okP) st.tries = 0;
        var amp = Math.sqrt(od.want);
        if (okP) {
          AF.Audio.play('success');
          out.insertAdjacentHTML('beforeend', '<div class="quiz-fb ok"><b>Pedido certo!</b> Chance ajustada: ' + pct(p) + '. Saíram ' + hot + ' quentes de 20 (' + pct(hot / 20) + ') — com poucos acarajés a contagem varia; a probabilidade aparece na média de muitos. ' +
            'Repare: a amplitude do quente é <b>' + fmt(amp) + '</b> e a chance é ' + fmt(amp) + '² = <b>' + pct(od.want) + '</b>. Isso é a <b>regra de Born</b>.</div>' +
            '<div class="mg-btns"><button class="btn primary mg-go">' + (st.order === 0 ? 'Próximo freguês' : 'Continuar') + '<span class="k"> [E]</span></button></div>');
          S.unlock('regra_born');
          var go = function () { st.order++; if (st.order < AC_ORDERS.length) stage2(); else stage3(0); };
          q(out, '.mg-go').addEventListener('click', go); ctl.interact = go;
        } else {
          AF.Audio.play('hurt');
          S.damage(2, 'receita fora do pedido');
          out.insertAdjacentHTML('beforeend', '<div class="quiz-fb bad"><b>O freguês reclamou!</b> Você ajustou ' + pct(p) + ' de chance de vir quente e ele pediu ' + pct(od.want) + '. ' +
            (p > od.want ? 'Gire o botão para menos.' : 'Gire o botão para mais.') + ' Lembre: chance = amplitude².</div>');
          ctl.interact = fry;
        }
        reveal(out);
      }
    }

    /* ---------- Etapa 3: quente ou frio? (o gato e os limites da analogia) ---------- */
    function stage3(i) {
      st.stage = 3; st.view = i === 0 ? 'closed' : 'q';
      frame('<div class="mg-grid">' + scene(i === 0 ? 'A pimenteira quântica' : 'Um acarajé de verdade') + '<div class="mg-side mg-q"></div></div>');
      ask(q(body, '.mg-q'), ctl, AC_Q[i], function () { if (i === 0) stage3(1); else finish(); });
      ctl.arrow = null;
    }
    function finish() {
      st.view = 'q';
      if (!replay) {
        S.setFlag('acarajeQ');
        S.addCredits(6); S.heal(10);
        ['superposicao', 'medicao', 'regra_born', 'gato_schrodinger', 'decoerencia'].forEach(function (k) { S.unlock(k); });
        S.addJournal('O acarajé de Schrödinger', 'No tabuleiro de Dona Cici, a pimenteira quântica deixava o acarajé "quente e frio" até abrir o papel. Aprendi: (1) superposição não é "meio a meio" nem ignorância — ao medir, aparece um resultado só; (2) depois de medido, o resultado fica definido; (3) a chance é a amplitude ao quadrado (amplitude 0,5 → 25%); (4) um acarajé de verdade, como o gato de Schrödinger, perde a superposição na hora por decoerência.',
          'Crônica: perdi duas apostas e ganhei um acarajé quente. Dona Cici disse que a física dela é de tabuleiro, mas é física de verdade.');
      }
      frame('<div class="mg-grid">' + scene('Quentinho — e já medido!') + '<div class="mg-side">' +
        say('cici', 'Agora sim, meu bem! Tome um acarajé quente — esse eu abri antes de você chegar, então já está decidido. Vai lá na Torre que a cidade precisa de você.') +
        '<ul class="mg-take"><li><b>Superposição:</b> antes de medir, as duas possibilidades juntas, cada uma com uma amplitude.</li>' +
        '<li><b>Medição:</b> aparece um resultado só; abrir de novo confirma o mesmo.</li>' +
        '<li><b>Regra de Born:</b> chance = amplitude² (0,5 → 25%).</li>' +
        '<li><b>Gato de Schrödinger:</b> objetos do dia a dia perdem a superposição na hora (decoerência). O acarajé quântico é só analogia: o de verdade já vem quente ou frio.</li></ul>' +
        (replay ? '<p class="dim">Partida livre: sem novas recompensas.</p>' : '<p class="gold">+6 Créditos Quânticos · +10 Estabilidade · 5 conceitos no Glossário</p>') +
        '<div class="mg-btns"><button class="btn primary mg-go">' + (S.flag('gateOpen') ? 'Voltar à praça' : 'Seguir para a Torre') + '<span class="k"> [E]</span></button></div></div></div>');
      var go = function () { g.m.close(); if (onDone) onDone(); AF.HUD.refresh(); };
      q(body, '.mg-go').addEventListener('click', go); ctl.interact = go; ctl.digit = null;
    }

    stage1();
    return g.m;
  }

  /* =====================================================================
   * 2) ELEVADOR DE HADAMARD — |0⟩ Cidade Baixa · |1⟩ Cidade Alta
   * ===================================================================== */
  var EL_PUZ = [
    { title: 'Primeira viagem', start: [1, 0], target: 1, allowed: ['X', 'H', 'Z'], max: 3,
      text: 'Todos os passageiros estão na <b>Cidade Baixa |0⟩</b>. Leve <b>todos</b> para a <b>Cidade Alta |1⟩</b>.',
      done: 'A porta <b>X</b> é o "NOT" quântico: troca |0⟩ por |1⟩. É a correção que Jamal usa quando o segundo bit de Dandara chega 1.' },
    { title: 'Meio a meio', start: [1, 0], target: 0.5, allowed: ['X', 'H', 'Z'], max: 3,
      text: 'Agora metade dos passageiros deve chegar à Cidade Alta e metade à Cidade Baixa — sem sorteio clássico: use uma porta quântica.',
      done: 'A porta <b>H</b> (Hadamard) cria a superposição (|0⟩ + |1⟩)/√2. Cada passageiro chega a UM lugar só; o meio a meio aparece na contagem de muitos.' },
    { title: 'Duas moedas?', start: [1, 0], target: 0, allowed: ['H'], exact: 2, predict: true,
      text: 'Jogar uma moeda duas vezes continua dando 50/50. E passar por <b>duas portas H seguidas</b>? Monte <b>H · H</b>, faça sua previsão e envie.',
      done: '<b>Interferência!</b> Os dois caminhos até a Cidade Alta têm amplitudes +½ e −½: somados dão 0 e se cancelam. Os caminhos até a Cidade Baixa (+½ e +½) se reforçam. Moedas não fazem isso; amplitudes fazem.' },
    { title: 'A fase invisível', start: [1, 0], target: 1, allowed: ['H', 'Z'], max: 3,
      text: 'Leve todos à <b>Cidade Alta</b> usando só <b>H</b> e <b>Z</b>. Dica de ascensorista: Z sozinha não muda as chances… mas muda um sinal.',
      done: '<b>H · Z · H</b> funciona como X. A porta Z só troca o <b>sinal</b> da amplitude de |1⟩: invisível numa medição direta, decisiva quando outra H faz as amplitudes interferirem. Por isso a correção Z de Jamal importa tanto.' },
    { title: 'Chegou de Jacobina', start: [S2, -S2], target: 0, allowed: ['H', 'Z'], max: 2,
      text: 'Uma cabine chegou pelo canal no estado <b>(|0⟩ − |1⟩)/√2</b>: 50/50, mas com sinal de menos. Use H e Z para entregar <b>todos na Cidade Baixa</b>.',
      done: '<b>Z</b> tirou o sinal de menos e <b>H</b> desfez a superposição: Z · H leva (|0⟩ − |1⟩)/√2 para |0⟩. Corrigir a fase antes de medir é exatamente o trabalho de Jamal no teletransporte.' }
  ];
  function applyGate(a, gt) {
    if (gt === 'X') return [a[1], a[0]];
    if (gt === 'Z') return [a[0], -a[1]];
    return [(a[0] + a[1]) * S2, (a[0] - a[1]) * S2];
  }
  function drawElevator(cv, a, t) {
    var x = cv.getContext('2d'), W = cv.width, H = cv.height;
    x.imageSmoothingEnabled = false;
    x.fillStyle = '#0a081c'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#3a2c3a'; x.fillRect(0, 30, 22, H - 30);                      /* escarpa */
    x.fillStyle = '#2c744e'; for (var i = 0; i < 12; i++) x.fillRect((i * 7) % 20, 34 + i * 7, 3, 2);
    x.fillStyle = '#d8d4e8'; x.fillRect(26, 6, 24, 10);                           /* estação alta */
    x.fillStyle = '#9a94b4'; x.fillRect(30, 16, 16, H - 34);                       /* torre */
    x.fillStyle = '#6e6888'; for (var y = 18; y < H - 18; y += 6) x.fillRect(30, y, 16, 1);
    x.fillStyle = '#d8d4e8'; x.fillRect(24, H - 18, 28, 12);                      /* estação baixa */
    x.fillStyle = '#00a9c4'; x.fillRect(37, 16, 2, H - 34);
    AF.Pix.text(x, 'ALTA |1>', 4, 0, '#ffc940');
    AF.Pix.text(x, 'BAIXA |0>', 2, H - 5, '#7af9ff');
    var p1 = a[1] * a[1], p0 = a[0] * a[0];
    var glow = 0.6 + 0.4 * Math.sin(t / 220);
    function cabin(cy, alpha, col) {
      if (alpha < 0.02) return;
      x.globalAlpha = alpha; x.fillStyle = col; x.fillRect(31, cy, 14, 10);
      x.fillStyle = '#07060f'; x.fillRect(33, cy + 2, 10, 5); x.fillStyle = '#ffc940'; x.fillRect(34, cy + 3, 2, 3); x.fillRect(39, cy + 3, 2, 3);
      x.globalAlpha = 1;
    }
    cabin(17, Math.max(0.12, p1) * glow + (1 - glow) * p1, a[1] < -1e-9 ? '#ff3fa4' : '#00e5ff');
    cabin(H - 29, Math.max(0.12, p0) * glow + (1 - glow) * p0, a[0] < -1e-9 ? '#ff3fa4' : '#00e5ff');
    if (p0 < 0.02) { x.globalAlpha = 0.15; x.strokeStyle = '#7af9ff'; x.strokeRect(31.5, H - 28.5, 13, 9); x.globalAlpha = 1; }
    if (p1 < 0.02) { x.globalAlpha = 0.15; x.strokeStyle = '#ffc940'; x.strokeRect(31.5, 17.5, 13, 9); x.globalAlpha = 1; }
  }
  /* círculo das amplitudes (reais): horizontal = Baixa |0⟩, vertical = Alta |1⟩ */
  function drawCircle(cv, a) {
    var x = cv.getContext('2d'), W = cv.width, H = cv.height, cx = W / 2, cy = H / 2, R = W * 0.36;
    x.clearRect(0, 0, W, H);
    x.strokeStyle = '#3a3274'; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = 'rgba(200,200,255,0.3)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(cx - R - 10, cy); x.lineTo(cx + R + 10, cy); x.moveTo(cx, cy + R + 10); x.lineTo(cx, cy - R - 10); x.stroke();
    x.font = '20px VT323, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#7af9ff'; x.fillText('+|0⟩', cx + R + 2, cy + 16); x.fillText('−|0⟩', cx - R - 2, cy + 16);
    x.fillStyle = '#ffc940'; x.fillText('+|1⟩', cx + 28, cy - R - 4); x.fillText('−|1⟩', cx + 28, cy + R + 6);
    var px = cx + a[0] * R, py = cy - a[1] * R;
    x.strokeStyle = 'rgba(255,201,64,0.35)'; x.setLineDash([4, 4]);
    x.beginPath(); x.moveTo(px, py); x.lineTo(px, cy); x.moveTo(px, py); x.lineTo(cx, py); x.stroke(); x.setLineDash([]);
    x.strokeStyle = '#ffc940'; x.lineWidth = 4; x.shadowColor = '#ffc940'; x.shadowBlur = 10;
    x.beginPath(); x.moveTo(cx, cy); x.lineTo(px, py); x.stroke(); x.shadowBlur = 0;
    x.fillStyle = '#fff'; x.beginPath(); x.arc(px, py, 5, 0, Math.PI * 2); x.fill();
  }

  function elevador() {
    var g = open('Elevador de Hadamard · Elevador Lacerda', 'mg-el', function () { if (g.raf) cancelAnimationFrame(g.raf); });
    var body = g.body, ctl = g.ctl;
    var solved = S.count('elevSolved');
    var st = { idx: Math.min(solved, EL_PUZ.length - 1), seq: [], busy: false, predicted: null };
    var cvE = null, amps = [1, 0];

    function loop(t) {
      if (ctl.dead) return;
      if (cvE && document.body.contains(cvE)) drawElevator(cvE, amps, t);
      g.raf = requestAnimationFrame(loop);
    }
    g.raf = requestAnimationFrame(loop);

    function state() { var a = EL_PUZ[st.idx].start.slice(); st.seq.forEach(function (gt) { a = applyGate(a, gt); }); return a; }

    function render() {
      var P = EL_PUZ[st.idx];
      st.predicted = null;
      var chips = EL_PUZ.map(function (p, i) {
        var cls = i < solved ? 'done' : (i === st.idx ? 'on' : (i > solved ? 'lock' : ''));
        if (i === st.idx) cls = (i < solved ? 'done ' : '') + 'on';
        return '<button class="mg-chip ' + cls + '" data-i="' + i + '"' + (i > solved ? ' disabled' : '') + '>' + (i + 1) + '. ' + p.title + '</button>';
      }).join('');
      body.innerHTML = '<div class="mg-chips">' + chips + '</div>' +
        '<div class="mg-grid el">' +
          '<div class="mg-scene el"><canvas class="el-cv" width="80" height="120"></canvas>' +
            '<canvas class="amp-cv" width="220" height="220"></canvas><div class="mg-cap">Seta dourada: as amplitudes. A sombra de cada eixo, ao quadrado, é a chance.</div></div>' +
          '<div class="mg-side">' +
            '<div class="mg-order">' + P.text + '</div>' +
            '<div class="mg-seq"><span class="dim">Portas:</span> <span class="seq"></span></div>' +
            '<div class="gates el-gates">' + ['H', 'X', 'Z'].map(function (gt) {
              return '<button class="btn gate" data-g="' + gt + '"' + (P.allowed.indexOf(gt) < 0 ? ' disabled' : '') + '><span class="num">' + gt + '</span>' + ({ H: 'Hadamard', X: 'Troca', Z: 'Fase' })[gt] + '</button>';
            }).join('') + '<button class="btn gate" data-g="undo">⌫ Apagar</button></div>' +
            '<div class="mg-bars">' +
              '<div class="row"><span>Alta |1⟩</span><div class="mg-bar"><i class="b1"></i></div><span class="v1"></span></div>' +
              '<div class="row"><span>Baixa |0⟩</span><div class="mg-bar"><i class="b0"></i></div><span class="v0"></span></div>' +
            '</div>' +
            '<div class="mg-note el-note"></div>' +
            '<div class="mg-btns"><button class="btn primary mg-send">Enviar 20 passageiros<span class="k"> [E]</span></button></div>' +
            '<div class="mg-out"></div>' +
          '</div></div>';
      cvE = q(body, '.el-cv');
      body.querySelectorAll('.mg-chip').forEach(function (b) {
        b.addEventListener('click', function () { var i = +b.getAttribute('data-i'); if (i <= solved && !st.busy) { st.idx = i; st.seq = []; render(); } });
      });
      body.querySelectorAll('.el-gates .gate').forEach(function (b) {
        b.addEventListener('click', function () { press(b.getAttribute('data-g')); });
      });
      q(body, '.mg-send').addEventListener('click', send);
      ctl.interact = send; ctl.digit = null;
      ctl.key = function (e) {
        if (e.code === 'KeyH') { press('H'); return true; }
        if (e.code === 'KeyX') { press('X'); return true; }
        if (e.code === 'KeyZ') { press('Z'); return true; }
        if (e.code === 'Backspace') { press('undo'); return true; }
        return false;
      };
      upd();
    }
    function press(gt) {
      if (st.busy) return;
      var P = EL_PUZ[st.idx], lim = P.exact || P.max;
      if (gt === 'undo') { st.seq.pop(); upd(); return; }
      if (P.allowed.indexOf(gt) < 0) return;
      if (st.seq.length >= lim) { AF.Toast.show('Máximo de ' + lim + ' portas neste desafio', 'dim'); return; }
      st.seq.push(gt); AF.Audio.play('select'); upd();
      q(body, '.mg-out').innerHTML = '';
    }
    function upd() {
      var P = EL_PUZ[st.idx];
      amps = state();
      var a = amps, p0 = a[0] * a[0], p1 = a[1] * a[1];
      q(body, '.seq').innerHTML = st.seq.length ? st.seq.map(function (gt) { return '<b class="sq">' + gt + '</b>'; }).join(' → ') : '<span class="dim">(nenhuma — toque H, X ou Z)</span>';
      q(body, '.b0').style.width = (p0 * 100) + '%'; q(body, '.b1').style.width = (p1 * 100) + '%';
      q(body, '.b0').parentNode.classList.toggle('neg', a[0] < -1e-9);
      q(body, '.b1').parentNode.classList.toggle('neg', a[1] < -1e-9);
      q(body, '.v0').innerHTML = 'amp. ' + sfmt(a[0]) + ' → <b>' + pct(p0) + '</b>';
      q(body, '.v1').innerHTML = 'amp. ' + sfmt(a[1]) + ' → <b>' + pct(p1) + '</b>';
      drawCircle(q(body, '.amp-cv'), a);
      var note = '';
      var last = st.seq[st.seq.length - 1];
      if (last === 'Z' && Math.abs(p0 - p1) < 1e-6) note = 'A porta Z trocou o <b>sinal</b> (barra magenta), mas as chances continuam ' + pct(p0) + ' / ' + pct(p1) + ': numa medição direta, a fase é invisível.';
      else if (last === 'Z' && (p0 < 1e-6 || p1 < 1e-6)) note = 'Z num estado sem superposição só muda um sinal "global": nada muda nas chances.';
      else if (st.seq.length === 0 && P.start[1] < 0) note = 'Repare na barra magenta: amplitude negativa. Mesmas chances que (|0⟩ + |1⟩)/√2, mas é outro estado.';
      var lim = P.exact ? 'exatamente ' + P.exact : 'até ' + P.max;
      q(body, '.el-note').innerHTML = (note ? note + '<br>' : '') + '<span class="dim">Portas: ' + lim + ' · permitidas: ' + P.allowed.join(', ') + '.</span>';
    }
    function send() {
      if (st.busy) return;
      var P = EL_PUZ[st.idx];
      var out = q(body, '.mg-out');
      if (P.exact && st.seq.length !== P.exact) { out.innerHTML = '<div class="quiz-fb bad">Monte exatamente ' + P.exact + ' portas antes de enviar.</div>'; reveal(out); return; }
      if (P.predict && st.predicted === null) {
        out.innerHTML = '<div class="mg-order"><b>Sua previsão:</b> com H · H, onde os 20 passageiros vão chegar?</div><div class="mg-btns">' +
          ['50% / 50%, como duas moedas', '100% na Cidade Baixa', '100% na Cidade Alta'].map(function (t, i) { return '<button class="btn mg-pred" data-i="' + i + '"><span class="num">' + (i + 1) + '</span>' + t + '</button>'; }).join('') + '</div>';
        out.querySelectorAll('.mg-pred').forEach(function (b) { b.addEventListener('click', function () { st.predicted = +b.getAttribute('data-i'); send(); }); });
        ctl.digit = function (n) { if (n >= 1 && n <= 3) { st.predicted = n - 1; send(); } };
        reveal(out);
        return;
      }
      ctl.digit = null;
      st.busy = true;
      var a = state(), p1 = a[1] * a[1];
      out.innerHTML = '<div class="el-tally"><div><span class="gold">Cidade Alta</span> <b class="n1">0</b><div class="pax up"></div></div>' +
        '<div><span class="cyan">Cidade Baixa</span> <b class="n0">0</b><div class="pax dn"></div></div></div>';
      var n = 0, up = 0;
      var tick = function () {
        if (ctl.dead) return;
        if (n >= 20) { finish(); return; }
        var isUp = Math.random() < p1; n++; if (isUp) up++;
        q(out, isUp ? '.pax.up' : '.pax.dn').insertAdjacentHTML('beforeend', '<i></i>');
        q(out, '.n1').textContent = up; q(out, '.n0').textContent = n - up;
        if (n % 5 === 0) AF.Audio.play('select');
        setTimeout(tick, 45);
      };
      tick();
      function finish() {
        st.busy = false;
        var ok = Math.abs(p1 - P.target) < 1e-6;
        st.tries = (st.tries || 0) + 1;
        if (ok && st.idx >= solved) { var o = {}; o['d' + (st.idx + 1)] = st.tries; if (P.predict) o.previsao = st.predicted === 1 ? 'certa' : 'errada'; S.mg('elevador', o); }
        if (ok) st.tries = 0;
        var predTxt = '';
        if (P.predict && st.predicted !== null) predTxt = st.predicted === 1 ? '<b>Sua previsão estava certa.</b> ' : 'Você previu ' + ['50/50', '', '100% na Alta'][st.predicted] + ' — a natureza surpreendeu. ';
        if (ok) {
          AF.Audio.play('success');
          var first = st.idx >= solved;
          if (first) {
            solved = st.idx + 1; S.d.counters.elevSolved = solved; S.addCredits(2);
            if (solved >= EL_PUZ.length && !S.flag('miniElevador')) {
              S.setFlag('miniElevador'); S.addCredits(5);
              ['porta_x', 'porta_h', 'porta_z', 'interferencia', 'fase_global'].forEach(function (k) { S.unlock(k); });
              S.addJournal('Elevador de Hadamard', 'No Elevador Lacerda, a Cidade Baixa era |0⟩ e a Cidade Alta, |1⟩. X troca as estações; H cria superposição; duas H seguidas voltam à Cidade Baixa porque os caminhos até a Alta se cancelam (interferência); Z só troca um sinal, invisível numa medida direta, mas H·Z·H vira X. Foi assim que entendi por que Jamal precisa corrigir a fase.');
            }
          }
          out.insertAdjacentHTML('beforeend', '<div class="quiz-fb ok"><b>Viagem perfeita!</b> ' + predTxt + P.done + '</div>' +
            '<div class="mg-btns">' + (st.idx < EL_PUZ.length - 1 ? '<button class="btn primary mg-go">Próximo desafio<span class="k"> [E]</span></button>'
              : '<button class="btn primary mg-go">Concluir<span class="k"> [E]</span></button>') + '</div>');
          var go = function () {
            if (st.idx < EL_PUZ.length - 1) { st.idx++; st.seq = []; render(); }
            else { done(); }
          };
          q(out, '.mg-go').addEventListener('click', go); ctl.interact = go;
        } else {
          AF.Audio.play('hurt');
          S.damage(2, 'viagem errada');
          out.insertAdjacentHTML('beforeend', '<div class="quiz-fb bad"><b>Passageiros no lugar errado!</b> ' + predTxt + 'A meta era ' +
            (P.target === 1 ? '100% na Cidade Alta' : (P.target === 0 ? '100% na Cidade Baixa' : '50% em cada estação')) +
            '; sua cabine tinha ' + pct(p1) + ' de chance de subir. Mude as portas e tente de novo.</div>');
          ctl.interact = send;
        }
        reveal(out);
      }
    }
    function done() {
      body.innerHTML = '<div class="mg-end"><div class="quiz-end-title">ELEVADOR DE HADAMARD · CONCLUÍDO</div>' +
        say('iasmin', 'O Elevador conta a mesma história do teletransporte: <b>X</b> troca |0⟩ e |1⟩, <b>Z</b> mexe no sinal (a fase) e <b>H</b> faz as amplitudes interferirem. Só a fase certa leva cada passageiro ao andar certo — como a correção certa leva o estado da D-7 até Jacobina.') +
        '<ul class="mg-take"><li><b>X</b> (Troca): |0⟩ ↔ |1⟩.</li><li><b>H</b>: superposição; <b>H · H</b> = nada (interferência).</li><li><b>Z</b>: muda o sinal de |1⟩ — invisível sozinha, decisiva com H.</li><li><b>H · Z · H = X</b>.</li></ul>' +
        '<div class="btn-row"><button class="btn primary mg-close">Voltar à praça<span class="k"> [E]</span></button></div></div>';
      faces(body);
      var c = function () { g.m.close(); AF.HUD.refresh(); };
      q(body, '.mg-close').addEventListener('click', c); ctl.interact = c; ctl.key = null;
    }
    render();
    return g.m;
  }

  /* =====================================================================
   * 3) GINCANA DAS FITINHAS — o desafio de Bell (jogo CHSH)
   * ===================================================================== */
  var COMBOS = [['am', 'am'], ['am', 'vd'], ['vd', 'am'], ['vd', 'vd']];
  var FITA = { am: 'Amarela', vd: 'Verde' };
  var ANGS = [0, 22.5, 45, 67.5, 90, -22.5, -45];
  function fita(c) { return '<span class="fita ' + c + '">' + FITA[c] + '</span>'; }
  function wantSame(c) { return !(c[0] === 'vd' && c[1] === 'vd'); }
  function angTxt(a) { return (a < 0 ? '−' : '') + String(Math.abs(a)).replace('.', ',') + '°'; }

  function mercado() {
    var g = open('Gincana das Fitinhas · Mercado Modelo', 'mg-me');
    var body = g.body, ctl = g.ctl;
    var st = { phase: 1, plan: { z: { am: 'S', vd: 'S' }, j: { am: 'S', vd: 'S' } }, played: 0, best: 0,
      ang: { z: { am: 0, vd: 90 }, j: { am: 0, vd: 0 } }, qRuns: [], busy: false };

    function head(n) { return steps(['Combinado clássico', 'Fitinhas emaranhadas', 'Isso é telefone?'], n); }
    function rules() {
      return '<div class="mg-order"><b>Regras:</b> a cada rodada, Dona Zeza (Mercado Modelo, Salvador) e Jamal (Jacobina) recebem, cada um, uma fitinha sorteada: ' + fita('am') + ' ou ' + fita('vd') + '. ' +
        'Cada um responde <b>SIM</b> ou <b>NÃO</b>, <b>sem se comunicar</b>. Vencem se as respostas forem <b>iguais</b> — menos quando os <b>dois</b> recebem ' + fita('vd') + ': aí precisam ser <b>diferentes</b>.</div>';
    }

    /* ---------- Fase 1: combinado clássico ---------- */
    function phase1() {
      st.phase = 1;
      body.innerHTML = head(1) +
        say('zeza', 'O canal voltou e a gincana também, meu bem! Eu fico aqui no Mercado Modelo e Jamal lá em Jacobina. A gente pode combinar a estratégia <b>antes</b>, mas na hora do jogo, nada de telefone.') +
        rules() +
        '<div class="me-plan">' + ['z', 'j'].map(function (p) {
          return '<div class="me-col"><b>' + (p === 'z' ? 'Dona Zeza (Salvador)' : 'Jamal (Jacobina)') + '</b>' +
            ['am', 'vd'].map(function (c) {
              return '<div class="me-row">Se receber ' + fita(c) + ': <button class="btn btn-sm tg" data-p="' + p + '" data-c="' + c + '"></button></div>';
            }).join('') + '</div>';
        }).join('') + '</div>' +
        '<div class="scroll"><table class="tt me-tt"><thead><tr><th>Zeza</th><th>Jamal</th><th>Respostas</th><th>Precisa</th><th></th></tr></thead><tbody></tbody></table></div>' +
        '<div class="mg-btns"><button class="btn primary mg-play">Jogar 40 rodadas<span class="k"> [E]</span></button></div>' +
        '<div class="mg-out"></div>';
      faces(body);
      body.querySelectorAll('.tg').forEach(function (b) {
        b.addEventListener('click', function () {
          var p = b.getAttribute('data-p'), c = b.getAttribute('data-c');
          st.plan[p][c] = st.plan[p][c] === 'S' ? 'N' : 'S'; AF.Audio.play('select'); table1();
        });
      });
      q(body, '.mg-play').addEventListener('click', play1);
      ctl.interact = play1; ctl.digit = null;
      table1();
    }
    function table1() {
      body.querySelectorAll('.tg').forEach(function (b) {
        var v = st.plan[b.getAttribute('data-p')][b.getAttribute('data-c')];
        b.textContent = v === 'S' ? 'SIM' : 'NÃO'; b.classList.toggle('on', v === 'S');
      });
      var wins = 0;
      q(body, '.me-tt tbody').innerHTML = COMBOS.map(function (c) {
        var a = st.plan.z[c[0]], b = st.plan.j[c[1]], ok = wantSame(c) ? a === b : a !== b;
        if (ok) wins++;
        return '<tr><td>' + fita(c[0]) + '</td><td>' + fita(c[1]) + '</td><td>' + (a === 'S' ? 'SIM' : 'NÃO') + ' / ' + (b === 'S' ? 'SIM' : 'NÃO') + '</td><td>' + (wantSame(c) ? 'iguais' : 'diferentes') + '</td><td class="' + (ok ? 'ok' : 'mag') + '">' + (ok ? 'vence' : 'perde') + '</td></tr>';
      }).join('');
      st.planWins = wins;
    }
    function bar(rate, cls) {
      return '<div class="me-rate ' + (cls || '') + '"><div class="me-fill" style="width:' + (rate * 100) + '%"></div><div class="me-line" style="left:75%"><span>teto clássico 75%</span></div></div>';
    }
    function play1() {
      if (st.busy) return;
      st.busy = true;
      var out = q(body, '.mg-out'), n = 0, w = 0;
      out.innerHTML = '<div class="me-score">Rodada <b class="r">0</b>/40 · vitórias <b class="w">0</b></div>' + bar(0);
      var tick = function () {
        if (ctl.dead) return;
        if (n >= 40) { fin(); return; }
        var c = COMBOS[Math.floor(Math.random() * 4)];
        var a = st.plan.z[c[0]], b = st.plan.j[c[1]];
        if (wantSame(c) ? a === b : a !== b) w++;
        n++;
        q(out, '.r').textContent = n; q(out, '.w').textContent = w;
        q(out, '.me-fill').style.width = (w / n * 100) + '%';
        if (n % 8 === 0) AF.Audio.play('select');
        setTimeout(tick, 22);
      };
      tick();
      function fin() {
        st.busy = false; st.played++;
        st.best = Math.max(st.best, st.planWins / 4);
        if (!S.flag('miniMercado')) S.mg('mercado', { classicoMelhor: Math.round(st.best * 100), classicoJogadas: st.played });
        out.insertAdjacentHTML('beforeend', '<div class="quiz-fb ' + (st.planWins === 3 ? 'ok' : 'bad') + '">Venceram <b>' + w + ' de 40</b> (' + pct(w / 40) + '). Com esse combinado, a chance é ' + st.planWins + ' em 4 = <b>' + pct(st.planWins / 4) + '</b>.' +
          (st.planWins < 3 ? ' Dá para fazer melhor: tente combinar as respostas para vencer em 3 dos 4 casos.' : '') + '</div>' +
          '<div class="mg-btns"><button class="btn mg-why">Dá para passar de 75%?</button>' +
          (st.best >= 0.75 ? '<button class="btn primary mg-go">Usar as fitinhas emaranhadas<span class="k"> [E]</span></button>' : '') + '</div>');
        q(out, '.mg-why').addEventListener('click', function () {
          q(out, '.mg-why').disabled = true;
          out.insertAdjacentHTML('beforeend', '<div class="mg-note">Não com combinado clássico. Repare na tabela: os quatro casos "conversam" entre si. Para vencer os três casos de "iguais", as respostas de Zeza e Jamal precisam bater sempre — e aí o caso ' + fita('vd') + '/' + fita('vd') + ' perde. Qualquer combinado fixo erra pelo menos 1 dos 4 casos: no máximo <b>75%</b>. Sortear respostas na hora não ajuda (é só misturar combinados). Esse limite é uma <b>desigualdade de Bell</b>.</div>');
          S.unlock('epr_bell');
          reveal(out);
        });
        var go = q(out, '.mg-go');
        if (go) { go.addEventListener('click', phase2); ctl.interact = phase2; } else ctl.interact = play1;
        reveal(out);
      }
    }

    /* ---------- Fase 2: fitinhas emaranhadas ---------- */
    function phase2() {
      st.phase = 2;
      var opts = function (p, c) {
        return '<select class="me-sel" data-p="' + p + '" data-c="' + c + '">' + ANGS.map(function (a) {
          return '<option value="' + a + '"' + (a === st.ang[p][c] ? ' selected' : '') + '>' + angTxt(a) + '</option>';
        }).join('') + '</select>';
      };
      body.innerHTML = head(2) +
        say('jamal', 'Agora que o canal quântico voltou, antes de cada rodada a gente recebe um <b>par emaranhado</b> |Φ+⟩ — uma "fitinha" para mim, outra para Zeza. Cada um <b>mede</b> a sua num ângulo que depende da cor recebida. Ângulos iguais: respostas sempre iguais. Quanto mais diferentes, mais elas discordam: <b>P(iguais) = cos²(diferença)</b>.') +
        '<div class="me-plan">' + ['z', 'j'].map(function (p) {
          return '<div class="me-col"><b>' + (p === 'z' ? 'Dona Zeza mede em…' : 'Jamal mede em…') + '</b>' +
            ['am', 'vd'].map(function (c) { return '<div class="me-row">com ' + fita(c) + ': ' + opts(p, c) + '</div>'; }).join('') + '</div>';
        }).join('') + '</div>' +
        '<div class="scroll"><table class="tt me-tt"><thead><tr><th>Zeza</th><th>Jamal</th><th>Diferença</th><th>Precisa</th><th>Chance de vencer</th></tr></thead><tbody></tbody></table></div>' +
        '<div class="me-exp"></div>' +
        '<div class="mg-btns"><button class="btn primary mg-play">Jogar 100 rodadas<span class="k"> [E]</span></button><button class="btn mg-hint">Dica da Prof.ª Iasmin</button></div>' +
        '<div class="mg-out"></div>';
      faces(body);
      body.querySelectorAll('.me-sel').forEach(function (s) {
        s.addEventListener('change', function () { st.ang[s.getAttribute('data-p')][s.getAttribute('data-c')] = parseFloat(s.value); table2(); });
      });
      q(body, '.mg-hint').addEventListener('click', function () {
        st.hintUsed = true;
        q(body, '.mg-out').innerHTML = '<div class="mg-note">' + say('iasmin', 'Deixe as diferenças pequenas (22,5°) nos três casos de "iguais" e grande (67,5°) no caso Verde/Verde. Experimente: Zeza mede em <b>0°</b> (Amarela) e <b>45°</b> (Verde); Jamal mede "no meio": <b>22,5°</b> (Amarela) e <b>−22,5°</b> (Verde).') + '</div>';
        faces(body);
      });
      q(body, '.mg-play').addEventListener('click', play2);
      ctl.interact = play2;
      table2();
    }
    function winP(c) {
      var d = (st.ang.z[c[0]] - st.ang.j[c[1]]) * Math.PI / 180, same = Math.pow(Math.cos(d), 2);
      return wantSame(c) ? same : 1 - same;
    }
    function expected() { return COMBOS.reduce(function (s, c) { return s + winP(c); }, 0) / 4; }
    function table2() {
      q(body, '.me-tt tbody').innerHTML = COMBOS.map(function (c) {
        var d = Math.abs(st.ang.z[c[0]] - st.ang.j[c[1]]), w = winP(c);
        return '<tr><td>' + fita(c[0]) + ' ' + angTxt(st.ang.z[c[0]]) + '</td><td>' + fita(c[1]) + ' ' + angTxt(st.ang.j[c[1]]) + '</td><td>' + angTxt(d) + '</td><td>' + (wantSame(c) ? 'iguais' : 'diferentes') + '</td><td>' + fmt(w * 100, 1) + '%</td></tr>';
      }).join('');
      var e = expected();
      q(body, '.me-exp').innerHTML = 'Chance média de vencer: <b class="' + (e > 0.75 + 1e-6 ? 'ok' : '') + '">' + fmt(e * 100, 1) + '%</b>' + bar(e, 'thin');
    }
    function play2() {
      if (st.busy) return;
      st.busy = true;
      var out = q(body, '.mg-out'), n = 0, w = 0, rec = [];
      out.innerHTML = '<div class="me-score">Rodada <b class="r">0</b>/100 · vitórias <b class="w">0</b></div>' + bar(0);
      var tick = function () {
        if (ctl.dead) return;
        for (var k = 0; k < 4 && n < 100; k++) {
          var c = COMBOS[Math.floor(Math.random() * 4)];
          var d = (st.ang.z[c[0]] - st.ang.j[c[1]]) * Math.PI / 180;
          var a = Math.random() < 0.5 ? 'S' : 'N';                      /* resposta de Zeza: sempre 50/50 */
          var same = Math.random() < Math.pow(Math.cos(d), 2);         /* correlação do par |Φ+⟩ */
          var b = same ? a : (a === 'S' ? 'N' : 'S');
          if (wantSame(c) ? a === b : a !== b) w++;
          rec.push({ zc: c[0], jb: b });
          n++;
        }
        q(out, '.r').textContent = n; q(out, '.w').textContent = w;
        q(out, '.me-fill').style.width = (w / n * 100) + '%';
        AF.Audio.play('select');
        if (n >= 100) fin(); else setTimeout(tick, 40);
      };
      tick();
      function fin() {
        st.busy = false;
        st.qRuns = rec;
        var e = expected();
        st.qTries = (st.qTries || 0) + 1;
        if (!S.flag('miniMercado')) S.mg('mercado', { quanticoTentativas: st.qTries, quanticoChance: Math.round(e * 1000) / 10, dicaUsada: !!st.hintUsed });
        if (e >= 0.80) {
          AF.Audio.play('success');
          out.insertAdjacentHTML('beforeend', '<div class="quiz-fb ok"><b>Acima do teto clássico!</b> Venceram ' + w + ' de 100. Com esses ângulos, a chance é ' + fmt(e * 100, 1) + '% — mais do que <b>qualquer</b> combinado clássico consegue (75%). Os pares emaranhados criam correlações que nenhum "plano escrito de antemão" explica.</div>' +
            '<div class="mg-btns"><button class="btn primary mg-go">Mas isso é telefone?<span class="k"> [E]</span></button></div>');
          S.unlock('chsh'); S.unlock('emaranhamento');
          q(out, '.mg-go').addEventListener('click', phase3); ctl.interact = phase3;
        } else {
          out.insertAdjacentHTML('beforeend', '<div class="quiz-fb bad">Venceram ' + w + ' de 100 (' + fmt(e * 100, 1) + '% de chance). Ainda não passa com folga do teto clássico. Procure diferenças pequenas nos casos de "iguais" e uma diferença grande no caso ' + fita('vd') + '/' + fita('vd') + '.</div>');
          ctl.interact = play2;
        }
        reveal(out);
      }
    }

    /* ---------- Fase 3: sem mensagem (não-sinalização) ---------- */
    function phase3() {
      st.phase = 3;
      var r = st.qRuns, am = r.filter(function (x) { return x.zc === 'am'; }), vd = r.filter(function (x) { return x.zc === 'vd'; });
      var sim = function (arr) { return arr.length ? arr.filter(function (x) { return x.jb === 'S'; }).length / arr.length : 0.5; };
      body.innerHTML = head(3) +
        say('zeza', 'Ô, Jamal! Se as fitinhas combinam tanto, você não consegue adivinhar daí a cor que <b>eu</b> recebi?') +
        '<div class="mg-order">Nas 100 rodadas, as respostas de Jamal foram <b>SIM em ' + pct(sim(am)) + '</b> das vezes em que Zeza tinha ' + fita('am') + ' e <b>SIM em ' + pct(sim(vd)) + '</b> quando Zeza tinha ' + fita('vd') + '.</div>' +
        '<div class="mg-q"></div>';
      faces(body);
      ask(q(body, '.mg-q'), ctl, {
        track: ['mercado', 1],
        q: 'Jamal consegue descobrir a cor da fita de Zeza olhando só as próprias respostas?',
        options: [
          { t: 'Sim: a correlação é instantânea, então a informação também é.', why: 'A correlação existe, mas sozinhas as respostas de Jamal parecem cara ou coroa: 50% SIM, qualquer que seja a fita de Zeza.' },
          { t: 'Sim, se ele medir mais rápido do que ela.', why: 'A ordem das medições não muda nada: as respostas de cada lado continuam 50/50.' },
          { t: 'Não: sozinhas, as respostas dele são 50% SIM e 50% NÃO. A correlação só aparece quando os dois comparam as anotações por um canal clássico.', ok: true,
            why: 'Emaranhamento não é telefone. É exatamente por isso que, no teletransporte, Dandara precisa mandar os dois bits pelo canal clássico: sem eles, Jamal não sabe qual correção aplicar.' }
        ]
      }, finish);
    }
    function finish() {
      var first = !S.flag('miniMercado');
      if (first) {
        S.setFlag('miniMercado'); S.addCredits(8);
        ['emaranhamento', 'epr_bell', 'chsh'].forEach(function (k) { S.unlock(k); });
        S.addJournal('Gincana das Fitinhas', 'No Mercado Modelo, Dona Zeza e Jamal jogaram o desafio de Bell. Com combinado clássico, o máximo é vencer 75% das rodadas; com pares emaranhados medidos nos ângulos certos (0°/45° e 22,5°/−22,5°), chega a ~85%. Mesmo assim, nenhuma mensagem viaja: as respostas de cada um, sozinhas, são 50/50. A correlação só aparece comparando as anotações pelo canal clássico — como no teletransporte.');
      }
      body.innerHTML = '<div class="mg-end"><div class="quiz-end-title">GINCANA DAS FITINHAS · CONCLUÍDA</div>' +
        say('zeza', 'Ganhamos mais do que qualquer combinado permitia — e sem telefone! Leve uma fitinha de lembrança, meu bem.') +
        '<ul class="mg-take"><li><b>Combinado clássico:</b> no máximo 75% (desigualdade de Bell).</li><li><b>Pares emaranhados:</b> cerca de 85% — correlação mais forte que qualquer plano escrito de antemão.</li>' +
        '<li><b>Sem mensagem:</b> cada lado, sozinho, vê respostas 50/50. Só comparando pelo canal clássico a correlação aparece.</li>' +
        '<li>Testes assim deram o <b>Nobel de Física de 2022</b> a Aspect, Clauser e Zeilinger.</li></ul>' +
        (first ? '<p class="gold">+8 Créditos Quânticos · conceitos no Glossário</p>' : '<p class="dim">Partida livre: sem novas recompensas.</p>') +
        '<div class="btn-row"><button class="btn primary mg-close">Voltar à praça<span class="k"> [E]</span></button></div></div>';
      faces(body);
      var c = function () { g.m.close(); AF.HUD.refresh(); };
      q(body, '.mg-close').addEventListener('click', c); ctl.interact = c;
    }

    phase1();
    return g.m;
  }

  /* =====================================================================
   * 4) RECEPÇÃO EM JACOBINA — o teletransporte pelo lado de Jamal
   *    Antes dos 2 bits, o qubit dele é uma mistura das 4 possibilidades
   *    (seta no centro da esfera). Medir cedo estraga a cápsula. Com os
   *    bits: X se b₂ = 1, Z se b₁ = 1.
   * ===================================================================== */
  var JAC_Q = AF.JACOBINA_Q = [
    { track: ['jacobina', 1], q: 'Por que Jamal não consegue recuperar a cápsula antes de os 2 bits chegarem pela fibra?', options: [
      { t: 'Porque o emaranhamento leva 1,5 ms para atravessar a fibra.', why: 'O par emaranhado foi distribuído ANTES. O que atravessa a fibra no protocolo são só os 2 bits clássicos.' },
      { t: 'Sem os bits, o qubit dele é uma mistura das 4 possibilidades: ele não sabe qual correção aplicar. Por isso o teletransporte nunca é mais rápido que a luz.', ok: true,
        why: 'Do lado de Jacobina, antes dos bits, a seta média fica no centro da esfera: nenhuma informação sobre a cápsula. Os bits viajam na velocidade da luz no vidro — e é esse o limite.' },
      { t: 'Porque ele precisa medir o qubit primeiro para ver o estado.', why: 'Medir agora daria só 0 ou 1 e destruiria a superposição: a cápsula se perderia.' }
    ] },
    { track: ['jacobina', 2], q: 'Depois de corrigir, Jamal pode medir o qubit para "ler" os números α e β da cápsula?', options: [
      { t: 'Pode: uma medição revela α e β.', why: 'Uma medição dá só 0 ou 1, com probabilidades |α|² e |β|². Os números em si não aparecem.' },
      { t: 'Pode, se ele medir duas vezes o mesmo qubit.', why: 'Depois da primeira medição o qubit já colapsou: a segunda só repete o resultado.' },
      { t: 'Não: o estado chega inteiro, mas uma medição só dá 0 ou 1. O estado serve para ser usado (na computação, na rede), não lido por inteiro.', ok: true,
        why: 'Por isso o teletransporte é tão valioso: ele entrega um estado que ninguém conseguiria copiar nem ler e reescrever.' }
    ] }
  ];
  function bX(v) { return { x: v.x, y: -v.y, z: -v.z }; }
  function bZ(v) { return { x: -v.x, y: -v.y, z: v.z }; }
  function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
  function randPsi() {
    var th = (25 + Math.random() * 130) * Math.PI / 180, ph = (15 + Math.random() * 330) * Math.PI / 180;
    if (Math.abs(Math.cos(ph)) > 0.96 || Math.abs(Math.sin(ph)) > 0.96) ph += 0.5;
    return { x: Math.sin(th) * Math.cos(ph), y: Math.sin(th) * Math.sin(ph), z: Math.cos(th) };
  }
  function drawFiber(cv, prog, bits, t) {
    var x = cv.getContext('2d'), W = cv.width, H = cv.height;
    x.clearRect(0, 0, W, H);
    x.fillStyle = '#0a081c'; x.fillRect(0, 0, W, H);
    var y0 = H * 0.58, xa = 70, xb = W - 70;
    x.strokeStyle = '#0a2238'; x.lineWidth = 6; x.beginPath(); x.moveTo(xa, y0); x.bezierCurveTo(W * 0.35, y0 - 26, W * 0.65, y0 + 26, xb, y0); x.stroke();
    x.strokeStyle = 'rgba(0,229,255,0.55)'; x.lineWidth = 2; x.stroke();
    x.font = '20px VT323, monospace'; x.textAlign = 'center';
    x.fillStyle = '#ff3fa4'; x.fillRect(xa - 26, y0 - 22, 14, 30); x.fillStyle = '#ecebf6'; x.fillText('SALVADOR', xa - 20, y0 + 30);
    x.fillStyle = '#7af9ff'; x.beginPath(); x.arc(xb + 18, y0, 14, Math.PI, 0); x.fill(); x.fillStyle = '#ecebf6'; x.fillText('JACOBINA', xb + 18, y0 + 30);
    x.fillStyle = '#8a84b8'; x.fillText('fibra óptica · cerca de 300 km · ≈ 1,5 ms (em câmera lenta)', W / 2, 18);
    if (prog >= 0) {
      var p = Math.min(1, prog), tt = p, u = 1 - tt;
      var px = u * u * u * xa + 3 * u * u * tt * W * 0.35 + 3 * u * tt * tt * W * 0.65 + tt * tt * tt * xb;
      var py = u * u * u * y0 + 3 * u * u * tt * (y0 - 26) + 3 * u * tt * tt * (y0 + 26) + tt * tt * tt * y0;
      x.shadowColor = '#ffc940'; x.shadowBlur = 14; x.fillStyle = '#ffc940';
      x.fillRect(px - 16, py - 12, 32, 22); x.shadowBlur = 0;
      x.fillStyle = '#1a1000'; x.font = '22px VT323, monospace'; x.fillText(p >= 1 ? bits : '??', px, py + 6);
    }
  }

  function jacobina() {
    var g = open('Recepção em Jacobina · Estação de Jamal', 'mg-jac', function () { if (g.raf) cancelAnimationFrame(g.raf); });
    var body = g.body, ctl = g.ctl;
    var first = !S.flag('jacobinaDone');
    var ROUNDS = 5;
    var st = { round: 0, ok: 0, early: 0, phase: 'wait', prog: 0, psi: null, cur: null, bits: '', applied: [], delivered: false, ruleShown: false };
    var cvF = null, cvB = null, t0 = 0;

    function loop(t) {
      if (ctl.dead) return;
      if (cvF && document.body.contains(cvF)) {
        if (st.phase === 'wait') {
          st.prog = (t - t0) / 2600;
          if (st.prog >= 1) arrive();
        }
        drawFiber(cvF, st.phase === 'early' ? -1 : st.prog, st.bits, t);
      }
      if (cvB && document.body.contains(cvB)) drawQubit();
      g.raf = requestAnimationFrame(loop);
    }
    function drawQubit() {
      if (st.phase === 'wait') {
        var p = st.psi;
        AF.Bloch.draw(cvB, { mixed: true, color: '#e8e6ff', ghosts: [p, bX(p), bZ(p), bX(bZ(p))], ghostColor: 'rgba(200,196,255,0.35)', label: 'sem os bits' });
      } else if (st.phase === 'early') {
        AF.Bloch.draw(cvB, { vec: st.cur, color: '#ff4d6a', glow: true, label: 'medido cedo' });
      } else {
        AF.Bloch.draw(cvB, { vec: st.cur, color: st.delivered ? '#3dff9a' : '#ff3fa4', glow: true,
          ghost: st.delivered ? st.psi : null, ghostColor: 'rgba(61,255,154,0.9)', label: st.delivered ? 'verde = original' : 'com os bits' });
      }
    }
    g.raf = requestAnimationFrame(loop);

    function round() {
      st.phase = 'wait'; st.prog = 0; st.delivered = false; st.applied = [];
      st.psi = randPsi();
      var b1 = Math.random() < 0.5 ? 1 : 0, b2 = Math.random() < 0.5 ? 1 : 0;
      st.bits = '' + b1 + b2; st.b1 = b1; st.b2 = b2;
      var phi = st.psi; if (b1) phi = bZ(phi); if (b2) phi = bX(phi);         /* φ = X^b₂ Z^b₁ ψ */
      st.cur = phi;
      body.innerHTML = steps(['Recepção (' + ROUNDS + ' cápsulas)', 'Por que esperar?'], 1) +
        '<div class="mg-grid jac">' +
          '<div class="mg-scene jac"><canvas class="fib-cv" width="520" height="110"></canvas><canvas class="blo-cv" width="260" height="260"></canvas></div>' +
          '<div class="mg-side">' +
            (st.round === 0 ? say('jamal', 'A D-8 saiu de Salvador! Dandara já mediu; os 2 bits estão a caminho pela fibra. Repare no meu qubit: sem os bits, ele pode ser qualquer uma das 4 setas fantasmas — na média, só um ponto no centro. <b>Espere os bits</b> e aplique a correção.')
              : say('jamal', 'Próxima cápsula a caminho. Mesma regra: espere os bits, depois corrija.')) +
            '<div class="mg-score">Cápsula ' + (st.round + 1) + ' de ' + ROUNDS + ' · entregues: ' + st.ok + '</div>' +
            '<div class="mg-order jac-status">Aguardando os bits clássicos…</div>' +
            '<div class="gates jac-gates"><button class="btn gate" data-g="X" disabled><span class="num">X</span>Troca</button>' +
              '<button class="btn gate" data-g="Z" disabled><span class="num">Z</span>Fase</button></div>' +
            '<div class="applied jac-applied"></div>' +
            '<div class="mg-btns"><button class="btn primary mg-deliver" disabled>Entregar a cápsula<span class="k"> [E]</span></button>' +
              '<button class="btn mg-early">Medir agora (sem esperar)</button><button class="btn mg-rule">Ver regra</button></div>' +
            '<div class="mg-out"></div>' +
          '</div></div>';
      faces(body);
      cvF = q(body, '.fib-cv'); cvB = q(body, '.blo-cv');
      t0 = performance.now();
      body.querySelectorAll('.jac-gates .gate').forEach(function (b) { b.addEventListener('click', function () { gate(b.getAttribute('data-g')); }); });
      q(body, '.mg-deliver').addEventListener('click', deliver);
      q(body, '.mg-early').addEventListener('click', early);
      q(body, '.mg-rule').addEventListener('click', function () {
        st.ruleShown = true;
        q(body, '.mg-out').innerHTML = '<div class="mg-note">Regra do Roteiro: bit da <b>direita</b> (b₂) = 1 → <b>X</b>; bit da <b>esquerda</b> (b₁) = 1 → <b>Z</b>. Bits 00 → nada.</div>';
      });
      ctl.interact = function () { if (st.phase === 'bits') deliver(); };
      ctl.key = function (e) {
        if (e.code === 'KeyX') { gate('X'); return true; }
        if (e.code === 'KeyZ') { gate('Z'); return true; }
        return false;
      };
      ctl.digit = null;
    }
    function arrive() {
      st.phase = 'bits'; st.prog = 1;
      AF.Audio.play('note');
      q(body, '.jac-status').innerHTML = 'Bits recebidos: <b class="gold jac-bits">b₁b₂ = ' + st.bits + '</b>. Agora Jamal sabe qual das 4 setas tem. Aplique a correção e entregue.';
      body.querySelectorAll('.jac-gates .gate').forEach(function (b) { b.disabled = false; });
      q(body, '.mg-deliver').disabled = false; q(body, '.mg-early').disabled = true;
      reveal(q(body, '.jac-gates'));
    }
    function gate(gt) {
      if (st.phase !== 'bits') return;
      st.cur = gt === 'X' ? bX(st.cur) : bZ(st.cur);
      st.applied.push(gt); AF.Audio.play('select');
      q(body, '.jac-applied').textContent = 'Correções aplicadas: ' + st.applied.join(' → ');
    }
    function early() {
      if (st.phase !== 'wait') return;
      st.phase = 'early'; st.early++;
      var p0 = (1 + st.cur.z) / 2, r = Math.random() < p0 ? 0 : 1;
      st.cur = { x: 0, y: 0, z: r ? -1 : 1 };
      var F = (1 + dot(st.cur, st.psi)) / 2;
      AF.Audio.play('hurt'); S.damage(3, 'medição antes dos bits');
      q(body, '.jac-status').innerHTML = 'Jamal mediu antes dos bits e obteve <b>' + r + '</b>. A superposição colapsou: a cápsula chegou com fidelidade de só <b>' + pct(F) + '</b>.';
      q(body, '.mg-out').innerHTML = '<div class="quiz-fb bad"><b>Cápsula corrompida!</b> Sem os bits, o qubit de Jamal era uma mistura das 4 possibilidades; medir agora dá só 0 ou 1 e apaga o estado. Ninguém em Jacobina consegue "adiantar" o teletransporte.</div>' +
        '<div class="mg-btns"><button class="btn primary mg-go">' + (st.round + 1 < ROUNDS ? 'Próxima cápsula' : 'Continuar') + '<span class="k"> [E]</span></button></div>';
      body.querySelectorAll('.mg-btns .btn:not(.mg-go)').forEach(function (b) { b.disabled = true; });
      var go = function () { next(); };
      q(body, '.mg-go').addEventListener('click', go); ctl.interact = go;
      reveal(q(body, '.mg-out'));
    }
    function deliver() {
      if (st.phase !== 'bits') return;
      var F = (1 + dot(st.cur, st.psi)) / 2;
      st.phase = 'done'; st.delivered = true;
      body.querySelectorAll('.jac-gates .gate, .mg-deliver, .mg-early').forEach(function (b) { b.disabled = true; });
      var ok = F > 0.999;
      var need = (st.b2 ? 'X' : '') + (st.b1 ? (st.b2 ? ' e Z' : 'Z') : '') || 'nenhuma';
      if (ok) { st.ok++; AF.Audio.play('success'); }
      else { AF.Audio.play('hurt'); S.damage(3, 'correção errada'); }
      q(body, '.mg-out').innerHTML = '<div class="quiz-fb ' + (ok ? 'ok' : 'bad') + '"><b>' + (ok ? 'Cápsula entregue: fidelidade 100%!' : 'Fidelidade ' + pct(F) + '.') + '</b> ' +
        'Com b₁b₂ = ' + st.bits + ', a correção certa é <b>' + need + '</b>. ' + (ok ? 'A seta verde (o original de Salvador) coincide com a de Jamal.' : 'Compare a seta de Jamal com a verde, o estado original.') + '</div>' +
        '<div class="mg-btns"><button class="btn primary mg-go">' + (st.round + 1 < ROUNDS ? 'Próxima cápsula' : 'Continuar') + '<span class="k"> [E]</span></button></div>';
      var go = function () { next(); };
      q(body, '.mg-go').addEventListener('click', go); ctl.interact = go;
      reveal(q(body, '.mg-out'));
    }
    function next() {
      st.round++;
      if (st.round < ROUNDS) { round(); return; }
      cvF = cvB = null;
      if (first) S.mg('jacobina', { rodadas: ROUNDS, certas: st.ok, cedo: st.early, regra: st.ruleShown });
      body.innerHTML = steps(['Recepção (' + ROUNDS + ' cápsulas)', 'Por que esperar?'], 2) + '<div class="mg-q"></div>';
      ask(q(body, '.mg-q'), ctl, JAC_Q[0], function () {
        body.innerHTML = steps(['Recepção (' + ROUNDS + ' cápsulas)', 'Por que esperar?'], 2) + '<div class="mg-q"></div>';
        ask(q(body, '.mg-q'), ctl, JAC_Q[1], finish);
      });
      ctl.key = null;
    }
    function finish() {
      if (first) {
        S.setFlag('jacobinaDone'); S.addCredits(8);
        ['canal_classico', 'protocolo', 'nao_clonagem', 'medicao'].forEach(function (k) { S.unlock(k); });
        S.addJournal('Recepção em Jacobina', 'Na Estação Receptora, operei a chegada das cápsulas pelo lado de Jamal. Antes dos 2 bits, o qubit dele é uma mistura das 4 possibilidades — a seta média fica no centro da esfera, sem nenhuma informação. Medir cedo estraga a cápsula. Com os bits (cerca de 1,5 ms pela fibra), a correção X/Z devolve o estado exato. Por isso o teletransporte nunca é mais rápido que a luz.');
      }
      body.innerHTML = '<div class="mg-end"><div class="quiz-end-title">RECEPÇÃO EM JACOBINA · CONCLUÍDA</div>' +
        say('jamal', 'Entregamos ' + st.ok + ' de ' + ROUNDS + ' cápsulas' + (st.early ? ' (e você viu o que acontece quando se mede cedo)' : '') + '. Agora você conhece os dois lados do canal: Dandara mede e manda bits; eu espero, corrijo e recebo.') +
        '<ul class="mg-take"><li><b>Antes dos bits:</b> o qubit de Jamal é uma mistura das 4 possibilidades — nenhuma informação.</li>' +
        '<li><b>Medir cedo</b> dá só 0 ou 1 e destrói a cápsula.</li><li><b>Com os bits:</b> b₂ = 1 → X; b₁ = 1 → Z.</li>' +
        '<li>Os bits viajam pela fibra (≈ 1,5 ms em 300 km): <b>nada vai mais rápido que a luz</b>.</li></ul>' +
        (first ? '<p class="gold">+8 Créditos Quânticos · conceitos no Glossário</p>' : '<p class="dim">Partida livre: sem novas recompensas.</p>') +
        '<div class="btn-row"><button class="btn primary mg-close">Voltar à estação<span class="k"> [E]</span></button></div></div>';
      faces(body);
      var c = function () { g.m.close(); AF.HUD.refresh(); };
      q(body, '.mg-close').addEventListener('click', c); ctl.interact = c;
    }
    round();
    return g.m;
  }

  AF.Mini = { acaraje: acaraje, elevador: elevador, mercado: mercado, jacobina: jacobina };
})(window.AF);
