/* =========================================================================
 * panel.js — Painel do Agente (Ficha · Diário de Bordo · Glossário · Testes),
 * menu de pausa e tela de controles
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;
  var TABS = [
    { id: 'ficha', label: 'Ficha & Atributos', key: 'F' },
    { id: 'diario', label: 'Diário de Bordo', key: 'J' },
    { id: 'glossario', label: 'Glossário Quântico', key: '' },
    { id: 'testes', label: 'Testes 2d6', key: '' }
  ];

  function fmtTime(s) { var m = Math.floor(s / 60); return m + 'min ' + ('0' + Math.floor(s % 60)).slice(-2) + 's'; }
  function pips(n) { var s = ''; for (var i = 0; i < AF.CONFIG.MAX_LEVEL; i++) s += '<i class="' + (i < n ? 'on' : '') + '"></i>'; return s; }

  var P = AF.Panel = {
    m: null, tab: 'ficha', upgrade: false,

    open: function (tab, opts) {
      opts = opts || {};
      this.upgrade = !!opts.upgrade;
      if (this.m && !this.m.closed) { this.show(tab || this.tab); return; }
      var wrap = AF.el('div', 'agent-panel');
      var tabs = AF.el('div', 'tabs');
      TABS.forEach(function (t) {
        var b = AF.el('button', 'tab', t.label + (t.key ? ' <small>' + t.key + '</small>' : ''));
        b.setAttribute('data-tab', t.id);
        b.addEventListener('click', function () { P.show(t.id); });
        tabs.appendChild(b);
      });
      wrap.appendChild(tabs);
      wrap.appendChild(AF.el('div', 'tab-body'));
      this.m = AF.UI.modal({
        title: 'PAINEL DO AGENTE', body: wrap, cls: 'modal-wide',
        onKey: function (e, a) {
          if (a === 'panel') { var i = TABS.findIndex(function (t) { return t.id === P.tab; }); P.show(TABS[(i + 1) % TABS.length].id); return true; }
          if (a === 'sheet') { P.show('ficha'); return true; }
          if (a === 'journal') { P.show('diario'); return true; }
          if (a === 'left' || a === 'right') {
            var j = TABS.findIndex(function (t) { return t.id === P.tab; });
            P.show(TABS[(j + (a === 'right' ? 1 : TABS.length - 1)) % TABS.length].id); return true;
          }
          return false;
        },
        onClose: function () { P.m = null; P.upgrade = false; AF.Bus.emit('hud'); }
      });
      this.show(tab || 'ficha');
    },

    show: function (tab) {
      this.tab = tab;
      var root = this.m.body;
      root.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === tab); });
      var body = root.querySelector('.tab-body');
      body.innerHTML = '';
      body.scrollTop = 0;
      this['render_' + tab](body);
    },

    render_ficha: function (body) {
      var d = S.d, cls = S.cls;
      var box = AF.el('div', 'sheet');
      var id = AF.el('div', 'sheet-id');
      var cv = AF.el('canvas', 'sheet-portrait'); cv.width = 16; cv.height = 22;
      cv.getContext('2d').drawImage(AF.World.playerFrames ? AF.World.playerFrames.down[0] : AF.Chars.build(S.spec()).down[0], 0, 0);
      id.appendChild(cv);
      var max = S.maxStability();
      id.insertAdjacentHTML('beforeend',
        '<div class="sheet-name">' + AF.esc(d.name) + '</div>' +
        '<div class="sheet-class">' + AF.esc(cls.name) + '</div>' +
        '<div class="sheet-perk">' + AF.esc(cls.perk) + '</div>' +
        '<div class="stat-line"><span>Estabilidade</span><div class="mini-bar"><div style="width:' + (d.stability / max * 100) + '%"></div></div><b>' + Math.round(d.stability) + '/' + max + '</b></div>' +
        '<div class="stat-line"><span>Créditos</span><b class="gold">' + d.credits + ' CQ</b></div>' +
        '<div class="stat-line"><span>Tempo</span><b>' + fmtTime(d.stats.playTime) + '</b></div>' +
        '<div class="sheet-note">Teste = 2d6 + nível do atributo + bônus de classe (+ dicas). Sucesso se o total for ≥ dificuldade (padrão 7). Falhar gera <b class="mag">ruído quântico</b>, não game over.</div>');
      box.appendChild(id);

      var at = AF.el('div', 'sheet-attrs');
      if (this.upgrade) at.appendChild(AF.el('div', 'upgrade-banner', 'TERMINAL ORÁCULO · Invista Créditos Quânticos para subir atributos (máx. nível 3). Custo por nível = custo base.'));
      var tbl = AF.el('div', 'attr-table');
      AF.ATTRS.forEach(function (a) {
        var lvl = S.level(a.id), cb = S.classBonus(a.id);
        var row = AF.el('div', 'attr-row');
        row.innerHTML =
          '<div class="a-name">' + a.name + ' <span class="a-short">' + a.short + '</span><div class="a-desc">' + a.desc + '</div></div>' +
          '<div class="a-pips">' + pips(lvl) + '</div>' +
          '<div class="a-mod">teste <b>+' + (lvl + cb) + '</b>' + (cb ? '<small> (classe +' + cb + ')</small>' : '') + '</div>' +
          '<div class="a-cost">' + a.cost + ' CQ</div>';
        if (P.upgrade) {
          var b = AF.el('button', 'btn btn-sm', '+');
          b.disabled = lvl >= AF.CONFIG.MAX_LEVEL || d.credits < a.cost;
          b.title = 'Subir ' + a.name + ' (' + a.cost + ' CQ)';
          b.addEventListener('click', function () {
            if (S.level(a.id) >= AF.CONFIG.MAX_LEVEL || S.d.credits < a.cost) return;
            S.d.attrs[a.id] = S.level(a.id) + 1;
            S.addCredits(-a.cost, true);
            if (a.id === 'armazenamento') S.heal(10);
            AF.Toast.show(a.name + ' agora nível ' + S.level(a.id), 'gold');
            AF.Audio.play('success');
            P.show('ficha');
          });
          row.appendChild(b);
        }
        tbl.appendChild(row);
      });
      at.appendChild(tbl);
      box.appendChild(at);
      body.appendChild(box);
    },

    render_diario: function (body) {
      var o = AF.Game.objective();
      var steps = [
        ['<b>Problematização ·</b> tem ou não tem pimenta? O acarajé de Schrödinger (Dona Cici)', S.flag('acarajeQ')],
        ['<b>Problematização ·</b> portas lógicas no Elevador Lacerda: clássicas e quânticas (' + Math.min(5, S.count('elevSolved')) + '/5)', S.flag('miniElevador')],
        ['<b>Problematização ·</b> passar pelo bloqueio de emergência da Torre', S.flag('gateOpen')],
        ['<b>Problematização ·</b> conectar-se à interface do Núcleo (antecâmara da sala blindada)', S.flag('nucleoLogs')],
        ['<b>Problematização ·</b> registrar hipóteses na lousa de Dandara', S.flag('lousaRead')],
        ['<b>Organização ·</b> aula e quiz da Prof.ª Iasmin', S.flag('quizDone')],
        ['<b>Organização ·</b> Roteiro de Operação: tabela da verdade (' + S.tableProgress() + '/4)', S.flag('tableDone')],
        ['<b>Organização ·</b> Decifrando o Código', S.flag('codeDecoded')],
        ['<b>Aplicação ·</b> cumprir o protocolo de entrada da Sala do Computador Quântico', S.flag('protocolo')],
        ['<b>Aplicação ·</b> reconstruir o circuito de 3 qubits', S.flag('circuitBuilt')],
        ['<b>Aplicação ·</b> validação ao vivo (5 teletransportes)', S.flag('validated')],
        ['<b>Aplicação ·</b> Relatório de Consultoria Afrotech', S.flag('restored')]
      ];
      var extra = [
        ['Diagnóstico da rede no Terminal Oráculo', S.flag('diagDone')],
        ['Fragmento de memória no corredor escuro', S.flag('fragment')],
        ['Explicar o teletransporte para Dona Cici', S.flag('ciciApp')],
        ['Explicar o teletransporte para Kauã (2 dúvidas)', S.flag('kauaApp2')],
        ['Conversar com o Prof. Hohenfeld na Prainha da Baía (desça a Rampa do Mercado)', S.flag('hohenfeldQuote')],
        ['Jogo da Memória Quântico com Kauã', S.flag('memoria')],
        ['Comprar roupa ou acessório na Boutique do Mercado (Dona Lu)', S.flag('loja')],
        ['Ouvir 4 histórias da mecânica quântica (Prof. Hohenfeld)', S.flag('hohenfeldHist')],
        ['Ouvir 4 histórias de mulheres na ciência (Prof. Hohenfeld)', S.flag('mulheresCiencia')],
        ['Aula de natação com Mi Ayô: as três boias', S.flag('natacao')],
        ['<b>Pós-missão ·</b> Gincana das Fitinhas no Mercado Modelo' + (S.flag('restored') ? '' : ' <span class="dim">(após a missão)</span>'), S.flag('miniMercado')],
        ['<b>Pós-missão ·</b> contar a aventura ao Prof. Hohenfeld' + (S.flag('restored') ? '' : ' <span class="dim">(após a missão)</span>'), S.flag('hohenfeldStory')],
        ['<b>Pós-missão ·</b> Recepção em Jacobina, na estação de Jamal (Hipertrem)' + (S.flag('restored') ? '' : ' <span class="dim">(após a missão)</span>'), S.flag('jacobinaDone')],
        ['<b>Pós-missão ·</b> mirante do Alto do Cruzeiro, em Jacobina (20 CQ)' + (S.flag('restored') ? '' : ' <span class="dim">(após a missão)</span>'), S.flag('cruzeiroVista')],
        ['<b>Pós-missão ·</b> VLT da Baía até a Ribeira e descansar em casa' + (S.flag('restored') ? '' : ' <span class="dim">(após a missão)</span>'), S.flag('casa')]
      ];
      var html = '<div class="journal"><div class="j-obj"><div class="j-act">' + o.act + '</div><div>' + AF.esc(o.text) + '</div></div>';
      html += '<div class="j-cols"><div><h3>Missão principal</h3><ul class="checklist">' +
        steps.map(function (s) { return '<li class="' + (s[1] ? 'done' : '') + '">' + s[0] + '</li>'; }).join('') + '</ul>' +
        '<h3>Extras</h3><ul class="checklist">' + extra.map(function (s) { return '<li class="' + (s[1] ? 'done' : '') + '">' + s[0] + '</li>'; }).join('') + '</ul></div>';
      html += '<div><h3>Descobertas (' + S.d.journal.length + ')</h3>';
      if (!S.d.journal.length) html += '<p class="dim">Nada registrado ainda.</p>';
      S.d.journal.slice().reverse().forEach(function (j) {
        html += '<div class="j-entry"><div class="j-title">' + AF.esc(j.title) + ' <small>' + AF.esc(j.act) + ' · ' + fmtTime(j.t) + '</small></div>' +
          '<div class="j-text">' + AF.esc(j.text) + '</div>' + (j.cronica ? '<div class="j-cron">' + AF.esc(j.cronica) + '</div>' : '') + '</div>';
      });
      html += '</div></div></div>';
      body.innerHTML = html;
    },

    render_glossario: function (body) {
      var n = AF.GLOSS_ORDER.filter(function (k) { return S.d.glossary[k]; }).length;
      var html = '<div class="gloss-head">Conceitos desbloqueados: <b>' + n + '/' + AF.GLOSS_ORDER.length + '</b></div><div class="gloss-grid">';
      AF.GLOSS_ORDER.forEach(function (k) {
        var g = AF.GLOSSARY[k];
        if (S.d.glossary[k]) {
          html += '<div class="g-card"><div class="g-term">' + g.term + '</div><div class="g-def">' + g.def + '</div><div class="g-game">No jogo: ' + g.game + '</div></div>';
        } else {
          html += '<div class="g-card locked"><div class="g-term">???</div><div class="g-def">Continue explorando para desbloquear este conceito.</div></div>';
        }
      });
      body.innerHTML = html + '</div>';
    },

    render_testes: function (body) {
      var st = S.d.stats;
      var html = '<div class="rolls"><div class="roll-stats">Testes: <b>' + st.rolls + '</b> · Sucessos: <b class="ok">' + st.successes + '</b> · Falhas: <b class="mag">' + st.fails + '</b> · Ruído acumulado: <b class="mag">' + st.ruido + '</b></div>';
      if (!S.d.rolls.length) html += '<p class="dim">Nenhum teste de 2d6 ainda. Eles aparecem em diálogos marcados com o atributo e a dificuldade.</p>';
      else {
        html += '<table class="roll-table"><tr><th>Atributo</th><th>Ação</th><th>2d6</th><th>Mod.</th><th>Total</th><th>Resultado</th></tr>';
        S.d.rolls.forEach(function (r) {
          html += '<tr><td>' + AF.ATTR_BY_ID[r.attr].name + '</td><td>' + AF.esc(r.label) + '</td><td>' + r.d1 + ' + ' + r.d2 + '</td><td>+' + r.mod + '</td><td>' + r.total + ' / ' + r.dc + '</td><td class="' + (r.success ? 'ok' : 'mag') + '">' + (r.crit === 'success' ? 'CRÍTICO!' : (r.crit === 'fail' ? 'FALHA CRÍTICA' : (r.success ? 'Sucesso' : 'Ruído'))) + '</td></tr>';
        });
        html += '</table>';
      }
      body.innerHTML = html + '</div>';
    }
  };

  /* ---------- Menu de pausa ---------- */
  AF.Pause = {
    open: function () {
      var box = AF.el('div', 'pause-menu');
      var T = AF.Touch;
      var snd = function () { return 'Som: ' + (AF.Audio.muted ? 'desligado' : 'ligado') + '<span class="k"> (M)</span>'; };
      var tch = function () { return 'Controles na tela: ' + (T.on ? 'ligados' : 'desligados'); };
      var fsl = function () { return T.isFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'; };
      var items = [
        ['Continuar', function () { m.close(); }],
        ['Ficha & Atributos<span class="k"> (F)</span>', function () { m.close(true); AF.Panel.open('ficha'); }],
        ['Diário de Bordo<span class="k"> (J)</span>', function () { m.close(true); AF.Panel.open('diario'); }],
        ['Salvar jogo', function () { AF.Toast.show(S.save() ? 'Jogo salvo neste aparelho' : 'Não foi possível salvar', 'cyan'); }],
        [snd(), function (b) { AF.Audio.toggle(); b.innerHTML = snd(); }],
        [AF.Music.label(), function (b) { AF.Music.toggle(); b.innerHTML = AF.Music.label(); }],
        [AF.Music.levelLabel(), function (b) { AF.Music.cycleLevel(); b.innerHTML = AF.Music.levelLabel(); }]
      ];
      if (T.canFullscreen()) items.push([fsl(), function (b) { T.toggleFullscreen(); setTimeout(function () { b.innerHTML = fsl(); }, 400); }]);
      items.push([tch(), function (b) { T.set(!T.on, true); b.innerHTML = tch(); }]);
      items.push(['Relatório para a professora', function () { AF.Report.open(); }]);
      items.push(['Controles e objetivos', function () { AF.Help.open(); }]);
      items.push(['Voltar ao título', function () { AF.UI.confirm('Voltar ao título? O progresso é salvo automaticamente.', 'Voltar', function () { S.save(); AF.UI.closeAll(); AF.Game.toTitle(); }); }]);
      items.forEach(function (it) {
        var b = AF.el('button', 'btn btn-block', it[0]);
        b.addEventListener('click', function () { it[1](b); });
        box.appendChild(b);
      });
      var m = AF.UI.modal({ title: 'PAUSA', body: box, cls: 'modal-sm' });
    }
  };

  AF.Help = {
    html: function () {
      var touch = AF.Touch && AF.Touch.on;
      var th = '<h3 style="margin-top:0">No celular / tablet</h3><div class="help-grid">' +
        '<div><span class="t-chip">◎ Joystick</span></div><div>Arraste o polegar na metade esquerda para andar (em qualquer direção)</div>' +
        '<div><span class="t-chip gold">E</span></div><div>Interagir. O botão acende quando há alguém ou algo por perto. O balão sobre o personagem também pode ser tocado</div>' +
        '<div><span class="t-chip">Toque</span></div><div>Na caixa de diálogo: pula o texto e avança. Toque nas opções para escolher</div>' +
        '<div><span class="t-chip">Ficha · Diário · Terminal · Menu</span></div><div>Atalhos na parte de cima dos controles</div>' +
        '<div><span class="t-chip">Simulador</span></div><div>Toque nas portas X e Z, depois em Verificar. Arraste o circuito para o lado para vê-lo inteiro</div>' +
        '<div><span class="t-chip">Minigames</span></div><div>Toque nos botões; no acarajé, arraste o botão da pimenteira; na gincana, escolha os ângulos nas listas</div>' +
        '</div><p class="dim">Dica: em pé (retrato) os controles ficam abaixo da cena; deitado (paisagem) a cena ocupa a tela toda. No Menu há Tela cheia e a opção de desligar os controles na tela.</p>';
      return '<div class="help">' + (touch ? th + '<h3>Com teclado</h3>' : '') +
        '<div class="help-grid">' +
        '<div><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / <kbd>←↑↓→</kbd></div><div>Mover</div>' +
        '<div><kbd>E</kbd> / <kbd>Espaço</kbd></div><div>Interagir · avançar diálogo</div>' +
        '<div><kbd>1</kbd>–<kbd>4</kbd> ou mouse</div><div>Escolher opções de diálogo e respostas</div>' +
        '<div><kbd>X</kbd> <kbd>Z</kbd> <kbd>R</kbd> <kbd>Enter</kbd></div><div>Simulador: aplicar portas, reiniciar o q2, verificar</div>' +
        '<div><kbd>F</kbd></div><div>Ficha & Atributos</div>' +
        '<div><kbd>J</kbd> / <kbd>Tab</kbd></div><div>Diário de Bordo e Glossário</div>' +
        '<div><kbd>Q</kbd></div><div>Terminal Quântico (simulador), após falar com Dandara</div>' +
        '<div><kbd>Esc</kbd></div><div>Menu de pausa · fechar janelas</div>' +
        '<div><kbd>O</kbd></div><div>Destacar o objetivo atual (clique nele para abrir o Diário)</div>' +
        '<div><kbd>H</kbd> <kbd>X</kbd> <kbd>Z</kbd> <kbd>⌫</kbd></div><div>Elevador de Hadamard: aplicar portas e apagar a última</div>' +
        '<div><kbd>←</kbd> <kbd>→</kbd></div><div>Acarajé de Schrödinger: girar o botão da pimenteira</div>' +
        '<div><kbd>M</kbd></div><div>Som liga/desliga (a música também se ajusta no Menu)</div>' +
        '</div>' +
        '<h3>Como funciona</h3><ul>' +
        '<li>Opções com <span class="chip chip-test">ATR +N · DIF 7</span> rolam <b>2d6</b> + seu modificador. Total ≥ dificuldade = sucesso.</li>' +
        '<li>Falhas e respostas erradas geram <b class="mag">ruído quântico</b>: você perde Estabilidade, mas pode tentar de novo. Em 0, ocorre <b>decoerência</b> e o Oráculo te reestabiliza.</li>' +
        '<li>O Terminal Oráculo restaura Estabilidade e permite investir Créditos Quânticos em atributos.</li>' +
        '<li>A missão segue os Três Momentos Pedagógicos: <b>Problematização</b> (suas hipóteses), <b>Organização do Conhecimento</b> (Prof.ª Iasmin e simulador) e <b>Aplicação</b> (circuito, validação e relatório no Núcleo).</li>' +
        '<li>O Terminal Oráculo responde perguntas de física quântica — só dentro do tema!</li>' +
        '<li><b>Antes da Torre:</b> o acarajé de Dona Cici (tem ou não tem pimenta?) e o treinamento de portas lógicas no Elevador Lacerda: primeiro NOT, AND, OR e XOR, depois as portas quânticas X, H e Z. Sem a credencial, o drone K-7 não libera o portão.</li>' +
        '<li><b>A qualquer hora:</b> o Jogo da Memória Quântico com Kauã, a Boutique da Dona Lu (em frente ao Mercado Modelo) para comprar roupas e acessórios com Créditos Quânticos, e a Prainha da Baía (Rampa do Mercado), com as histórias do Prof. Hohenfeld e a aula de natação de Mi Ayô.</li>' +
        '<li><b>No Núcleo:</b> entre as etapas do protocolo (circuito → validação → relatório), os qubits recalibram por 1min30s. Dá para explorar enquanto isso.</li>' +
        '<li><b>Depois da missão:</b> a Gincana das Fitinhas (Mercado Modelo), o VLT da Baía até sua casa na Ribeira (1 minuto de viagem pela beira da baía) e o Hipertrem até Jacobina, com o mirante do Alto do Cruzeiro (20 CQ).</li>' +
        '<li><b>Trilha sonora baiana:</b> cada lugar tem o seu ritmo, com melodias originais — ijexá dos afoxés (título), samba-reggae dos blocos afro (praça), canção praieira (Prainha), toque de Angola da capoeira com berimbau (torre), samba de roda do Recôncavo (minigames), baião do sertão (Jacobina) e axé de trio elétrico (vitória). Ligue, desligue ou mude o volume no Menu.</li>' +
        '<li><b>Para a professora:</b> no Menu, "Relatório para a professora" gera um código com o seu progresso para enviar.</li>' +
        '</ul></div>';
    },
    open: function () { AF.UI.modal({ title: 'CONTROLES E OBJETIVOS', body: this.html(), cls: 'modal-md' }); }
  };
})(window.AF);
