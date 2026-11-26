/* =========================================================================
 * main.js — inicialização, laço principal, progressão por atos,
 * transições de cena, decoerência e final
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State, C = AF.CONFIG;
  function $(id) { return document.getElementById(id); }

  var G = AF.Game = {
    mode: 'boot', scale: 3, transitioning: false, ctx: null, last: 0, saveT: 0, decohering: false,

    init: function () {
      var cv = $('screen');
      this.ctx = cv.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
      AF.Tiles.init();
      AF.Touch.init();
      AF.HUD.init();
      AF.Title.init();
      AF.Create.init();
      var rz = function () { clearTimeout(G._rz); G._rz = setTimeout(function () { G.resize(); }, 60); };
      window.addEventListener('resize', rz);
      window.addEventListener('orientationchange', function () { setTimeout(function () { G.resize(); }, 250); });
      if (window.visualViewport) window.visualViewport.addEventListener('resize', rz);
      this.resize();
      this.registerSW();
      AF.Bus.on('decoherence', function () { G.decohere(); });
      this.toTitle();
      /* link direto para o painel da professora: index.html#professor */
      var openTeacher = function () { if (/^#professor/.test(location.hash) && AF.Game.mode === 'title') AF.Teacher.open(); };
      openTeacher();
      window.addEventListener('hashchange', openTeacher);
      requestAnimationFrame(function (t) { G.last = t; G.loop(t); });
    },

    /* Desktop: 384×216 em escala inteira (como antes).
     * Celular: a resolução interna se adapta à tela (retrato ou paisagem),
     * mantendo pixels nítidos — escala inteira em pixels físicos do aparelho. */
    resize: function () {
      var vw = window.innerWidth, vh = window.innerHeight;
      var touch = AF.Touch && AF.Touch.on;
      var ae = document.activeElement;
      var typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA');
      var portrait = touch && (typing && this._portrait !== undefined ? this._portrait : vh > vw * 1.05);
      this._portrait = portrait;
      var body = document.body;
      body.classList.toggle('portrait', !!portrait);
      body.classList.toggle('landscape', !!(touch && !portrait));
      if (typing && touch) return;   /* teclado virtual aberto: não refaz o layout */
      if (AF.HUD && AF.HUD.layout) AF.HUD.layout();

      /* Faixa do HUD acima da cena (desktop e celular deitado): a cena encolhe um pouco
       * na vertical para caber, em vez de o HUD ficar por cima da sala */
      var hudT = function (sc) { var fs = touch ? 16 : Math.max(16, Math.min(22, 5.5 * sc)); return Math.round(fs * 2.2 + 14); };
      var W = 384, H = 216, s, T = 0;
      if (touch) {
        var dpr = window.devicePixelRatio || 1, availW = vw, availH = vh, k;
        if (portrait) {
          var deck = Math.round(Math.max(270, Math.min(360, vh * 0.42)));
          document.documentElement.style.setProperty('--deck', deck + 'px');
          availH = vh - deck;
          k = Math.max(1, Math.round(availW * dpr / 232));
        } else {
          document.documentElement.style.setProperty('--deck', '0px');
          T = hudT(1);
          availH = vh - T;
          k = Math.max(1, Math.round(availH * dpr / 200));
        }
        W = Math.max(160, Math.min(560, Math.floor(availW * dpr / k)));
        H = Math.max(140, Math.min(420, Math.floor(availH * dpr / k)));
        s = k / dpr;
      } else {
        document.documentElement.style.setProperty('--deck', '0px');
        s = Math.max(1, Math.floor(Math.min(vw / W, vh / H)));
        for (;;) {
          T = hudT(s);
          H = Math.min(216, Math.floor((vh - T) / s));
          if (H >= 180 || s === 1) break;
          s--;
        }
        H = Math.max(140, H);
      }
      document.documentElement.style.setProperty('--hudT', T + 'px');
      var cv = $('screen');
      if (C.W !== W || C.H !== H || cv.width !== W || cv.height !== H) {
        C.W = W; C.H = H;
        cv.width = W; cv.height = H;
        this.ctx.imageSmoothingEnabled = false;
        if (AF.World && AF.World.tiles) {
          if (AF.World.titleMode) AF.World.titleCamera(); else if (AF.World.snapCamera) AF.World.snapCamera();
        }
      }
      this.scale = s;
      var cw = Math.round(W * s), ch = Math.round(H * s);
      cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
      $('stage').style.width = cw + 'px'; $('stage').style.height = ch + 'px';
      document.documentElement.style.setProperty('--s', s);
      /* dica de teclado embaixo da cena só se sobrar espaço */
      body.classList.toggle('hint-room', !touch && (vh - T - ch) / 2 >= 26);
      if (AF.HUD.layout) AF.HUD.layout();
    },

    /* PWA: funciona offline quando hospedado (GitHub Pages, Netlify, servidor da escola) */
    registerSW: function () {
      try {
        if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
        if (window.self !== window.top) return;    /* dentro de iframe/sandbox: ignora */
        navigator.serviceWorker.register('sw.js').catch(function () { /* ok */ });
      } catch (e) { /* ok */ }
    },

    loop: function (t) {
      var dt = Math.min(0.05, (t - this.last) / 1000);
      this.last = t;
      if (this.mode === 'play' && S.d) {
        var block = AF.UI.blocking();
        AF.World.update(dt, !block);
        AF.Dialogue.update(dt);
        if (!block) {
          var I = AF.Input;
          if (I.consume('menu')) AF.Pause.open();
          else if (I.consume('panel') || I.consume('journal')) AF.Panel.open('diario');
          else if (I.consume('sheet')) AF.Panel.open('ficha');
          else if (I.consume('terminal')) this.shortcut('terminal');
          else if (I.consume('objective')) AF.HUD.toggleObj();
        }
        S.d.stats.playTime += dt;
        this.saveT += dt;
        if (this.saveT > 30 && !block) { this.saveT = 0; S.save(); }
      } else {
        AF.World.update(dt, false);
        if (this.mode === 'title' && !AF.UI.top() && AF.Input.consume('interact')) this.openCreate();
      }
      AF.Touch.update();
      AF.Music.update();
      AF.World.render(this.ctx);
      AF.HUD.updatePrompt();
      AF.Input.endFrame();
      requestAnimationFrame(function (tt) { G.loop(tt); });
    },

    /* ---------- Telas ---------- */
    toTitle: function () {
      this.mode = 'title';
      AF.UI.closeAll();
      if (AF.Dialogue.active) AF.Dialogue.close();
      AF.HUD.show(false);
      var keep = S.d; S.d = null;
      AF.World.load('praca', null, { title: true });
      S.d = keep;
      AF.Create.hide();
      AF.Title.show();
    },
    openCreate: function () {
      this.mode = 'create';
      AF.Title.hide();
      AF.Create.show();
    },
    startNew: function () {
      this.mode = 'play';
      AF.UI.closeAll();
      AF.Title.hide();
      AF.World.load('praca', 'start');
      AF.HUD.show(true); AF.HUD.refresh();
      AF.HUD.banner(AF.MAPS.praca.name, AF.MAPS.praca.sub);
      S.save();
      AF.Input.clear();
      setTimeout(function () { if (G.mode === 'play' && !AF.Dialogue.active) AF.Dialogue.start('intro'); }, 1100);
    },
    continueGame: function () {
      if (!S.load()) { AF.Toast.show('Nenhum jogo salvo encontrado', 'dim'); return; }
      this.mode = 'play';
      AF.Title.hide();
      var map = AF.MAPS[S.d.map] ? S.d.map : 'praca';
      /* jogos salvos antes da sala blindada: quem já estava lá dentro não fica preso */
      if (map === 'torre' && S.flag('tableDone') && !S.flag('protocolo') && S.d.y < 7 * AF.CONFIG.TILE) S.setFlag('protocolo');
      AF.World.load(map, { px: S.d.x, py: S.d.y, dir: S.d.dir });
      AF.HUD.show(true); AF.HUD.refresh();
      AF.HUD.banner(AF.MAPS[map].name, 'Missão retomada · ' + AF.MAPS[map].sub);
      AF.Input.clear();
    },

    shortcut: function (act) {
      if (this.mode !== 'play' || AF.UI.blocking()) return;
      if (act === 'sheet') AF.Panel.open('ficha');
      else if (act === 'journal') AF.Panel.open('diario');
      else if (act === 'menu') AF.Pause.open();
      else if (act === 'terminal') {
        if (!S.flag('terminal')) AF.Toast.show('Terminal Quântico offline — Dandara tem um terminal portátil na Torre', 'dim');
        else if (!S.flag('quizDone')) AF.Toast.show('Terminal pronto, mas o simulador aguarda o quiz da Prof.ª Iasmin', 'dim');
        else AF.Sim.open('treino');
      }
    },

    /* ---------- Progressão ---------- */
    objective: function () {
      if (!S.d) return { act: '', text: '' };
      var PI = 'Problematização', OC = 'Organização do Conhecimento', AC = 'Aplicação do Conhecimento';
      if (S.flag('restored')) {
        var left = [];
        if (!S.flag('miniElevador')) left.push('Elevador de Hadamard no Elevador Lacerda (' + Math.min(5, S.count('elevSolved')) + '/5)');
        if (!S.flag('miniMercado')) left.push('Gincana das Fitinhas no Mercado Modelo');
        if (!S.flag('hohenfeldStory')) left.push('conte a aventura ao Prof. Hohenfeld na Prainha (Rampa do Mercado)');
        if (!S.flag('jacobinaDone')) left.push(S.flag('jacobina') ? 'opere a Recepção no console de Jamal, em Jacobina' : 'visite Jamal em Jacobina (Hipertrem, leste da praça)');
        var out = AF.World && AF.World.mapId === 'torre' ? 'Saia da Torre. ' : '';
        if (AF.World && AF.World.mapId === 'jacobina' && S.flag('jacobinaDone')) out = 'Volte a Salvador pelo Hipertrem. ';
        if (!left.length) return { act: 'Missão cumprida', text: 'Tudo concluído! Explore Salvador e conte essa história a quem encontrar.' };
        return { act: 'Desafios liberados', text: out + 'Agora: ' + left.join(' · ') + '.' };
      }
      if (!S.flag('acarajeQ') && !S.flag('gateOpen')) return { act: 'Ato 1 · ' + PI, text: 'Passe no tabuleiro de Dona Cici (sul da praça): tem ou não tem pimenta? Depois, siga para a Torre (leste).' };
      if (!S.flag('gateOpen')) return { act: 'Ato 1 · ' + PI, text: 'Chegue à Torre da Afrotech (leste da praça) e passe pelo bloqueio de emergência.' };
      if (!S.flag('visitedTower')) return { act: 'Ato 1 · ' + PI, text: 'Entre na Torre da Afrotech pelo portão liberado.' };
      if (!S.flag('nucleoLogs') && !S.flag('metDandara')) return { act: 'Ato 2 · ' + PI, text: 'Atravesse o Labirinto do Silêncio e conecte-se à interface do Núcleo, na antecâmara da sala blindada (norte), antes que os logs se apaguem.' };
      if (!S.flag('metDandara')) return { act: 'Ato 2 · ' + PI, text: 'Encontre Dandara no gabinete (oeste do corredor).' };
      if (!S.flag('lousaRead')) return { act: 'Ato 2 · ' + PI, text: 'Decifre a lousa de Dandara e registre suas hipóteses.' };
      if (!S.flag('dandaraReact')) return { act: 'Ato 2 · ' + PI, text: 'Mostre suas hipóteses a Dandara.' };
      if (!S.flag('quizDone')) return { act: 'Ato 3 · ' + OC, text: 'Encontre a Prof.ª Iasmin no Laboratório de Teoria Quântica (leste do corredor).' };
      if (!S.flag('tableDone')) return { act: 'Ato 3 · ' + OC, text: 'Roteiro de Operação: no simulador (console ou Q), descubra a correção para 00, 01, 10 e 11 — ' + S.tableProgress() + '/4.' };
      if (!S.flag('codeDecoded')) return { act: 'Ato 3 · ' + OC, text: 'Mostre sua tabela à Prof.ª Iasmin e decifre o código.' };
      if (!S.flag('circuitBuilt') && !S.flag('protocolo')) return { act: 'Ato 4 · ' + AC, text: 'Vá à antecâmara da Sala do Computador Quântico (norte do corredor) e cumpra o protocolo de entrada no painel de acesso.' };
      if (!S.flag('circuitBuilt')) return { act: 'Ato 4 · ' + AC, text: 'Entre na Sala do Computador Quântico e reconstrua o circuito de 3 qubits no Núcleo.' };
      if (!S.flag('validated')) return { act: 'Ato 4 · ' + AC, text: 'No Núcleo: valide o protocolo ao vivo (5 teletransportes perfeitos).' };
      return { act: 'Ato 4 · ' + AC, text: 'No Núcleo: registre o Relatório de Consultoria Afrotech.' };
    },
    act: function () { return this.objective().act; },

    transition: function (to, spawn) {
      if (this.transitioning) return;
      this.transitioning = true;
      AF.Audio.play('door');
      AF.FX.fade(true, 260);
      setTimeout(function () {
        AF.World.load(to, spawn);
        if (to === 'jacobina' && !S.flag('jacobina')) {
          S.setFlag('jacobina');
          S.addJournal('Jacobina, Cidade do Ouro', 'Peguei o Hipertrem até Jacobina, no extremo norte da Chapada Diamantina, a uns 300 km de Salvador. Foi aqui, na Estação Receptora, que Jamal recebeu o estado da D-7. A cidade nasceu da corrida do ouro no período colonial; ao redor, serras, a Mina Velha, o Alto do Cruzeiro e o Rio do Ouro.');
          setTimeout(function () { if (!AF.Dialogue.active) AF.Dialogue.start('jamal_chegada'); }, 1000);
        }
        var firstTower = to === 'torre' && !S.flag('visitedTower');
        if (firstTower) {
          S.setFlag('visitedTower');
          S.addJournal('Labirinto do Silêncio', 'Entrei na Torre da Afrotech. O corredor central está sem energia e com gás denso — só as luzes de emergência piscam. Núcleo ao norte, gabinete de Dandara a oeste, laboratório a leste.');
          setTimeout(function () { if (!AF.Dialogue.active) AF.Dialogue.start('torre_entrada'); }, 900);
        }
        AF.FX.fade(false, 320);
        AF.HUD.banner(AF.MAPS[to].name, AF.MAPS[to].sub);
        AF.HUD.refresh();
        AF.Input.clear();
        S.save();
        G.transitioning = false;
      }, 300);
    },

    /* Estabilidade zerada: decoerência (sem game over) */
    decohere: function () {
      if (this.decohering) return;
      this.decohering = true; this.transitioning = true;
      AF.UI.closeAll();
      if (AF.Dialogue.active) AF.Dialogue.close();
      S.d.stats.decoherences++;
      var ov = $('fx-decoh');
      ov.classList.remove('hidden');
      AF.Audio.play('fail');
      setTimeout(function () {
        AF.World.load(AF.World.mapId, 'oraculo');
        S.d.stability = Math.round(S.maxStability() * 0.5);
        ov.classList.add('hidden');
        AF.HUD.refresh();
        S.addJournal('Decoerência', 'Minha assinatura quântica colapsou por excesso de ruído. O Oráculo me reestabilizou no terminal mais próximo, com metade da Estabilidade. Nada se perdeu — só tempo.');
        AF.Toast.show('O Oráculo reestabilizou você (50% de Estabilidade)', 'cyan');
        G.decohering = false; G.transitioning = false;
        AF.Input.clear();
        S.save();
      }, 2300);
    },

    victory: function () {
      S.setFlag('restored');
      S.unlock('protocolo');
      S.addCredits(20, true);
      S.heal(9999);
      S.addJournal('Canal Quântico restaurado', 'Circuito reconstruído, cinco teletransportes perfeitos e o Relatório de Consultoria arquivado. A tabela de correção voltou a todos os receptores: o Silêncio acabou. Jamal recebeu o estado da cápsula D-7 com fidelidade total.',
        'Crônica: quando o Espinhaço acendeu em ciano, a praça inteira aplaudiu. Dona Cici bateu panela.');
      S.save();
      var st = S.d.stats;
      var nGloss = AF.GLOSS_ORDER.filter(function (k) { return S.d.glossary[k]; }).length;
      var mins = Math.floor(st.playTime / 60), secs = Math.floor(st.playTime % 60);
      var jp = AF.Chars.portrait(AF.SPECS.jamal);
      var hyp = AF.HIPOTESES.map(function (h) {
        var k = S.d.hyp[h.id];
        return '<div class="hy-row"><div class="hy-q">' + h.q + '</div>' +
          '<div class="hy-a"><span>Antes, você pensou:</span> ' + (k !== undefined ? AF.esc(h.options[k]) : '—') + '</div>' +
          '<div class="hy-s"><span>O que a física mostrou:</span> ' + h.science + '</div></div>';
      }).join('');
      var body = AF.el('div', 'ending');
      body.innerHTML =
        '<div class="end-title">TRANSMISSÃO FINAL DO ORÁCULO</div>' +
        '<p class="end-lead">"Protocolo de restauração completo. Agentes e consultores, Salvador saúda sua coragem e seu intelecto. O canal de fibra óptica volta a transmitir a receita de que Jamal precisa, e suas explicações sobre emaranhamento, superposição e colapso serão a nova base da educação científica da metrópole."</p>' +
        '<p class="end-lead">"O mistério do Silêncio foi resolvido: não era o fim da tecnologia, mas um convite para entendermos melhor a linguagem quântica que nos une. STATUS DA MISSÃO: sucesso absoluto — o código foi quebrado. Bem-vindos de volta ao futuro."</p>' +
        '<div class="end-jamal"><canvas width="16" height="16"></canvas><div><b>Jamal (Jacobina):</b> "Recebi! Estado da D-7 com fidelidade de 100%. A cápsula nem saiu de Salvador — só a informação viajou. Jacobina online!"</div></div>' +
        '<h3 class="end-h">Suas hipóteses · antes e depois</h3><div class="hyps">' + hyp + '</div>' +
        '<h3 class="end-h">Novos desafios liberados em Salvador</h3>' +
        '<ul class="end-tasks"><li><b>Elevador Lacerda · Elevador de Hadamard:</b> a Cidade Baixa é |0⟩ e a Cidade Alta é |1⟩. Use X, H e Z para levar os passageiros — e descubra a interferência.</li>' +
        '<li><b>Mercado Modelo · Gincana das Fitinhas:</b> com Dona Zeza e Jamal, vença o desafio de Bell acima do teto clássico de 75%.</li>' +
        '<li><b>Prainha da Baía:</b> desça a Rampa do Mercado e conte sua aventura ao Prof. Hohenfeld.</li>' +
        '<li><b>Jacobina:</b> pegue o Hipertrem (leste da praça) até a Estação Receptora e receba as próximas cápsulas pelo lado de Jamal.</li></ul>' +
        '<h3 class="end-h">Missão para a turma (fora do jogo)</h3>' +
        '<ul class="end-tasks"><li><b>IBM Quantum Composer:</b> montem o circuito de 3 qubits do teletransporte (H e CNOT para o par; CNOT e H de Dandara; medidas; correções X e Z).</li>' +
        '<li><b>Vídeo de 3 a 5 minutos</b> (relatório de consultoria): explicação científica, momento crítico (medição e colapso), justificativa técnica e visão de futuro para Salvador.</li></ul>' +
        '<div class="end-stats">' +
          '<div><span>Tempo de missão</span><b>' + mins + 'min ' + secs + 's</b></div>' +
          '<div><span>Testes 2d6</span><b>' + st.successes + ' sucessos · ' + st.fails + ' falhas</b></div>' +
          '<div><span>Ruído quântico absorvido</span><b>' + st.ruido + '</b></div>' +
          '<div><span>Rodadas no simulador</span><b>' + st.simCorrect + '/' + st.simRounds + ' corretas</b></div>' +
          '<div><span>Erros conceituais corrigidos</span><b>' + st.quizErrors + '</b></div>' +
          '<div><span>Conceitos no Glossário</span><b>' + nGloss + '/' + AF.GLOSS_ORDER.length + '</b></div>' +
        '</div>' +
        '<p class="dim">Fim do Volume 2 · +20 CQ de recompensa. Tudo fica registrado no Diário de Bordo.</p>' +
        '<div class="end-rep"><b>Para a sua professora ou professor:</b> gere o relatório da sua missão (hipóteses, respostas e simulador) e envie o código.</div>' +
        '<div class="btn-row"><button class="btn primary" id="end-stay">Continuar explorando</button><button class="btn" id="end-rep">Relatório para a professora</button><button class="btn" id="end-title">Voltar ao título</button></div>';
      var m = AF.UI.modal({ title: 'MISSÃO CUMPRIDA', body: body, cls: 'modal-md', closable: false });
      var pc = body.querySelector('canvas').getContext('2d'); pc.imageSmoothingEnabled = false; pc.drawImage(jp, 0, 0);
      body.querySelector('#end-stay').addEventListener('click', function () { m.close(); AF.HUD.refresh(); });
      body.querySelector('#end-title').addEventListener('click', function () { m.close(true); G.toTitle(); });
      body.querySelector('#end-rep').addEventListener('click', function () { AF.Report.open(); });
      AF.Audio.play('victory');
      AF.HUD.refresh();
    }
  };

  window.addEventListener('DOMContentLoaded', function () { G.init(); });
})(window.AF);
