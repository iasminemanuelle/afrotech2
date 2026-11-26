/* =========================================================================
 * create.js — tela inicial e criação de ficha (nome, aparência, classe,
 * distribuição de Créditos Quânticos nos atributos)
 * ========================================================================= */
(function (AF) {
  'use strict';
  var C = AF.CONFIG;
  function $(id) { return document.getElementById(id); }
  var NAMES = ['Zuri', 'Akin', 'Ayo', 'Nala', 'Kayode', 'Iara', 'Malik', 'Dara', 'Obá', 'Tainá', 'Kito', 'Luena'];

  /* ---------------- Tela de título ---------------- */
  AF.Title = {
    init: function () {
      $('btn-new').addEventListener('click', function () { AF.Game.openCreate(); });
      $('btn-continue').addEventListener('click', function () { AF.Game.continueGame(); });
      $('btn-help').addEventListener('click', function () { AF.Help.open(); });
      $('btn-teacher').addEventListener('click', function () { AF.Teacher.open(); });
      $('btn-about').addEventListener('click', function () {
        AF.UI.modal({ title: 'SOBRE', cls: 'modal-md', body:
          '<div class="about"><p><b>Afrotech — Volume 2: Silêncio no Canal Quântico</b> é a versão digital (protótipo MVP) de um RPG de mesa educativo ambientado numa Salvador afrofuturista em 2495.</p>' +
          '<p>Conteúdos: <b>qubit vs. bit</b>, <b>superposição</b>, <b>medição</b>, <b>emaranhamento</b> e o <b>protocolo de teletransporte quântico</b> com correção por portas X e Z.</p>' +
          '<p>O simulador usa um vetor de estado real de 3 qubits: os bits medidos são sorteados pela regra de Born e a fidelidade é calculada de verdade.</p>' +
          '<p>Narrativa, falas e sequência didática baseadas no produto educacional e na dissertação de <b>Iasmin Emanuelle Santos Silva</b> (MNPEF · Polo 60 · UNEB), com orientação de José Carlos Oliveira de Jesus e coorientação de Marco Antônio Silva Trindade, estruturadas pelos Três Momentos Pedagógicos.</p>' +
          '<p class="dim">HTML5 + CSS3 + JavaScript puro. Toda a pixel art e os sons são gerados por código. Versão ' + C.VERSION + '.</p></div>' });
      });
    },
    show: function () {
      $('screen-title').classList.remove('hidden');
      $('btn-continue').disabled = !AF.State.hasSave();
    },
    hide: function () { $('screen-title').classList.add('hidden'); }
  };

  /* ---------------- Criação de ficha ---------------- */
  var CR = AF.Create = {
    st: null, iv: 0,

    init: function () {
      $('c-back').addEventListener('click', function () { CR.hide(); AF.Game.mode = 'title'; AF.Title.show(); });
      $('c-start').addEventListener('click', function () { CR.start(); });
      $('c-preset').addEventListener('click', function () { CR.applyPreset(); });
      $('c-reset').addEventListener('click', function () { AF.ATTRS.forEach(function (a) { CR.st.attrs[a.id] = 0; }); CR.render(); });
      $('c-random').addEventListener('click', function () { $('c-name').value = NAMES[Math.floor(Math.random() * NAMES.length)]; });
      $('c-name').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); this.blur(); } });
    },

    show: function () {
      this.st = {
        classId: 'cientista',
        look: { skin: 's1', hair: 'afro', accent: 'ciano' },
        attrs: {}
      };
      $('c-name').value = NAMES[Math.floor(Math.random() * NAMES.length)];
      this.applyPreset();
      $('screen-create').classList.remove('hidden');
      var dirs = ['down', 'right', 'up', 'left'], tick = 0;
      clearInterval(this.iv);
      this.iv = setInterval(function () {
        tick++;
        CR.drawPreview(dirs[Math.floor(tick / 8) % 4], [1, 0, 2, 0][tick % 4]);
      }, 140);
    },
    hide: function () { $('screen-create').classList.add('hidden'); clearInterval(this.iv); },

    spent: function () {
      var s = 0, a = this.st.attrs;
      AF.ATTRS.forEach(function (at) { s += (a[at.id] || 0) * at.cost; });
      return s;
    },
    remaining: function () { return C.START_CREDITS - this.spent(); },

    applyPreset: function () {
      var p = AF.CLASS_BY_ID[this.st.classId].preset;
      var self = this;
      AF.ATTRS.forEach(function (a) { self.st.attrs[a.id] = p[a.id] || 0; });
      this.render();
    },

    drawPreview: function (dir, f) {
      var cv = $('c-preview');
      if (!this._frames || this._lookKey !== JSON.stringify(this.st.look)) {
        this._frames = AF.Chars.build(AF.Chars.playerSpec(this.st.look));
        this._lookKey = JSON.stringify(this.st.look);
      }
      var ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(this._frames[dir || 'down'][f || 0], 0, 0);
    },

    render: function () {
      var st = this.st, self = this;
      /* aparência */
      var sk = $('c-skins'); sk.innerHTML = '';
      AF.LOOKS.skins.forEach(function (s) {
        var b = AF.el('button', 'swatch' + (st.look.skin === s.id ? ' on' : ''));
        b.style.background = s.base; b.title = s.name;
        b.addEventListener('click', function () { st.look.skin = s.id; self.render(); });
        sk.appendChild(b);
      });
      var hr = $('c-hairs'); hr.innerHTML = '';
      AF.LOOKS.hairs.forEach(function (h) {
        var b = AF.el('button', 'opt' + (st.look.hair === h.id ? ' on' : ''), h.name);
        b.addEventListener('click', function () { st.look.hair = h.id; self.render(); });
        hr.appendChild(b);
      });
      var ac = $('c-accents'); ac.innerHTML = '';
      AF.LOOKS.accents.forEach(function (a) {
        var b = AF.el('button', 'swatch' + (st.look.accent === a.id ? ' on' : ''));
        b.style.background = a.color; b.title = a.name;
        b.addEventListener('click', function () { st.look.accent = a.id; self.render(); });
        ac.appendChild(b);
      });
      this.drawPreview('down', 0);

      /* classes */
      var cl = $('c-classes'); cl.innerHTML = '';
      AF.CLASSES.forEach(function (c) {
        var b = AF.el('button', 'class-card' + (st.classId === c.id ? ' on' : ''));
        b.innerHTML = '<div class="cc-name">' + c.name + '</div><div class="cc-desc">' + c.desc + '</div><div class="cc-perk">' + c.perk + '</div>';
        b.addEventListener('click', function () { st.classId = c.id; self.applyPreset(); });
        cl.appendChild(b);
      });

      /* atributos */
      var rem = this.remaining();
      $('c-credits').textContent = rem;
      var at = $('c-attrs'); at.innerHTML = '';
      var cls = AF.CLASS_BY_ID[st.classId];
      AF.ATTRS.forEach(function (a) {
        var lvl = st.attrs[a.id] || 0, cb = (cls.testBonus && cls.testBonus[a.id]) || 0;
        var row = AF.el('div', 'c-attr');
        var pips = '';
        for (var i = 0; i < C.MAX_LEVEL; i++) pips += '<i class="' + (i < lvl ? 'on' : '') + '"></i>';
        row.innerHTML = '<div class="ca-name">' + a.name + ' <small>' + a.cost + ' CQ/nível</small><div class="ca-desc">' + a.desc + '</div></div>' +
          '<button class="btn btn-sm ca-minus"' + (lvl <= 0 ? ' disabled' : '') + '>−</button>' +
          '<div class="a-pips">' + pips + '</div>' +
          '<button class="btn btn-sm ca-plus"' + (lvl >= C.MAX_LEVEL || rem < a.cost ? ' disabled' : '') + '>+</button>' +
          '<div class="ca-mod">+' + (lvl + cb) + (cb ? '<small>★</small>' : '') + '</div>';
        row.querySelector('.ca-minus').addEventListener('click', function () { if (st.attrs[a.id] > 0) { st.attrs[a.id]--; self.render(); } });
        row.querySelector('.ca-plus').addEventListener('click', function () {
          if ((st.attrs[a.id] || 0) < C.MAX_LEVEL && self.remaining() >= a.cost) { st.attrs[a.id] = (st.attrs[a.id] || 0) + 1; self.render(); }
        });
        at.appendChild(row);
      });
      var inv = st.attrs.investimento || 0;
      var stab = C.BASE_STABILITY + 10 * (st.attrs.armazenamento || 0) + (cls.stabilityBonus || 0);
      var bonus = cls.bonusCredits || 0;
      $('c-summary').innerHTML = 'Estabilidade inicial <b>' + stab + '</b> · Reserva de Créditos <b class="gold">' + (rem + inv * 3 + bonus) + ' CQ</b>' +
        ((inv || bonus) ? ' <small>(sobra ' + rem + (inv ? ' + Investimento ' + inv * 3 : '') + (bonus ? ' + classe ' + bonus : '') + ')</small>' : '');
    },

    start: function () {
      var name = ($('c-name').value || '').trim().slice(0, 16) || 'Agente';
      var st = this.st;
      AF.State.newGame({
        name: name, classId: st.classId, look: Object.assign({}, st.look), attrs: Object.assign({}, st.attrs),
        credits: this.remaining() + 3 * (st.attrs.investimento || 0) + (AF.CLASS_BY_ID[st.classId].bonusCredits || 0)
      });
      this.hide();
      AF.Game.startNew();
    }
  };
})(window.AF);
