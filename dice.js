/* =========================================================================
 * dice.js — teste de 2d6 automatizado e animado
 * total = d1 + d2 + nível do atributo + bônus de classe + bônus situacional
 * sucesso se total >= dificuldade (padrão do manual: 7)
 * 12 natural = sucesso crítico (+2 CQ) · 2 natural = falha crítica
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;
  var FACES = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

  function makeDie() {
    var d = AF.el('div', 'die');
    for (var i = 0; i < 9; i++) d.appendChild(AF.el('span', 'pip'));
    return d;
  }
  function setFace(d, n) {
    var on = FACES[n];
    for (var i = 0; i < 9; i++) d.children[i].classList.toggle('on', on.indexOf(i) >= 0);
  }

  AF.Dice = {
    /* opts: { attr, dc, bonus, label } -> Promise<resultado> */
    roll: function (opts) {
      return new Promise(function (resolve) {
        var attr = AF.ATTR_BY_ID[opts.attr];
        var lvl = S.level(opts.attr), cb = S.classBonus(opts.attr), extra = opts.bonus || 0;
        var d1 = 1 + Math.floor(Math.random() * 6), d2 = 1 + Math.floor(Math.random() * 6);
        var nat = d1 + d2, total = nat + lvl + cb + extra;
        var crit = nat === 12 ? 'success' : (nat === 2 ? 'fail' : null);
        var success = crit === 'success' ? true : (crit === 'fail' ? false : total >= opts.dc);

        var box = AF.el('div', 'dice-box');
        box.appendChild(AF.el('div', 'dice-attr', 'TESTE DE ' + attr.name.toUpperCase()));
        box.appendChild(AF.el('div', 'dice-sub', AF.esc(opts.label || '') + ' · Dificuldade <b>' + opts.dc + '</b>'));
        var row = AF.el('div', 'dice-row');
        var e1 = makeDie(), e2 = makeDie();
        row.appendChild(e1); row.appendChild(AF.el('div', 'dice-plus', '+')); row.appendChild(e2);
        box.appendChild(row);
        var brk = AF.el('div', 'dice-break', '&nbsp;');
        var res = AF.el('div', 'dice-result', '&nbsp;');
        var hint = AF.el('div', 'dice-hint', '&nbsp;');
        box.appendChild(brk); box.appendChild(res); box.appendChild(hint);

        var done = false, ready = false;
        var m = AF.UI.modal({
          body: box, cls: 'modal-dice', closable: false, silent: true,
          onKey: function (e, a) { if (a === 'interact' && ready) finish(); return true; }
        });
        m.el.addEventListener('click', function () { if (ready) finish(); });

        e1.classList.add('rolling'); e2.classList.add('rolling');
        var ticks = 0;
        var iv = setInterval(function () {
          setFace(e1, 1 + Math.floor(Math.random() * 6));
          setFace(e2, 1 + Math.floor(Math.random() * 6));
          AF.Audio.play('dice');
          if (++ticks >= 14) {
            clearInterval(iv);
            setFace(e1, d1); setFace(e2, d2);
            e1.classList.remove('rolling'); e2.classList.remove('rolling');
            e1.classList.add('landed'); e2.classList.add('landed');
            var parts = [d1 + ' + ' + d2];
            if (lvl) parts.push(attr.short + ' ' + lvl);
            if (cb) parts.push('classe ' + cb);
            if (extra) parts.push('bônus ' + extra);
            brk.innerHTML = parts.join(' + ') + ' = <b>' + total + '</b> ' + (total >= opts.dc ? '≥' : '<') + ' ' + opts.dc;
            if (crit === 'success') res.innerHTML = 'SUCESSO CRÍTICO! <small>(12 natural · +2 CQ)</small>';
            else if (crit === 'fail') res.innerHTML = 'FALHA CRÍTICA <small>(2 natural)</small> — RUÍDO QUÂNTICO';
            else res.innerHTML = success ? 'SUCESSO' : 'FALHA — RUÍDO QUÂNTICO';
            res.classList.add(success ? 'ok' : 'bad');
            hint.innerHTML = AF.Touch ? AF.Touch.advanceHint() : '[E] ou clique para continuar';
            AF.Audio.play(success ? 'success' : 'fail');
            ready = true;
          }
        }, 65);

        function finish() {
          if (done) return;
          done = true;
          m.close(true);
          var r = { attr: opts.attr, label: opts.label || '', d1: d1, d2: d2, mod: lvl + cb + extra,
                    total: total, dc: opts.dc, success: success, crit: crit, t: Math.floor(S.d.stats.playTime) };
          S.logRoll(r);
          if (crit === 'success') S.addCredits(2);
          resolve(r);
        }
      });
    }
  };
})(window.AF);
