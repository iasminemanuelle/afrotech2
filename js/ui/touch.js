/* =========================================================================
 * touch.js — versão para celular: joystick virtual, botão de ação (E),
 * atalhos na tela, detecção de toque, tela cheia e textos de ajuda por toque.
 *
 * O modo toque liga sozinho em celulares/tablets. Para forçar:
 *   index.html?touch=1  (liga)   ·   index.html?touch=0  (desliga)
 * ou pelo Menu de pausa → "Controles na tela".
 * ========================================================================= */
(function (AF) {
  'use strict';
  var KEY = 'afrotech_touch';
  function $(id) { return document.getElementById(id); }
  function mq(q) { try { return window.matchMedia && window.matchMedia(q).matches; } catch (e) { return false; } }

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function detect() {
    var q = (location.search.match(/[?&]touch=([01])/) || [])[1];
    if (q) return q === '1';
    var p = stored();
    if (p === '1' || p === '0') return p === '1';
    var touchy = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
    return mq('(pointer: coarse)') || (touchy && !mq('(hover: hover)'));
  }

  var R = 46;        /* raio útil do joystick (px CSS) */
  var DEAD = 9;      /* zona morta */

  var T = AF.Touch = {
    on: false, visible: false, joy: null, aHeld: false,

    init: function () {
      this.on = detect();
      this.build();
      this.apply();
      var unlock = function () { AF.Audio.unlock(); };
      window.addEventListener('touchend', unlock, { passive: true });
      window.addEventListener('pointerdown', unlock, { passive: true });
      /* Notebook com tela de toque: o primeiro toque ativa os controles */
      window.addEventListener('touchstart', function () {
        if (!T.on && stored() !== '0') T.set(true, false);
      }, { passive: true });
      /* Evita zoom por gesto de pinça no iOS durante o jogo */
      document.addEventListener('gesturestart', function (e) { if (T.on) e.preventDefault(); });
    },

    build: function () {
      var root = $('touch');
      var base = $('t-base'), knob = $('t-knob'), zone = $('t-joy');

      zone.addEventListener('pointerdown', function (e) {
        if (T.joy || !T.visible) return;
        e.preventDefault();
        try { zone.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
        var zr = zone.getBoundingClientRect();
        T.joy = { id: e.pointerId, cx: e.clientX, cy: e.clientY, x: 0, y: 0 };
        base.style.left = (e.clientX - zr.left) + 'px';
        base.style.top = (e.clientY - zr.top) + 'px';
        base.classList.add('active');
        T.moveKnob(0, 0);
      });
      var move = function (e) {
        if (!T.joy || e.pointerId !== T.joy.id) return;
        e.preventDefault();
        var dx = e.clientX - T.joy.cx, dy = e.clientY - T.joy.cy;
        var d = Math.hypot(dx, dy);
        if (d > R) { dx = dx / d * R; dy = dy / d * R; }
        T.joy.x = dx; T.joy.y = dy;
        T.moveKnob(dx, dy);
      };
      var end = function (e) {
        if (!T.joy || e.pointerId !== T.joy.id) return;
        T.release();
      };
      zone.addEventListener('pointermove', move);
      zone.addEventListener('pointerup', end);
      zone.addEventListener('pointercancel', end);
      zone.addEventListener('lostpointercapture', end);

      /* Botão de ação: equivale a E / Espaço */
      var a = $('t-a');
      a.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        a.classList.add('down');
        AF.Input.virtual('interact');
      });
      var up = function () { a.classList.remove('down'); };
      a.addEventListener('pointerup', up); a.addEventListener('pointercancel', up); a.addEventListener('pointerleave', up);

      /* Atalhos: Ficha, Diário, Terminal, Menu */
      root.querySelectorAll('[data-act]').forEach(function (b) {
        b.addEventListener('click', function (e) {
          e.preventDefault();
          if (!T.visible) return;
          AF.Game.shortcut(b.getAttribute('data-act'));
        });
      });

      /* Balão "E Falar · Dandara" também é tocável */
      $('prompt').addEventListener('click', function () { if (T.on) AF.Input.virtual('interact'); });

      /* Nada de menu de contexto / seleção ao segurar */
      root.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    },

    moveKnob: function (dx, dy) {
      $('t-knob').style.transform = 'translate(' + Math.round(dx) + 'px,' + Math.round(dy) + 'px)';
    },

    release: function () {
      this.joy = null;
      var base = $('t-base');
      base.classList.remove('active');
      base.style.left = ''; base.style.top = '';
      this.moveKnob(0, 0);
      var I = AF.Input;
      I.axis = null;
      I.down.up = I.down.down = I.down.left = I.down.right = false;
    },

    /* chamado a cada quadro pelo laço principal */
    update: function () {
      if (!this.on) return;
      var G = AF.Game;
      var vis = G.mode === 'play' && !AF.UI.blocking();
      if (vis !== this.visible) {
        this.visible = vis;
        $('touch').classList.toggle('t-off', !vis);
        if (!vis && this.joy) this.release();
      }
      var hidden = G.mode !== 'play';
      if (hidden !== this._hidden) { this._hidden = hidden; $('touch').classList.toggle('hidden', hidden); }
      if (!vis) return;

      /* joystick → eixo analógico + direções (portais usam I.down) */
      var I = AF.Input;
      if (this.joy) {
        var x = this.joy.x, y = this.joy.y, d = Math.hypot(x, y);
        if (d < DEAD) { I.axis = null; I.down.up = I.down.down = I.down.left = I.down.right = false; }
        else {
          var nx = x / d, ny = y / d, m = Math.min(1, (d - DEAD) / (R - DEAD));
          I.axis = { x: nx * m, y: ny * m };
          I.down.right = nx > 0.38; I.down.left = nx < -0.38;
          I.down.down = ny > 0.38; I.down.up = ny < -0.38;
        }
      }

      /* botão E acende quando há algo para interagir */
      var tgt = AF.World && AF.World.target;
      var lbl = tgt ? (tgt.npc ? 'Falar' : 'Usar') : 'Agir';
      if (lbl !== this._lbl) {
        this._lbl = lbl;
        $('t-a-lbl').textContent = lbl;
        $('t-a').classList.toggle('ready', !!tgt);
      }
      var termOn = AF.State.flag && AF.State.d && AF.State.flag('terminal');
      if (termOn !== this._term) { this._term = termOn; $('t-term').classList.toggle('locked', !termOn); }
    },

    set: function (on, persist) {
      this.on = !!on;
      if (persist) { try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) { /* ok */ } }
      if (!on && this.joy) this.release();
      this.visible = false; this._hidden = undefined; this._lbl = null; this._term = undefined;
      this.apply();
      AF.Game.resize();
    },

    apply: function () {
      document.body.classList.toggle('touch', this.on);
      $('touch').classList.toggle('hidden', !this.on);
    },

    /* ---------- Tela cheia (só a partir de um toque/clique) ---------- */
    canFullscreen: function () {
      var d = document;
      return !!(d.fullscreenEnabled || d.webkitFullscreenEnabled);
    },
    isFullscreen: function () { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
    toggleFullscreen: function () {
      var d = document, el = d.documentElement;
      try {
        if (this.isFullscreen()) {
          var ex = d.exitFullscreen || d.webkitExitFullscreen;
          var p1 = ex && ex.call(d);
          if (p1 && p1.catch) p1.catch(function () {});
        } else {
          var rq = el.requestFullscreen || el.webkitRequestFullscreen;
          var p2 = rq && rq.call(el, { navigationUI: 'hide' });
          if (p2 && p2.catch) p2.catch(function () { AF.Toast.show('Tela cheia não permitida aqui', 'dim'); });
        }
      } catch (e) { AF.Toast.show('Tela cheia não permitida aqui', 'dim'); }
    },

    /* texto curto de "como avançar" conforme o dispositivo */
    advanceHint: function () { return this.on ? 'Toque para continuar' : '[E] ou clique para continuar'; }
  };
})(window.AF);
