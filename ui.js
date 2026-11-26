/* =========================================================================
 * ui.js — gerenciador de modais, notificações (toasts) e efeitos de tela
 * ========================================================================= */
(function (AF) {
  'use strict';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  AF.el = el;
  AF.esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  };

  /* ---------- Modais empilháveis ---------- */
  var UI = AF.UI = {
    stack: [],

    /* opts: { title, cls, body (Element|string), closable, onClose, onKey, wide } */
    modal: function (opts) {
      var overlay = el('div', 'modal-overlay' + (opts.overlayCls ? ' ' + opts.overlayCls : ''));
      var panel = el('div', 'modal-panel px-panel' + (opts.cls ? ' ' + opts.cls : ''));
      if (opts.title) {
        var head = el('div', 'modal-head');
        head.appendChild(el('div', 'modal-title', opts.title));
        if (opts.closable !== false) {
          var x = el('button', 'btn btn-x', '✕');
          x.title = 'Fechar (Esc)';
          x.addEventListener('click', function () { m.close(); });
          head.appendChild(x);
        }
        panel.appendChild(head);
      }
      var body = el('div', 'modal-body');
      if (typeof opts.body === 'string') body.innerHTML = opts.body; else if (opts.body) body.appendChild(opts.body);
      panel.appendChild(body);
      overlay.appendChild(panel);
      document.getElementById('modal-root').appendChild(overlay);

      var m = {
        el: overlay, panel: panel, body: body, opts: opts, closed: false,
        close: function (silent) {
          if (m.closed) return;
          m.closed = true;
          overlay.remove();
          var i = UI.stack.indexOf(m);
          if (i >= 0) UI.stack.splice(i, 1);
          if (!silent) AF.Audio.play('close');
          if (opts.onClose) opts.onClose();
        },
        onKey: function (e, a) {
          if (opts.onKey && opts.onKey(e, a) === true) return;
          if (a === 'menu' && opts.closable !== false) m.close();
        }
      };
      UI.stack.push(m);
      if (!opts.silent) AF.Audio.play('open');
      return m;
    },

    top: function () { return this.stack[this.stack.length - 1] || null; },
    blocking: function () { return this.stack.length > 0 || (AF.Dialogue && AF.Dialogue.active) || AF.Game.transitioning; },

    handleKey: function (e, a) {
      var t = this.top();
      if (t) { t.onKey(e, a); return true; }
      if (AF.Game.mode !== 'play') return false;
      if (AF.Dialogue && AF.Dialogue.active) { AF.Dialogue.onKey(e, a); return true; }
      return false;
    },

    closeAll: function () {
      while (this.stack.length) this.stack[this.stack.length - 1].close(true);
    },

    confirm: function (text, okLabel, onOk) {
      var body = el('div', 'confirm');
      body.appendChild(el('p', '', text));
      var row = el('div', 'btn-row');
      var no = el('button', 'btn', 'Cancelar');
      var yes = el('button', 'btn primary', okLabel || 'Confirmar');
      row.appendChild(no); row.appendChild(yes); body.appendChild(row);
      var m = UI.modal({ title: 'Confirmar', body: body, cls: 'modal-sm' });
      no.onclick = function () { m.close(); };
      yes.onclick = function () { m.close(true); onOk(); };
      return m;
    }
  };

  /* ---------- Notificações ---------- */
  AF.Toast = {
    show: function (text, kind) {
      var box = document.getElementById('toasts');
      if (!box) return;
      var t = el('div', 'toast toast-' + (kind || 'cyan'), AF.esc(text));
      box.appendChild(t);
      var max = 2;   /* no máximo 2 avisos por vez, para não cobrir a cena */
      while (box.children.length > max) box.firstChild.remove();
      setTimeout(function () { t.classList.add('out'); }, 2600);
      setTimeout(function () { t.remove(); }, 3100);
    }
  };

  /* ---------- Efeitos de tela (ruído quântico, decoerência) ---------- */
  AF.FX = {
    glitch: 0, shake: 0,
    ruido: function (n) {
      this.glitch = Math.min(0.6, 0.18 + n * 0.02);
      this.shake = Math.min(0.5, 0.1 + n * 0.015);
      var f = document.getElementById('fx-flash');
      f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
      AF.Audio.play('glitch');
    },
    fade: function (toBlack, ms) {
      var f = document.getElementById('fx-fade');
      f.style.transitionDuration = (ms || 260) + 'ms';
      f.classList.toggle('on', !!toBlack);
    },
    update: function (dt) {
      this.glitch = Math.max(0, this.glitch - dt);
      this.shake = Math.max(0, this.shake - dt);
    }
  };

  AF.Bus.on('ruido', function (d) {
    AF.FX.ruido(d.n);
    AF.Toast.show('Ruído quântico! −' + d.n + ' Estabilidade' + (d.reason ? ' · ' + d.reason : ''), 'magenta');
  });
})(window.AF);
