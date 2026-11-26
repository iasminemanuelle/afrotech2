/* =========================================================================
 * input.js — teclado (WASD/setas, E/Espaço, Esc/Tab, atalhos) e ações virtuais (toque)
 * Os modais (UI) recebem as teclas primeiro; o mundo só lê o que sobrar.
 * ========================================================================= */
(function (AF) {
  'use strict';

  var KEYMAP = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    KeyE: 'interact', Space: 'interact', Enter: 'interact',
    Escape: 'menu', Tab: 'panel',
    KeyF: 'sheet', KeyJ: 'journal', KeyQ: 'terminal', KeyM: 'mute', KeyO: 'objective'
  };
  var PREVENT = { up: 1, down: 1, left: 1, right: 1, interact: 1, panel: 1, menu: 1 };

  var I = AF.Input = {
    down: {},
    pressed: {},
    axis: null,          /* joystick analógico (celular): {x, y} com módulo 0..1 */
    actionOf: function (e) { return KEYMAP[e.code] || null; },
    consume: function (a) {
      if (this.pressed[a]) { delete this.pressed[a]; return true; }
      return false;
    },
    endFrame: function () { this.pressed = {}; },
    clear: function () { this.down = {}; this.pressed = {}; this.axis = null; }
  };

  /* Mesmo caminho para teclado físico e botões virtuais (celular) */
  function handle(e, a) {
    AF.Audio.unlock();
    if (a === 'mute') { AF.Audio.toggle(); return true; }
    if (AF.UI && AF.UI.handleKey(e, a)) { I.clear(); return true; }
    return false;
  }

  window.addEventListener('keydown', function (e) {
    var tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    var a = KEYMAP[e.code] || null;
    if (a && PREVENT[a]) e.preventDefault();
    if (handle(e, a)) { e.preventDefault(); return; }
    if (a) {
      if (!I.down[a]) I.pressed[a] = true;
      I.down[a] = true;
    }
  });

  /* Toque: dispara uma ação como se fosse a tecla correspondente */
  var CODE = { interact: 'KeyE', menu: 'Escape', panel: 'Tab', sheet: 'KeyF', journal: 'KeyJ', terminal: 'KeyQ',
    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
  I.virtual = function (a, code) {
    var c = code || CODE[a] || '';
    var e = { code: c, key: c.replace(/^Key/, '').toLowerCase(), type: 'keydown', repeat: false, virtual: true,
      target: document.body, preventDefault: function () {}, stopPropagation: function () {} };
    if (handle(e, a)) return true;
    if (a) I.pressed[a] = true;
    return false;
  };

  window.addEventListener('keyup', function (e) {
    var a = KEYMAP[e.code];
    if (a) I.down[a] = false;
  });

  window.addEventListener('blur', function () { I.clear(); });

  /* Evita que um botão focado pelo mouse seja "clicado" de novo por Espaço/Enter */
  document.addEventListener('click', function (e) {
    AF.Audio.unlock();
    var b = e.target.closest && e.target.closest('button');
    if (b) setTimeout(function () { b.blur(); }, 0);
  });
})(window.AF);
