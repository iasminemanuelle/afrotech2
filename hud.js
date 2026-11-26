/* =========================================================================
 * hud.js — HUD: estabilidade, créditos, objetivo, atalhos e balão de interação
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;
  function $(id) { return document.getElementById(id); }

  var H = AF.HUD = {
    open: false, pinned: false, docked: false, _obj: null, _o: null,

    init: function () {
      document.querySelectorAll('#hud [data-act]').forEach(function (b) {
        b.addEventListener('click', function () { AF.Game.shortcut(b.getAttribute('data-act')); });
      });
      /* Objetivo: sempre visível na faixa do HUD (fora da cena); clique abre o Diário */
      $('hud-objbox').addEventListener('click', function () { AF.Game.shortcut('journal'); });
      AF.Bus.on('hud', function () { H.refresh(); });
      AF.Bus.on('flags', function () { H.refresh(); });
    },
    show: function (on) {
      $('hud').classList.toggle('hidden', !on);
      if (on) { this._obj = null; this.pinned = false; }
    },
    refresh: function () {
      if (!S.d) return;
      var max = S.maxStability(), st = Math.round(S.d.stability);
      var pct = Math.max(0, Math.min(100, st / max * 100));
      var fill = $('hud-stab-fill');
      fill.style.width = pct + '%';
      fill.className = pct < 30 ? 'crit' : (pct < 60 ? 'warn' : '');
      $('hud-stab-text').textContent = st + '/' + max;
      $('hud-cq').textContent = S.d.credits;
      var o = AF.Game.objective();
      this._o = o;
      if (o.text !== this._obj) {
        var first = this._obj === null;
        this._obj = o.text;
        $('hud-obj').textContent = o.text;
        $('hud-objbox').title = o.act + ' — ' + o.text + ' (clique para abrir o Diário)';
        if (!first) this.flash();   /* objetivo novo: a faixa pisca para chamar atenção */
      }
      this.objUI();
      $('hud-term').classList.toggle('locked', !S.flag('terminal'));
    },

    /* ---------- Objetivo (sempre aberto, fora da cena) ---------- */
    objUI: function () {
      var o = this._o; if (!o) return;
      var shortAct = AF.Touch && AF.Touch.on && !this.docked;
      $('hud-objbox').classList.add('open');
      $('hud-act').textContent = shortAct ? o.act.split(' · ')[0] : o.act;
      $('hud-tog').textContent = '';
    },
    flash: function () {
      var b = $('hud-objbox');
      b.classList.remove('new'); void b.offsetWidth; b.classList.add('new');
      clearTimeout(this._ft);
      this._ft = setTimeout(function () { b.classList.remove('new'); }, 2600);
    },
    peek: function () { this.flash(); },
    toggleObj: function () { this.flash(); AF.Audio.play('select'); },

    /* ---------- Onde o HUD fica ----------
     * desktop e celular deitado: faixa acima da cena (#hud-top)
     * celular em pé: status e objetivo descem para o deck de controles
     * Em nenhum caso o HUD fica por cima da sala. */
    layout: function () {
      var portrait = document.body.classList.contains('portrait');
      var st = $('hud-status'), ob = $('hud-objbox'), dock = $('t-dock'), top = $('hud-top');
      if (portrait && st.parentNode !== dock) { dock.appendChild(st); dock.appendChild(ob); }
      if (!portrait && st.parentNode !== top) { top.insertBefore(ob, top.firstChild); top.insertBefore(st, top.firstChild); }
      this.docked = portrait;
      this._fadeEls = null;
      this.objUI();
    },

    /* Celular deitado: joystick e botão E ficam sobre a cena; se o personagem (ou o que ele
     * vai usar) passa por trás deles, eles ficam quase transparentes */
    fade: function () {
      var els = this._fadeEls;
      if (!els) {
        els = this._fadeEls = [$('t-a'), $('t-base')].filter(function (e) { return !!e; });
      }
      if (!document.body.classList.contains('landscape')) {
        for (var j = 0; j < els.length; j++) if (els[j]._behind) { els[j]._behind = false; els[j].classList.remove('behind'); }
        return;
      }
      var W = AF.World, p = W.player;
      var active = AF.Game.mode === 'play' && p && !AF.UI.blocking();
      var sr = active ? $('stage').getBoundingClientRect() : null, sc = AF.Game.scale;
      var boxes = [];
      if (active) {
        boxes.push([sr.left + (p.x - 10 - W.cam.x) * sc, sr.top + (p.y - 24 - W.cam.y) * sc, sr.left + (p.x + 10 - W.cam.x) * sc, sr.top + (p.y + 3 - W.cam.y) * sc]);
        var tp = W.target && W.targetScreenPos();
        if (tp) boxes.push([sr.left + (tp.x - 10) * sc, sr.top + (tp.y - 4) * sc, sr.left + (tp.x + 10) * sc, sr.top + (tp.y + 18) * sc]);
      }
      for (var i = 0; i < els.length; i++) {
        var el = els[i], hit = false;
        if (active) {
          var r = el.getBoundingClientRect();
          if (r.width) for (var k = 0; k < boxes.length && !hit; k++) {
            var bx = boxes[k];
            hit = !(bx[2] < r.left - 4 || bx[0] > r.right + 4 || bx[3] < r.top - 4 || bx[1] > r.bottom + 4);
          }
        }
        if (el.id === 't-base' && AF.Touch && AF.Touch.joy) hit = false;
        if (hit !== !!el._behind) { el._behind = hit; el.classList.toggle('behind', hit); }
      }
    },

    banner: function (title, sub) {
      var b = $('banner');
      b.innerHTML = '<div class="b-title">' + AF.esc(title) + '</div><div class="b-sub">' + AF.esc(sub || '') + '</div>';
      b.classList.remove('hidden', 'show'); void b.offsetWidth; b.classList.add('show');
      clearTimeout(H._bt);
      H._bt = setTimeout(function () { b.classList.add('hidden'); b.classList.remove('show'); }, 3200);
    },
    updatePrompt: function () {
      this.fade();
      var pr = $('prompt');
      var W = AF.World;
      if (AF.Game.mode !== 'play' || AF.UI.blocking() || !W.target) { pr.classList.add('hidden'); return; }
      var pos = W.targetScreenPos();
      if (!pos) { pr.classList.add('hidden'); return; }
      var s = AF.Game.scale;
      var label = W.target.label || (W.target.npc ? 'Falar' : 'Interagir');
      var verb = W.target.npc ? 'Falar' : 'Interagir';
      var html = (AF.Touch && AF.Touch.on) ? '<b>E</b> ' + AF.esc(W.target.label || verb)
        : '<b>E</b> ' + verb + (W.target.label ? ' · ' + AF.esc(label) : '');
      if (pr._html !== html) { pr.innerHTML = html; pr._html = html; }
      pr.style.left = Math.round(pos.x * s) + 'px';
      pr.style.top = Math.round(pos.y * s) + 'px';
      pr.classList.remove('hidden');
    }
  };
})(window.AF);
