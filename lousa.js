/* =========================================================================
 * lousa.js — Lousa de problematização de Dandara (1º Momento Pedagógico)
 * O(a) estudante registra HIPÓTESES — sem certo ou errado nesta etapa.
 * No final do jogo, as hipóteses são comparadas com o que a física mostrou.
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;
  var GL = '█▓▒░#%&@?!';

  function glitchText(s, amount) {
    var out = '';
    for (var i = 0; i < s.length; i++) out += (s[i] !== ' ' && Math.random() < amount) ? GL[Math.floor(Math.random() * GL.length)] : s[i];
    return out;
  }
  function hypText(q) {
    var h = S.d.hyp[q.id];
    return h === undefined ? null : q.options[h];
  }

  var L = AF.Lousa = {
    /* Board visual: as 4 perguntas do manual (+ hipóteses já registradas) */
    boardEl: function (glitched) {
      var board = AF.el('div', 'lousa' + (glitched ? ' glitched' : ''));
      var lines = [];
      var add = function (cls, txt) { var d = AF.el('div', cls); d.textContent = glitched ? glitchText(txt, 0.38) : txt; d._t = txt; board.appendChild(d); lines.push(d); };
      add('l-h', 'PROBLEMATIZAÇÃO — D.');
      AF.HIPOTESES.forEach(function (q, i) {
        add('l-q', (i + 1) + '. ' + q.q);
        var h = !glitched && hypText(q);
        if (h) { var d = AF.el('div', 'l-a'); d.textContent = '→ hipótese: ' + h; board.appendChild(d); }
      });
      add('l-t', 'TABELA DE CORREÇÃO (apagada pelo pulso):   00 → ?    01 → ?    10 → ?    11 → ?');
      board._lines = lines;
      return board;
    },

    /* Lousa instável (falha no teste): só fragmentos */
    open: function (glitched) {
      var board = this.boardEl(glitched);
      var foot = AF.el('div', 'lousa-foot', glitched
        ? 'A escrita está instável. Tente outra abordagem (Percepção, Fotografia Quântica ou Inteligência) para ler tudo.'
        : (S.flag('lousaRead') ? 'Suas hipóteses estão no Diário de Bordo. Elas serão confrontadas com a física no laboratório.'
                               : 'Registre suas hipóteses para cada pergunta.'));
      var wrap = AF.el('div'); wrap.appendChild(board); wrap.appendChild(foot);
      var iv = null;
      var m = AF.UI.modal({
        title: 'LOUSA DE DANDARA', body: wrap, cls: 'modal-md',
        onKey: function (e, a) { if (a === 'interact') { m.close(); return true; } return false; },
        onClose: function () { if (iv) clearInterval(iv); }
      });
      if (glitched) iv = setInterval(function () { board._lines.forEach(function (d) { d.textContent = glitchText(d._t, 0.38); }); }, 160);
    },

    /* Levantamento de hipóteses (sucesso ao decifrar) */
    hypotheses: function (onDone) {
      var idx = 0;
      var box = AF.el('div', 'hyp');
      var m = AF.UI.modal({
        title: 'LOUSA DE DANDARA · Suas hipóteses', body: box, cls: 'modal-md',
        closable: false,
        onKey: function (e, a) {
          var n = parseInt(e.key, 10);
          if (idx < AF.HIPOTESES.length && n >= 1 && n <= 4) { choose(n - 1); return true; }
          if (idx >= AF.HIPOTESES.length && a === 'interact') { finish(); return true; }
          return true;
        }
      });
      function render() {
        var q = AF.HIPOTESES[idx];
        box.innerHTML = '<div class="lousa lousa-sm"><div class="l-h">PERGUNTA ' + (idx + 1) + ' DE ' + AF.HIPOTESES.length + '</div><div class="l-q big">' + q.q + '</div></div>' +
          '<div class="hyp-note">Não existe resposta errada agora: é a SUA hipótese. Ela vai para o Diário de Bordo e será testada no laboratório.</div>' +
          '<div class="quiz-opts">' + q.options.map(function (o, k) {
            return '<button class="btn quiz-opt" data-k="' + k + '"><span class="num">' + (k + 1) + '</span> ' + o + '</button>';
          }).join('') + '</div>';
        box.querySelectorAll('.quiz-opt').forEach(function (b) { b.addEventListener('click', function () { choose(+b.getAttribute('data-k')); }); });
      }
      function choose(k) {
        var q = AF.HIPOTESES[idx];
        S.d.hyp[q.id] = k;
        AF.Audio.play('note');
        idx++;
        if (idx < AF.HIPOTESES.length) { render(); return; }
        box.innerHTML = '<div class="lousa lousa-sm"><div class="l-h">HIPÓTESES REGISTRADAS</div>' +
          AF.HIPOTESES.map(function (h, i) { return '<div class="l-q">' + (i + 1) + '. ' + h.q + '</div><div class="l-a">→ ' + AF.esc(h.options[S.d.hyp[h.id]]) + '</div>'; }).join('') +
          '</div><div class="btn-row"><button class="btn primary hyp-done">Mostrar a Dandara<span class="k"> [E]</span></button></div>';
        box.querySelector('.hyp-done').addEventListener('click', finish);
      }
      function finish() {
        if (m.closed) return;
        m.close(true);
        if (!S.flag('lousaRead')) {
          S.setFlag('lousaRead');
          S.addCredits(3);
          S.addJournal('Minhas hipóteses (Problematização)', AF.HIPOTESES.map(function (h, i) { return (i + 1) + ') ' + h.q + ' — ' + h.options[S.d.hyp[h.id]]; }).join(' · '),
            'Crônica: escrevi o que eu pensava antes de saber. Quero ver depois o quanto isso mudou.');
        }
        if (onDone) onDone();
      }
      render();
    },

    /* Roteiro de Operação (Apêndice 1 do manual) — entregue após o quiz */
    roteiro: function () {
      S.addJournal('Roteiro de Operação Teletransporte', 'Você é um(a) engenheiro(a) quântico(a) recém-contratado(a). O sistema de correção automática quebrou: a informação chega embaralhada a Jamal. Única pista: 2 bits clássicos. MISSÃO: descobrir o Código de Correção. 1) Observe as três estações: Dandara (estado original — some rápido!), Canal (os bits) e Jamal (seta vermelha = onde está; sombra verde = onde deveria estar). 2) Teste as Portas X e Z: o que a seta faz? 3) Faça pelo menos 10 teletransportes e anote bits recebidos e o que funcionou. 4) Encontre a regra.');
    }
  };
  void L;
})(window.AF);
