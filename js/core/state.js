/* =========================================================================
 * state.js — estado do jogo, barramento de eventos, salvar/carregar
 * ========================================================================= */
(function (AF) {
  'use strict';
  var C = AF.CONFIG;

  /* ---------- Barramento de eventos simples ---------- */
  AF.Bus = {
    h: {},
    on: function (evt, fn) { (this.h[evt] = this.h[evt] || []).push(fn); },
    emit: function (evt, data) { (this.h[evt] || []).forEach(function (fn) { fn(data); }); }
  };

  function rid() { return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); }
  function newRes() { return { sid: rid(), t0: Date.now(), q: {}, mg: {}, ms: {}, ora: {} }; }

  /* marcos da missão: guarda o tempo de jogo (s) em que cada um foi alcançado */
  var MILESTONES = ['acarajeQ', 'gateOpen', 'visitedTower', 'metDandara', 'lousaRead', 'quizDone', 'tableDone', 'codeDecoded',
    'protocolo', 'circuitBuilt', 'validated', 'restored', 'miniElevador', 'miniMercado', 'hohenfeldQuote', 'hohenfeldStory', 'jacobina', 'jacobinaDone'];
  AF.MILESTONES = MILESTONES;
  AF.Bus.on('flags', function (k) {
    var d = AF.State.d;
    if (!d || !d.res || MILESTONES.indexOf(k) < 0 || d.res.ms[k] !== undefined) return;
    d.res.ms[k] = Math.round(d.stats.playTime);
  });

  var S = AF.State = {
    d: null,

    newGame: function (ch) {
      this.d = {
        version: C.VERSION,
        name: ch.name,
        classId: ch.classId,
        look: ch.look,
        attrs: Object.assign({}, ch.attrs),
        credits: ch.credits,
        stability: 0,
        map: 'praca', x: 0, y: 0, dir: 'down',
        flags: {},
        counters: {},
        journal: [],
        glossary: {},
        rolls: [],
        hyp: {},
        role: null,
        table: { '00': null, '01': null, '10': null, '11': null },
        simFails: { '00': 0, '01': 0, '10': 0, '11': 0 },
        simHistogram: { '00': 0, '01': 0, '10': 0, '11': 0 },
        stats: { rolls: 0, successes: 0, fails: 0, ruido: 0, simRounds: 0, simCorrect: 0,
                 quizErrors: 0, playTime: 0, decoherences: 0 },
        student: { nome: '', turma: '' },
        res: newRes()
      };
      this.d.stability = this.maxStability();
    },

    get cls() { return AF.CLASS_BY_ID[this.d.classId]; },
    level: function (id) { return this.d.attrs[id] || 0; },
    classBonus: function (id) { return (this.cls.testBonus && this.cls.testBonus[id]) || 0; },
    mod: function (id) { return this.level(id) + this.classBonus(id); },
    maxStability: function () {
      return C.BASE_STABILITY + 10 * this.level('armazenamento') + (this.cls.stabilityBonus || 0);
    },

    /* Erro como "Ruído Quântico": perde estabilidade, nunca morte instantânea */
    damage: function (n, reason) {
      if (!this.d || n <= 0) return;
      this.d.stability = Math.max(0, this.d.stability - n);
      this.d.stats.ruido += n;
      AF.Bus.emit('ruido', { n: n, reason: reason || '' });
      AF.Bus.emit('hud');
      if (this.d.stability <= 0) AF.Bus.emit('decoherence');
    },
    heal: function (n) {
      this.d.stability = Math.min(this.maxStability(), this.d.stability + n);
      AF.Bus.emit('hud');
    },
    addCredits: function (n, silent) {
      this.d.credits = Math.max(0, this.d.credits + n);
      if (!silent && n !== 0) AF.Toast.show((n > 0 ? '+' : '') + n + ' Créditos Quânticos', n > 0 ? 'gold' : 'dim');
      AF.Bus.emit('hud');
    },

    flag: function (k) { return !!(this.d && this.d.flags[k]); },
    setFlag: function (k, v) {
      this.d.flags[k] = (v === undefined) ? true : v;
      AF.Bus.emit('flags', k);
      AF.Bus.emit('hud');
    },
    count: function (k) { return this.d.counters[k] || 0; },
    inc: function (k) { this.d.counters[k] = (this.d.counters[k] || 0) + 1; return this.d.counters[k]; },

    addJournal: function (title, text, cronica) {
      if (this.d.journal.some(function (j) { return j.title === title; })) return;
      var entry = { title: title, text: text, act: AF.Game.act(), t: Math.floor(this.d.stats.playTime) };
      if (cronica && this.d.classId === 'cronista') entry.cronica = cronica;
      this.d.journal.push(entry);
      AF.Toast.show('Diário de Bordo: ' + title, 'cyan');
      AF.Audio.play('note');
    },
    unlock: function (id) {
      if (!AF.GLOSSARY[id] || this.d.glossary[id]) return;
      this.d.glossary[id] = true;
      AF.Toast.show('Glossário Quântico: ' + AF.GLOSSARY[id].term, 'green');
    },
    logRoll: function (r) {
      this.d.rolls.unshift(r);
      if (this.d.rolls.length > 40) this.d.rolls.pop();
      this.d.stats.rolls++;
      if (r.success) this.d.stats.successes++; else this.d.stats.fails++;
    },
    /* ---------- Resultados para o modo professor(a) ----------
     * record(trilha, item, tentativas, escolha): guarda só a 1ª vez que o item foi concluído
     *   tentativas = 1 → acertou de primeira */
    record: function (track, idx, tries, pick) {
      if (!this.d) return;
      var r = this.d.res, t = r.q[track] = r.q[track] || {};
      if (t[idx]) return;
      t[idx] = pick === undefined ? [tries] : [tries, String(pick).slice(0, 90)];
    },
    mg: function (key, obj) {
      if (!this.d) return;
      var m = this.d.res.mg[key] = this.d.res.mg[key] || {};
      for (var k in obj) m[k] = obj[k];
    },
    tableProgress: function () {
      var t = this.d.table;
      return ['00', '01', '10', '11'].filter(function (k) { return !!t[k]; }).length;
    },

    /* ---------- Persistência (localStorage) ---------- */
    save: function () {
      if (!this.d) return false;
      try {
        var p = AF.World.player;
        if (p) { this.d.map = AF.World.mapId; this.d.x = p.x; this.d.y = p.y; this.d.dir = p.dir; }
        localStorage.setItem(C.SAVE_KEY, JSON.stringify(this.d));
        return true;
      } catch (e) { return false; }
    },
    hasSave: function () {
      try { return !!localStorage.getItem(C.SAVE_KEY); } catch (e) { return false; }
    },
    load: function () {
      try {
        var raw = localStorage.getItem(C.SAVE_KEY);
        if (!raw) return false;
        var d = JSON.parse(raw);
        if (!d || !d.classId || !AF.CLASS_BY_ID[d.classId]) return false;
        d.hyp = d.hyp || {}; d.counters = d.counters || {}; d.flags = d.flags || {};
        d.simFails = d.simFails || { '00': 0, '01': 0, '10': 0, '11': 0 };
        d.simHistogram = d.simHistogram || { '00': 0, '01': 0, '10': 0, '11': 0 };
        d.student = d.student || { nome: '', turma: '' };
        d.res = d.res || newRes();
        this.d = d;
        return true;
      } catch (e) { return false; }
    },
    clearSave: function () { try { localStorage.removeItem(C.SAVE_KEY); } catch (e) { /* ok */ } }
  };
})(window.AF);
