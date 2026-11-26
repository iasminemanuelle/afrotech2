/* =========================================================================
 * dialogue.js — motor de diálogos com máquina de escrever, escolhas,
 * opções bloqueadas por atributo e testes de 2d6 integrados
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;
  var portraitCache = {};

  function $(id) { return document.getElementById(id); }

  function subst(str) {
    if (!S.d) return str;
    return String(str)
      .replace(/\{name\}/g, S.d.name)
      .replace(/\{NAME\}/g, S.d.name.toUpperCase())
      .replace(/\{cls\}/g, S.cls.name)
      .replace(/\{stab\}/g, Math.round(S.d.stability))
      .replace(/\{max\}/g, S.maxStability())
      .replace(/\{cq\}/g, S.d.credits)
      .replace(/\{cost\}/g, AF.oracleCost())
      .replace(/\{table\}/g, S.tableProgress());
  }
  AF.subst = subst;

  function portraitFor(sp) {
    if (!sp) return null;
    if (sp.player) return AF.Chars.portrait(AF.Chars.playerSpec(S.d.look));
    if (sp.spec) {
      if (!portraitCache[sp.spec]) portraitCache[sp.spec] = AF.Chars.portrait(AF.SPECS[sp.spec]);
      return portraitCache[sp.spec];
    }
    if (sp.portrait) return AF.Art.portrait(sp.portrait);
    return null;
  }

  var D = AF.Dialogue = {
    active: false, script: null, node: null,
    full: '', shown: 0, typing: false, visible: [], sel: 0, busy: false, onDone: null,

    start: function (id, onDone) {
      var sc = AF.DIALOGUES[id];
      if (!sc) { console.warn('Diálogo inexistente', id); return; }
      this.script = sc; this.active = true; this.onDone = onDone || null;
      $('dialogue').classList.remove('hidden');
      AF.Input.clear();
      this.go(sc.start || 'a');
    },

    go: function (id) {
      if (!this.active) return;
      if (!id) { this.close(); return; }
      var n = this.script.nodes[id];
      if (!n) { this.close(); return; }
      if (n.redirect) {
        var to = n.redirect(S);
        if (!this.active) return;
        this.go(to);
        return;
      }
      this.node = n;
      if (S.d && S.d.res && this.script === AF.DIALOGUES.oraculo_terminal && /^f_/.test(id)) S.d.res.ora[id] = 1;
      if (n.onEnter) n.onEnter(S, this);
      if (!this.active) return;

      var sp = AF.SPEAKERS[n.speaker] || AF.SPEAKERS.narrador;
      var pc = portraitFor(sp);
      var pbox = $('dlg-portrait-box');
      if (pc) {
        pbox.classList.remove('hidden');
        var cv = $('dlg-portrait'), cx = cv.getContext('2d');
        cx.imageSmoothingEnabled = false; cx.clearRect(0, 0, 16, 16); cx.drawImage(pc, 0, 0);
      } else pbox.classList.add('hidden');
      $('dlg-name').textContent = subst(sp.name || '');
      $('dialogue').classList.toggle('narrator', !sp.name);

      var text = typeof n.text === 'function' ? n.text(S) : n.text;
      this.full = subst(text || '');
      this.shown = 0; this.typing = true;
      $('dlg-text').textContent = '';
      $('dlg-choices').innerHTML = '';
      $('dlg-more').classList.add('hidden');
    },

    update: function (dt) {
      if (!this.active || !this.typing) return;
      var before = Math.floor(this.shown);
      this.shown = Math.min(this.full.length, this.shown + dt * 75);
      var now = Math.floor(this.shown);
      if (now !== before) {
        $('dlg-text').textContent = this.full.slice(0, now);
        if (now % 3 === 0) AF.Audio.play('blip');
      }
      if (this.shown >= this.full.length) this.finishTyping();
    },

    finishTyping: function () {
      this.typing = false;
      this.readyAt = performance.now() + 220;   /* evita escolher sem querer ao pular o texto */
      $('dlg-text').textContent = this.full;
      this.showChoices();
    },

    showChoices: function () {
      var n = this.node, box = $('dlg-choices');
      box.innerHTML = '';
      var list = (n.choices || []).filter(function (c) { return !c.if || c.if(S); });
      if (!list.length) list = [{ t: n.next ? 'Continuar' : 'Encerrar', next: n.next, close: !n.next, auto: true }];
      this.visible = list;
      this.sel = 0;
      var self = this;
      list.forEach(function (c, i) {
        var b = AF.el('button', 'dlg-choice');
        var locked = c.req && S.level(c.req.attr) < c.req.min;
        c._locked = locked;
        var chip = '';
        if (c.test) {
          var dc = typeof c.test.dc === 'function' ? c.test.dc(S) : c.test.dc;
          var bonus = AF.Dialogue.testBonus(c.test);
          var m = S.mod(c.test.attr) + bonus;
          chip = '<span class="chip chip-test">' + AF.ATTR_BY_ID[c.test.attr].short + ' ' + (m >= 0 ? '+' : '') + m + ' · DIF ' + dc + '</span>';
        } else if (c.req) {
          chip = '<span class="chip ' + (locked ? 'chip-lock' : 'chip-req') + '">' + (locked ? 'REQUER ' : '') +
                 AF.ATTR_BY_ID[c.req.attr].name.toUpperCase() + ' ' + c.req.min + '</span>';
        }
        b.innerHTML = '<span class="num">' + (c.auto ? '▶' : (i + 1)) + '</span>' + chip + '<span class="ct">' + AF.esc(subst(c.t)) + '</span>';
        if (locked) { b.classList.add('locked'); b.title = 'Requer ' + AF.ATTR_BY_ID[c.req.attr].name + ' ' + c.req.min; }
        b.addEventListener('click', function () { self.choose(i); });
        b.addEventListener('mouseenter', function () { self.select(i); });
        box.appendChild(b);
      });
      this.select(0);
    },

    select: function (i) {
      var kids = $('dlg-choices').children;
      if (!kids.length) return;
      this.sel = (i + kids.length) % kids.length;
      for (var k = 0; k < kids.length; k++) kids[k].classList.toggle('sel', k === this.sel);
    },

    choose: function (i) {
      if (this.busy || this.typing) return;
      var c = this.visible[i];
      if (!c) return;
      if (c._locked) {
        AF.Toast.show('Requer ' + AF.ATTR_BY_ID[c.req.attr].name + ' nível ' + c.req.min + ' (invista Créditos no Oráculo)', 'dim');
        AF.Audio.play('hurt');
        return;
      }
      AF.Audio.play('select');
      var self = this;
      if (c.test) {
        this.busy = true;
        $('dlg-choices').innerHTML = '';
        var dc = typeof c.test.dc === 'function' ? c.test.dc(S) : c.test.dc;
        var bonus = AF.Dialogue.testBonus(c.test);
        AF.Dice.roll({ attr: c.test.attr, dc: dc, bonus: bonus, label: subst(c.t) }).then(function (r) {
          self.busy = false;
          if (!r.success && c.test.ruido) S.damage(c.test.ruido + (r.crit === 'fail' ? 4 : 0), c.test.reason);
          if (r.success) S.addCredits(1, true);
          if (!self.active) return;
          self.go(r.success ? c.test.success : c.test.fail);
        });
        return;
      }
      if (c.close) {
        this.close();
        if (c.action) c.action(S);
        return;
      }
      if (c.action) c.action(S);
      this.go(c.next);
    },

    /* bônus situacional: dicas de NPCs + Armazenamento em "resolução de problemas" (manual) */
    testBonus: function (t) {
      var b = t.bonus ? t.bonus(S) : 0;
      if (t.problem && S.level('armazenamento') >= 1 && t.attr !== 'armazenamento') b += 1;
      return b;
    },

    closeThen: function (fn) {
      this.close();
      setTimeout(fn, 0);
    },

    close: function () {
      if (!this.active) return;
      this.active = false; this.busy = false; this.typing = false;
      $('dialogue').classList.add('hidden');
      AF.Input.clear();
      var cb = this.onDone; this.onDone = null;
      if (cb) cb();
      AF.Bus.emit('hud');
    },

    onKey: function (e, a) {
      if (this.busy) return;
      if (this.typing) {
        if (a === 'interact' || e.type === 'click') this.finishTyping();
        return;
      }
      if (a === 'interact') { if (performance.now() >= (this.readyAt || 0)) this.choose(this.sel); return; }
      if (a === 'up' || a === 'left') { this.select(this.sel - 1); return; }
      if (a === 'down' || a === 'right') { this.select(this.sel + 1); return; }
      if (a === 'menu') {
        var last = this.visible[this.visible.length - 1];
        if (last && (last.close || last.auto)) this.choose(this.visible.length - 1);
        return;
      }
      var num = parseInt(e.key, 10);
      if (num >= 1 && num <= this.visible.length) this.choose(num - 1);
    }
  };

  /* Clique no texto acelera a máquina de escrever */
  document.addEventListener('DOMContentLoaded', function () {
    var t = $('dlg-text');
    if (t) t.addEventListener('click', function () { if (D.typing) D.finishTyping(); });
    /* Toque em qualquer parte da caixa: pula o texto ou segue quando só há "Continuar" */
    var box = $('dialogue');
    if (box) box.addEventListener('click', function (e) {
      if (!D.active || D.busy) return;
      if (e.target.closest && e.target.closest('button')) return;
      if (D.typing) { D.finishTyping(); return; }
      var v = D.visible || [];
      if (v.length === 1 && v[0].auto && performance.now() >= (D.readyAt || 0)) D.choose(0);
    });
  });
})(window.AF);
