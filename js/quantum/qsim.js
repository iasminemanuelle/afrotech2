/* =========================================================================
 * qsim.js — simulador de vetor de estado (3 qubits) para o protocolo de
 * teletransporte. Física real: amplitudes complexas, H, X, Z, CNOT e medição
 * com colapso probabilístico (regra de Born).
 *
 *   q0 = qubit |ψ⟩ de Dandara     q1 = metade de Dandara do par |Φ+⟩
 *   q2 = metade de Jamal (Jacobina)
 *   Índice da base: i = (b0 << 2) | (b1 << 1) | b2
 * ========================================================================= */
(function (AF) {
  'use strict';

  function C(re, im) { return { re: re, im: im || 0 }; }
  function add(a, b) { return C(a.re + b.re, a.im + b.im); }
  function mul(a, b) { return C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }
  function scale(a, s) { return C(a.re * s, a.im * s); }
  function conj(a) { return C(a.re, -a.im); }
  function abs2(a) { return a.re * a.re + a.im * a.im; }

  var R2 = Math.SQRT1_2;
  var GATES = {
    I: [[C(1), C(0)], [C(0), C(1)]],
    X: [[C(0), C(1)], [C(1), C(0)]],
    Z: [[C(1), C(0)], [C(0), C(-1)]],
    H: [[C(R2), C(R2)], [C(R2), C(-R2)]]
  };

  function Register(n) {
    this.n = n;
    this.v = [];
    for (var i = 0; i < (1 << n); i++) this.v.push(C(0));
    this.v[0] = C(1);
  }
  Register.prototype.step = function (q) { return 1 << (this.n - 1 - q); };
  Register.prototype.apply1 = function (q, M) {
    var s = this.step(q);
    for (var i = 0; i < this.v.length; i++) {
      if (i & s) continue;
      var j = i | s, a0 = this.v[i], a1 = this.v[j];
      this.v[i] = add(mul(M[0][0], a0), mul(M[0][1], a1));
      this.v[j] = add(mul(M[1][0], a0), mul(M[1][1], a1));
    }
  };
  Register.prototype.cnot = function (c, t) {
    var cs = this.step(c), ts = this.step(t);
    for (var i = 0; i < this.v.length; i++) {
      if ((i & cs) && !(i & ts)) { var j = i | ts, tmp = this.v[i]; this.v[i] = this.v[j]; this.v[j] = tmp; }
    }
  };
  Register.prototype.measure = function (q, rng) {
    var s = this.step(q), p1 = 0, i;
    for (i = 0; i < this.v.length; i++) if (i & s) p1 += abs2(this.v[i]);
    var bit = (rng || Math.random)() < p1 ? 1 : 0;
    var norm = Math.sqrt(bit ? p1 : 1 - p1);
    for (i = 0; i < this.v.length; i++) {
      var has = (i & s) ? 1 : 0;
      this.v[i] = (has === bit) ? scale(this.v[i], 1 / norm) : C(0);
    }
    return bit;
  };

  /* vetor de Bloch do estado reduzido de um qubit do registro (encolhe quando ele está emaranhado) */
  function reduced(reg, q) {
    var s = reg.step(q), r00 = 0, r11 = 0, re = 0, im = 0;
    for (var i = 0; i < reg.v.length; i++) {
      if (i & s) continue;
      var a = reg.v[i], b = reg.v[i | s], ab = mul(conj(a), b);
      r00 += abs2(a); r11 += abs2(b); re += ab.re; im += ab.im;
    }
    return { x: 2 * re, y: 2 * im, z: r00 - r11 };
  }

  function bloch(st) {
    var ab = mul(conj(st[0]), st[1]);
    return { x: 2 * ab.re, y: 2 * ab.im, z: abs2(st[0]) - abs2(st[1]) };
  }

  /* Estado aleatório evitando eixos: garante que toda correção errada
     produza fidelidade visivelmente baixa (F_errada = x², y² ou z² < 0,62) */
  function randomState() {
    var x, y, z, tries = 0;
    do {
      z = Math.random() * 2 - 1;
      var phi = Math.random() * Math.PI * 2, rr = Math.sqrt(1 - z * z);
      x = rr * Math.cos(phi); y = rr * Math.sin(phi);
      tries++;
    } while ((Math.abs(x) > 0.78 || Math.abs(y) > 0.78 || Math.abs(z) > 0.78) && tries < 500);
    var theta = Math.acos(z), ph = Math.atan2(y, x);
    var a = C(Math.cos(theta / 2));
    var b = C(Math.cos(ph) * Math.sin(theta / 2), Math.sin(ph) * Math.sin(theta / 2));
    return [a, b];
  }

  function apply2(st, M) {
    return [add(mul(M[0][0], st[0]), mul(M[0][1], st[1])), add(mul(M[1][0], st[0]), mul(M[1][1], st[1]))];
  }

  function fidelity(psi, phi) {
    var ip = add(mul(conj(psi[0]), phi[0]), mul(conj(psi[1]), phi[1]));
    return abs2(ip);
  }

  /* Executa o protocolo completo e devolve os bits medidos e o qubit de Jamal */
  function teleport(psi) {
    var r = new Register(3);
    r.v[0] = C(0); r.v[0b000] = psi[0]; r.v[0b100] = psi[1];   // |ψ⟩ ⊗ |0⟩ ⊗ |0⟩
    r.apply1(1, GATES.H); r.cnot(1, 2);                          // par de Bell |Φ+⟩ em q1,q2
    r.cnot(0, 1); r.apply1(0, GATES.H);                          // operações de Dandara
    var m1 = r.measure(0), m2 = r.measure(1);                    // medição em Salvador
    var base = (m1 << 2) | (m2 << 1);
    return { m1: m1, m2: m2, bits: '' + m1 + m2, jamal: [r.v[base], r.v[base | 1]] };
  }

  function fmtNum(v) {
    var s = (Math.abs(v) < 0.005 ? 0 : v).toFixed(2);
    return s === '-0.00' ? '0.00' : s;
  }
  function fmt(c) {
    var re = Math.abs(c.re) < 0.005 ? 0 : c.re, im = Math.abs(c.im) < 0.005 ? 0 : c.im;
    if (im === 0) return fmtNum(re);
    if (re === 0) return fmtNum(im) + 'i';
    return '(' + fmtNum(re) + (im >= 0 ? '+' : '−') + fmtNum(Math.abs(im)) + 'i)';
  }
  function fmtState(st) {
    return fmt(st[0]) + '|0⟩ + ' + fmt(st[1]) + '|1⟩';
  }

  AF.Q = {
    C: C, GATES: GATES, Register: Register,
    bloch: bloch, reduced: reduced, randomState: randomState, apply2: apply2, fidelity: fidelity, teleport: teleport,
    fmt: fmt, fmtState: fmtState,
    /* sequência de portas para cada escolha do jogador (ordem de aplicação) */
    SEQ: { none: [], X: ['X'], Z: ['Z'], XZ: ['X', 'Z'] },
    CORRECT: { '00': 'none', '01': 'X', '10': 'Z', '11': 'XZ' },
    LABEL: { none: 'Nenhuma (I)', X: 'Porta X', Z: 'Porta Z', XZ: 'X + Z' },
    /* eixo e ângulo de cada porta como rotação na esfera de Bloch */
    AXIS: { X: { x: 1, y: 0, z: 0 }, Z: { x: 0, y: 0, z: 1 } }
  };
})(window.AF);
