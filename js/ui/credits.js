/* =========================================================================
 * credits.js — créditos finais que sobem na tela (fim do Volume 2)
 *   AF.Credits.roll(onEnd, opts) · opts.fromTitle: aberto pelo menu inicial
 * Para editar nomes e textos, mude a lista CREDITS abaixo.
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;

  /* elenco: [quem, papel, retrato] */
  var CAST = [
    ['Oráculo', 'interface de diagnóstico da Afrotech', 'art:oraculo'],
    ['Dandara', 'operadora da Estação Salvador', 'dandara'],
    ['Prof.ª Iasmin', 'Laboratório de Teoria Quântica', 'iasmin'],
    ['Jamal', 'Estação Receptora de Jacobina', 'jamal'],
    ['Dona Cici', 'tabuleiro de acarajé da Praça Cairu', 'cici'],
    ['Kauã', 'entregador de drones e mestre da memória', 'kaua'],
    ['Dona Zeza', 'Gincana das Fitinhas, Mercado Modelo', 'zeza'],
    ['Dona Lu', 'Boutique do Mercado', 'lu'],
    ['Prof. Hohenfeld', 'surfista e contador de história', 'hohenfeld'],
    ['Mi Ayô', 'aula de natação na Prainha', 'miayo'],
    ['Dona Socorro e Davi', 'moradores de Jacobina', 'socorro'],
    ['Seu Didi', 'pescador da Ribeira', 'didi'],
    ['Drone Vigia K-7', 'portão da Torre', 'art:k7']
  ];

  function block(title, lines) {
    return '<div class="cr-block"><div class="cr-h">' + title + '</div>' + lines.map(function (l) {
      return Array.isArray(l) ? '<div class="cr-line"><span class="cr-role">' + l[0] + '</span><span class="cr-name">' + l[1] + '</span></div>' : '<div class="cr-text">' + l + '</div>';
    }).join('') + '</div>';
  }

  function content(fromTitle) {
    var d = S.d, html = '';
    html += '<div class="cr-logo"><div class="cr-small">AFROTECH · VOLUME 2</div><div class="cr-big">SILÊNCIO NO<br>CANAL QUÂNTICO</div><div class="cr-small">Salvador, 2495</div></div>';
    if (d && !fromTitle) {
      var cls = AF.CLASS_BY_ID[d.classId];
      html += '<div class="cr-block"><div class="cr-h">ESTRELANDO</div><canvas class="cr-face cr-me" width="16" height="16"></canvas>' +
        '<div class="cr-star">' + AF.esc(d.name) + '</div><div class="cr-text">' + (cls ? cls.name : '') + ' · Consultor(a) da Afrotech</div></div>';
    }
    html += '<div class="cr-block"><div class="cr-h">ELENCO</div>' + CAST.map(function (c, i) {
      return '<div class="cr-cast"><canvas class="cr-face" data-i="' + i + '" width="16" height="16"></canvas><div><div class="cr-name">' + c[0] + '</div><div class="cr-role">' + c[1] + '</div></div></div>';
    }).join('') + '</div>';
    html += block('ROTEIRO E PEDAGOGIA', [
      'Baseado no produto educacional e na dissertação',
      '<i>Afrotech: uma abordagem gamificada sociointeracionista em RPG</i>',
      ['Autora', 'Iasmin Emanuelle Santos Silva'],
      ['Orientação', 'José Carlos Oliveira de Jesus'],
      ['Coorientação', 'Marco Antônio Silva Trindade'],
      ['Programa', 'MNPEF · Polo 60 · UNEB'],
      'Organizado pelos Três Momentos Pedagógicos (Delizoicov e Angotti)'
    ]);
    html += block('VERSÃO DIGITAL', [
      ['Desenvolvimento', 'Yan Cleiton'],
      ['Com a assistência de', 'Claude (Anthropic)'],
      ['Tecnologia', 'HTML5, CSS3 e JavaScript puro'],
      ['Pixel art, sons e música', 'gerados por código'],
      ['Fontes', 'VT323 e Press Start 2P (licença OFL)']
    ]);
    html += block('A FÍSICA DO JOGO', [
      'Simulador de vetor de estado de 3 qubits: amplitudes complexas, regra de Born e esfera de Bloch',
      'Qubit e bit · superposição · medição · emaranhamento · teletransporte quântico',
      'Portas lógicas · portas X, H, Z e CNOT · desafio de Bell · não-clonagem · decoerência'
    ]);
    html += block('TRILHA SONORA BAIANA', [
      ['Salvador, 2495', 'ijexá dos afoxés'],
      ['Comércio', 'samba-reggae de bloco afro'],
      ['Maré na Baía', 'canção praieira'],
      ['Labirinto do Silêncio', 'toque de Angola (capoeira)'],
      ['10 milikelvin', 'berimbau e qubits'],
      ['Serra do Ouro', 'baião do sertão'],
      ['Roda de Ideias', 'samba de roda do Recôncavo'],
      ['Trio no Circuito', 'axé de trio elétrico'],
      'Todas as melodias são composições originais.'
    ]);
    html += block('LUGARES', [
      'Praça Cairu · Elevador Lacerda · Mercado Modelo · Prainha da Baía · Forte São Marcelo',
      'Água de Meninos · São Joaquim · Calçada · Largo de Roma · Bonfim · Ribeira',
      'Jacobina: Estação Receptora · Mina Velha · Alto do Cruzeiro · Rio do Ouro'
    ]);
    html += block('CIENTISTAS LEMBRADAS NESTA HISTÓRIA', [
      'Marie Curie · Emmy Noether · Lise Meitner · Chien-Shiung Wu · Grete Hermann',
      'Maria Goeppert Mayer · Donna Strickland · Andrea Ghez · Anne L\'Huillier',
      'Elisa Frota-Pessôa · Sonia Guimarães · Katemari Rosa · Jaqueline Goes de Jesus'
    ]);
    if (d && !fromTitle) {
      var st = d.stats, mins = Math.floor(st.playTime / 60);
      var nG = AF.GLOSS_ORDER.filter(function (k) { return d.glossary[k]; }).length;
      var mg = [['portasClassicas', 'portas lógicas'], ['miniElevador', 'Elevador de Hadamard'], ['acarajeQ', 'acarajé de Schrödinger'], ['miniMercado', 'Gincana das Fitinhas'],
        ['jacobinaDone', 'Recepção em Jacobina'], ['memoria', 'memória quântica'], ['natacao', 'aula de natação'], ['cruzeiroVista', 'Alto do Cruzeiro']]
        .filter(function (m) { return d.flags[m[0]]; }).map(function (m) { return m[1]; });
      html += block('SUA MISSÃO', [
        ['Tempo', mins + ' min'],
        ['Testes de 2d6', st.successes + ' sucessos · ' + st.fails + ' falhas'],
        ['Simulador', st.simCorrect + ' de ' + st.simRounds + ' rodadas certas'],
        ['Glossário', nG + ' de ' + AF.GLOSS_ORDER.length + ' conceitos'],
        mg.length ? 'Desafios vencidos: ' + mg.join(' · ') : 'Ainda há desafios esperando por você em Salvador.'
      ]);
    }
    html += block('MISSÃO PARA A TURMA', [
      'Montar o circuito do teletransporte no IBM Quantum Composer',
      'Gravar um vídeo de 3 a 5 minutos explicando o que aconteceu com Salvador'
    ]);
    html += '<div class="cr-block cr-quote">"Toda equação já foi, um dia, uma pergunta de alguém."<div class="cr-role">— lousinha do Prof. Hohenfeld</div></div>';
    return html;
  }

  function stars(cv) {
    var x = cv.getContext('2d'), r = AF.Pix.rng(2495);
    cv.width = 480; cv.height = 270;
    var g = x.createLinearGradient(0, 0, 0, 270);
    g.addColorStop(0, '#05040c'); g.addColorStop(1, '#140a30');
    x.fillStyle = g; x.fillRect(0, 0, 480, 270);
    for (var i = 0; i < 160; i++) {
      x.fillStyle = 'rgba(' + (r() < 0.2 ? '122,249,255' : '255,255,240') + ',' + (0.25 + r() * 0.7).toFixed(2) + ')';
      x.fillRect(Math.floor(r() * 480), Math.floor(r() * 270), 1, 1);
    }
  }

  AF.Credits = {
    roll: function (onEnd, opts) {
      opts = opts || {};
      var fromTitle = !!opts.fromTitle, speed = 1, pos = 0, raf = 0, last = performance.now(), ended = false;
      var body = AF.el('div', 'credits-roll');
      body.innerHTML = '<canvas class="cr-sky"></canvas><div class="cr-view"><div class="cr-scroll">' + content(fromTitle) + '</div></div>' +
        '<div class="cr-foot"><button class="btn btn-sm cr-fast">Acelerar ▸▸</button><button class="btn btn-sm cr-skip">Pular</button></div>' +
        '<div class="cr-end hidden"><div class="cr-big">FIM DO VOLUME 2</div><div class="cr-text">Salvador voltou a falar — graças a você.</div><div class="cr-small">Obrigado por jogar!</div><div class="btn-row"></div></div>';
      var m = AF.UI.modal({
        body: body, cls: 'modal-credits', overlayCls: 'ov-credits', closable: false, silent: true,
        onKey: function (e, a) {
          if (ended) { if (a === 'interact') { finish(fromTitle ? 'close' : 'wake'); } return true; }
          if (a === 'interact') { toggleFast(); return true; }
          if (a === 'menu') { end(); return true; }
          return true;
        },
        onClose: function () { cancelAnimationFrame(raf); }
      });
      stars(body.querySelector('.cr-sky'));
      /* retratos */
      body.querySelectorAll('canvas.cr-face').forEach(function (c) {
        var x = c.getContext('2d'); x.imageSmoothingEnabled = false;
        var img;
        if (c.classList.contains('cr-me')) img = AF.Chars.portrait(S.spec());
        else {
          var who = CAST[+c.getAttribute('data-i')][2];
          img = who.indexOf('art:') === 0 ? AF.Art.portrait(who.slice(4)) : AF.Chars.portrait(AF.SPECS[who]);
        }
        if (img) x.drawImage(img, 0, 0, 16, 16);
      });
      var scroll = body.querySelector('.cr-scroll'), H = body.clientHeight || window.innerHeight;
      pos = H;
      function toggleFast() { speed = speed === 1 ? 4 : 1; body.querySelector('.cr-fast').textContent = speed === 1 ? 'Acelerar ▸▸' : 'Velocidade normal'; }
      function end() {
        if (ended) return;
        ended = true; cancelAnimationFrame(raf);
        scroll.classList.add('hidden'); body.querySelector('.cr-foot').classList.add('hidden');
        var e = body.querySelector('.cr-end'); e.classList.remove('hidden');
        var row = e.querySelector('.btn-row');
        row.innerHTML = fromTitle ? '<button class="btn primary cr-close">Fechar<span class="k"> [E]</span></button>'
          : '<button class="btn primary cr-wake">Acordar e continuar explorando<span class="k"> [E]</span></button><button class="btn cr-title">Voltar ao título</button>';
        if (fromTitle) row.querySelector('.cr-close').addEventListener('click', function () { finish('close'); });
        else {
          row.querySelector('.cr-wake').addEventListener('click', function () { finish('wake'); });
          row.querySelector('.cr-title').addEventListener('click', function () { finish('title'); });
        }
        AF.Audio.play('victory');
      }
      function finish(how) {
        m.close(true);
        if (how === 'title') { if (S.d) S.save(); AF.Game.toTitle(); return; }
        if (onEnd) onEnd(how);
      }
      body.querySelector('.cr-fast').addEventListener('click', toggleFast);
      body.querySelector('.cr-skip').addEventListener('click', end);
      var pxs = AF.Touch && AF.Touch.on ? 30 : 38;
      function loop(now) {
        var dt = Math.min(0.1, (now - last) / 1000); last = now;
        pos -= pxs * speed * dt;
        scroll.style.transform = 'translateY(' + Math.round(pos) + 'px)';
        if (pos < -scroll.offsetHeight + H * 0.35) { end(); return; }
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);
      return m;
    }
  };
})(window.AF);
