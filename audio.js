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
      }
    }
  };
})(window.AF);
