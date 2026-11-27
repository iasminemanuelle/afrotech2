/* =========================================================================
 * world.js — cena jogável: tilemap, colisão, jogador, NPCs, interação,
 * câmera, iluminação neon, zona sem energia, partículas de ruído quântico
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State, T = 16, C = AF.CONFIG;
  var DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  var charCache = {};
  var darkCanvas = null;

  function frames(specId) {
    if (!charCache[specId]) charCache[specId] = AF.Chars.build(AF.SPECS[specId]);
    return charCache[specId];
  }
  function overlap(a, b) { return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]; }

  var W = AF.World = {
    mapId: null, def: null, tiles: null, solid: null, keys: null, w: 0, h: 0,
    props: [], colliders: [], npcs: [], lights: [], player: null,
    cam: { x: 0, y: 0 }, t: 0, particles: [], titleMode: false,
    hazardCd: 0, target: null, playerFrames: null,

    /* ---------- Carregamento ---------- */
    load: function (id, spawn, opts) {
      opts = opts || {};
      var def = AF.MAPS[id];
      this.mapId = id; this.def = def; this.titleMode = !!opts.title;
      this.tiles = def.build();
      this.h = this.tiles.length; this.w = this.tiles[0].length;
      this.solid = []; this.keys = [];
      var y, x;
      for (y = 0; y < this.h; y++) {
        this.solid.push([]); this.keys.push([]);
        for (x = 0; x < this.w; x++) {
          var L = def.legend[this.tiles[y][x]] || { tile: 'floor' };
          this.solid[y].push(!!L.solid);
          var key = L.tile;
          if (key === 'wall' || key === 'shield' || key === 'casa') {
            var below = this.tiles[y + 1] && def.legend[this.tiles[y + 1][x]];
            var bt = below && below.tile;
            key = key + ((below && bt !== 'wall' && bt !== 'shield' && bt !== 'casa' && !below.field) ? '_face' : '_top');
          }
          var nv = AF.Tiles.variants(key) || 1;
          this.keys[y].push({ key: key, v: L.v !== undefined && key.slice(-5) === '_face' ? L.v % nv : AF.Pix.hash(x, y) % nv, anim: !!L.anim, hazard: !!L.hazard, field: !!L.field });
        }
      }
      /* objetos */
      this.props = []; this.colliders = [];
      var self = this;
      def.props.forEach(function (pd) {
        var p = {
          d: pd, x: pd.x, y: pd.y, w: pd.w, h: pd.h,
          img: pd.art ? AF.Art.get(pd.art) : null,
          sortY: (pd.y + pd.h) * T,
          solid: pd.solid !== undefined ? pd.solid : (!pd.invisible && !pd.ground)
        };
        if (p.solid) {
          if (pd.hit) {
            self.colliders.push([pd.x * T + pd.hit[0], pd.y * T + pd.hit[1], pd.x * T + pd.hit[0] + pd.hit[2], pd.y * T + pd.hit[1] + pd.hit[3]]);
          } else {
            for (var j = pd.y; j < pd.y + pd.h; j++) for (var i = pd.x; i < pd.x + pd.w; i++) {
              if (self.solid[j]) self.solid[j][i] = true;
            }
          }
        }
        self.props.push(p);
      });
      /* NPCs */
      this.npcs = (def.npcs || []).filter(function (nd) { return !nd.cond || nd.cond(); }).map(function (nd) {
        return { d: nd, id: nd.id, kind: nd.kind || 'char', x: nd.x * T, y: nd.y * T, dir: nd.dir, home: nd.dir,
                 frames: nd.spec ? frames(nd.spec) : null, turnT: 2 + Math.random() * 4, talkT: 0,
                 vx: nd.speed || 0, ph: Math.random() * 6 };
      });
      /* jogador */
      if (!this.titleMode) {
        this.playerFrames = AF.Chars.build(S.spec());
        var sp = typeof spawn === 'string' ? def.spawns[spawn] : spawn;
        sp = sp || def.spawns.start || def.spawns.entrada;
        this.player = {
          x: sp.px !== undefined ? sp.px : sp.x * T,
          y: sp.py !== undefined ? sp.py : sp.y * T,
          dir: sp.dir || 'down', anim: 0, moving: false
        };
      } else this.player = null;
      this.particles = [];
      this.target = null;
      this.stepT = 0;
      this.buoys = {};
      this.auto = null; this.sleeping = null; this.night = 0;
      this.area = this.player ? this.areaAt(this.player.x, this.player.y) : null;
      this.snapCamera();
    },

    /* Caminhada automática por pontos (cenas: ir para a cama) */
    walkTo: function (pts, onDone) { this.auto = { pts: pts, i: 0, onDone: onDone }; this.target = null; },
    autoWalk: function (dt) {
      var a = this.auto, p = this.player, pt = a.pts[a.i];
      if (!pt) { this.auto = null; if (a.onDone) a.onDone(); return; }
      var tx = pt[0] * T, ty = pt[1] * T, dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy), sp = C.PLAYER_SPEED * 0.9 * dt;
      if (d <= sp) { p.x = tx; p.y = ty; a.i++; }
      else { p.x += dx / d * sp; p.y += dy / d * sp; }
      p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      p.moving = true;
      this.checkArea();
    },

    /* Atualiza o visual do jogador (roupa nova, traje de banho) */
    refreshPlayer: function () { if (S.d && !this.titleMode) this.playerFrames = AF.Chars.build(S.spec()); },

    /* Água em que se pode nadar (aula de natação da Prainha) */
    inSwimZone: function (tx, ty) {
      var z = this.def.swimZone;
      return !!(z && tx >= z.x && tx < z.x + z.w && ty >= z.y && ty < z.y + z.h);
    },
    swimming: function () {
      var p = this.player;
      if (!p || !S.d || !S.d.swim) return false;
      var tx = Math.floor(p.x / T), ty = Math.floor((p.y - 2) / T);
      var k = this.keys[ty] && this.keys[ty][tx];
      return !!(k && (k.key === 'water' || k.key === 'foam') && this.inSwimZone(tx, ty));
    },

    /* Sub-regiões do mapa (ex.: Prainha da Baía): faixa de título ao entrar */
    areaAt: function (px, py) {
      var list = this.def.areas || [];
      for (var i = 0; i < list.length; i++) {
        var a = list[i];
        if (px >= a.x * T && px < (a.x + a.w) * T && py >= a.y * T && py < (a.y + a.h) * T) return a;
      }
      return null;
    },
    checkArea: function () {
      var a = this.areaAt(this.player.x, this.player.y);
      if (a === this.area) return;
      this.area = a;
      if (S.d && S.d.swim && !(a && a.name === 'Prainha da Baía') && AF.Swim) AF.Swim.stop(true);
      if (!a || !a.name) return;
      AF.HUD.banner(a.name, a.sub);
      if (a.onEnter) a.onEnter();
    },

    /* ---------- Colisão ---------- */
    isSolidTile: function (tx, ty) {
      if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return true;
      if (this.keys[ty][tx].field) return !(S.flag('tableDone') && S.flag('protocolo'));   /* porta interna da sala blindada */
      if (S.d && S.d.swim && this.inSwimZone(tx, ty)) { var kk = this.keys[ty][tx].key; if (kk === 'water' || kk === 'foam') return false; }
      return this.solid[ty][tx];
    },
    rectHits: function (r) {
      var x0 = Math.floor(r[0] / T), x1 = Math.floor((r[2] - 0.01) / T);
      var y0 = Math.floor(r[1] / T), y1 = Math.floor((r[3] - 0.01) / T);
      for (var ty = y0; ty <= y1; ty++) for (var tx = x0; tx <= x1; tx++) if (this.isSolidTile(tx, ty)) return true;
      for (var i = 0; i < this.colliders.length; i++) if (overlap(r, this.colliders[i])) return true;
      for (var k = 0; k < this.npcs.length; k++) {
        var n = this.npcs[k];
        if (n.kind === 'swimmer') continue;
        if (overlap(r, [n.x - 6, n.y - 5, n.x + 6, n.y + 1])) return true;
      }
      return false;
    },
    playerRect: function (x, y) { return [x - 4, y - 4, x + 4, y]; },

    /* ---------- Atualização ---------- */
    update: function (dt, allowInput) {
      this.t += dt;
      AF.FX.update(dt);
      this.updateParticles(dt);
      this.updateNPCs(dt);
      if (this.titleMode) { this.titleCamera(); return; }
      var p = this.player, I = AF.Input;
      p.moving = false;
      if (this.auto) { this.autoWalk(dt); allowInput = false; }
      if (this.sleeping) allowInput = false;
      if (allowInput) {
        var dx = (I.down.right ? 1 : 0) - (I.down.left ? 1 : 0);
        var dy = (I.down.down ? 1 : 0) - (I.down.up ? 1 : 0);
        var mag = 1;
        if (I.axis && (I.axis.x || I.axis.y)) {   /* joystick de toque: 360° e velocidade proporcional */
          dx = I.axis.x; dy = I.axis.y;
          mag = Math.max(0.5, Math.min(1, Math.hypot(dx, dy)));
          if (Math.abs(dx) < 0.2) dx = 0; if (Math.abs(dy) < 0.2) dy = 0;
        }
        if (dx || dy) {
          var len = Math.hypot(dx, dy), sp = C.PLAYER_SPEED * dt * mag * (this.swimming() ? 0.62 : 1);
          var mx = dx / len * sp, my = dy / len * sp;
          if (I.axis && dx && dy) p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
          else if (dx && !dy) p.dir = dx > 0 ? 'right' : 'left';
          else if (dy && !dx) p.dir = dy > 0 ? 'down' : 'up';
          else if (!((p.dir === 'left' && dx < 0) || (p.dir === 'right' && dx > 0) || (p.dir === 'up' && dy < 0) || (p.dir === 'down' && dy > 0))) p.dir = dy > 0 ? 'down' : 'up';
          if (!this.rectHits(this.playerRect(p.x + mx, p.y))) p.x += mx;
          if (!this.rectHits(this.playerRect(p.x, p.y + my))) p.y += my;
          p.moving = true;
        }
        this.target = this.findTarget();
        if (I.consume('interact') && this.target) this.interact(this.target);
        this.checkPortals();
        this.checkHazards(dt);
        this.checkArea();
      } else {
        this.target = null;
      }
      p.anim = p.moving ? p.anim + dt : 0;
      if (p.moving) {
        this.stepT -= dt;
        if (this.stepT <= 0) { var sw = this.swimming(); this.stepT = sw ? 0.5 : 0.27; AF.Audio.step(sw ? 'agua' : this.surface()); }
      } else this.stepT = 0.06;
      if (S.d && S.d.swim) this.checkBuoys();
      this.followCamera(dt);
    },

    /* tipo de chão sob o jogador, para o som dos passos */
    surface: function () {
      var p = this.player, tx = Math.floor(p.x / T), ty = Math.floor((p.y - 2) / T);
      var k = this.keys[ty] && this.keys[ty][tx], key = k ? k.key : 'floor';
      if (key === 'sand') return 'areia';
      if (key === 'wood' || key === 'ponte' || key === 'stairs' || key === 'piso_casa') return 'madeira';
      if (key === 'grama' || key === 'terra' || key === 'trilha') return 'terra';
      if (key === 'lab' || key === 'iso' || key === 'floor' || key === 'porta' || key === 'exit' || key === 'ruido') return 'metal';
      return 'pedra';
    },
    checkBuoys: function () {
      var p = this.player, self = this;
      this.props.forEach(function (pr) {
        var b = pr.d.buoy;
        if (!b || self.buoys[b]) return;
        var bx = pr.x * T + 8, by = pr.y * T + 12;
        if (Math.hypot(p.x - bx, p.y - by) < 13) {
          self.buoys[b] = true;
          var n = Object.keys(self.buoys).length;
          AF.Audio.play('splash');
          if (AF.Swim) AF.Swim.buoy(n);
        }
      });
    },

    checkHazards: function (dt) {
      this.hazardCd = Math.max(0, this.hazardCd - dt);
      if (S.flag('restored')) return;
      var p = this.player;
      var tx = Math.floor(p.x / T), ty = Math.floor((p.y - 2) / T);
      var k = this.keys[ty] && this.keys[ty][tx];
      if (k && k.hazard && this.hazardCd <= 0) {
        this.hazardCd = 0.9;
        AF.Audio.play('hurt');
        S.damage(4, 'piso contaminado');
      }
    },

    checkPortals: function () {
      var p = this.player, I = AF.Input;
      var list = this.def.portals || [];
      for (var i = 0; i < list.length; i++) {
        var pt = list[i];
        if (pt.cond && !pt.cond()) continue;
        var inside = p.x >= pt.x * T && p.x <= (pt.x + pt.w) * T && p.y >= pt.y * T && p.y <= (pt.y + pt.h) * T + 2;
        if (inside && (!pt.facing || (p.dir === pt.facing && I.down[pt.facing]))) {
          AF.Game.transition(pt.to, pt.spawn);
          return;
        }
      }
    },

    findTarget: function () {
      var p = this.player, v = DIRV[p.dir];
      var fx = p.x + v[0] * 12, fy = p.y - 3 + v[1] * 12;
      var best = null, bd = 1e9;
      this.npcs.forEach(function (n) {
        var d = Math.hypot(n.x - fx, (n.y - 4) - fy);
        if (d < 14 && d < bd) { bd = d; best = { npc: n, label: n.d.label, interact: n.d.interact }; }
      });
      if (best) return best;
      var cands = [];
      this.props.forEach(function (pr) {
        var d = pr.d;
        if (!d.interact || (d.cond && !d.cond())) return;
        var r = [pr.x * T - 3, pr.y * T - 3, (pr.x + pr.w) * T + 3, (pr.y + pr.h) * T + 3];
        if (fx >= r[0] && fx <= r[2] && fy >= r[1] && fy <= r[3]) cands.push(pr);
      });
      cands.sort(function (a, b) { return (b.d.invisible ? 1 : 0) - (a.d.invisible ? 1 : 0) || (a.w * a.h - b.w * b.h); });
      if (cands.length) return { prop: cands[0], label: cands[0].d.label, interact: cands[0].d.interact };
      return null;
    },

    interact: function (tg) {
      var p = this.player;
      if (tg.npc) {
        var n = tg.npc, dx = p.x - n.x, dy = p.y - n.y;
        if (n.kind !== 'drone') n.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        n.talkT = 6;
      }
      if (typeof tg.interact === 'function') tg.interact();
      else if (tg.interact) AF.Dialogue.start(tg.interact);
    },

    updateNPCs: function (dt) {
      var t = this.t;
      this.npcs.forEach(function (n) {
        if (n.kind === 'drone') {
          var tx = (S.d && S.flag('gateOpen') ? 35.4 : 31.9) * T;
          n.x += (tx - n.x) * Math.min(1, dt * 2);
          return;
        }
        if (n.kind === 'swimmer') {
          n.ph += dt;
          n.x += n.vx * dt;
          if (n.x < n.d.x0 * T) { n.x = n.d.x0 * T; n.vx = Math.abs(n.vx); }
          if (n.x > n.d.x1 * T) { n.x = n.d.x1 * T; n.vx = -Math.abs(n.vx); }
          return;
        }
        if (n.talkT > 0) { n.talkT -= dt; if (n.talkT <= 0 && !AF.Dialogue.active) n.dir = n.home; return; }
        n.turnT -= dt;
        if (n.turnT <= 0 && n.id === 'kaua') {
          n.turnT = 2.5 + Math.random() * 4;
          n.dir = ['down', 'left', 'right', 'left'][Math.floor(Math.random() * 4)];
        }
        void t;
      });
    },

    /* ---------- Câmera ---------- */
    clampCam: function () {
      var mw = this.w * T, mh = this.h * T;
      this.cam.x = mw <= C.W ? (mw - C.W) / 2 : Math.max(0, Math.min(mw - C.W, this.cam.x));
      this.cam.y = mh <= C.H ? (mh - C.H) / 2 : Math.max(0, Math.min(mh - C.H, this.cam.y));
    },
    snapCamera: function () {
      if (this.player) { this.cam.x = this.player.x - C.W / 2; this.cam.y = this.player.y - 10 - C.H / 2; }
      else { this.cam.x = 0; this.cam.y = 0; }
      this.clampCam();
    },
    followCamera: function (dt) {
      var tx = this.player.x - C.W / 2, ty = this.player.y - 10 - C.H / 2;
      var k = Math.min(1, dt * 8);
      this.cam.x += (tx - this.cam.x) * k; this.cam.y += (ty - this.cam.y) * k;
      this.clampCam();
    },
    titleCamera: function () {
      var mw = this.w * T;
      this.cam.x = (Math.sin(this.t * 0.08) * 0.5 + 0.5) * (mw - C.W);
      this.cam.y = 40 + Math.sin(this.t * 0.11) * 30;
      this.clampCam();
    },

    /* ---------- Partículas ---------- */
    updateParticles: function (dt) {
      var kind = this.def.particles;
      var restored = S.d && S.flag('restored');
      var rate = kind === 'glitch' ? (restored ? 5 : 16) : (kind === 'vagalume' ? 3 : 4);
      var n = rate * dt + (Math.random() < (rate * dt % 1) ? 1 : 0);
      if (kind === 'vagalume') {                      /* vaga-lumes no céu limpo do sertão */
        for (var v = 0; v < Math.floor(n); v++) {
          this.particles.push({ x: this.cam.x + Math.random() * C.W, y: this.cam.y + Math.random() * C.H,
            vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 8, life: 2 + Math.random() * 3, max: 0,
            c: ['#d8ff6a', '#ffe08a', '#9affc8'][v % 3], s: 1, glitch: false });
        }
        n = 0;
      }
      for (var i = 0; i < Math.floor(n); i++) {
        var pal = kind === 'glitch' ? (restored ? ['#7af9ff', '#ffc940', '#3dff9a'] : ['#ff3fa4', '#00e5ff', '#e8e6ff', '#ff3fa4'])
                                    : ['#5a64b0', '#7a84d0', '#00a9c4'];
        this.particles.push({
          x: this.cam.x + Math.random() * C.W, y: this.cam.y + Math.random() * C.H,
          vx: (Math.random() - 0.5) * 6, vy: -(4 + Math.random() * 10) * (restored ? 0.5 : 1),
          life: 1.2 + Math.random() * 2, max: 0, c: pal[Math.floor(Math.random() * pal.length)],
          s: Math.random() < 0.2 ? 2 : 1, glitch: kind === 'glitch' && !restored && Math.random() < 0.3
        });
      }
      for (var k = this.particles.length - 1; k >= 0; k--) {
        var pt = this.particles[k];
        pt.life -= dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt;
        if (pt.glitch && Math.random() < 0.05) pt.x += (Math.random() - 0.5) * 8;
        if (pt.life <= 0) this.particles.splice(k, 1);
      }
      if (this.particles.length > 300) this.particles.splice(0, this.particles.length - 300);
    },

    /* ---------- Renderização ---------- */
    render: function (ctx) {
      var cw = C.W, ch = C.H;
      ctx.save();
      ctx.fillStyle = '#07060f'; ctx.fillRect(0, 0, cw, ch);
      if (AF.FX.shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * 8 * AF.FX.shake), Math.round((Math.random() - 0.5) * 8 * AF.FX.shake));
      var cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
      var t = this.t, self = this;

      /* chão */
      var tx0 = Math.max(0, Math.floor(cx / T)), ty0 = Math.max(0, Math.floor(cy / T));
      var tx1 = Math.min(this.w - 1, Math.floor((cx + cw) / T)), ty1 = Math.min(this.h - 1, Math.floor((cy + ch) / T));
      var tf = Math.floor(t * 4);
      for (var ty = ty0; ty <= ty1; ty++) for (var tx = tx0; tx <= tx1; tx++) {
        var k = this.keys[ty][tx];
        var key = k.key;
        if (k.field && S.flag('tableDone') && S.flag('protocolo')) key = 'iso';
        if (k.hazard && S.flag('restored')) key = 'floor';
        var img = AF.Tiles.get(key, (k.anim || key === 'nucleo') ? tf + ((tx + ty) % 2) : k.v);
        if (img) ctx.drawImage(img, tx * T - cx, ty * T - cy);
      }

      /* decalques de chão */
      this.props.forEach(function (p) { if (p.d.ground && p.img) ctx.drawImage(p.img, p.x * T - cx, p.y * T - cy); });

      /* objetos e personagens ordenados por profundidade */
      var list = [];
      this.props.forEach(function (p) { if (!p.d.ground && (p.img || p.d.anim)) list.push({ y: p.sortY, p: p }); });
      this.npcs.forEach(function (n) { list.push({ y: n.y, n: n }); });
      if (this.player) list.push({ y: this.player.y, me: true });
      list.sort(function (a, b) { return a.y - b.y; });
      list.forEach(function (it) {
        if (it.p) self.drawProp(ctx, it.p, cx, cy, t);
        else if (it.n) self.drawNPC(ctx, it.n, cx, cy, t);
        else self.drawPlayer(ctx, cx, cy);
      });

      /* iluminação */
      this.renderLights(ctx, cx, cy, t);

      /* partículas */
      this.particles.forEach(function (pt) {
        var a = Math.min(1, pt.life);
        ctx.globalAlpha = a * (pt.glitch && Math.random() < 0.3 ? 0.2 : 0.85);
        ctx.fillStyle = pt.c;
        ctx.fillRect(Math.round(pt.x - cx), Math.round(pt.y - cy), pt.s, pt.s);
      });
      ctx.globalAlpha = 1;
      ctx.restore();

      /* noite caindo (cena de dormir) */
      if (this.night > 0) { ctx.fillStyle = 'rgba(4,4,22,' + (0.72 * this.night).toFixed(3) + ')'; ctx.fillRect(0, 0, cw, ch); }

      /* pós-processamento de ruído quântico */
      if (AF.FX.glitch > 0) {
        var gI = AF.FX.glitch;
        for (var i = 0; i < 7; i++) {
          var sy = Math.floor(Math.random() * ch), sh = 2 + Math.floor(Math.random() * 10);
          var dx = Math.round((Math.random() - 0.5) * 40 * gI);
          ctx.drawImage(ctx.canvas, 0, sy, cw, sh, dx, sy, cw, sh);
        }
        ctx.fillStyle = 'rgba(255,63,164,' + (0.18 * gI) + ')'; ctx.fillRect(0, 0, cw, ch);
      }
    },

    drawProp: function (ctx, p, cx, cy, t) {
      var d = p.d;
      var sx = p.x * T + (d.ox || 0) - cx;
      var sy = p.img ? (p.y + p.h) * T - p.img.height + (d.oy || 0) - cy : p.y * T - cy;
      if (sx > AF.CONFIG.W + 20 || sy > AF.CONFIG.H + 20 || sx + (p.img ? p.img.width : 16) < -20 || sy + (p.img ? p.img.height : 16) < -20) return;
      if (d.cond && d.invisible && !d.cond()) return;
      if (p.img) ctx.drawImage(p.img, sx, sy);
      if (d.anim === 'fragment') {
        if (!d.cond || d.cond()) {
          var bright = (Math.sin(t * 5) + 1) / 2;
          ctx.fillStyle = 'rgba(122,249,255,' + (0.4 + bright * 0.6) + ')';
          ctx.fillRect(sx + 7, sy + 7, 2, 2);
          if (bright > 0.7) { ctx.fillRect(sx + 7, sy + 4, 2, 1); ctx.fillRect(sx + 7, sy + 11, 2, 1); ctx.fillRect(sx + 4, sy + 7, 1, 2); ctx.fillRect(sx + 11, sy + 7, 1, 2); }
        }
      } else if (d.anim && AF.Art.anim[d.anim]) AF.Art.anim[d.anim](ctx, sx, sy, t, p);
    },

    drawShadow: function (ctx, x, y, w) {
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.fillRect(x - w / 2, y - 1, w, 2);
      ctx.fillRect(x - w / 2 + 1, y - 2, w - 2, 1);
      ctx.fillRect(x - w / 2 + 1, y + 1, w - 2, 1);
    },

    drawNPC: function (ctx, n, cx, cy, t) {
      var x = Math.round(n.x - cx), y = Math.round(n.y - cy);
      if (n.kind === 'drone') {
        var bob = Math.round(Math.sin(t * 3) * 2);
        this.drawShadow(ctx, x, y, 8);
        var img = AF.Art.get(S.flag('gateOpen') ? 'drone_cyan' : 'drone_red');
        ctx.drawImage(img, x - 8, y - 24 + bob);
        return;
      }
      if (n.kind === 'swimmer') { this.drawSwimmer(ctx, x, y, n); return; }
      this.drawShadow(ctx, x, y, 10);
      var f = n.frames[n.dir][0];
      ctx.drawImage(f, x - 8, y - 21);
    },

    /* aluno(a) da aula de natação: touca, braçada e espuma */
    drawSwimmer: function (ctx, x, y, n) {
      var dir = n.vx >= 0 ? 1 : -1, ph = n.ph * 5, stroke = Math.sin(ph);
      ctx.fillStyle = 'rgba(232,246,255,0.55)';
      ctx.fillRect(x - 7 - dir * 3, y - 3, 12, 1); ctx.fillRect(x - 5 - dir * 6, y - 2, 6, 1);
      ctx.fillStyle = n.d.skin || '#4a2a1c'; ctx.fillRect(x - 2, y - 7, 5, 4);
      ctx.fillStyle = n.d.cap || '#ffc940'; ctx.fillRect(x - 2, y - 8, 5, 2); ctx.fillRect(x - 1, y - 9, 3, 1);
      ctx.fillStyle = '#3aa0ff'; ctx.fillRect(x + (dir > 0 ? 1 : -2), y - 6, 2, 1);
      var ax = x + dir * (stroke > 0 ? 4 : -3), ay = y - (stroke > 0 ? 8 + Math.round(stroke * 2) : 4);
      ctx.fillStyle = n.d.skin || '#4a2a1c'; ctx.fillRect(ax, ay, 2, stroke > 0 ? 3 : 2);
      if (stroke < -0.6) { ctx.fillStyle = 'rgba(232,246,255,0.8)'; ctx.fillRect(x + dir * 5, y - 4, 2, 1); }
    },

    drawPlayer: function (ctx, cx, cy) {
      var p = this.player;
      var x = Math.round(p.x - cx), y = Math.round(p.y - cy);
      var seq = [1, 0, 2, 0];
      var fi = p.moving ? seq[Math.floor(p.anim * 8) % 4] : 0;
      if (this.sleeping) { this.drawSleeping(ctx, cx, cy); return; }
      if (this.swimming()) {                              /* nadando: só cabeça e ombros fora d'água */
        var bob = Math.round(Math.sin(this.t * 4) * 1);
        ctx.drawImage(this.playerFrames[p.dir][0], 0, 0, 16, 13, x - 8, y - 13 + bob, 16, 13);
        ctx.fillStyle = 'rgba(232,246,255,0.6)';
        ctx.fillRect(x - 8, y - 1 + bob, 16, 1);
        if (p.moving) { ctx.fillRect(x - 10 + (Math.floor(this.t * 6) % 3), y + bob, 4, 1); ctx.fillRect(x + 6 - (Math.floor(this.t * 6) % 3), y + bob, 4, 1); }
        return;
      }
      this.drawShadow(ctx, x, y, 10);
      ctx.drawImage(this.playerFrames[p.dir][fi], x - 8, y - 21);
    },

    /* deitado(a) na cama, com o cobertor e os "Z" subindo */
    drawSleeping: function (ctx, cx, cy) {
      var s = this.sleeping, bx = Math.round(s.x - cx), by = Math.round(s.y - cy);
      ctx.save(); ctx.translate(bx + 2, by + 20); ctx.rotate(-Math.PI / 2);
      ctx.drawImage(this.playerFrames.down[0], 0, 0);
      ctx.restore();
      ctx.fillStyle = '#3a9ab0'; ctx.fillRect(bx + 11, by + 9, 18, 11);
      ctx.fillStyle = '#2a7a90'; ctx.fillRect(bx + 11, by + 9, 18, 1);
      ctx.fillStyle = '#ffc940'; for (var k = 0; k < 4; k++) ctx.fillRect(bx + 13 + k * 4, by + 14, 1, 1);
      var t = this.t;
      for (var z = 0; z < 3; z++) {
        var ph = (t * 0.6 + z / 3) % 1;
        ctx.globalAlpha = 1 - ph;
        AF.Pix.text(ctx, 'Z', Math.round(bx + 6 + ph * 10 + z * 2), Math.round(by - 2 - ph * 18), '#e8e6ff');
      }
      ctx.globalAlpha = 1;
    },

    renderLights: function (ctx, cx, cy, t) {
      var def = this.def, restored = S.d && S.flag('restored');
      ctx.fillStyle = def.ambient; ctx.fillRect(0, 0, C.W, C.H);
      var all = [];
      this.props.forEach(function (p, pi) {
        (p.d.lights || []).forEach(function (l, li) {
          var by = p.img ? (p.y + p.h) * T - p.img.height + (p.d.oy || 0) : p.y * T;
          all.push({ x: p.x * T + (p.d.ox || 0) + l.ox, y: by + l.oy, r: l.r, c: typeof l.c === 'function' ? l.c() : l.c, a: l.a, id: pi * 7 + li });
        });
      });
      (def.lights || []).forEach(function (l, i) {
        if (l.dark && restored) return;
        all.push({ x: l.x * T, y: l.y * T, r: l.r, c: l.c, a: l.a, id: 100 + i, dark: l.dark });
      });
      if (this.player) {
        var acc = AF.LOOKS.accents.find(function (a) { return a.id === S.d.look.accent; });
        var rgb = AF.Pix.hexToRgb(acc ? acc.color : '#00e5ff');
        all.push({ x: this.player.x, y: this.player.y - 10, r: 22, c: rgb.join(','), a: 0.12, id: 999 });
      }
      var darkActive = def.dark && !restored && !this.titleMode;
      ctx.globalCompositeOperation = 'lighter';
      all.forEach(function (l) {
        if (l.dark) return;
        var sx = l.x - cx, sy = l.y - cy;
        if (sx < -l.r || sy < -l.r || sx > C.W + l.r || sy > C.H + l.r) return;
        var a = l.a;
        if (!restored && Math.sin(t * 11 + l.id * 3.7) > 0.985) a *= 0.25;
        var g = ctx.createRadialGradient(sx, sy, 0, sx, sy, l.r);
        g.addColorStop(0, 'rgba(' + l.c + ',' + a + ')'); g.addColorStop(1, 'rgba(' + l.c + ',0)');
        ctx.fillStyle = g; ctx.fillRect(sx - l.r, sy - l.r, l.r * 2, l.r * 2);
      });
      ctx.globalCompositeOperation = 'source-over';

      if (darkActive) {
        if (!darkCanvas || darkCanvas.width !== C.W || darkCanvas.height !== C.H) darkCanvas = AF.Pix.canvas(C.W, C.H);
        var d = darkCanvas.getContext('2d');
        d.globalCompositeOperation = 'source-over';
        d.clearRect(0, 0, C.W, C.H);
        var zones = def.dark;
        d.fillStyle = 'rgba(3,2,12,0.94)';
        zones.forEach(function (z) { d.fillRect(z.x * T - cx, z.y * T - cy, z.w * T, z.h * T); });
        d.globalCompositeOperation = 'destination-out';
        var p = this.player;
        var rad = 24 + 14 * S.mod('percepcao');
        var px = p.x - cx, py = p.y - 8 - cy;
        var g2 = d.createRadialGradient(px, py, rad * 0.45, px, py, rad);
        g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
        d.fillStyle = g2; d.fillRect(px - rad, py - rad, rad * 2, rad * 2);
        all.forEach(function (l) {
          if (!l.dark) return;
          var sx = l.x - cx, sy = l.y - cy;
          var g3 = d.createRadialGradient(sx, sy, 0, sx, sy, l.r * 1.6);
          g3.addColorStop(0, 'rgba(0,0,0,0.85)'); g3.addColorStop(1, 'rgba(0,0,0,0)');
          d.fillStyle = g3; d.fillRect(sx - l.r * 2, sy - l.r * 2, l.r * 4, l.r * 4);
        });
        ctx.drawImage(darkCanvas, 0, 0);
        /* luzes de emergência e piso contaminado visível (Percepção 2+) */
        ctx.globalCompositeOperation = 'lighter';
        all.forEach(function (l) {
          if (!l.dark) return;
          var sx = l.x - cx, sy = l.y - cy;
          var pulse = 0.6 + 0.4 * Math.sin(t * 3 + l.id);
          var g4 = ctx.createRadialGradient(sx, sy, 0, sx, sy, l.r * 1.4);
          g4.addColorStop(0, 'rgba(' + l.c + ',' + (l.a * pulse) + ')'); g4.addColorStop(1, 'rgba(' + l.c + ',0)');
          ctx.fillStyle = g4; ctx.fillRect(sx - l.r * 2, sy - l.r * 2, l.r * 4, l.r * 4);
          ctx.fillStyle = 'rgba(255,60,80,' + pulse + ')'; ctx.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 2, 2);
        });
        if (S.mod('percepcao') >= 2) {
          var keys = this.keys;
          zones.forEach(function (z) {
            for (var ty = z.y; ty < z.y + z.h; ty++) for (var tx = z.x; tx < z.x + z.w; tx++) {
              if (!keys[ty][tx].hazard) continue;
              var fl = 0.22 + 0.14 * Math.sin(t * 6 + tx * 2 + ty);
              var hx = tx * T - cx, hy = ty * T - cy;
              ctx.fillStyle = 'rgba(255,63,164,' + (fl * 0.35) + ')';
              ctx.fillRect(hx + 3, hy + 3, 10, 10);
              ctx.strokeStyle = 'rgba(255,63,164,' + fl + ')'; ctx.lineWidth = 1;
              ctx.strokeRect(hx + 2.5, hy + 2.5, 11, 11);
            }
          });
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    },

    /* posição do alvo na tela (para o balão "E · Interagir") */
    targetScreenPos: function () {
      var tg = this.target;
      if (!tg) return null;
      var cx = this.cam.x, cy = this.cam.y;
      if (tg.npc) return { x: tg.npc.x - cx, y: tg.npc.y - (tg.npc.kind === 'drone' ? 28 : 26) - cy };
      var p = tg.prop;
      var top = p.img ? (p.y + p.h) * T - p.img.height : p.y * T;
      return { x: (p.x + p.w / 2) * T - cx, y: Math.max(8, top - 4 - cy) };
    }
  };
})(window.AF);
