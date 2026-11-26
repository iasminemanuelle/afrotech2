/* =========================================================================
 * bloch.js — desenho da esfera de Bloch e rotações das portas X e Z
 * ========================================================================= */
(function (AF) {
  'use strict';
  var AZ = -32 * Math.PI / 180, EL = 18 * Math.PI / 180;

  function project(v, cx, cy, R) {
    var x1 = v.x * Math.cos(AZ) - v.y * Math.sin(AZ);
    var y1 = v.x * Math.sin(AZ) + v.y * Math.cos(AZ);
    var h = y1, vert = v.z * Math.cos(EL) - x1 * Math.sin(EL);
    var depth = x1 * Math.cos(EL) + v.z * Math.sin(EL);
    return { x: cx + R * h, y: cy - R * vert, d: depth };
  }

  /* Rotação de Rodrigues: gira v em torno do eixo unitário k pelo ângulo t */
  function rotate(v, k, t) {
    var c = Math.cos(t), s = Math.sin(t);
    var dot = k.x * v.x + k.y * v.y + k.z * v.z;
    var cr = { x: k.y * v.z - k.z * v.y, y: k.z * v.x - k.x * v.z, z: k.x * v.y - k.y * v.x };
    return {
      x: v.x * c + cr.x * s + k.x * dot * (1 - c),
      y: v.y * c + cr.y * s + k.y * dot * (1 - c),
      z: v.z * c + cr.z * s + k.z * dot * (1 - c)
    };
  }

  function curve(ctx, pts, cx, cy, R, back, color) {
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    for (var pass = 0; pass < 2; pass++) {
      ctx.setLineDash(pass === 0 ? [3, 4] : []);
      ctx.globalAlpha = pass === 0 ? 0.35 : 0.85;
      ctx.beginPath();
      var started = false;
      for (var i = 0; i < pts.length; i++) {
        var p = project(pts[i], cx, cy, R);
        var isBack = p.d < 0;
        if ((pass === 0) !== isBack) { started = false; continue; }
        if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }

  function arrow(ctx, from, to, color, width, dashed) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width || 3;
    if (dashed) ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
    ctx.setLineDash([]);
    var ang = Math.atan2(to.y - from.y, to.x - from.x);
    if (Math.hypot(to.x - from.x, to.y - from.y) > 6) {
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - 10 * Math.cos(ang - 0.45), to.y - 10 * Math.sin(ang - 0.45));
      ctx.lineTo(to.x - 10 * Math.cos(ang + 0.45), to.y - 10 * Math.sin(ang + 0.45));
      ctx.closePath(); ctx.fill();
    }
  }

  var eq = [], mer = [], mer2 = [];
  for (var a = 0; a <= 360; a += 4) {
    var r = a * Math.PI / 180;
    eq.push({ x: Math.cos(r), y: Math.sin(r), z: 0 });
    mer.push({ x: Math.cos(r), y: 0, z: Math.sin(r) });
    mer2.push({ x: 0, y: Math.cos(r), z: Math.sin(r) });
  }

  AF.Bloch = {
    rotate: rotate,
    /* opts: { vec, ghost, fog, mixed, color, ghostColor, label, glow } */
    draw: function (canvas, opts) {
      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height;
      var cx = W / 2, cy = H / 2 + 4, R = Math.min(W, H) * 0.40;
      ctx.clearRect(0, 0, W, H);

      var g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.1, cx, cy, R * 1.05);
      g.addColorStop(0, 'rgba(60,70,140,0.55)'); g.addColorStop(1, 'rgba(10,12,34,0.85)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5a64b0'; ctx.lineWidth = 2; ctx.stroke();

      curve(ctx, eq, cx, cy, R, true, '#7a84d0');
      curve(ctx, mer, cx, cy, R, true, '#4a5498');
      curve(ctx, mer2, cx, cy, R, true, '#3a4488');

      var axes = [
        { v: { x: 0, y: 0, z: 1 }, l: '|0⟩', c: '#e8e6ff' }, { v: { x: 0, y: 0, z: -1 }, l: '|1⟩', c: '#e8e6ff' },
        { v: { x: 1, y: 0, z: 0 }, l: 'x', c: '#ff8ac4' }, { v: { x: 0, y: 1, z: 0 }, l: 'y', c: '#9affc8' }
      ];
      var o = project({ x: 0, y: 0, z: 0 }, cx, cy, R);
      ctx.font = '24px VT323, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      axes.forEach(function (ax) {
        var p = project(ax.v, cx, cy, R);
        var q = project({ x: ax.v.x * 1.22, y: ax.v.y * 1.22, z: ax.v.z * 1.22 }, cx, cy, R);
        ctx.strokeStyle = 'rgba(200,200,255,0.25)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.fillStyle = ax.c; ctx.fillText(ax.l, q.x, q.y);
      });

      if (opts.ghosts) opts.ghosts.forEach(function (gv) { arrow(ctx, o, project(gv, cx, cy, R), opts.ghostColor || 'rgba(255,201,64,0.45)', 2, true); });
      if (opts.ghost) {
        var gp = project(opts.ghost, cx, cy, R);
        arrow(ctx, o, gp, opts.ghostColor || 'rgba(255,201,64,0.85)', 2, true);
      }

      if (opts.fog) {
        ctx.fillStyle = 'rgba(8,8,20,0.55)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
        for (var i = 0; i < 140; i++) {
          var rr = Math.sqrt(Math.random()) * R, th = Math.random() * Math.PI * 2;
          ctx.fillStyle = ['#ff3fa4', '#00e5ff', '#e8e6ff', '#5a64b0'][i % 4];
          ctx.fillRect(cx + rr * Math.cos(th), cy + rr * Math.sin(th), 2, 2);
        }
        ctx.font = '60px VT323, monospace'; ctx.fillStyle = '#e8e6ff';
        ctx.fillText('?', cx, cy);
      } else if (opts.mixed) {
        ctx.fillStyle = opts.color || '#00e5ff';
        ctx.beginPath(); ctx.arc(o.x, o.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,229,255,0.4)';
        ctx.beginPath(); ctx.arc(o.x, o.y, 10 + Math.sin(Date.now() / 200) * 3, 0, Math.PI * 2); ctx.stroke();
      } else if (opts.vec) {
        var vp = project(opts.vec, cx, cy, R);
        if (opts.glow) { ctx.shadowColor = opts.color || '#00e5ff'; ctx.shadowBlur = 12; }
        arrow(ctx, o, vp, opts.color || '#00e5ff', 3.5);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(vp.x, vp.y, 3, 0, Math.PI * 2); ctx.fill();
      }

      if (opts.label) {
        ctx.font = '18px VT323, monospace'; ctx.fillStyle = '#cfcaff'; ctx.textAlign = 'left';
        ctx.fillText(opts.label, 8, 14);
      }
    }
  };
})(window.AF);
