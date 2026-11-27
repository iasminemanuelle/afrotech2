/* =========================================================================
 * audio.js — efeitos sonoros sintetizados com WebAudio (sem arquivos)
 * ========================================================================= */
(function (AF) {
  'use strict';

  var A = AF.Audio = {
    ctx: null, master: null, muted: false, vol: 0.16,

    unlock: function () {
      if (!this.ctx) {
        try {
          var Ctx = window.AudioContext || window.webkitAudioContext;
          if (!Ctx) return;
          this.ctx = new Ctx();
          this.master = this.ctx.createGain();
          this.master.gain.value = this.muted ? 0 : this.vol;
          this.master.connect(this.ctx.destination);
        } catch (e) { this.ctx = null; }
      } else if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },

    toggle: function () {
      this.muted = !this.muted;
      if (this.master) this.master.gain.value = this.muted ? 0 : this.vol;
      if (AF.Toast) AF.Toast.show(this.muted ? 'Som desligado (M)' : 'Som ligado (M)', 'dim');
    },

    tone: function (freq, dur, type, vol, slideTo, delay) {
      if (!this.ctx || this.muted) return;
      var t0 = this.ctx.currentTime + (delay || 0);
      var o = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(vol || 0.3, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(this.master);
      o.start(t0); o.stop(t0 + dur + 0.02);
    },

    noise: function (dur, vol, delay) {
      if (!this.ctx || this.muted) return;
      var t0 = this.ctx.currentTime + (delay || 0);
      var len = Math.floor(this.ctx.sampleRate * dur);
      var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = this.ctx.createBufferSource();
      var g = this.ctx.createGain();
      g.gain.value = vol || 0.3;
      src.buffer = buf; src.connect(g); g.connect(this.master);
      src.start(t0);
    },

    /* ruído filtrado curto (passos, portas, água) */
    fnoise: function (dur, vol, type, freq, q, delay, sweepTo) {
      if (!this.ctx || this.muted) return;
      var c = this.ctx, t0 = c.currentTime + (delay || 0);
      if (!this._nb) {
        var len = c.sampleRate, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this._nb = b;
      }
      var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      src.buffer = this._nb; f.type = type || 'bandpass'; f.frequency.setValueAtTime(freq || 1200, t0); f.Q.value = q || 0.8;
      if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + Math.min(0.01, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f); f.connect(g); g.connect(this.master);
      src.start(t0, Math.random() * 0.5); src.stop(t0 + dur + 0.02);
    },

    /* passos: o som muda com o chão */
    _foot: 0,
    step: function (kind) {
      if (!this.ctx || this.muted) return;
      this._foot = 1 - this._foot;
      var k = this._foot ? 1 : 0.88, r = 0.92 + Math.random() * 0.16;
      switch (kind) {
        case 'areia': this.fnoise(0.08, 0.09, 'lowpass', 900 * k * r, 0.7); break;
        case 'madeira': this.tone(150 * k * r, 0.05, 'triangle', 0.11); this.fnoise(0.03, 0.05, 'bandpass', 900 * k, 1.2); break;
        case 'metal': this.tone(560 * k * r, 0.025, 'square', 0.03); this.fnoise(0.035, 0.05, 'highpass', 3200 * k, 0.8); break;
        case 'terra': this.fnoise(0.06, 0.08, 'lowpass', 650 * k * r, 0.9); break;
        case 'agua': this.fnoise(0.22, 0.09, 'bandpass', 700 * r, 0.9, 0, 1400); break;
        default: this.fnoise(0.035, 0.07, 'bandpass', 1800 * k * r, 1.4); this.tone(190 * k, 0.02, 'triangle', 0.04);
      }
    },

    /* vozes dos personagens: cada um tem um timbre nos "bipes" do texto */
    VOICES: {
      oraculo: [880, 'sine', 1320], k7: [210, 'square'], dandara: [430, 'triangle'], iasmin: [500, 'sine'],
      jamal: [300, 'triangle'], cici: [540, 'triangle'], kaua: [620, 'square'], zeza: [470, 'triangle'],
      socorro: [380, 'sine'], davi: [720, 'square'], hohenfeld: [250, 'triangle'], player: [410, 'triangle'],
      miayo: [580, 'triangle'], lu: [480, 'sine'], didi: [230, 'triangle']
    },
    talk: function (who) {
      if (!this.ctx || this.muted) return;
      var v = this.VOICES[who];
      if (!v) { this.play('blip'); return; }
      var f = v[0] * (0.94 + Math.random() * 0.12);
      this.tone(f, 0.04, v[1], v[1] === 'square' ? 0.04 : 0.07);
      if (v[2]) this.tone(v[2], 0.03, 'sine', 0.03, 0, 0.02);
    },

    play: function (name) {
      switch (name) {
        case 'blip': this.tone(1240, 0.025, 'square', 0.06); break;
        case 'select': this.tone(660, 0.05, 'square', 0.18); this.tone(990, 0.06, 'square', 0.14, 0, 0.05); break;
        case 'open': this.tone(440, 0.06, 'triangle', 0.25, 880); break;
        case 'close': this.tone(700, 0.06, 'triangle', 0.2, 350); break;
        case 'dice': this.tone(180 + Math.random() * 220, 0.03, 'square', 0.12); break;
        case 'success':
          this.tone(523, 0.1, 'square', 0.2); this.tone(659, 0.1, 'square', 0.2, 0, 0.09);
          this.tone(784, 0.1, 'square', 0.2, 0, 0.18); this.tone(1047, 0.22, 'square', 0.2, 0, 0.27); break;
        case 'fail':
          this.noise(0.25, 0.25); this.tone(220, 0.3, 'sawtooth', 0.2, 70); break;
        case 'glitch': this.noise(0.12, 0.2); this.tone(90 + Math.random() * 80, 0.1, 'sawtooth', 0.12, 40); break;
        case 'note': this.tone(880, 0.08, 'triangle', 0.18); this.tone(1320, 0.12, 'triangle', 0.14, 0, 0.07); break;
        case 'door': this.tone(300, 0.12, 'triangle', 0.25, 600); this.tone(600, 0.15, 'sine', 0.2, 1200, 0.1); break;
        case 'gate': this.tone(200, 0.08, 'square', 0.15); this.tone(400, 0.08, 'square', 0.15, 0, 0.08); this.tone(800, 0.15, 'square', 0.15, 0, 0.16); break;
        case 'quantum': this.tone(330, 0.4, 'sine', 0.2, 990); this.tone(495, 0.4, 'sine', 0.12, 1485, 0.05); break;
        case 'victory':
          [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { A.tone(f, 0.18, 'square', 0.18, 0, i * 0.12); });
          break;
        case 'hurt': this.tone(160, 0.12, 'square', 0.2, 80); break;
        case 'door_open':                                 /* porta pneumática abrindo */
          this.fnoise(0.32, 0.12, 'bandpass', 600, 0.9, 0, 2600); this.tone(220, 0.18, 'triangle', 0.14, 440); this.tone(90, 0.08, 'square', 0.06, 0, 0.28); break;
        case 'door_close':                                /* porta fechando: desliza e trava */
          this.fnoise(0.25, 0.1, 'bandpass', 2200, 0.9, 0, 500); this.tone(380, 0.16, 'triangle', 0.12, 160); this.tone(70, 0.1, 'square', 0.12, 50, 0.2); this.fnoise(0.05, 0.12, 'lowpass', 400, 0.7, 0.2); break;
        case 'house_door':                                /* porta de madeira de casa */
          this.tone(180, 0.06, 'triangle', 0.12, 120); this.fnoise(0.18, 0.06, 'bandpass', 500, 2, 0.02, 900); this.tone(110, 0.08, 'triangle', 0.14, 70, 0.22); break;
        case 'splash': this.fnoise(0.35, 0.16, 'bandpass', 1500, 0.7, 0, 400); this.tone(500, 0.12, 'sine', 0.06, 220); break;
        case 'chime': this.tone(880, 0.35, 'sine', 0.16); this.tone(660, 0.5, 'sine', 0.16, 0, 0.32); break;
        case 'cash': this.tone(1320, 0.06, 'square', 0.1); this.tone(1760, 0.18, 'square', 0.1, 0, 0.07); this.fnoise(0.12, 0.06, 'highpass', 5000, 0.8, 0.05); break;
        case 'card': this.fnoise(0.05, 0.08, 'highpass', 3000, 0.8); this.tone(900, 0.04, 'triangle', 0.06, 1200); break;
        case 'snore': this.fnoise(0.8, 0.05, 'lowpass', 300, 1, 0, 600); this.fnoise(0.6, 0.04, 'lowpass', 500, 1, 1.0, 250); break;
      }
    }
  };
})(window.AF);
