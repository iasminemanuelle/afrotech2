/* =========================================================================
 * report.js — MODO PROFESSOR(A)
 *
 * Estudante: Menu → "Relatório para a professora" (ou no fim da missão)
 *   gera um CÓDIGO (texto "AFROTECH2:…") para mandar por WhatsApp/e-mail
 *   e, se quiser, um arquivo .json. Nada sai do aparelho sem o(a) estudante.
 * Professor(a): tela inicial → "Modo professor(a)" (ou index.html#professor)
 *   cola os códigos (pode colar a conversa inteira) ou importa os .json,
 *   vê o resumo da turma e exporta a planilha (CSV) ou copia a tabela.
 *   Os dados ficam só no aparelho da professora (localStorage).
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State, C = AF.CONFIG;
  var TKEY = 'afrotech_v2_turma';
  var PREFIX = 'AFROTECH2:';
  function esc(x) { return AF.esc(x === undefined || x === null ? '' : String(x)); }
  function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
  function mins(sec) { return Math.round((sec || 0) / 60); }
  function fmtMin(sec) { var m = Math.floor((sec || 0) / 60); return m >= 60 ? Math.floor(m / 60) + 'h' + String(m % 60).padStart(2, '0') : m + ' min'; }

  /* ---------- etapas da missão (para "onde a turma está") ---------- */
  var STAGES = [
    ['acarajeQ', 'Acarajé de Schrödinger'], ['gateOpen', 'Entrou na Torre'], ['lousaRead', 'Hipóteses na lousa'],
    ['quizDone', 'Quiz da Prof.ª Iasmin'], ['tableDone', 'Roteiro no simulador'], ['codeDecoded', 'Decifrou o código'],
    ['circuitBuilt', 'Circuito reconstruído'], ['validated', 'Validação (5 seguidos)'], ['restored', 'Missão cumprida']
  ];
  var MINIS = [['acarajeQ', 'Acarajé'], ['miniElevador', 'Elevador'], ['miniMercado', 'Gincana'], ['jacobinaDone', 'Jacobina'], ['hohenfeldStory', 'Hohenfeld']];

  /* rótulos das perguntas registradas (trilha → item → texto) */
  function qLabels() {
    var L = {};
    var add = function (track, arr, prefix) {
      L[track] = {};
      arr.forEach(function (q, i) { L[track][i + 1] = (prefix || '') + String(q.q).replace(/<[^>]+>/g, ''); });
    };
    add('quiz', AF.QUIZ || [], 'Quiz: ');
    add('codigo', AF.QUIZ_CODIGO || [], 'Código: ');
    add('circuito', AF.QUIZ_CIRCUITO || [], 'Circuito: ');
    add('relatorio', AF.QUIZ_RELATORIO || [], 'Relatório: ');
    L.acaraje = { 1: 'Acarajé: antes de abrir, o acarajé quântico…', 2: 'Acarajé: um acarajé de verdade pode ficar em superposição?' };
    L.sala = { 1: 'Sala blindada: o que fica no armário da antecâmara?', 2: 'Sala blindada: como atravessar a antecâmara?', 3: 'Sala blindada: por que o computador quântico precisa de uma sala só dele?' };
    L.mercado = { 1: 'Gincana: Jamal descobre a fita de Zeza pelas próprias respostas?' };
    L.aplicacao = { cici: 'Dona Cici: dá pra mandar acarajé por teletransporte?', kaua1: 'Kauã: a Afrotech teletransporta gente?',
      kaua2: 'Kauã: dá pra mandar mensagem mais rápido que a luz?', hohenfeld: 'Prof. Hohenfeld: por onde começar a contar a aventura?' };
    L.jacobina = (AF.JACOBINA_Q || []).reduce(function (o, q, i) { o[i + 1] = 'Jacobina: ' + q.q.replace(/<[^>]+>/g, ''); return o; }, {});
    return L;
  }

  /* ---------- montar o relatório do(a) estudante ---------- */
  function build() {
    var d = S.d, st = d.stats;
    var flags = {};
    STAGES.concat(MINIS).forEach(function (p) { if (d.flags[p[0]]) flags[p[0]] = 1; });
    ['metHohenfeld', 'hohenfeldQuote', 'jacobina', 'dandaraReact', 'visitedTower', 'protocolo'].forEach(function (k) { if (d.flags[k]) flags[k] = 1; });
    return {
      v: 1, app: 'afrotech2', ver: C.VERSION, sid: d.res.sid,
      nome: (d.student.nome || '').trim(), turma: (d.student.turma || '').trim(),
      data: new Date().toISOString(), inicio: d.res.t0 ? new Date(d.res.t0).toISOString() : '',
      per: d.name, cls: d.classId, ato: AF.Game.objective().act,
      tempo: Math.round(st.playTime), f: flags, ms: d.res.ms,
      hip: d.hyp, q: d.res.q, mg: d.res.mg,
      sim: { r: st.simRounds, c: st.simCorrect, f: d.simFails, t: S.tableProgress() },
      dados: [st.rolls, st.successes, st.fails], ruido: st.ruido, dec: st.decoherences, err: st.quizErrors,
      gl: Object.keys(d.glossary).length, di: d.journal.length, ora: Object.keys(d.res.ora || {}).length, cq: d.credits
    };
  }

  /* ---------- código: AFROTECH2:<base64url(JSON)>.<verificação> ---------- */
  function hash(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('000000' + (h & 0xffffff).toString(16)).slice(-6);
  }
  function b64e(str) {
    var bytes = new TextEncoder().encode(str), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64d(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function encode(obj) { var j = JSON.stringify(obj); return PREFIX + b64e(j) + '.' + hash(j); }
  function decodeOne(body, h) {
    try {
      var j = b64d(body);
      if (hash(j) !== h) return null;
      var o = JSON.parse(j);
      return o && o.app === 'afrotech2' ? o : null;
    } catch (e) { return null; }
  }
  /* encontra todos os códigos num texto qualquer (ex.: conversa exportada do WhatsApp) */
  function scan(text) {
    var out = [], bad = 0, seen = {};
    [text, String(text).replace(/\s+/g, '')].forEach(function (t) {
      var re = /AFROTECH2:([A-Za-z0-9_-]+)\.([0-9a-f]{6})/g, m;
      while ((m = re.exec(t))) {
        if (seen[m[0]]) continue; seen[m[0]] = 1;
        var o = decodeOne(m[1], m[2]);
        if (o) out.push(o); else bad++;
      }
    });
    return { list: out, bad: bad };
  }

  /* ---------- salvar arquivo: capacidade "downloads" (link do Claude) ou download comum ---------- */
  var dlCap = null;
  try {
    if (window.claude && window.claude.use) window.claude.use('downloads').then(function (d) { dlCap = d; }, function () {});
  } catch (e) { /* ok */ }
  function saveFile(name, text) {
    if (dlCap) {
      return dlCap.save({ filename: name, data: text }).then(function () { return true; }, function (err) {
        if (err && err.code === 'declined') return false;
        AF.Toast.show('Não foi possível baixar aqui. Use "Copiar".', 'dim'); return false;
      });
    }
    try {
      var blob = new Blob([text], { type: /\.csv$/.test(name) ? 'text/csv;charset=utf-8' : 'application/json' });
      var url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 800);
      return Promise.resolve(true);
    } catch (e) { return Promise.resolve(false); }
  }
  function copyText(text, ta) {
    var ok = function () { AF.Toast.show('Copiado!', 'green'); AF.Audio.play('success'); };
    var fallback = function () {
      if (!ta) { AF.Toast.show('Selecione o texto e copie manualmente', 'dim'); return; }
      ta.focus(); ta.select();
      try { if (document.execCommand('copy')) { ok(); return; } } catch (e) { /* ok */ }
      AF.Toast.show('Texto selecionado: copie com o menu do aparelho', 'dim');
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
      else fallback();
    } catch (e) { fallback(); }
  }
  function slug(s) { return String(s || 'estudante').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'estudante'; }

  /* ---------- resumo de um relatório ---------- */
  function firstTry(r, tracks) {
    var ok = 0, n = 0;
    (tracks || ['quiz', 'codigo', 'circuito', 'acaraje', 'sala', 'mercado', 'aplicacao', 'jacobina']).forEach(function (t) {
      var o = (r.q || {})[t]; if (!o) return;
      Object.keys(o).forEach(function (k) { n++; if (o[k][0] === 1) ok++; });
    });
    return { ok: ok, n: n, p: n ? Math.round(100 * ok / n) : null };
  }
  function stageOf(r) {
    var n = 0, last = 'Início';
    STAGES.forEach(function (s, i) { if (r.f && r.f[s[0]]) { n = i + 1; last = s[1]; } });
    return { n: n, label: last };
  }

  /* =====================================================================
   * Lado do(a) estudante
   * ===================================================================== */
  var Report = AF.Report = {
    build: build, encode: encode, scan: scan,
    open: function () {
      if (!S.d) return;
      var body = AF.el('div', 'rep');
      var r0 = build(), ft = firstTry(r0), stg = stageOf(r0);
      body.innerHTML =
        '<p>Mande este relatório para a sua professora ou professor. Ele mostra o seu caminho na missão: hipóteses, respostas, simulador e desafios. ' +
        '<span class="dim">Só vão junto o nome e a turma que você escrever aqui.</span></p>' +
        '<div class="rep-form"><label>Seu nome<input id="rep-nome" maxlength="60" autocomplete="name" placeholder="Nome e sobrenome"></label>' +
        '<label>Turma<input id="rep-turma" maxlength="30" placeholder="Ex.: 3º A"></label></div>' +
        '<div class="rep-sum">' +
          '<div><span>Etapa</span><b>' + esc(stg.label) + '</b></div>' +
          '<div><span>Tempo de jogo</span><b>' + fmtMin(r0.tempo) + '</b></div>' +
          '<div><span>Acertos de primeira</span><b>' + (ft.p === null ? '—' : ft.p + '% (' + ft.ok + '/' + ft.n + ')') + '</b></div>' +
          '<div><span>Desafios</span><b>' + MINIS.filter(function (m) { return r0.f[m[0]]; }).map(function (m) { return m[1]; }).join(', ') + (MINIS.some(function (m) { return r0.f[m[0]]; }) ? '' : '—') + '</b></div>' +
        '</div>' +
        '<div class="rep-need dim">Escreva o seu nome para gerar o código.</div>' +
        '<textarea id="rep-code" readonly rows="4" spellcheck="false"></textarea>' +
        '<div class="btn-row rep-btns"><button class="btn primary" id="rep-copy">Copiar código</button>' +
        (navigator.share ? '<button class="btn" id="rep-share">Enviar…</button>' : '') +
        '<button class="btn" id="rep-file">Baixar arquivo .json</button></div>' +
        '<p class="dim rep-tip">Dica: cole o código numa mensagem para a professora (WhatsApp, e-mail ou como ela pedir). Você pode gerar um novo relatório quando avançar no jogo.</p>';
      var m = AF.UI.modal({ title: 'Relatório para a professora', body: body, cls: 'modal-md modal-rep' });
      var nome = body.querySelector('#rep-nome'), turma = body.querySelector('#rep-turma'), ta = body.querySelector('#rep-code');
      nome.value = S.d.student.nome || ''; turma.value = S.d.student.turma || '';
      var code = '';
      function refresh() {
        S.d.student.nome = nome.value; S.d.student.turma = turma.value;
        var ready = nome.value.trim().length >= 2;
        body.querySelector('.rep-need').style.display = ready ? 'none' : '';
        body.querySelectorAll('.rep-btns .btn').forEach(function (b) { b.disabled = !ready; });
        code = ready ? encode(build()) : '';
        ta.value = code;
      }
      nome.addEventListener('input', refresh); turma.addEventListener('input', refresh);
      ta.addEventListener('focus', function () { ta.select(); });
      body.querySelector('#rep-copy').addEventListener('click', function () { if (code) { copyText(code, ta); S.save(); } });
      var sh = body.querySelector('#rep-share');
      if (sh) sh.addEventListener('click', function () {
        if (!code) return;
        try {
          navigator.share({ title: 'Relatório Afrotech', text: 'Relatório Afrotech de ' + nome.value.trim() + ' (' + turma.value.trim() + '):\n' + code })
            .catch(function () { /* cancelado */ });
        } catch (e) { copyText(code, ta); }
      });
      body.querySelector('#rep-file').addEventListener('click', function () {
        if (!code) return;
        var r = build(); r.codigo = code;
        saveFile('afrotech-' + slug(r.nome) + '.json', JSON.stringify(r, null, 1)).then(function (ok) { if (ok) AF.Toast.show('Arquivo salvo', 'green'); });
      });
      refresh();
      if (!nome.value && !(AF.Touch && AF.Touch.on)) setTimeout(function () { nome.focus(); }, 60);
      return m;
    }
  };

  /* =====================================================================
   * Lado do(a) professor(a)
   * ===================================================================== */
  function loadClass() { try { return JSON.parse(localStorage.getItem(TKEY) || '[]') || []; } catch (e) { return []; } }
  function saveClass(list) { try { localStorage.setItem(TKEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
  function merge(list, incoming) {
    var added = 0, updated = 0;
    incoming.forEach(function (r) {
      var i = -1;
      for (var k = 0; k < list.length; k++) if (list[k].sid === r.sid) { i = k; break; }
      if (i < 0) { list.push(r); added++; }
      else if (String(r.data) >= String(list[i].data)) { list[i] = r; updated++; }
    });
    return { added: added, updated: updated };
  }

  /* turma fictícia para a professora ver como o painel funciona */
  function sample() {
    var names = ['Ana Clara', 'Bruno', 'Caio', 'Daniela', 'Enzo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Júlia', 'Kelvin', 'Luana'];
    var rnd = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
    var tries = function (p) { return Math.random() < p ? 1 : rnd(2, 3); };
    return names.map(function (n, i) {
      var stage = Math.min(9, rnd(3, 11)), f = {};
      STAGES.forEach(function (s, k) { if (k < stage) f[s[0]] = 1; });
      if (stage >= 9) { if (Math.random() < 0.7) f.miniElevador = 1; if (Math.random() < 0.6) f.miniMercado = 1; if (Math.random() < 0.5) f.jacobinaDone = 1; if (Math.random() < 0.5) f.hohenfeldStory = 1; }
      var q = { acaraje: { 1: [tries(0.5)], 2: [tries(0.65)] } };
      if (stage >= 4) { q.quiz = {}; for (var k = 1; k <= 6; k++) q.quiz[k] = [tries(k === 4 ? 0.35 : 0.7)]; }
      if (stage >= 6) { q.codigo = {}; for (var c = 1; c <= 4; c++) q.codigo[c] = [tries(c === 4 ? 0.4 : 0.75)]; }
      if (stage >= 7) { q.circuito = {}; for (var e = 1; e <= 8; e++) q.circuito[e] = [tries(e === 7 ? 0.5 : 0.8)]; }
      var hip = { q1: rnd(0, 2), q2: rnd(0, 2), q3: rnd(0, 2), q4: rnd(0, 2) };
      return { v: 1, app: 'afrotech2', ver: C.VERSION, sid: 'exemplo' + i, nome: n + ' (exemplo)', turma: i < 6 ? '3º A' : '3º B',
        data: new Date(Date.now() - rnd(0, 3) * 864e5).toISOString(), per: n.split(' ')[0], cls: ['cientista', 'hacker', 'cronista', 'executivo', 'analista', 'hardware'][i % 6],
        ato: stage >= 9 ? 'Missão cumprida' : 'Em andamento', tempo: rnd(25, 70) * 60, f: f, ms: {}, hip: hip, q: q, mg: {},
        sim: { r: rnd(6, 20), c: rnd(4, 12), f: { '00': rnd(0, 1), '01': rnd(0, 2), '10': rnd(0, 3), '11': rnd(0, 4) }, t: stage >= 5 ? 4 : rnd(0, 3) },
        dados: [rnd(4, 9), rnd(2, 6), rnd(1, 3)], ruido: rnd(5, 40), dec: Math.random() < 0.2 ? 1 : 0, err: rnd(1, 9), gl: rnd(8, 25), di: rnd(5, 16), ora: rnd(0, 6), cq: rnd(10, 60), exemplo: true };
    });
  }

  /* linhas da planilha */
  var HIP_IDS = function () { return (AF.HIPOTESES || []).map(function (h) { return h.id; }); };
  function rows(list) {
    var L = qLabels();
    var head = ['Nome', 'Turma', 'Data do relatório', 'Personagem', 'Classe', 'Etapa', 'Etapas concluídas (de 9)', 'Missão concluída', 'Tempo (min)',
      'Acerto de primeira (%)', 'Perguntas respondidas', 'Ruído total', 'Decoerências', 'Erros em quiz',
      'Simulador: rodadas', 'Simulador: acertos', 'Simulador: falhas 00', 'falhas 01', 'falhas 10', 'falhas 11', 'Tabela 00-11 descoberta',
      'Testes 2d6', 'Sucessos 2d6', 'Glossário', 'Diário', 'Perguntas ao Oráculo',
      'Acarajé', 'Elevador', 'Gincana', 'Jacobina', 'Prof. Hohenfeld'];
    HIP_IDS().forEach(function (id, i) { head.push('Hipótese ' + (i + 1)); });
    var qcols = [];
    ['acaraje', 'quiz', 'codigo', 'sala', 'circuito', 'relatorio', 'mercado', 'aplicacao', 'jacobina'].forEach(function (t) {
      Object.keys(L[t] || {}).forEach(function (k) { qcols.push([t, k]); head.push(L[t][k] + ' (tentativas)'); if (t === 'relatorio') head.push(L[t][k] + ' (escolha)'); });
    });
    var mgcols = [['acaraje', 'apostas', 'Acarajé: apostas certas (de 3)'], ['acaraje', 'pedido1', 'Acarajé: pedido 25% (tentativas)'], ['acaraje', 'pedido2', 'Acarajé: pedido 75% (tentativas)'],
      ['elevador', 'd1', 'Elevador 1 (tentativas)'], ['elevador', 'd2', 'Elevador 2'], ['elevador', 'd3', 'Elevador 3 (H·H)'], ['elevador', 'previsao', 'Elevador: previsão H·H'], ['elevador', 'd4', 'Elevador 4 (H·Z·H)'], ['elevador', 'd5', 'Elevador 5'],
      ['mercado', 'classicoMelhor', 'Gincana: melhor clássico (%)'], ['mercado', 'quanticoTentativas', 'Gincana: tentativas com emaranhamento'], ['mercado', 'quanticoChance', 'Gincana: chance final (%)'], ['mercado', 'dicaUsada', 'Gincana: usou dica'],
      ['jacobina', 'rodadas', 'Jacobina: rodadas'], ['jacobina', 'cedo', 'Jacobina: mediu antes dos bits'], ['jacobina', 'certas', 'Jacobina: entregas certas']];
    mgcols.forEach(function (c) { head.push(c[2]); });
    var out = [head];
    list.forEach(function (r) {
      var ft = firstTry(r), stg = stageOf(r), sim = r.sim || {}, sf = sim.f || {};
      var row = [r.nome || '(sem nome)', r.turma || '', String(r.data || '').slice(0, 10), r.per || '', (AF.CLASS_BY_ID[r.cls] || {}).name || r.cls || '',
        stg.label, stg.n, r.f && r.f.restored ? 'sim' : 'não', mins(r.tempo),
        ft.p === null ? '' : ft.p, ft.n, r.ruido || 0, r.dec || 0, r.err || 0,
        sim.r || 0, sim.c || 0, sf['00'] || 0, sf['01'] || 0, sf['10'] || 0, sf['11'] || 0, (sim.t || 0) + '/4',
        (r.dados || [])[0] || 0, (r.dados || [])[1] || 0, r.gl || 0, r.di || 0, r.ora || 0];
      MINIS.forEach(function (m) { row.push(r.f && r.f[m[0]] ? 'sim' : 'não'); });
      HIP_IDS().forEach(function (id, i) { var h = AF.HIPOTESES[i], v = (r.hip || {})[id]; row.push(v === undefined ? '' : h.options[v]); });
      qcols.forEach(function (c) {
        var v = ((r.q || {})[c[0]] || {})[c[1]];
        row.push(v ? v[0] : '');
        if (c[0] === 'relatorio') row.push(v && v[1] ? v[1] : '');
      });
      mgcols.forEach(function (c) { var v = ((r.mg || {})[c[0]] || {})[c[1]]; row.push(v === undefined ? '' : (v === true ? 'sim' : (v === false ? 'não' : v))); });
      out.push(row);
    });
    return out;
  }
  function toCSV(tab) {
    return '﻿' + tab.map(function (r) {
      return r.map(function (c) { c = String(c === undefined || c === null ? '' : c); return /[;"\n\r]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(';');
    }).join('\r\n');
  }
  function toTSV(tab) { return tab.map(function (r) { return r.map(function (c) { return String(c === undefined || c === null ? '' : c).replace(/[\t\n\r]+/g, ' '); }).join('\t'); }).join('\n'); }

  function bars(items, total, cls) {
    return '<div class="tb-bars ' + (cls || '') + '">' + items.map(function (it) {
      var p = pct(it.n, total);
      return '<div class="tb-row"><span class="tb-l">' + esc(it.label) + '</span><div class="tb-bar"><i style="width:' + p + '%"></i></div><span class="tb-v">' + it.n + (total ? ' · ' + p + '%' : '') + '</span></div>';
    }).join('') + '</div>';
  }

  var Teacher = AF.Teacher = {
    filter: '',
    open: function () {
      var self = this;
      var body = AF.el('div', 'tch');
      var m = AF.UI.modal({ title: 'Modo professor(a) · Resultados da turma', body: body, cls: 'modal-wide modal-tch' });
      this.m = m; this.body = body;
      body.innerHTML =
        '<div class="tch-import">' +
          '<div class="tch-how"><b>Como funciona:</b> no jogo, cada estudante abre <b>Menu → Relatório para a professora</b> (ou o botão no fim da missão), escreve nome e turma e envia o código. ' +
          'Cole aqui os códigos recebidos — pode colar várias mensagens ou a conversa inteira exportada do WhatsApp — ou importe os arquivos .json. Os dados ficam só neste aparelho.</div>' +
          '<textarea id="tch-paste" rows="3" spellcheck="false" placeholder="Cole aqui os códigos AFROTECH2:…"></textarea>' +
          '<div class="btn-row tch-row"><button class="btn primary" id="tch-go">Importar códigos</button>' +
          '<label class="btn tch-file">Importar arquivos .json<input type="file" id="tch-files" accept=".json,application/json,text/plain" multiple></label>' +
          '<button class="btn" id="tch-sample">Ver exemplo (turma fictícia)</button></div>' +
          '<div id="tch-msg" class="dim"></div>' +
        '</div>' +
        '<div id="tch-dash"></div>';
      body.querySelector('#tch-go').addEventListener('click', function () {
        var ta = body.querySelector('#tch-paste');
        var res = scan(ta.value);
        self.ingest(res.list, res.bad);
        if (res.list.length) ta.value = '';
      });
      body.querySelector('#tch-files').addEventListener('change', function (e) {
        var files = Array.prototype.slice.call(e.target.files || []), got = [], bad = 0, left = files.length;
        if (!left) return;
        files.forEach(function (f) {
          var rd = new FileReader();
          rd.onload = function () {
            var txt = String(rd.result || '');
            try {
              var o = JSON.parse(txt);
              if (o && o.app === 'afrotech2') got.push(o);
              else if (o && o.codigo) { var s1 = scan(o.codigo); got = got.concat(s1.list); bad += s1.bad; }
              else bad++;
            } catch (err) { var s2 = scan(txt); got = got.concat(s2.list); bad += s2.bad + (s2.list.length ? 0 : 1); }
            if (--left === 0) { self.ingest(got, bad); e.target.value = ''; }
          };
          rd.onerror = function () { bad++; if (--left === 0) self.ingest(got, bad); };
          rd.readAsText(f);
        });
      });
      body.querySelector('#tch-sample').addEventListener('click', function () {
        var list = loadClass().filter(function (r) { return !r.exemplo; });
        merge(list, sample()); saveClass(list); self.msg('Turma fictícia carregada (nomes marcados com "exemplo"). Use "Apagar exemplos" para tirar.'); self.render();
      });
      this.render();
      return m;
    },
    msg: function (t) { var el = this.body.querySelector('#tch-msg'); if (el) el.textContent = t; },
    ingest: function (incoming, bad) {
      var list = loadClass();
      var r = merge(list, incoming);
      var ok = saveClass(list);
      var parts = [];
      if (r.added) parts.push(r.added + ' relatório(s) novo(s)');
      if (r.updated) parts.push(r.updated + ' atualizado(s)');
      if (bad) parts.push(bad + ' código(s) inválido(s) ou incompleto(s)');
      if (!incoming.length && !bad) parts.push('Nenhum código AFROTECH2 encontrado no texto');
      if (!ok) parts.push('atenção: este navegador não deixou guardar os dados — exporte a planilha antes de fechar');
      this.msg(parts.join(' · ') + '.');
      AF.Audio.play(incoming.length ? 'success' : 'hurt');
      this.render();
    },
    render: function () {
      var self = this, all = loadClass(), dash = this.body.querySelector('#tch-dash');
      var turmas = []; all.forEach(function (r) { var t = r.turma || '(sem turma)'; if (turmas.indexOf(t) < 0) turmas.push(t); });
      turmas.sort();
      if (this.filter && turmas.indexOf(this.filter) < 0) this.filter = '';
      var list = all.filter(function (r) { return !self.filter || (r.turma || '(sem turma)') === self.filter; });
      list.sort(function (a, b) { return String(a.nome).localeCompare(String(b.nome), 'pt'); });
      if (!all.length) { dash.innerHTML = '<div class="tch-empty">Nenhum relatório ainda. Cole os códigos acima ou clique em <b>Ver exemplo</b> para conhecer o painel.</div>'; return; }

      var n = list.length;
      var done = list.filter(function (r) { return r.f && r.f.restored; }).length;
      var tAvg = n ? list.reduce(function (s, r) { return s + (r.tempo || 0); }, 0) / n : 0;
      var ftAll = list.reduce(function (s, r) { var f = firstTry(r); s.ok += f.ok; s.n += f.n; return s; }, { ok: 0, n: 0 });

      /* onde a turma está */
      var stageItems = STAGES.map(function (s, i) { return { label: s[1], n: list.filter(function (r) { return stageOf(r).n === i + 1; }).length }; });
      stageItems.unshift({ label: 'Ainda no início', n: list.filter(function (r) { return stageOf(r).n === 0; }).length });

      /* perguntas mais difíceis */
      var L = qLabels(), qs = [];
      Object.keys(L).forEach(function (t) {
        if (t === 'relatorio') return;
        Object.keys(L[t]).forEach(function (k) {
          var ans = list.filter(function (r) { return r.q && r.q[t] && r.q[t][k]; });
          if (!ans.length) return;
          var ok = ans.filter(function (r) { return r.q[t][k][0] === 1; }).length;
          qs.push({ label: L[t][k], ok: ok, n: ans.length, p: ok / ans.length });
        });
      });
      qs.sort(function (a, b) { return a.p - b.p || b.n - a.n; });

      /* hipóteses iniciais */
      var hipHTML = (AF.HIPOTESES || []).map(function (h) {
        var tot = list.filter(function (r) { return r.hip && r.hip[h.id] !== undefined; }).length;
        return '<div class="tch-hip"><b>' + esc(h.q) + '</b>' + bars(h.options.map(function (o, i) {
          return { label: o, n: list.filter(function (r) { return r.hip && r.hip[h.id] === i; }).length };
        }), tot, 'wide') + '</div>';
      }).join('');

      var miniItems = MINIS.map(function (mm) { return { label: mm[1], n: list.filter(function (r) { return r.f && r.f[mm[0]]; }).length }; });
      var simAvg = n ? (list.reduce(function (s, r) { return s + ((r.sim || {}).r || 0); }, 0) / n) : 0;
      var failKeys = ['00', '01', '10', '11'].map(function (k) { return { label: 'Bits ' + k, n: list.reduce(function (s, r) { return s + (((r.sim || {}).f || {})[k] || 0); }, 0) }; });
      var failTot = failKeys.reduce(function (s, x) { return s + x.n; }, 0);

      var tab = rows(list);
      var head = tab[0];
      var show = [0, 1, 5, 8, 9, 11, 14, 26, 27, 28, 29, 30, 2];
      dash.innerHTML =
        '<div class="tch-bar"><label>Turma: <select id="tch-turma"><option value="">Todas (' + all.length + ')</option>' +
          turmas.map(function (t) { return '<option value="' + esc(t) + '"' + (t === self.filter ? ' selected' : '') + '>' + esc(t) + ' (' + all.filter(function (r) { return (r.turma || '(sem turma)') === t; }).length + ')</option>'; }).join('') +
        '</select></label><div class="btn-row"><button class="btn" id="tch-csv">Baixar planilha (CSV)</button><button class="btn" id="tch-tsv">Copiar tabela</button>' +
        (all.some(function (r) { return r.exemplo; }) ? '<button class="btn" id="tch-noex">Apagar exemplos</button>' : '') +
        '<button class="btn" id="tch-clear">Limpar tudo</button></div></div>' +
        '<div class="tch-cards">' +
          '<div><span>Estudantes</span><b>' + n + '</b></div>' +
          '<div><span>Concluíram a missão</span><b>' + done + ' <small>(' + pct(done, n) + '%)</small></b></div>' +
          '<div><span>Tempo médio de jogo</span><b>' + fmtMin(tAvg) + '</b></div>' +
          '<div><span>Acertos de primeira</span><b>' + pct(ftAll.ok, ftAll.n) + '%</b><small>' + ftAll.ok + ' de ' + ftAll.n + ' respostas</small></div>' +
        '</div>' +
        '<div class="tch-grid">' +
          '<section><h3>Onde a turma está</h3>' + bars(stageItems, n) + '</section>' +
          '<section><h3>Perguntas mais difíceis <small class="dim">(menos acertos de primeira)</small></h3>' +
            (qs.length ? '<div class="tch-qs">' + qs.slice(0, 8).map(function (x) {
              return '<div class="tch-q"><div class="tb-row"><span class="tb-l">' + esc(x.label) + '</span></div><div class="tb-row"><div class="tb-bar ' + (x.p < 0.5 ? 'bad' : '') + '"><i style="width:' + Math.round(x.p * 100) + '%"></i></div><span class="tb-v">' + x.ok + '/' + x.n + ' · ' + Math.round(x.p * 100) + '%</span></div></div>';
            }).join('') + '</div>' : '<p class="dim">Sem respostas registradas ainda.</p>') + '</section>' +
          '<section><h3>Desafios concluídos</h3>' + bars(miniItems, n) +
            '<h3>Simulador</h3><p>Média de <b>' + simAvg.toFixed(1).replace('.', ',') + '</b> rodadas por estudante. Onde mais erraram:</p>' + bars(failKeys, failTot) + '</section>' +
          '<section class="span2"><h3>Hipóteses iniciais (Problematização)</h3><p class="dim">Respostas da lousa de Dandara, antes da aula: bom ponto de partida para a discussão em sala.</p>' + hipHTML + '</section>' +
        '</div>' +
        '<h3>Estudantes <small class="dim">— toque num nome para ver os detalhes</small></h3>' +
        '<div class="scroll tch-tbl"><table class="tt"><thead><tr>' + show.map(function (i) { return '<th>' + esc(head[i]) + '</th>'; }).join('') + '<th></th></tr></thead><tbody>' +
          tab.slice(1).map(function (row, ri) {
            return '<tr data-i="' + ri + '">' + show.map(function (i, ci) { return '<td' + (ci === 0 ? ' class="tch-name"' : '') + '>' + esc(row[i]) + '</td>'; }).join('') + '<td><button class="btn btn-sm tch-del" data-sid="' + esc(list[ri].sid) + '" title="Remover">×</button></td></tr>';
          }).join('') +
        '</tbody></table></div>' +
        '<div id="tch-detail"></div>';

      dash.querySelector('#tch-turma').addEventListener('change', function (e) { self.filter = e.target.value; self.render(); });
      dash.querySelector('#tch-csv').addEventListener('click', function () {
        var name = 'afrotech-turma' + (self.filter ? '-' + slug(self.filter) : '') + '-' + new Date().toISOString().slice(0, 10) + '.csv';
        saveFile(name, toCSV(tab)).then(function (ok) { if (ok) AF.Toast.show('Planilha salva', 'green'); });
      });
      dash.querySelector('#tch-tsv').addEventListener('click', function () { copyText(toTSV(tab)); self.msg('Tabela copiada: cole no Google Planilhas ou no Excel.'); });
      var noex = dash.querySelector('#tch-noex');
      if (noex) noex.addEventListener('click', function () { saveClass(loadClass().filter(function (r) { return !r.exemplo; })); self.msg('Exemplos apagados.'); self.render(); });
      dash.querySelector('#tch-clear').addEventListener('click', function () {
        AF.UI.confirm('Apagar todos os relatórios guardados neste aparelho?', 'Apagar', function () { saveClass([]); self.filter = ''; self.render(); self.msg('Tudo apagado.'); });
      });
      dash.querySelectorAll('.tch-del').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var sid = b.getAttribute('data-sid');
          saveClass(loadClass().filter(function (r) { return r.sid !== sid; })); self.render();
        });
      });
      dash.querySelectorAll('.tch-tbl tbody tr').forEach(function (tr) {
        tr.addEventListener('click', function () { self.detail(list[+tr.getAttribute('data-i')], L); });
      });
    },
    detail: function (r, L) {
      var el = this.body.querySelector('#tch-detail');
      var ft = firstTry(r), stg = stageOf(r);
      var qline = function (t) {
        var o = (r.q || {})[t]; if (!o) return '';
        return Object.keys(o).map(function (k) {
          var v = o[k];
          return '<li class="' + (v[0] === 1 ? 'ok' : 'mag') + '">' + esc(L[t] && L[t][k] || (t + ' ' + k)) + ' — ' + (v[0] === 1 ? 'de primeira' : v[0] + ' tentativas') + (v[1] ? '<br><span class="dim">Escolheu: ' + esc(v[1]) + '</span>' : '') + '</li>';
        }).join('');
      };
      el.innerHTML = '<div class="tch-det"><h3>' + esc(r.nome || '(sem nome)') + ' <small class="dim">' + esc(r.turma || '') + ' · personagem ' + esc(r.per || '') + ' · relatório de ' + esc(String(r.data || '').slice(0, 10)) + '</small></h3>' +
        '<p>Etapa: <b>' + esc(stg.label) + '</b> · tempo ' + fmtMin(r.tempo) + ' · acertos de primeira ' + (ft.p === null ? '—' : ft.p + '%') + ' · ruído ' + (r.ruido || 0) + ' · glossário ' + (r.gl || 0) + ' conceitos</p>' +
        '<h4>Hipóteses iniciais</h4><ul>' + (AF.HIPOTESES || []).map(function (h) { var v = (r.hip || {})[h.id]; return '<li>' + esc(h.q) + '<br><span class="gold">' + (v === undefined ? '—' : esc(h.options[v])) + '</span></li>'; }).join('') + '</ul>' +
        '<h4>Respostas</h4><ul class="tch-ans">' + ['acaraje', 'quiz', 'codigo', 'sala', 'circuito', 'relatorio', 'mercado', 'aplicacao', 'jacobina'].map(qline).join('') + '</ul></div>';
      try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { /* ok */ }
    }
  };
})(window.AF);
