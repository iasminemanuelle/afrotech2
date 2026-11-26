/* =========================================================================
 * ui/quiz.js — motor genérico de perguntas (quiz, decifrar o código,
 * reconstrução do circuito, relatório) + desenho do circuito de 3 qubits
 * Erro = ruído quântico + explicação; pode tentar de novo.
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------- Circuito de teletransporte desenhado por etapas ---------- */
  AF.CircuitArt = {
    draw: function (cv, stage, fresh) {
      var ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
      var y0 = 50, y1 = 110, y2 = 170;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0920'; ctx.fillRect(0, 0, W, H);
      ctx.textBaseline = 'middle';
      function lbl(t, x, y, c, sz, al) { ctx.fillStyle = c; ctx.font = (sz || 24) + 'px VT323, monospace'; ctx.textAlign = al || 'left'; ctx.fillText(t, x, y); ctx.textAlign = 'left'; }
      function glow(x, y, w, h, on) { if (on) { ctx.fillStyle = 'rgba(255,201,64,0.16)'; ctx.fillRect(x, y, w, h); } }
      function box(x, y, t, c, w) {
        w = w || 44; ctx.fillStyle = '#161438'; ctx.strokeStyle = c; ctx.lineWidth = 2;
        ctx.fillRect(x - w / 2, y - 16, w, 32); ctx.strokeRect(x - w / 2, y - 16, w, 32); lbl(t, x, y + 1, c, 26, 'center');
      }
      function wire(y, x1, x2, col, dbl) {
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
        if (dbl) { ctx.moveTo(x1, y - 2); ctx.lineTo(x2, y - 2); ctx.moveTo(x1, y + 2); ctx.lineTo(x2, y + 2); }
        else { ctx.moveTo(x1, y); ctx.lineTo(x2, y); }
        ctx.stroke();
      }
      function vwire(x, ya, yb, col, dbl) {
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
        if (dbl) { ctx.moveTo(x - 2, ya); ctx.lineTo(x - 2, yb); ctx.moveTo(x + 2, ya); ctx.lineTo(x + 2, yb); }
        else { ctx.moveTo(x, ya); ctx.lineTo(x, yb); }
        ctx.stroke();
      }
      function cnot(x, yc, yt) {
        vwire(x, Math.min(yc, yt), Math.max(yc, yt) + (yt > yc ? 14 : -14), '#e8e6ff');
        ctx.fillStyle = '#e8e6ff'; ctx.beginPath(); ctx.arc(x, yc, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e8e6ff'; ctx.beginPath(); ctx.arc(x, yt, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 14, yt); ctx.lineTo(x + 14, yt); ctx.moveTo(x, yt - 14); ctx.lineTo(x, yt + 14); ctx.stroke();
      }
      function meter(x, y) {
        ctx.fillStyle = '#161438'; ctx.strokeStyle = '#e8e6ff'; ctx.lineWidth = 2;
        ctx.fillRect(x - 22, y - 16, 44, 32); ctx.strokeRect(x - 22, y - 16, 44, 32);
        ctx.beginPath(); ctx.arc(x, y + 9, 13, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + 9); ctx.lineTo(x + 9, y - 8); ctx.stroke();
      }
      if (stage < 1) { lbl('Responda para montar o circuito…', W / 2, H / 2, '#8a84c0', 28, 'center'); return; }
      lbl('q0 |ψ⟩', 14, y0, '#00e5ff'); lbl('q1', 14, y1, '#ff3fa4'); lbl('q2', 14, y2, '#3dff9a');
      lbl('SALVADOR · Dandara', 150, 16, '#8a84c0', 20); lbl('JACOBINA · Jamal', 700, 16, '#8a84c0', 20);
      var endQ = stage >= 6 ? 560 : W - 30;
      wire(y0, 100, endQ, '#3a4488'); wire(y1, 100, endQ, '#3a4488'); wire(y2, 100, W - 30, '#3a4488');
      ctx.setLineDash([4, 6]); ctx.strokeStyle = '#5a5498'; ctx.beginPath(); ctx.moveTo(640, 28); ctx.lineTo(640, H - 8); ctx.stroke(); ctx.setLineDash([]);
      if (stage >= 2) { glow(140, y1 - 24, 60, 48, fresh === 2); box(170, y1, 'H', '#ffc940'); }
      if (stage >= 3) {
        glow(222, y1 - 24, 60, y2 - y1 + 48, fresh === 3); cnot(252, y1, y2);
        lbl('|β₀₀⟩', 252, y2 + 30, '#ff3fa4', 22, 'center');
      }
      if (stage >= 4) { glow(330, y0 - 24, 60, y1 - y0 + 48, fresh === 4); cnot(360, y0, y1); }
      if (stage >= 5) { glow(410, y0 - 24, 60, 48, fresh === 5); box(440, y0, 'H', '#ffc940'); }
      if (stage >= 6) { glow(500, y0 - 24, 64, y1 - y0 + 48, fresh === 6); meter(530, y0); meter(530, y1); }
      if (stage >= 7) {
        var cc = '#ffc940';
        wire(y0, 552, 820, cc, true); vwire(820, y0, y2 - 16, cc, true);
        wire(y1, 552, 720, cc, true); vwire(720, y1, y2 - 16, cc, true);
        lbl('b₁', 575, y0 - 16, cc, 22); lbl('b₂', 575, y1 - 16, cc, 22);
        glow(552, y0 - 20, 280, y1 - y0 + 40, fresh === 7);
      }
      if (stage >= 8) {
        glow(680, y2 - 24, 180, 48, fresh === 8);
        box(720, y2, 'X^b₂', '#3dff9a', 70); box(820, y2, 'Z^b₁', '#3dff9a', 70);
        lbl('|ψ⟩ ✔', 900, y2, '#3dff9a', 30);
      }
    }
  };

  var Q = AF.Quiz = {
    /* cfg: { title, portrait (spec id) | portraitArt, questions, damage, hints, circuit, cls, onComplete(box, errors, m) } */
    run: function (cfg) {
      var st = { idx: 0, errors: 0, errorsHere: 0, hints: cfg.hints || 0, answered: false, opts: null, wrong: {}, hidden: {}, stage: 0, fresh: 0 };
      var box = AF.el('div', 'quiz' + (cfg.circuit ? ' quiz-circuit' : ''));
      var m = AF.UI.modal({
        title: cfg.title, body: box, cls: cfg.cls || 'modal-md',
        onKey: function (e, a) {
          var n = parseInt(e.key, 10);
          if (!st.answered && st.idx < cfg.questions.length && n >= 1 && n <= 4) { pick(n - 1); return true; }
          if (st.answered && a === 'interact') { next(); return true; }
          if (e.code === 'KeyH' && !st.answered) { hint(); return true; }
          return false;
        }
      });

      function portrait() {
        if (cfg.portraitArt) return AF.Art.portrait(cfg.portraitArt);
        return AF.Chars.portrait(AF.SPECS[cfg.portrait || 'iasmin']);
      }

      function render(feedback) {
        var q = cfg.questions[st.idx];
        if (!st.opts) {
          var list = q.options.map(function (o, i) { return Object.assign({ i: i }, o); });
          st.opts = cfg.noShuffle ? list : shuffle(list);
        }
        var html = '';
        if (cfg.circuit) html += '<div class="circ-wrap"><canvas class="quiz-circ" width="980" height="215"></canvas></div>';
        html += '<div class="quiz-top"><canvas class="quiz-portrait" width="16" height="16"></canvas><div class="quiz-q"><div class="quiz-prog">' +
          (cfg.label || 'Pergunta') + ' ' + (st.idx + 1) + ' de ' + cfg.questions.length +
          ' <span class="dots">' + cfg.questions.map(function (_, i) { return '<i class="' + (i < st.idx ? 'done' : (i === st.idx ? 'cur' : '')) + '"></i>'; }).join('') + '</span></div>' +
          '<div class="quiz-text">' + q.q + '</div></div></div><div class="quiz-opts">';
        st.opts.forEach(function (o, k) {
          var cls = 'btn quiz-opt';
          if (st.wrong[k]) cls += ' wrong';
          if (st.hidden[k]) cls += ' hidden-opt';
          if (st.answered && o.ok && st.picked === k) cls += ' right';
          html += '<button class="' + cls + '" data-k="' + k + '"' + (st.answered || st.wrong[k] || st.hidden[k] ? ' disabled' : '') + '><span class="num">' + 'ABCD'[k] + '</span> ' + o.t + '</button>';
        });
        html += '</div><div class="quiz-foot">';
        if (feedback) html += feedback;
        else if (cfg.hints !== undefined) html += '<div class="quiz-tools"><button class="btn btn-sm quiz-hint"' + (st.hints > 0 ? '' : ' disabled') + '><span class="k">[H] </span>Dica de Inteligência · eliminar uma alternativa (' + st.hints + ')</button></div>';
        html += '</div>';
        box.innerHTML = html;
        var pc = box.querySelector('.quiz-portrait').getContext('2d'); pc.imageSmoothingEnabled = false; pc.drawImage(portrait(), 0, 0);
        if (cfg.circuit) AF.CircuitArt.draw(box.querySelector('.quiz-circ'), st.stage, st.fresh);
        box.querySelectorAll('.quiz-opt').forEach(function (b) { b.addEventListener('click', function () { pick(+b.getAttribute('data-k')); }); });
        var hb = box.querySelector('.quiz-hint'); if (hb) hb.addEventListener('click', hint);
        var nb = box.querySelector('.quiz-next'); if (nb) nb.addEventListener('click', next);
      }

      function hint() {
        if (st.hints <= 0 || st.answered) return;
        var cand = [];
        st.opts.forEach(function (o, k) { if (!o.ok && !st.wrong[k] && !st.hidden[k]) cand.push(k); });
        if (cand.length <= 1) { AF.Toast.show('Não dá para eliminar mais alternativas', 'dim'); return; }
        st.hidden[cand[Math.floor(Math.random() * cand.length)]] = true;
        st.hints--;
        AF.Audio.play('select');
        render();
      }

      function pick(k) {
        if (st.answered || st.wrong[k] || st.hidden[k]) return;
        var o = st.opts[k], q = cfg.questions[st.idx];
        if (o.ok) {
          st.answered = true; st.picked = k;
          if (cfg.track) S.record(cfg.track, st.idx + 1, st.errorsHere + 1, cfg.trackPick ? o.t : undefined);
          AF.Audio.play('success');
          (q.unlock || []).forEach(function (g) { S.unlock(g); });
          if (q.stage) { st.stage = q.stage; st.fresh = q.stage; }
          if (cfg.onAnswer) cfg.onAnswer(q, o);
          render('<div class="quiz-fb ok"><b>' + (cfg.okLabel || 'Correto!') + '</b> ' + o.why + '</div><button class="btn primary quiz-next">' +
            (st.idx < cfg.questions.length - 1 ? 'Próxima<span class="k"> [E]</span>' : 'Concluir<span class="k"> [E]</span>') + '</button>');
        } else {
          st.wrong[k] = true; st.errors++; st.errorsHere++;
          if (cfg.countErrors !== false) S.d.stats.quizErrors++;
          if (cfg.damage) S.damage(cfg.damage, cfg.damageReason || 'resposta conceitual');
          if (m.closed) return;
          render('<div class="quiz-fb bad"><b>' + (cfg.damage ? 'Ruído quântico!' : 'Repense…') + '</b> ' + o.why + ' <i>Tente outra alternativa.</i></div>');
        }
      }

      function next() {
        if (!st.answered) return;
        if (st.idx < cfg.questions.length - 1) {
          st.idx++; st.answered = false; st.opts = null; st.wrong = {}; st.hidden = {}; st.fresh = 0; st.errorsHere = 0;
          render();
          return;
        }
        st.answered = false; st.idx = cfg.questions.length;
        cfg.onComplete(box, st.errors, m);
      }

      if (cfg.intro) {
        box.innerHTML = '<div class="quiz-intro">' + cfg.intro + '</div><div class="btn-row"><button class="btn primary quiz-start">Começar<span class="k"> [E]</span></button></div>';
        st.answered = true;
        var start = function () { st._introNext = false; st.answered = false; render(); };
        box.querySelector('.quiz-start').addEventListener('click', start);
        st._introNext = true;
        var origNext = next;
        next = function () { if (st._introNext) { st._introNext = false; start(); return; } origNext(); };
      } else render();
      return m;
    },

    /* Quiz da Prof.ª Iasmin (Organização do Conhecimento) */
    open: function (practice) {
      Q.run({
        title: 'LABORATÓRIO DE TEORIA QUÂNTICA · Quiz da Prof.ª Iasmin' + (practice ? ' (revisão)' : ''),
        portrait: 'iasmin', questions: AF.QUIZ, damage: 5, track: practice ? null : 'quiz',
        hints: S.level('inteligencia') + (S.cls.quizHints || 0),
        intro: practice ? null : '<p><i>A Prof.ª Iasmin ajusta os óculos de realidade aumentada e projeta hologramas pulsantes à frente de vocês.</i></p>' +
          '<p>"Antes de tocarem no console da Afrotech e iniciarem a Operação Teletransporte, preciso ter certeza de que vocês não são apenas técnicos, mas cientistas que entendem a alma desta máquina. Respondam, engenheiros!"</p>' +
          '<p class="dim">Errou? Vira ruído quântico (−5 Estabilidade) e você lê o porquê. Inteligência dá dicas<span class="k"> (tecla H)</span>.</p>',
        onComplete: function (box, errors, m) {
          var first = !S.flag('quizDone') && !practice;
          var msg = errors === 0 ? 'Nenhum ruído!' : 'Você corrigiu ' + errors + ' ruído(s) pelo caminho — é assim que se aprende.';
          box.innerHTML = '<div class="quiz-end"><div class="quiz-end-title">QUIZ CONCLUÍDO</div><p>' + msg + '</p>' +
            (first ? '<p class="gold">+10 Créditos Quânticos · Console do Simulador liberado.</p>' : '') +
            '<p>"Exato. A informação quântica é rica, mas chega embaralhada. Os bits clássicos são o mapa que Jamal usa para colocar a seta na posição correta. Agora, assumam seus postos." — Prof.ª Iasmin</p>' +
            '<p class="dim">O que você faz agora?</p>' +
            '<div class="role-grid">' +
              '<button class="btn role" data-r="sistemas">Engenheiro(a) de Sistemas<br><small>abro o simulador e observo as estações de Dandara e Jamal</small></button>' +
              '<button class="btn role" data-r="hardware">Especialista em Hardware<br><small>testo as Portas X e Z e vejo como a seta se move</small></button>' +
              '<button class="btn role" data-r="dados">Analista de Dados<br><small>preparo a tabela para anotar as rodadas</small></button>' +
            '</div><div class="btn-row"><button class="btn quiz-close2">Fechar</button></div></div>';
          if (first) {
            S.setFlag('quizDone'); S.addCredits(10);
            S.addJournal('Quiz da Prof.ª Iasmin', 'Concluí o quiz (' + errors + ' erro(s)): superposição, medição e colapso, emaranhamento sem mensagem instantânea, o papel dos 2 bits clássicos e a não-clonagem.',
              'Crônica: a Prof.ª Iasmin sorri quando alguém erra — diz que é o momento em que o cérebro mais aprende.');
            AF.Lousa.roteiro();
          }
          box.querySelectorAll('.role').forEach(function (b) {
            b.addEventListener('click', function () {
              S.d.role = b.getAttribute('data-r');
              m.close(true); AF.Sim.open('treino');
            });
          });
          box.querySelector('.quiz-close2').addEventListener('click', function () { m.close(); });
        }
      });
    },

    /* Decifrando o Código (fim da Organização do Conhecimento) */
    codigo: function () {
      Q.run({
        title: 'DECIFRANDO O CÓDIGO · Desafio Final do Roteiro', portrait: 'iasmin', questions: AF.QUIZ_CODIGO, damage: 3, track: 'codigo',
        intro: '<p>"Vocês preencheram a tabela da verdade. Agora quero a REGRA, não só a lista. Olhem para os seus registros e me digam: que padrão vocês encontraram?" — Prof.ª Iasmin</p>',
        onComplete: function (box, errors, m) {
          if (!S.flag('codeDecoded')) {
            S.setFlag('codeDecoded'); S.addCredits(5);
            S.addJournal('Código decifrado', 'Regra: o bit da direita (b₂) pede X; o da esquerda (b₁) pede Z. Dandara não manda a seta pelo cabo porque ela é descrita por números contínuos que nem dá para medir — com o par emaranhado, 2 bits bastam.',
              'Crônica: quatro linhas numa tabela viraram uma regra. É assim que a ciência guarda o mundo numa frase.');
          }
          box.innerHTML = '<div class="quiz-end"><div class="quiz-end-title">CÓDIGO DECIFRADO</div>' +
            '<div class="end-table"><div>00 → I</div><div>01 → X</div><div>10 → Z</div><div>11 → ZX</div></div>' +
            '<p>"O tempo de simulação acabou. Vocês decifraram o código no simulador, mas agora precisam reconstruir a arquitetura real do protocolo antes que a última conexão caia. O campo de contenção do Núcleo já reconhece vocês." — Prof.ª Iasmin</p>' +
            '<div class="btn-row"><button class="btn primary quiz-close2">Rumo ao Núcleo</button></div></div>';
          box.querySelector('.quiz-close2').addEventListener('click', function () { m.close(); });
        }
      });
    },

    /* Reconstrução do Circuito (Aplicação do Conhecimento) */
    circuito: function (onDone) {
      Q.run({
        title: 'PROTOCOLO SALVADOR 2495 · Etapa 1: Reconstrução do Circuito', portraitArt: 'oraculo',
        questions: AF.QUIZ_CIRCUITO, damage: 4, damageReason: 'circuito instável', label: 'Etapa', noShuffle: false, track: 'circuito',
        circuit: true, cls: 'modal-wide modal-circ',
        intro: '<p><i>As luzes do laboratório oscilam. O Oráculo projeta um cronômetro vermelho nas paredes de grafeno: o colapso total é iminente.</i></p>' +
          '<p>"Reconstruam a arquitetura do protocolo, porta por porta. É o mesmo circuito que vocês vão montar no <b>IBM Quantum Composer</b>." — Oráculo</p>',
        onComplete: function (box, errors, m) {
          S.setFlag('circuitBuilt');
          S.addJournal('Circuito reconstruído', 'Montei o circuito de 3 qubits: H e CNOT criam o par |β₀₀⟩ (q1, q2); Dandara aplica CNOT(q0→q1) e H(q0), mede q0 e q1, envia b₁b₂ pela fibra; Jamal aplica X^b₂ e Z^b₁.');
          box.innerHTML = '<div class="circ-wrap"><canvas class="quiz-circ" width="980" height="215"></canvas></div><div class="quiz-end"><div class="quiz-end-title">CIRCUITO RECONSTRUÍDO</div>' +
            '<p>"Arquitetura validada. Agora, a prova de fogo: cinco teletransportes perfeitos seguidos, sem ver a seta — como na vida real." — Oráculo</p>' +
            '<div class="btn-row"><button class="btn primary quiz-close2">Iniciar validação ao vivo</button></div></div>';
          AF.CircuitArt.draw(box.querySelector('.quiz-circ'), 8, 0);
          box.querySelector('.quiz-close2').addEventListener('click', function () { m.close(true); if (onDone) onDone(); });
        }
      });
    },

    /* Relatório de Consultoria (Aplicação do Conhecimento) */
    relatorio: function (onDone) {
      Q.run({
        title: 'PROTOCOLO SALVADOR 2495 · Etapa 2: Relatório de Consultoria Afrotech', portraitArt: 'oraculo',
        questions: AF.QUIZ_RELATORIO, damage: 0, label: 'Item', okLabel: 'Registrado!', countErrors: false, track: 'relatorio', trackPick: true,
        intro: '<p>"Como consultores seniores da Afrotech, registrem um depoimento oficial para os arquivos da cidade. Futuras gerações precisam entender como o mundo foi salvo." — Oráculo</p>' +
          '<p class="dim">Escolha a explicação que vai para o relatório. Na sala de aula, este roteiro vira o vídeo de 3 a 5 minutos.</p>',
        onComplete: function (box, errors, m) {
          m.close(true);
          if (onDone) onDone();
        }
      });
    }
  };
})(window.AF);
