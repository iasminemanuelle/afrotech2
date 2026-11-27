/* =========================================================================
 * shop.js — Boutique do Mercado Modelo (comprar roupas e acessórios com
 * Créditos Quânticos) e guarda-roupa (trocar o que já é seu)
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;

  function q(root, sel) { return root.querySelector(sel); }

  function open(mode) {
    var shop = mode !== 'guarda';
    var st = { tab: 'todos', sel: null, try: {}, raf: 0, tick: 0 };
    var W = S.d.wardrobe;
    var body = AF.el('div', 'shop');
    var m = AF.UI.modal({
      title: shop ? 'BOUTIQUE DO MERCADO MODELO · DONA LU' : 'GUARDA-ROUPA · CASA NA RIBEIRA',
      body: body, cls: 'modal-md modal-shop',
      onClose: function () { cancelAnimationFrame(st.raf); AF.World.refreshPlayer(); AF.HUD.refresh(); S.save(); }
    });

    /* visual em teste: o que está vestido + a peça selecionada */
    function preview() {
      var eq = Object.assign({}, W.eq, st.try);
      Object.keys(eq).forEach(function (k) { if (!eq[k]) delete eq[k]; });
      return AF.Chars.build(AF.Chars.playerSpec(S.d.look, eq));
    }
    var frames = null;
    function loop() {
      st.tick++;
      var cv = q(body, '.shop-prev canvas');
      if (cv && frames) {
        var dirs = ['down', 'right', 'up', 'left'], d = dirs[Math.floor(st.tick / 70) % 4], f = [1, 0, 2, 0][Math.floor(st.tick / 9) % 4];
        var x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, 16, 22); x.drawImage(frames[d][f], 0, 0);
      }
      st.raf = requestAnimationFrame(loop);
    }

    function items() {
      return AF.SHOP.filter(function (it) {
        if (!shop && W.owned.indexOf(it.id) < 0) return false;
        return st.tab === 'todos' || it.slot === st.tab;
      });
    }

    function render(msg) {
      frames = preview();
      var tabs = '<div class="shop-tabs">' + [['todos', 'Tudo']].concat(Object.keys(AF.SHOP_SLOTS).map(function (k) { return [k, AF.SHOP_SLOTS[k]]; }))
        .map(function (t) { return '<button data-t="' + t[0] + '" class="' + (st.tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>';
      var list = items();
      var html = list.map(function (it) {
        var owned = W.owned.indexOf(it.id) >= 0, worn = W.eq[it.slot] === it.id;
        var tag = worn ? '<span class="si-tag">vestindo</span>' : (owned ? '<span class="si-tag">é seu</span>' : '');
        return '<div class="shop-item' + (st.sel === it.id ? ' on' : '') + '" data-id="' + it.id + '">' +
          '<div class="si-head"><span class="si-name">' + it.name + '</span><span class="si-price">' + (owned ? '' : it.price + ' CQ') + '</span></div>' +
          '<div class="si-desc">' + it.desc + '</div><div class="dim">' + AF.SHOP_SLOTS[it.slot] + ' ' + tag + '</div></div>';
      }).join('') || '<div class="dim">' + (shop ? 'Nada nesta seção.' : 'Seu guarda-roupa ainda está vazio. A Boutique da Dona Lu fica na frente do Mercado Modelo.') + '</div>';

      var sel = st.sel && AF.SHOP_BY_ID[st.sel], foot = '';
      if (sel) {
        var owned = W.owned.indexOf(sel.id) >= 0, worn = W.eq[sel.slot] === sel.id;
        if (!owned) foot += '<button class="btn primary sh-buy"' + (S.d.credits < sel.price ? ' disabled' : '') + '>Comprar e vestir · ' + sel.price + ' CQ</button>';
        else if (!worn) foot += '<button class="btn primary sh-wear">Vestir</button>';
        else foot += '<button class="btn sh-off">Tirar</button>';
      }
      if (Object.keys(W.eq).length) foot += '<button class="btn sh-all">Voltar ao visual da ficha</button>';
      body.innerHTML =
        '<div class="shop-prev"><canvas width="16" height="22"></canvas><div class="cq">Créditos: <b class="gold">' + S.d.credits + ' CQ</b></div>' +
          '<div class="dim" style="text-align:center">' + (sel ? (W.owned.indexOf(sel.id) >= 0 ? 'Provando: ' : 'Provador: ') + sel.name : 'Toque numa peça para provar') + '</div></div>' +
        '<div><div class="shop-tabs-wrap">' + tabs + '</div><div class="shop-list">' + html + '</div>' +
          '<div class="shop-foot"><div class="msg">' + (msg || (shop ? 'Provar é de graça. Créditos vêm de testes, desafios e descobertas.' : 'O que você comprou na Boutique fica guardado aqui.')) + '</div>' + foot + '</div></div>';

      body.querySelectorAll('.shop-tabs button').forEach(function (b) {
        b.addEventListener('click', function () { st.tab = b.getAttribute('data-t'); render(); });
      });
      body.querySelectorAll('.shop-item').forEach(function (b) {
        b.addEventListener('click', function () {
          var it = AF.SHOP_BY_ID[b.getAttribute('data-id')];
          st.sel = it.id; st.try = {}; st.try[it.slot] = it.id;
          AF.Audio.play('select'); render();
        });
      });
      var buy = q(body, '.sh-buy'), wear = q(body, '.sh-wear'), off = q(body, '.sh-off'), all = q(body, '.sh-all');
      if (buy) buy.addEventListener('click', function () {
        if (!S.spend(sel.price)) { render('Créditos insuficientes: faltam ' + (sel.price - S.d.credits) + ' CQ.'); return; }
        W.owned.push(sel.id); W.eq[sel.slot] = sel.id; st.try = {};
        AF.Audio.play('cash');
        var first = !S.flag('loja');
        S.setFlag('loja');
        if (first) S.addJournal('Boutique do Mercado', 'Comprei ' + sel.name.toLowerCase() + ' na Boutique da Dona Lu, em frente ao Mercado Modelo. No guarda-roupa de casa, na Ribeira, posso trocar o visual quando quiser.');
        AF.World.refreshPlayer(); S.save();
        render('<b class="green">' + sel.name + '</b> é seu!' + (sel.id === 'fitinha' ? ' Dona Lu amarra no seu pulso: três nós, três pedidos.' : ''));
      });
      if (wear) wear.addEventListener('click', function () { W.eq[sel.slot] = sel.id; st.try = {}; AF.Audio.play('select'); AF.World.refreshPlayer(); render(); });
      if (off) off.addEventListener('click', function () { delete W.eq[sel.slot]; st.try = {}; AF.Audio.play('close'); AF.World.refreshPlayer(); render(); });
      if (all) all.addEventListener('click', function () { W.eq = {}; st.try = {}; st.sel = null; AF.Audio.play('close'); AF.World.refreshPlayer(); render(); });
    }
    render();
    st.raf = requestAnimationFrame(loop);
    return m;
  }

  AF.Shop = { open: function () { return open('loja'); } };
  AF.Wardrobe = { open: function () { return open('guarda'); } };
})(window.AF);
