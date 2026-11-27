/* =========================================================================
 * music.js — trilha sonora baiana, original, sintetizada ao vivo (WebAudio)
 *
 * Nenhum arquivo de áudio: um sequenciador agenda cada batida no relógio de
 * áudio do navegador. Cada lugar do jogo tem um ritmo da Bahia, com troca suave:
 *
 *   titulo   · "Salvador, 2495"        — IJEXÁ dos afoxés: agogô, atabaques (rum,
 *                                         rumpi, lê), xequerê, pad futurista e flauta
 *   praca    · "Comércio"              — SAMBA-REGGAE de bloco afro: surdos (fundo,
 *                                         dobra), caixa, timbal na clave, coro e metais.
 *                                         Antes da missão o bloco falha: o Silêncio
 *                                         derruba batidas e a melodia some
 *   praia    · "Maré na Baía"          — CANÇÃO PRAIEIRA: violão, ondas e ijexá leve
 *   torre    · "Labirinto do Silêncio" — toque de ANGOLA (capoeira): berimbau gunga
 *                                         (chiado-chiado-dom-dim), caxixi, pandeiro, atabaque
 *   sala     · "10 milikelvin"         — quase silêncio: pings de qubit e um berimbau distante
 *   jacobina · "Serra do Ouro"         — BAIÃO do sertão baiano: zabumba, triângulo, sanfona
 *   desafio  · "Roda de Ideias"        — SAMBA DE RODA do Recôncavo: viola machete,
 *                                         pandeiro, palmas e prato-e-faca
 *   festa    · "Trio no Circuito"      — AXÉ de trio elétrico: guitarra baiana e metais
 *
 * Todas as melodias são composições originais deste jogo (nenhuma música conhecida).
 * Controles: Menu → "Música" e "Volume da música"; a tecla M desliga todo o som.
 * ========================================================================= */
(function (AF) {
  'use strict';
  var A = AF.Audio;
  var PREF = 'afrotech_music';
  var LEVELS = [0, 0.6, 1.0, 1.5];
  var LEVEL_NAMES = ['', 'baixo', 'médio', 'alto'];

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  /* ======================= instrumentos ======================= */
  function noiseBuf(c) {
    if (c._afNoise) return c._afNoise;
    var len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return (c._afNoise = b);
  }
  function env(g, t, a, peak, d) {
    g.gain.value = 0;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function osc(c, type, f, t, stop) { var o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(stop); return o; }
  function tone(c, t, out, type, f, v, a, d, f2) {
    var o = osc(c, type, f, t, t + a + d + 0.05), g = c.createGain();
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + Math.min(0.08, d));
    env(g, t, a, v, d); o.connect(g); g.connect(out); return g;
  }
  function noise(c, t, dur, ftype, freq, q, v, out, a) {
    var s = c.createBufferSource(); s.buffer = noiseBuf(c);
    var f = c.createBiquadFilter(); f.type = ftype; f.frequency.value = freq; f.Q.value = q || 0.7;
    var g = c.createGain(); env(g, t, a || 0.002, v, dur);
    s.connect(f); f.connect(g); g.connect(out);
    s.start(t, Math.random() * 1.5); s.stop(t + (a || 0.002) + dur + 0.05);
  }
  var CURVE = (function () {
    var n = 1025, cv = new Float32Array(n), k = 9;      /* ímpar: o centro da curva é exatamente 0 (sem nível DC) */
    for (var i = 0; i < n; i++) { var x = i * 2 / (n - 1) - 1; cv[i] = (1 + k) * x / (1 + k * Math.abs(x)); }
    return cv;
  })();

  var I = {
    /* ---------- tambores ---------- */
    kick: function (c, t, o, v) { tone(c, t, o, 'sine', 130, v, 0.003, 0.3, 42); },
    surdo: function (c, t, o, v, f, muted) {
      f = f || 70;
      var g = tone(c, t, o, 'sine', f * 1.3, v, 0.004, muted ? 0.12 : 0.55, f);
      noise(c, t, 0.025, 'lowpass', 900, 0.7, v * 0.25, o);
      return g;
    },
    /* atabaque: 'a' aberto, 's' tapa (slap) */
    atabaque: function (c, t, o, v, f, kind) {
      if (kind === 's') { noise(c, t, 0.06, 'bandpass', 2300, 1.1, v * 0.9, o); tone(c, t, o, 'sine', f * 2, v * 0.3, 0.002, 0.05); return; }
      tone(c, t, o, 'sine', f * 1.35, v, 0.003, 0.36, f);
      tone(c, t, o, 'sine', f * 1.6, v * 0.25, 0.002, 0.12);
      noise(c, t, 0.02, 'bandpass', 1300, 1, v * 0.25, o);
    },
    repique: function (c, t, o, v) { tone(c, t, o, 'sine', 470, v, 0.002, 0.12, 410); noise(c, t, 0.03, 'highpass', 3200, 0.7, v * 0.6, o); },
    timbal: function (c, t, o, v, slap) {
      if (slap) { noise(c, t, 0.05, 'bandpass', 2700, 1.3, v, o); tone(c, t, o, 'sine', 640, v * 0.3, 0.002, 0.04); }
      else { tone(c, t, o, 'sine', 360, v, 0.002, 0.16, 320); noise(c, t, 0.02, 'bandpass', 1800, 1, v * 0.3, o); }
    },
    caixa: function (c, t, o, v, d) {
      noise(c, t, d || 0.07, 'bandpass', 2600, 0.6, v, o);
      if (v > 0.02) { noise(c, t, (d || 0.07) * 0.7, 'highpass', 6000, 0.7, v * 0.4, o); tone(c, t, o, 'triangle', 210, v * 0.4, 0.002, 0.06); }
    },
    hat: function (c, t, o, v, d) { noise(c, t, d || 0.035, 'highpass', 7500, 0.7, v, o); },
    shaker: function (c, t, o, v) { noise(c, t, 0.05, 'bandpass', 5200, 1.2, v, o, 0.008); },
    xequere: function (c, t, o, v) { noise(c, t, 0.07, 'bandpass', 4200, 0.9, v, o, 0.012); },
    caxixi: function (c, t, o, v) { noise(c, t, 0.045, 'bandpass', 6800, 1.4, v, o, 0.006); },

    /* ---------- metais de percussão ---------- */
    agogo: function (c, t, o, v, high) {
      var f = high ? 1175 : 880;
      tone(c, t, o, 'sine', f, v, 0.002, 0.24); tone(c, t, o, 'sine', f * 2.76, v * 0.35, 0.002, 0.18); tone(c, t, o, 'sine', f * 5.4, v * 0.12, 0.002, 0.1);
    },
    triangulo: function (c, t, o, v, open) {
      tone(c, t, o, 'sine', 2580, v, 0.001, open ? 0.45 : 0.05); tone(c, t, o, 'sine', 4130, v * 0.5, 0.001, open ? 0.4 : 0.04);
      if (open) tone(c, t, o, 'sine', 6210, v * 0.25, 0.001, 0.3);
    },
    /* prato-e-faca do samba de roda: a faca raspa o prato */
    prato: function (c, t, o, v) { noise(c, t, 0.05, 'bandpass', 4300, 4, v, o, 0.004); if (v > 0.012) tone(c, t, o, 'sine', 3150, v * 0.2, 0.001, 0.09); },
    /* pandeiro: 'g' grave (polegar), 't' tapa, 'p' platinelas */
    pandeiro: function (c, t, o, v, kind) {
      if (kind === 'g') tone(c, t, o, 'sine', 115, v, 0.003, 0.22, 78);
      if (kind === 't') noise(c, t, 0.05, 'bandpass', 1600, 0.9, v * 0.8, o);
      noise(c, t, 0.07, 'highpass', 7000, 0.8, kind === 'p' ? v : v * 0.35, o);
      if (kind === 'p' && v >= 0.014) tone(c, t, o, 'sine', 8200 + Math.random() * 400, v * 0.12, 0.001, 0.06);
    },
    palmas: function (c, t, o, v) {
      noise(c, t, 0.03, 'bandpass', 1050, 1.0, v * 0.6, o);
      noise(c, t + 0.011 + Math.random() * 0.005, 0.09, 'bandpass', 1250, 0.9, v, o);   /* várias mãos, quase juntas */
    },
    zabumba: function (c, t, o, v) { I.surdo(c, t, o, v, 64); },
    bacalhau: function (c, t, o, v) { noise(c, t, 0.03, 'highpass', 2600, 0.8, v, o); },

    /* ---------- berimbau ---------- 'tch' chiado · 'dong' corda solta · 'ding' corda presa (dobrão) */
    berimbau: function (c, t, o, v, kind, base, send) {
      base = base || 45;
      I.caxixi(c, t, o, v * 0.35);
      if (kind === 'tch') { noise(c, t, 0.045, 'bandpass', 2900, 3, v * 0.55, o); return; }
      var m = kind === 'ding' ? base + 2 : base, f = mtof(m), dur = kind === 'ding' ? 0.5 : 0.85;
      var flt = c.createBiquadFilter(), g = c.createGain();
      flt.type = 'bandpass'; flt.Q.value = 5;
      /* a cabaça abre e fecha na barriga: o "uãn" do berimbau */
      flt.frequency.setValueAtTime(kind === 'ding' ? 1150 : 950, t);
      flt.frequency.exponentialRampToValueAtTime(kind === 'ding' ? 720 : 500, t + dur * 0.6);
      [[1, 0, 1], [2, 4, 0.35]].forEach(function (p) {
        var s = osc(c, 'sawtooth', f * p[0], t, t + dur + 0.05); s.detune.value = p[1];
        var pg = c.createGain(); pg.gain.value = p[2]; s.connect(pg); pg.connect(flt);
      });
      env(g, t, 0.003, v * 2.2, dur);
      flt.connect(g); g.connect(o); if (send) g.connect(send);
      noise(c, t, 0.015, 'highpass', 3000, 0.7, v * 0.4, o);   /* a vareta na corda */
    },

    /* ---------- tonais ---------- */
    bass: function (c, t, o, m, dur, v, type) {
      var s = osc(c, type || 'sawtooth', mtof(m), t, t + dur + 0.1), f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(220, t + dur); f.Q.value = 3;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.setValueAtTime(v, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(o);
    },
    pad: function (c, t, o, ms, dur, v, cutoff) {
      var f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'lowpass'; f.frequency.value = cutoff || 1100; f.Q.value = 0.5;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + Math.min(0.8, dur * 0.3));
      g.gain.setValueAtTime(v, t + dur * 0.75); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.6);
      ms.forEach(function (m) { [-7, 7].forEach(function (ct) { var s = osc(c, 'sawtooth', mtof(m), t, t + dur + 0.7); s.detune.value = ct; s.connect(f); }); });
      f.connect(g); g.connect(o);
    },
    pluck: function (c, t, o, m, v, send, d) {
      var g = tone(c, t, o, 'triangle', mtof(m), v, 0.003, d || 0.35);
      tone(c, t, o, 'square', mtof(m), v * 0.18, 0.002, 0.08);
      if (send) g.connect(send);
    },
    violao: function (c, t, o, m, v, send) {
      var f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'lowpass'; f.frequency.value = 2100;
      var s1 = osc(c, 'triangle', mtof(m), t, t + 1.4), s2 = osc(c, 'sine', mtof(m) * 2, t, t + 0.8), g2 = c.createGain(); g2.gain.value = 0.22;
      s1.connect(f); s2.connect(g2); g2.connect(f); env(g, t, 0.003, v, 1.1); f.connect(g); g.connect(o); if (send) g.connect(send);
      noise(c, t, 0.012, 'bandpass', 3000, 1, v * 0.15, o);
    },
    /* viola machete: cordas de aço em pares, brilho que fecha rápido */
    machete: function (c, t, o, m, v, send) {
      var f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'lowpass'; f.Q.value = 2; f.frequency.setValueAtTime(3600, t); f.frequency.exponentialRampToValueAtTime(900, t + 0.28);
      osc(c, 'sawtooth', mtof(m), t, t + 0.6).connect(f);
      env(g, t, 0.002, v, 0.45); f.connect(g); g.connect(o); if (send) g.connect(send);
    },
    flauta: function (c, t, o, m, dur, v, send) {
      var g = c.createGain(), s = osc(c, 'sine', mtof(m), t, t + dur + 0.2), s2 = osc(c, 'triangle', mtof(m), t, t + dur + 0.2), g2 = c.createGain();
      var lfo = osc(c, 'sine', 5, t, t + dur + 0.2), lg = c.createGain();
      lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(9, t + Math.min(0.35, dur)); lfo.connect(lg); lg.connect(s.detune); lg.connect(s2.detune);
      g2.gain.value = 0.2; s.connect(g); s2.connect(g2); g2.connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.05); g.gain.setValueAtTime(v * 0.85, t + dur * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
      g.connect(o); if (send) g.connect(send);
      noise(c, t, 0.08, 'bandpass', mtof(m) * 2, 2, v * 0.12, o);   /* sopro */
    },
    /* coro: vozes em "ô", com dois formantes */
    coro: function (c, t, o, ms, dur, v, send) {
      var f1 = c.createBiquadFilter(), f2 = c.createBiquadFilter(), g = c.createGain(), mix = c.createGain();
      f1.type = 'bandpass'; f1.frequency.value = 480; f1.Q.value = 4;
      f2.type = 'bandpass'; f2.frequency.value = 860; f2.Q.value = 5;
      var lfo = osc(c, 'sine', 4.6 + Math.random(), t, t + dur + 0.3), lg = c.createGain(); lg.gain.value = 10; lfo.connect(lg);
      ms.forEach(function (m) {
        [-10, 10].forEach(function (ct) {
          var s = osc(c, 'sawtooth', mtof(m), t, t + dur + 0.3); s.detune.value = ct; lg.connect(s.detune);
          s.connect(mix);
        });
      });
      mix.connect(f1); mix.connect(f2);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.07); g.gain.setValueAtTime(v * 0.9, t + dur * 0.8); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.2);
      f1.connect(g); f2.connect(g); g.connect(o); if (send) g.connect(send);
    },
    /* metais: naipe de sopros com "bwap" no filtro */
    metais: function (c, t, o, ms, dur, v, send) {
      var f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'lowpass'; f.Q.value = 1.2;
      f.frequency.setValueAtTime(450, t); f.frequency.linearRampToValueAtTime(3200, t + 0.035); f.frequency.exponentialRampToValueAtTime(1500, t + 0.16);
      ms.forEach(function (m) { [-8, 8].forEach(function (ct) { var s = osc(c, 'sawtooth', mtof(m), t, t + dur + 0.15); s.detune.value = ct; s.connect(f); }); });
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.015); g.gain.setValueAtTime(v * 0.75, t + Math.max(0.03, dur - 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.09);
      f.connect(g); g.connect(o); if (send) g.connect(send);
    },
    /* guitarra baiana (a "guitarrinha" do trio elétrico): aguda, saturada, com vibrato */
    guitarra: function (c, t, o, m, dur, v, send) {
      var s = osc(c, 'sawtooth', mtof(m), t, t + dur + 0.15);
      var lfo = osc(c, 'sine', 6.2, t, t + dur + 0.15), lg = c.createGain();
      lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(14, t + Math.min(0.25, dur)); lfo.connect(lg); lg.connect(s.detune);
      var ws = c.createWaveShaper(); ws.curve = CURVE;
      var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 3600; f.Q.value = 1.5;
      var pre = c.createGain(); pre.gain.value = 0.7;
      s.connect(pre); pre.connect(ws); ws.connect(f);
      var g = c.createGain(); g.gain.value = 0;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.006); g.gain.setValueAtTime(v * 0.8, t + Math.max(0.02, dur - 0.02)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
      f.connect(g); g.connect(o); if (send) g.connect(send);
    },
    lead: function (c, t, o, m, dur, v, send, type) {
      var s = osc(c, type || 'square', mtof(m), t, t + dur + 0.15), g = c.createGain(), f = c.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 2200;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
      s.connect(f); f.connect(g); g.connect(o); if (send) g.connect(send);
    },
    /* sanfona: palhetas desafinadas de leve, com tremolo do fole */
    sanfona: function (c, t, o, m, dur, v, send) {
      var f = c.createBiquadFilter(), g = c.createGain(), trem = c.createGain();
      f.type = 'bandpass'; f.frequency.value = 1300; f.Q.value = 0.6;
      var lfo = osc(c, 'sine', 6, t, t + dur + 0.1), lg = c.createGain(); lg.gain.value = 0.18; lfo.connect(lg); lg.connect(trem.gain); trem.gain.value = 1;
      [[0, 'sawtooth', 1, 0], [0, 'sawtooth', 0.8, 9], [-12, 'square', 0.35, 0]].forEach(function (p) {
        var s = osc(c, p[1], mtof(m + p[0]), t, t + dur + 0.1); s.detune.value = p[3];
        var pg = c.createGain(); pg.gain.value = p[2]; s.connect(pg); pg.connect(f);
      });
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.04); g.gain.setValueAtTime(v, t + dur * 0.85); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.08);
      f.connect(trem); trem.connect(g); g.connect(o); if (send) g.connect(send);
    },
    /* fole da sanfona no acompanhamento: barato, sem tremolo */
    fole: function (c, t, o, ms, dur, v) {
      var f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 0.7;
      ms.forEach(function (m) { osc(c, 'sawtooth', mtof(m), t, t + dur + 0.1).connect(f); });
      g.gain.value = 0; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.03); g.gain.setValueAtTime(v, t + dur * 0.8); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.06);
      f.connect(g); g.connect(o);
    },
    ping: function (c, t, o, m, v, send) {
      var g = tone(c, t, o, 'sine', mtof(m), v, 0.004, 1.9); tone(c, t, o, 'sine', mtof(m) * 2.01, v * 0.25, 0.002, 0.6);
      if (send) g.connect(send);
    },
    drone: function (c, t, o, m, dur, v) {
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + dur * 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.3);
      [0, 6].forEach(function (ct) { var s = osc(c, 'sine', mtof(m), t, t + dur + 0.4); s.detune.value = ct; s.connect(g); });
      var s3 = osc(c, 'triangle', mtof(m + 12), t, t + dur + 0.4), g3 = c.createGain(); g3.gain.value = 0.25; s3.connect(g3); g3.connect(g);
      g.connect(o);
    },
    ondas: function (c, t, o, dur, v) {
      var s = c.createBufferSource(); s.buffer = noiseBuf(c); s.loop = true;
      var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(380, t); f.frequency.linearRampToValueAtTime(1100, t + dur * 0.4); f.frequency.linearRampToValueAtTime(300, t + dur);
      var g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + dur * 0.4); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(o); s.start(t); s.stop(t + dur + 0.1);
    },
    grilo: function (c, t, o, v) { for (var k = 0; k < 3; k++) tone(c, t + k * 0.07, o, 'sine', 4300 + Math.random() * 300, v, 0.004, 0.035); }
  };

  /* ======================= utilidades de composição ======================= */
  /* padrão em texto, uma letra por semicolcheia: '.' pausa; outras letras dizem o golpe */
  function hit(pat, s) { var ch = pat[s % pat.length]; return ch === '.' || ch === ' ' ? null : ch; }
  /* melodia: lista de [passo, nota MIDI, duração em passos] */
  function notesAt(mel, i) { var r = []; for (var k = 0; k < mel.length; k++) if (mel[k][0] === i) r.push(mel[k]); return r; }
  /* terça diatônica abaixo (para a segunda voz da viola), escala dada por classes de altura */
  function terca(m, scale) {
    var down = 0, n = m;
    while (down < 2 && n > m - 6) { n--; if (scale.indexOf(((n % 12) + 12) % 12) >= 0) down++; }
    return n;
  }
  var D_MAIOR = [2, 4, 6, 7, 9, 11, 1];
  var IJEXA = 'h.h.ll..h.h.l.l.';           /* agogô de ijexá (alto/baixo) */

  /* ======================= as trilhas ======================= */
  var TRACKS = {
    /* "Salvador, 2495" — ijexá dos afoxés com sintetizadores do futuro. Lá dórico: Am9 · D9 · Fmaj7 · Esus */
    titulo: {
      name: 'Salvador, 2495', style: 'ijexá (afoxé)', bpm: 92, steps: 64, vol: 1,
      bars: [{ r: 45, p: [60, 64, 67, 71] }, { r: 38, p: [57, 60, 64, 66] }, { r: 41, p: [60, 64, 65, 69] }, { r: 40, p: [59, 62, 64, 69] }],
      mel: [[0, 76, 4], [4, 74, 2], [6, 72, 2], [8, 74, 6], [16, 69, 3], [20, 72, 2], [22, 74, 2], [24, 76, 4], [28, 79, 4],
            [32, 81, 4], [36, 79, 2], [38, 76, 2], [40, 74, 6], [48, 72, 2], [50, 74, 2], [52, 72, 2], [54, 69, 10]],
      play: function (i, t, c, o, S, n) {
        var bar = (i / 16) | 0, s = i % 16, b = this.bars[bar];
        if (s === 0) I.pad(c, t, o, b.p, S * 16, 0.04, 950);
        if (hit('x.....x.x.......', s)) I.bass(c, t, o, b.r + (s === 8 ? 7 : 0), S * 3, 0.13, 'triangle');
        var ag = hit(IJEXA, s); if (ag) I.agogo(c, t, o, 0.03, ag === 'h');
        if (s % 2 === 0) I.xequere(c, t, o, s % 4 === 2 ? 0.03 : 0.013);
        if (s % 2 === 0) I.atabaque(c, t, o, 0.022, 235, 'a');                                  /* lê */
        if (hit('..x...x...x...xx', s)) I.atabaque(c, t, o, 0.035, 170, 'a');                   /* rumpi */
        var rum = hit(bar % 2 ? 'x..s..x...x.s.x.' : 'x.....x.s.x.....', s);                    /* rum */
        if (rum) I.atabaque(c, t, o, 0.06, 112, rum);
        if (n % 2 === 0) { if (s % 2 === 1) I.pluck(c, t, o, b.p[[0, 1, 2, 3, 2, 1, 3, 2][(s / 2) | 0]] + 12, 0.022, this.fx, 0.25); }
        else notesAt(this.mel, i).forEach(function (q) { I.flauta(c, t, o, q[1], q[2] * S, 0.04, TRACKS.titulo.fx); });
      }
    },

    /* "Comércio" — samba-reggae de bloco afro. Mi menor: Em7 · Em7 · A7 · A7 · C · D · Em · Em */
    praca: {
      name: 'Comércio', style: 'samba-reggae (bloco afro)', bpm: 98, steps: 128, vol: 1,
      roots: [40, 40, 45, 45, 36, 38, 40, 40],
      pads: [[64, 67, 71, 74], null, [61, 64, 67, 69], null, [60, 64, 67, 71], [62, 66, 69, 72], [64, 67, 71, 74], null],
      /* metais chamam, o coro responde */
      call: [[0, 76, 1], [2, 76, 1], [3, 79, 2], [6, 76, 2], [10, 74, 1], [11, 76, 4],
             [32, 76, 1], [34, 76, 1], [35, 79, 2], [38, 76, 2], [42, 74, 1], [43, 76, 4],
             [64, 79, 2], [66, 79, 1], [67, 81, 2], [70, 79, 2], [72, 76, 4],
             [96, 83, 2], [98, 81, 1], [99, 79, 1], [100, 76, 2], [102, 79, 2], [104, 76, 2], [106, 74, 2], [108, 71, 4]],
      resp: [[18, 71, 1], [19, 74, 1], [20, 76, 2], [24, 74, 2], [26, 71, 2], [28, 69, 3],
             [50, 73, 1], [51, 76, 1], [52, 79, 2], [56, 76, 2], [58, 73, 2], [60, 69, 3],
             [80, 78, 2], [82, 81, 2], [84, 78, 2], [86, 74, 2], [88, 76, 6],
             [112, 76, 8], [124, 74, 1], [125, 76, 2]],
      play: function (i, t, c, o, S) {
        var ok = AF.State.flag('restored');
        var bar = (i / 16) | 0, s = i % 16, fx = this.fx;
        /* antes da missão: o Silêncio derruba batidas e, nos dois últimos compassos, quase tudo cala */
        var calado = !ok && bar >= 6;
        var drop = function (p) { return !ok && Math.random() < p; };
        if (s === 0 && this.pads[bar]) I.pad(c, t, o, this.pads[bar], S * (bar === 4 || bar === 5 ? 16 : 32), ok ? 0.035 : 0.022, ok ? 1500 : 650);
        /* surdos: o fundo (grave) no 2 e no 4; o surdo de resposta no 1 e no 3 */
        if ((s === 4 || s === 12) && !drop(0.2)) I.surdo(c, t, o, 0.24, 52);
        if (s === 14 && bar % 2 === 1 && !calado && !drop(0.4)) I.surdo(c, t, o, 0.14, 52);
        if ((s === 0 || s === 8) && !calado && !drop(0.3)) I.surdo(c, t, o, 0.17, 72, s === 8 && bar % 2 === 0);
        if (hit('..xx..x...x.x.x.', s) && !calado && !drop(0.4)) I.surdo(c, t, o, 0.09, 104);   /* dobra rolando no contratempo */
        /* caixa: fantasmas em todas as semicolcheias e o contratempo duplo do reggae */
        if (!calado) {
          var acc = hit('..X...X...X...X.', s);
          if (acc && ok) I.caixa(c, t, o, 0.045);
          else if (!drop(0.5)) I.caixa(c, t, o, 0.009, 0.04);
        }
        /* timbal na clave do samba-reggae */
        if (hit('x..x..x...x.x...', s) && !calado && !drop(0.5)) I.timbal(c, t, o, 0.045, true);
        if (ok && hit('......x.......x.', s)) I.timbal(c, t, o, 0.03, false);
        if (ok && bar === 7 && s >= 8) I.repique(c, t, o, 0.02 + (s - 8) * 0.004);              /* virada do repique */
        if (ok && hit('x..x..x...x.x...', s)) I.bass(c, t, o, this.roots[bar] + (s === 6 ? 7 : s === 12 ? 12 : 0), S * 2.4, 0.13);
        if (ok) {
          notesAt(this.call, i).forEach(function (q) { I.metais(c, t, o, [q[1], q[1] - 12], q[2] * S, 0.028, fx); });
          notesAt(this.resp, i).forEach(function (q) { I.coro(c, t, o, [q[1] - 12], q[2] * S, 0.03, fx); });
        } else if (!calado) {
          /* a melodia chega em pedaços, como sinal falhando */
          notesAt(this.call, i).forEach(function (q) { if (Math.random() < 0.45) I.lead(c, t, o, q[1] + (Math.random() < 0.2 ? 1 : 0), Math.min(q[2], 2) * S, 0.018, fx, 'triangle'); });
        }
      }
    },

    /* "Maré na Baía" — canção praieira: violão, ondas e ijexá leve. Sol: G6/9 · Em7 · Am7 · D7sus4 */
    praia: {
      name: 'Maré na Baía', style: 'canção praieira com ijexá', bpm: 80, steps: 64, vol: 2,
      bars: [{ r: 43, v: [59, 62, 64, 69] }, { r: 40, v: [59, 62, 67, 71] }, { r: 45, v: [60, 64, 67, 72] }, { r: 38, v: [60, 62, 67, 69] }],
      mel: [[0, 71, 4], [4, 74, 4], [8, 76, 6], [16, 74, 2], [18, 71, 2], [20, 69, 4], [24, 67, 6],
            [32, 71, 3], [35, 74, 1], [36, 76, 4], [40, 79, 6], [48, 76, 2], [50, 74, 2], [52, 71, 4], [56, 74, 8]],
      play: function (i, t, c, o, S, n) {
        var bar = (i / 16) | 0, s = i % 16, b = this.bars[bar], fx = this.fx;
        if (s === 0 && bar % 2 === 0) I.ondas(c, t, o, S * 30, 0.08);
        if (s === 0) I.violao(c, t, o, b.r, 0.07, null);
        if (s === 8) I.violao(c, t, o, b.r + 7, 0.055, null);
        var up = { 2: 1, 4: 2, 6: 3, 10: 2, 12: 3, 14: 0 }[s];
        if (up !== undefined) I.violao(c, t, o, b.v[up], 0.035, fx);
        var ag = hit(IJEXA, s); if (ag) I.agogo(c, t, o, 0.014, ag === 'h');
        if (s % 4 === 2) I.xequere(c, t, o, 0.012);
        if (hit('..x...x...x...x.', s)) I.atabaque(c, t, o, 0.018, 220, 'a');
        if (n % 2 === 1) notesAt(this.mel, i).forEach(function (q) { I.flauta(c, t, o, q[1], q[2] * S, 0.035, fx); });
      }
    },

    /* "Labirinto do Silêncio" — toque de Angola na capoeira, sobre um fundo sombrio. Lá */
    torre: {
      name: 'Labirinto do Silêncio', style: 'toque de Angola (capoeira)', bpm: 76, steps: 64, vol: 1,
      play: function (i, t, c, o, S) {
        var ok = AF.State.flag('restored');
        var s = i % 16, k = i % 8, cyc = (i / 8) | 0, fx = this.fx;
        if (i === 0) { I.drone(c, t, o, 33, S * 64, 0.08); I.drone(c, t, o, 40, S * 64, 0.035); }
        if (i % 32 === 0) I.pad(c, t, o, i ? [57, 60, 64, 71] : [57, 60, 62, 64], S * 32, 0.022, ok ? 1100 : 600);
        /* berimbau gunga: chiado, chiado, dom (solta), dim (presa) */
        if (k === 0 || k === 2) I.berimbau(c, t, o, 0.05, 'tch');
        if (k === 4) I.berimbau(c, t, o, 0.06, 'dong', 45, fx);
        if (k === 6) I.berimbau(c, t, o, 0.055, 'ding', 45, fx);
        if (cyc % 4 === 3 && k === 5) I.berimbau(c, t, o, 0.045, 'dong', 45, fx);              /* variação */
        /* depois da missão, o berimbau viola (agudo) improvisa por cima */
        if (ok && cyc % 2 === 1 && (k === 3 || k === 7)) I.berimbau(c, t, o, 0.03, k === 3 ? 'ding' : 'dong', 57, fx);
        if (k === 4) I.pandeiro(c, t, o, 0.05, 'g');
        if (k === 0 || k === 2 || k === 6) I.pandeiro(c, t, o, 0.014, 'p');
        if (s === 4 || s === 12) I.atabaque(c, t, o, 0.045, 100, 'a');
        if (s === 10) I.atabaque(c, t, o, 0.025, 100, 's');
        if (k === 0) I.agogo(c, t, o, 0.016, cyc % 2 === 0);
      }
    },

    /* "10 milikelvin" — quase silêncio: pings de qubit e um berimbau ao longe */
    sala: {
      name: '10 milikelvin', style: 'berimbau distante e qubits', bpm: 60, steps: 32, vol: 1,
      pings: [[0, 81], [3, 88], [6, 85], [10, 93], [16, 83], [20, 90], [24, 88], [28, 85]],
      play: function (i, t, c, o) {
        var ok = AF.State.flag('restored'), fx = this.fx;
        if (i === 0) { I.drone(c, t, o, 33, 32 * 0.25, 0.07); noise(c, t, 7.5, 'bandpass', 9000, 0.5, 0.004, o); }
        if (i % 8 === 0) I.pad(c, t, o, ok ? [69, 76, 80] : [69, 76], 2, 0.013, 600);
        this.pings.forEach(function (p) { if (p[0] === i) I.ping(c, t, o, p[1], 0.032, fx); });
        if (i === 12) I.berimbau(c, t, o, 0.018, 'ding', 45, fx);
        if (i === 30) I.berimbau(c, t, o, 0.016, 'dong', 45, fx);
      }
    },

    /* "Serra do Ouro" — baião do sertão baiano. Sol mixolídio: G · F · C · G */
    jacobina: {
      name: 'Serra do Ouro', style: 'baião (forró pé-de-serra)', bpm: 108, steps: 128, vol: 1,
      roots: [43, 41, 36, 43],
      chords: [[59, 62, 67], [57, 60, 65], [55, 60, 64], [59, 62, 67]],
      mel: [[0, 74, 2], [2, 72, 2], [4, 71, 2], [6, 69, 3], [10, 71, 2], [12, 72, 4],
            [16, 77, 3], [19, 76, 1], [20, 74, 2], [22, 72, 2], [24, 74, 6], [30, 72, 2],
            [32, 72, 2], [34, 74, 2], [36, 76, 3], [40, 79, 2], [42, 77, 2], [44, 76, 4],
            [48, 74, 3], [52, 71, 2], [54, 72, 2], [56, 74, 8],
            [64, 79, 3], [67, 77, 1], [68, 76, 2], [70, 74, 2], [72, 77, 4], [76, 76, 2], [78, 74, 2],
            [80, 72, 3], [83, 71, 1], [84, 69, 2], [86, 71, 2], [88, 72, 4], [92, 74, 4],
            [96, 76, 2], [98, 74, 2], [100, 72, 2], [102, 71, 2], [104, 72, 3], [107, 74, 1], [108, 72, 4],
            [112, 71, 2], [114, 69, 2], [116, 67, 8]],
      play: function (i, t, c, o, S) {
        var bar = ((i / 16) | 0) % 4, s = i % 16, root = this.roots[bar], fx = this.fx;
        var z = hit('x..x....x..x.x..', s);                                   /* zabumba: 3 + 3 + 2 */
        if (z) I.zabumba(c, t, o, s === 0 || s === 8 ? 0.2 : 0.11);
        if (s === 4 || s === 12) I.bacalhau(c, t, o, 0.035);
        I.triangulo(c, t, o, s % 4 === 2 ? 0.02 : 0.009, s % 4 === 2);
        if (hit('x..x....x..x....', s)) I.bass(c, t, o, root - 12 + (s === 3 || s === 11 ? 7 : 0), S * 2.5, 0.13);
        if (s === 6 || s === 14) I.fole(c, t, o, this.chords[bar].map(function (m) { return m - 12; }), S * 1.5, 0.03);   /* acorde do fole */
        notesAt(this.mel, i).forEach(function (q) { I.sanfona(c, t, o, q[1], q[2] * S * 0.95, 0.05, fx); });
        if (i % 32 === 20 && Math.random() < 0.7) I.grilo(c, t, o, 0.012);
      }
    },

    /* "Roda de Ideias" — samba de roda do Recôncavo. Ré: D · A7 · D · G A7 */
    desafio: {
      name: 'Roda de Ideias', style: 'samba de roda do Recôncavo', bpm: 100, steps: 64, vol: 2.2,
      riff: [[0, 78], [2, 76], [3, 74], [6, 76], [8, 78], [10, 81], [12, 78], [14, 76],
             [16, 76], [18, 73], [19, 73], [22, 76], [24, 79], [26, 76], [28, 73], [30, 69],
             [32, 74], [34, 78], [35, 81], [38, 78], [40, 74], [42, 76], [44, 78], [46, 74],
             [48, 79], [50, 78], [52, 74], [54, 71], [56, 76], [58, 73], [60, 69], [62, 73]],
      coro: [[0, 78, 12], [16, 76, 12], [32, 74, 12], [48, 71, 6], [56, 73, 6]],
      play: function (i, t, c, o, S, n) {
        var s = i % 16, fx = this.fx;
        /* pandeiro: grave do polegar no tempo, platinelas no resto */
        if (s === 0 || s === 8) I.pandeiro(c, t, o, 0.055, 'g');
        else if (s === 7 || s === 15) I.pandeiro(c, t, o, 0.03, 'g');
        else if (s === 4 || s === 12) I.pandeiro(c, t, o, 0.03, 't');
        else I.pandeiro(c, t, o, s % 2 ? 0.01 : 0.016, 'p');
        if (hit('x..x..x.x..x..x.', s)) I.palmas(c, t, o, 0.032);
        if (s % 2 === 0) I.prato(c, t, o, s % 4 === 0 ? 0.016 : 0.009);
        var at = hit('a...s.....a.s...', s); if (at) I.atabaque(c, t, o, 0.04, 120, at);
        this.riff.forEach(function (q) {
          if (q[0] !== i) return;
          var m = n % 2 ? q[1] - 12 : q[1];
          I.machete(c, t, o, m, 0.032, fx); I.machete(c, t, o, terca(m, D_MAIOR), 0.024, null);
        });
        if (n % 2 === 1) notesAt(this.coro, i).forEach(function (q) { I.coro(c, t, o, [q[1] - 12, terca(q[1], D_MAIOR) - 12], q[2] * S, 0.022, fx); });
      }
    },

    /* "Trio no Circuito" — axé de trio elétrico para a vitória. Lá: A · D · E · A */
    festa: {
      name: 'Trio no Circuito', style: 'axé de trio elétrico', bpm: 136, steps: 64, vol: 0.9,
      roots: [45, 38, 40, 45],
      stabs: [[69, 73, 76], [69, 74, 78], [68, 71, 76], [69, 73, 76]],
      mel: [[0, 81, 2], [2, 80, 1], [3, 78, 1], [4, 76, 2], [6, 78, 1], [7, 80, 1], [8, 81, 3], [12, 76, 2], [14, 73, 2],
            [16, 74, 2], [18, 78, 2], [20, 81, 2], [22, 78, 1], [23, 76, 1], [24, 74, 3], [28, 73, 1], [29, 74, 1], [30, 76, 2],
            [32, 80, 2], [34, 83, 2], [36, 80, 1], [37, 78, 1], [38, 76, 2], [40, 80, 3], [44, 83, 2], [46, 85, 2],
            [48, 86, 3], [51, 85, 1], [52, 83, 2], [54, 80, 2], [56, 81, 6], [62, 76, 2]],
      play: function (i, t, c, o, S) {
        var bar = (i / 16) | 0, s = i % 16, fx = this.fx;
        if (s === 0 || s === 8) I.kick(c, t, o, 0.1);
        if (s === 4 || s === 12) I.surdo(c, t, o, 0.2, 60);
        var ac = hit('X..X..X.X..X..X.', s);
        if (ac) I.caixa(c, t, o, 0.035, 0.07); else if (s % 2) I.caixa(c, t, o, 0.011, 0.035);
        if (s % 4 === 2) I.timbal(c, t, o, 0.035, false);
        if (s === 3 || s === 11) I.timbal(c, t, o, 0.03, true);
        if (s % 2 === 0) I.shaker(c, t, o, 0.012);
        if (hit('x..x..x.x..x..x.', s)) I.bass(c, t, o, this.roots[bar] + (s === 6 || s === 14 ? 12 : 0), S * 1.6, 0.12);
        if (s === 6 || s === 14) I.metais(c, t, o, this.stabs[bar], S * 1.2, 0.022, fx);
        notesAt(this.mel, i).forEach(function (q) { I.guitarra(c, t, o, q[1], q[2] * S * 0.95, 0.04, fx); });
      }
    }
  };

  /* ======================= motor ======================= */
  var M = AF.Music = {
    on: true, level: 2, cur: null, inst: null, bus: null, fx: null, _chk: 0, _ctx: null, _seen: {},
    TRACKS: TRACKS, I: I,

    init: function () {
      try {
        var p = JSON.parse(localStorage.getItem(PREF) || 'null');
        if (p) { this.on = p.on !== false; this.level = Math.max(1, Math.min(3, p.level || 2)); }
      } catch (e) { /* ok */ }
    },
    save: function () { try { localStorage.setItem(PREF, JSON.stringify({ on: this.on, level: this.level })); } catch (e) { /* ok */ } },

    /* barramento da música → master (assim a tecla M também cala a música) + eco */
    build: function (c, dest) {
      var bus = c.createGain(); bus.gain.value = 0;
      var d = c.createDelay(1.0), fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain();
      d.delayTime.value = 0.36; fb.gain.value = 0.3; lp.type = 'lowpass'; lp.frequency.value = 2200; wet.gain.value = 0.32;
      d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(bus);
      bus.connect(dest);
      return { bus: bus, fx: d };
    },
    graph: function () {
      var c = A.ctx;
      if (!c) return false;
      if (this._ctx !== c) { var b = this.build(c, A.master); this.bus = b.bus; this.fx = b.fx; this._ctx = c; this.cur = null; this.inst = null; }
      return true;
    },

    /* qual trilha combina com o momento */
    desired: function () {
      var G = AF.Game;
      if (G && G.mode === 'trip' && AF.Trip && AF.Trip.music) return AF.Trip.music;
      if (!G || G.mode !== 'play' || this._credits) return 'titulo';
      if (this._ending) return 'festa';
      if (this._modal) return 'desafio';
      var W = AF.World, id = W && W.mapId, area = W && W.area && W.area.name;
      if (id === 'jacobina') return 'jacobina';
      if (id === 'ribeira') return 'praia';
      if (id === 'torre') return area === 'Sala do Computador Quântico' ? 'sala' : 'torre';
      if (id === 'praca' && area === 'Prainha da Baía') return 'praia';
      return 'praca';
    },

    level01: function () {
      if (!this.on || A.muted) return 0;
      var v = LEVELS[this.level];
      if (AF.Dialogue && AF.Dialogue.active) v *= 0.6;          /* abaixa durante os diálogos */
      if (AF.World && AF.World.sleeping) v *= 0.4;              /* e quando o(a) agente dorme */
      return v;
    },

    update: function () {
      if (!A.ctx || A.ctx.state !== 'running' || !this.graph()) return;
      var c = A.ctx, now = c.currentTime;
      if ((this._chk -= 1) <= 0) {
        this._chk = 12;
        this._modal = !!document.querySelector('.modal-mini, .modal-sim');
        this._ending = !!document.querySelector('.ending');
        this._credits = !!document.querySelector('.credits-roll');
      }
      this.bus.gain.setTargetAtTime(this.level01(), now, 0.25);
      var want = this.on ? this.desired() : null;
      if (want !== this.cur) this.switchTo(want);
      var it = this.inst;
      if (!it) return;
      if (it.next < now - 0.3) it.next = now + 0.05;                /* a aba voltou do segundo plano */
      var def = it.def, S = 60 / def.bpm / 4;
      while (it.next < now + 0.2) {
        try { def.play(it.step, it.next, c, it.gain, S, it.loop); } catch (e) { /* uma nota ruim não para a música */ }
        it.step++;
        if (it.step >= def.steps) { it.step = 0; it.loop++; }
        it.next += S;
      }
    },

    switchTo: function (name) {
      var c = A.ctx, now = c.currentTime;
      if (this.inst) {
        var old = this.inst.gain;
        old.gain.cancelScheduledValues(now); old.gain.setValueAtTime(old.gain.value, now); old.gain.linearRampToValueAtTime(0.0001, now + 1.4);
        setTimeout(function () { try { old.disconnect(); } catch (e) { /* ok */ } }, 2600);
      }
      this.cur = name; this.inst = null;
      if (!name) return;
      var def = TRACKS[name]; def.fx = this.fx;
      var g = c.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(def.vol || 1, now + 1.6); g.connect(this.bus);
      this.inst = { def: def, gain: g, step: 0, loop: 0, next: now + 0.08 };
      /* na primeira vez de cada trilha, um aviso discreto com o ritmo baiano */
      if (AF.Game && AF.Game.mode === 'play' && !this._seen[name] && name !== 'desafio' && name !== 'festa' && AF.Toast && A.ctx && !A.muted && this.on) {
        this._seen[name] = 1;
        setTimeout(function () { AF.Toast.show('♪ ' + def.name + ' · ' + def.style, 'dim'); }, 900);
      }
    },

    /* ---------- controles ---------- */
    toggle: function () {
      this.on = !this.on; this.save();
      if (AF.Toast) AF.Toast.show(this.on ? 'Música ligada' : 'Música desligada', 'dim');
    },
    cycleLevel: function () { this.level = this.level % 3 + 1; if (!this.on) this.on = true; this.save(); },
    label: function () { return 'Música: ' + (this.on ? 'ligada' : 'desligada'); },
    levelLabel: function () { return 'Volume da música: ' + LEVEL_NAMES[this.level]; },
    nowPlaying: function () { var d = this.cur && TRACKS[this.cur]; return d ? d.name + ' · ' + d.style : ''; },

    /* para testes: renderiza uma trilha fora do tempo real e mede os níveis */
    render: function (name, secs) {
      var Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      var sr = 22050, c = new Ctx(1, Math.ceil(sr * secs), sr), def = TRACKS[name];
      var b = this.build(c, c.destination); b.bus.gain.value = LEVELS[3];
      var prev = def.fx; def.fx = b.fx;
      var g = c.createGain(); g.gain.value = def.vol || 1; g.connect(b.bus);
      var S = 60 / def.bpm / 4, t = 0.05, step = 0, loop = 0;
      while (t < secs - 0.5) { def.play(step, t, c, g, S, loop); step++; if (step >= def.steps) { step = 0; loop++; } t += S; }
      def.fx = prev;
      return c.startRendering().then(function (buf) {
        var d = buf.getChannelData(0), peak = 0, sum = 0;
        for (var k = 0; k < d.length; k++) { var a = Math.abs(d[k]); if (a > peak) peak = a; sum += d[k] * d[k]; }
        return { peak: peak, rms: Math.sqrt(sum / d.length) };
      });
    }
  };
  M.init();
})(window.AF);
