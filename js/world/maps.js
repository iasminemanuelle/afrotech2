/* =========================================================================
 * maps.js — cenas jogáveis
 *   praca: Praça Cairu, Comércio (Cidade Baixa) — Elevador Lacerda,
 *          casarões da Cidade Alta, Mercado Modelo, Torre da Afrotech e,
 *          descendo a Rampa do Mercado, a Prainha da Baía (Forte São Marcelo,
 *          saveiro, Prof. Hohenfeld)
 *   torre: Torre da Afrotech — saguão, corredor sem energia, gabinete
 *          de Dandara, Laboratório de Teoria Quântica e o Núcleo
 *   jacobina: Estação Receptora de Jamal (pós-missão, pelo Hipertrem):
 *          serras, Mina Velha, Alto do Cruzeiro, Rio do Ouro
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;

  function grid(w, h, ch) {
    var g = [];
    for (var y = 0; y < h; y++) { g.push([]); for (var x = 0; x < w; x++) g[y].push(ch); }
    return g;
  }
  function fill(g, x, y, w, h, ch) {
    for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) if (g[j] && g[j][i] !== undefined) g[j][i] = ch;
  }

  /* ---------------------------- PRAÇA ---------------------------- */
  function buildPraca() {
    var g = grid(40, 40, 'o');
    fill(g, 0, 0, 40, 3, 'X');
    fill(g, 0, 3, 40, 4, 'c');
    fill(g, 3, 7, 20, 10, '.');
    fill(g, 0, 18, 40, 1, 'a');
    fill(g, 0, 19, 40, 1, '=');
    fill(g, 0, 20, 40, 1, 'a');
    fill(g, 0, 21, 40, 1, 'k');
    fill(g, 0, 22, 40, 1, 'b');
    /* Rampa do Mercado: escadaria até a Prainha da Baía */
    fill(g, 0, 23, 28, 1, 'M');
    fill(g, 28, 23, 12, 17, '~');
    fill(g, 4, 22, 2, 2, 'S');
    fill(g, 0, 24, 27, 9, 's');
    fill(g, 27, 24, 1, 9, 'r');
    fill(g, 0, 33, 28, 1, 'f');
    fill(g, 0, 34, 28, 6, '~');
    return g;
  }

  /* ---------------------------- TORRE ---------------------------- */
  function buildTorre() {
    /* B = paredes blindadas (mu-metal + malha de cobre) · q = piso flutuante sobre amortecedores
     * Z = porta interna (campo de contenção) · O = porta externa da antecâmara */
    var rows = [
      'wwwwwwwwwwwwBBBBBBBBBBwwwwwwwwwwww',
      'wKKKKKKKKKKwBqqqqqqqqBwllllllllllw',
      'wKKKKKKKKKKwBqqqqqqqqBwllllllllllw',
      'wKKKKKKKKKKwBqqqqqqqqBwllllllllllw',
      'wKKKKKKKKKKwBqqqqqqqqBwllllllllllw',
      'wKKKKKKKKKKwBqqqqqqqqBwllllllllllw',
      'wKKKKKKKKKKwBBBBZZBBBBwllllllllllw',
      'wKKKKKKKKKKwwwffffffwwwllllllllllw',
      'wKKKKKKKKKKwwwffffffwwwllllllllllw',
      'wwwwwffwwwwwwwwwOOwwwwwllllllllllw',
      'wfffffffffffffffffffffwllllllllllw',
      'wffffffffffffffffffffffllllllllllw',
      'wffffffffffffffffffffffllllllllllw',
      'wfffffffffffffffffffffwllllllllllw',
      'wfffffffffffffffffffffwllllllllllw',
      'wwwwwwwwwwwwwwwffffwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwffffwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwffffwwwwwwwwwwwwwww',
      'wwwwwwwwffffffffffffffffffwwwwwwww',
      'wwwwwwwwffffffffffffffffffwwwwwwww',
      'wwwwwwwwffffffffffffffffffwwwwwwww',
      'wwwwwwwwffffffffffffffffffwwwwwwww',
      'wwwwwwwwffffffffffffffffffwwwwwwww',
      'wwwwwwwwwwwwwwwwDDwwwwwwwwwwwwwwww'
    ];
    var g = rows.map(function (r) { return r.split(''); });
    /* piso contaminado por ruído quântico no corredor escuro */
    [[8, 10], [13, 10], [3, 11], [10, 11], [18, 11], [6, 12], [13, 12], [20, 12],
     [2, 13], [9, 13], [15, 13], [5, 14], [12, 14], [19, 14]].forEach(function (p) { g[p[1]][p[0]] = 'x'; });
    return g;
  }

  var LEG_PRACA = {
    X: { tile: 'cobble', solid: true }, c: { tile: 'cliff', solid: true },
    '.': { tile: 'calcada' }, o: { tile: 'cobble' }, a: { tile: 'asphalt' }, '=': { tile: 'lane' },
    k: { tile: 'seawall' }, b: { tile: 'rail', solid: true }, '~': { tile: 'water', solid: true, anim: true },
    S: { tile: 'stairs' }, M: { tile: 'quay', solid: true }, s: { tile: 'sand' },
    f: { tile: 'foam', anim: true, solid: true }, r: { tile: 'foam_r', anim: true, solid: true }
  };
  var LEG_TORRE = {
    w: { tile: 'wall', solid: true }, f: { tile: 'floor' }, l: { tile: 'lab' }, K: { tile: 'wood' },
    n: { tile: 'nucleo', anim: true }, x: { tile: 'ruido', anim: true, hazard: true },
    Z: { tile: 'field', anim: true, solid: true, field: true }, D: { tile: 'exit' },
    B: { tile: 'shield', solid: true }, q: { tile: 'iso' }, O: { tile: 'porta' }
  };

  /* --------------------------- RIBEIRA --------------------------- */
  function buildRibeira() {
    var W = 32, H = 24, g = grid(W, H, 'g');
    fill(g, 0, 0, W, 3, 'X');
    fill(g, 0, 3, W, 1, '.'); fill(g, 0, 4, W, 1, 'a'); fill(g, 0, 5, W, 1, '='); fill(g, 0, 6, W, 1, 'a'); fill(g, 0, 7, W, 1, '.');
    /* casa: telhado (8), parede com janelas (9), cômodo (10–13), fachada com porta (14) */
    fill(g, 3, 8, 12, 2, 'H'); fill(g, 3, 10, 1, 4, 'H'); fill(g, 14, 10, 1, 4, 'H'); fill(g, 3, 14, 12, 1, 'H');
    fill(g, 4, 10, 10, 4, 'p');
    g[9][5] = 'J'; g[9][12] = 'J'; g[14][5] = 'J'; g[14][12] = 'J';
    fill(g, 8, 14, 2, 1, 'D');
    fill(g, 0, 15, W, 1, '.'); fill(g, 8, 8, 0, 0, '.');
    fill(g, 0, 17, W, 2, 's'); fill(g, 0, 19, W, 1, 'f'); fill(g, 0, 20, W, 4, '~');
    return g;
  }
  var LEG_RIB = {
    X: { tile: 'seawall', solid: true }, '.': { tile: 'calcada' }, a: { tile: 'asphalt' }, '=': { tile: 'lane' },
    g: { tile: 'grama' }, H: { tile: 'casa', solid: true, v: 0 }, J: { tile: 'casa', solid: true, v: 1 },
    p: { tile: 'piso_casa' }, D: { tile: 'porta_casa' }, s: { tile: 'sand' },
    f: { tile: 'foam', anim: true, solid: true }, '~': { tile: 'water', solid: true, anim: true }
  };

  /* --------------------------- JACOBINA --------------------------- */
  function buildJacobina() {
    var W = 36, H = 26, g = grid(W, H, 't');
    var r = AF.Pix.rng(4242);
    for (var y = 4; y < H; y++) for (var x = 0; x < W; x++) if (r() < 0.32) g[y][x] = 'g';
    fill(g, 0, 0, W, 4, '#');
    fill(g, 0, 14, W, 2, '~');
    fill(g, 17, 14, 2, 2, '=');
    fill(g, 17, 9, 2, 5, 'p');                       /* trilha: estação → ponte */
    fill(g, 17, 16, 2, 4, 'p');                      /* ponte → praça de chegada */
    fill(g, 5, 19, 14, 2, 'p');
    fill(g, 2, 21, 8, 3, 'P');                       /* plataforma do hipertrem */
    fill(g, 8, 9, 9, 1, 'p');                        /* trilha da mina */
    fill(g, 6, 5, 2, 5, 'p');
    fill(g, 19, 10, 9, 1, 'p');                      /* trilha do cruzeiro */
    fill(g, 27, 7, 2, 4, 'p');
    return g;
  }
  var LEG_JAC = {
    '#': { tile: 'cliff', solid: true }, t: { tile: 'terra' }, g: { tile: 'grama' }, p: { tile: 'trilha' },
    '~': { tile: 'water', solid: true, anim: true }, '=': { tile: 'ponte' }, P: { tile: 'calcada' }
  };
  function cacto(x, y) { return { art: 'mandacaru', x: x, y: y, w: 1, h: 1, hit: [5, 10, 6, 6] }; }
  function moita(x, y) { return { art: 'arbusto', x: x, y: y, w: 1, h: 1, hit: [2, 6, 14, 8] }; }

  function lamp(x, y) {
    return { art: 'lamp', x: x, y: y, w: 1, h: 1, hit: [5, 10, 6, 6], lights: [{ ox: 8, oy: 7, r: 38, c: '0,229,255', a: 0.32 }] };
  }
  function palm(x) { return { art: 'palm', x: x, y: 21, w: 1, h: 1, ox: -8, hit: [5, 9, 6, 7] }; }

  AF.MAPS = {
    praca: {
      name: 'Praça Cairu — Comércio', sub: 'Cidade Baixa · Salvador, 2495',
      build: buildPraca, legend: LEG_PRACA,
      ambient: 'rgba(14,6,44,0.30)',
      particles: 'glitch',
      props: [
        { art: 'skyline', x: 0, y: 0, w: 40, h: 3 },
        { art: 'elevador', x: 9, y: 0, w: 4, h: 9, interact: 'elevador', anim: 'elevador', label: 'Elevador Lacerda',
          lights: [{ ox: 32, oy: 134, r: 36, c: '0,229,255', a: 0.3 }, { ox: 32, oy: 16, r: 40, c: '0,229,255', a: 0.18 }] },
        { art: 'torre', x: 26, y: 1, w: 12, h: 13, anim: 'torre',
          lights: [{ ox: 96, oy: 58, r: 74, c: '255,63,164', a: 0.2 },
                   { ox: 96, oy: 190, r: 52, c: function () { return S.flag('gateOpen') ? '0,229,255' : '255,60,90'; }, a: 0.32 },
                   { ox: 25, oy: 90, r: 40, c: '0,229,255', a: 0.12 }, { ox: 167, oy: 90, r: 40, c: '0,229,255', a: 0.12 }] },
        { x: 30, y: 13, w: 4, h: 1, invisible: true, interact: 'portao', label: 'Portão da Torre', cond: function () { return !S.flag('gateOpen'); } },
        { art: 'mercado', x: 0, y: 14, w: 8, h: 4, interact: 'mercado', label: 'Mercado Modelo',
          lights: [{ ox: 30, oy: 40, r: 40, c: '255,190,90', a: 0.25 }, { ox: 98, oy: 40, r: 40, c: '255,190,90', a: 0.25 }] },
        { art: 'terminal', x: 14, y: 8, w: 1, h: 1, interact: 'oraculo_terminal', anim: 'terminal', label: 'Terminal Oráculo',
          lights: [{ ox: 8, oy: 8, r: 30, c: '0,229,255', a: 0.35 }] },
        { art: 'panel', x: 17, y: 8, w: 2, h: 1, interact: 'painel', anim: 'panel', label: 'Painel da Rede',
          lights: [{ ox: 16, oy: 12, r: 30, c: function () { return S.flag('restored') ? '61,255,154' : '255,60,90'; }, a: 0.28 }] },
        { art: 'stall', x: 10, y: 14, w: 2, h: 1, interact: 'cici', label: 'Tabuleiro da Dona Cici',
          lights: [{ ox: 16, oy: 14, r: 40, c: '255,201,64', a: 0.3 }] },
        { art: 'bench', x: 5, y: 12, w: 2, h: 1 },
        { art: 'hipertrem', x: 34, y: 14, w: 6, h: 3, interact: 'hipertrem', label: 'Hipertrem para Jacobina',
          lights: [{ ox: 48, oy: 30, r: 50, c: function () { return S.flag('restored') ? '0,229,255' : '255,60,90'; }, a: 0.22 }] },
        { art: 'bench', x: 17, y: 12, w: 2, h: 1 },
        lamp(4, 8), lamp(22, 8), lamp(14, 17), lamp(24, 17),
        palm(2), palm(8), palm(14), palm(20), palm(26), palm(32), palm(38),
        /* ---- Prainha da Baía ---- */
        { art: 'forte', x: 30, y: 25, w: 5, h: 4, solid: false,
          lights: [{ ox: 42, oy: 6, r: 34, c: '255,63,164', a: 0.22 }, { ox: 42, oy: 38, r: 54, c: '0,229,255', a: 0.14 }] },
        { art: 'saveiro', x: 18, y: 35, w: 3, h: 2, solid: false },
        { art: 'guardasol', x: 17, y: 26, w: 2, h: 1, hit: [0, 6, 36, 10] },
        { art: 'cavalete', x: 12, y: 27, w: 1, h: 1, ox: -4, hit: [0, 6, 18, 10], interact: 'hohenfeld_lousa', label: 'Lousinha de praia' },
        { art: 'palm', x: 1, y: 25, w: 1, h: 1, ox: -8, hit: [5, 9, 6, 7] },
        { art: 'palm', x: 9, y: 24, w: 1, h: 1, ox: -8, hit: [5, 9, 6, 7] },
        { art: 'palm', x: 23, y: 25, w: 1, h: 1, ox: -8, hit: [5, 9, 6, 7] },
        { art: 'palm', x: 6, y: 31, w: 1, h: 1, ox: -8, hit: [5, 9, 6, 7] },
        { art: 'palm', x: 21, y: 31, w: 1, h: 1, ox: -8, hit: [5, 9, 6, 7] },
        lamp(7, 24), lamp(15, 24),
        { art: 'placa_praia', x: 6, y: 21, w: 2, h: 1, hit: [14, 10, 6, 6] },
        /* ---- v0.8: prancha do professor, boias da aula de natação, boutique e VLT ---- */
        { art: 'prancha', x: 14, y: 27, w: 1, h: 1, hit: [3, 24, 6, 6], interact: 'prancha', label: 'Prancha do professor' },
        { art: 'boia', x: 5, y: 35, w: 1, h: 1, solid: false, buoy: 1 },
        { art: 'boia', x: 13, y: 37, w: 1, h: 1, solid: false, buoy: 2 },
        { art: 'boia', x: 23, y: 36, w: 1, h: 1, solid: false, buoy: 3 },
        { art: 'arara', x: 2, y: 18, w: 2, h: 1, hit: [0, 24, 34, 6], interact: 'lu', label: 'Boutique do Mercado' },
        { art: 'vlt', x: 15, y: 18, w: 6, h: 2, hit: [0, 30, 96, 16], interact: 'vlt', label: 'VLT da Baía (Ribeira)',
          lights: [{ ox: 48, oy: 24, r: 46, c: function () { return S.flag('restored') ? '255,201,64' : '255,60,90'; }, a: 0.2 }] }
      ],
      swimZone: { x: 0, y: 33, w: 28, h: 7 },
      areas: [
        { x: 0, y: 23, w: 40, h: 17, name: 'Prainha da Baía', sub: 'Baía de Todos-os-Santos · Forte São Marcelo ao fundo',
          onEnter: function () {
            S.addJournal('Prainha da Baía', 'Desci a Rampa do Mercado até a prainha. Dali se vê o Forte São Marcelo no meio da baía. Um professor desenha ondas numa lousinha de frente para o mar.');
          } },
        { x: 0, y: 0, w: 40, h: 23, name: 'Praça Cairu — Comércio', sub: 'Cidade Baixa · Salvador, 2495', quiet: true }
      ],
      npcs: [
        { id: 'cici', spec: 'cici', x: 11, y: 13.85, dir: 'down', interact: 'cici', label: 'Dona Cici' },
        { id: 'kaua', spec: 'kaua', x: 24.5, y: 11.6, dir: 'left', interact: 'kaua', label: 'Kauã' },
        { id: 'k7', kind: 'drone', x: 31.9, y: 15.6, dir: 'down', interact: 'k7', label: 'Drone Vigia K-7' },
        { id: 'zeza', spec: 'zeza', x: 6.5, y: 18.6, dir: 'down', interact: 'mercado', label: 'Dona Zeza (Gincana)', cond: function () { return S.flag('restored'); } },
        { id: 'hohenfeld', spec: 'hohenfeld', x: 11.4, y: 28.9, dir: 'down', interact: 'hohenfeld', label: 'Prof. Hohenfeld' },
        { id: 'aluna', spec: 'aluna', x: 9.3, y: 30.4, dir: 'up', interact: 'alunos', label: 'Estudante' },
        { id: 'aluno', spec: 'aluno', x: 13.6, y: 30.5, dir: 'up', interact: 'alunos', label: 'Estudante' },
        { id: 'miayo', spec: 'miayo', x: 22.5, y: 31.7, dir: 'down', interact: 'miayo', label: 'Mi Ayô (aula de natação)' },
        { id: 'lu', spec: 'lu', x: 1.2, y: 19.9, dir: 'right', interact: 'lu', label: 'Dona Lu (Boutique)' },
        /* aula de natação: alunos de touca nadando de um lado para o outro */
        { id: 'nad1', kind: 'swimmer', x: 4, y: 35.4, x0: 2, x1: 11, speed: 13, cap: '#ffc940', skin: '#4a2a1c' },
        { id: 'nad2', kind: 'swimmer', x: 15, y: 36.5, x0: 9, x1: 19, speed: -11, cap: '#ff3fa4', skin: '#9a6646' },
        { id: 'nad3', kind: 'swimmer', x: 6, y: 38.2, x0: 2, x1: 12, speed: 9, cap: '#3dff9a', skin: '#6e4230' },
        { id: 'nad4', kind: 'swimmer', x: 22, y: 37.6, x0: 17, x1: 26, speed: -12, cap: '#f2f0f8', skin: '#3a2014' },
        { id: 'nad5', kind: 'swimmer', x: 12, y: 39.2, x0: 6, x1: 24, speed: 15, cap: '#3aa0ff', skin: '#d2a07a' }
      ],
      portals: [
        { x: 30, y: 14, w: 4, h: 1, to: 'torre', spawn: 'entrada', facing: 'up', cond: function () { return S.flag('gateOpen'); } }
      ],
      spawns: {
        start: { x: 10.5, y: 9.9, dir: 'down' },
        from_torre: { x: 31.9, y: 15.2, dir: 'down' },
        oraculo: { x: 14.5, y: 9.9, dir: 'up' },
        praia: { x: 11.4, y: 30.6, dir: 'up' },
        from_vlt: { x: 18, y: 20.7, dir: 'down' },
        natacao: { x: 21.5, y: 32.6, dir: 'down' },
        from_jac: { x: 36.5, y: 17.6, dir: 'down' }
      }
    },

    ribeira: {
      name: 'Ribeira — Beira da Praia', sub: 'Península de Itapagipe · Enseada dos Tainheiros',
      build: buildRibeira, legend: LEG_RIB,
      ambient: 'rgba(70,24,50,0.16)',
      particles: 'dust',
      props: [
        { art: 'ribeira_sky', x: 0, y: 0, w: 32, h: 3 },
        { art: 'vlt', x: 22, y: 5, w: 6, h: 2, hit: [0, 30, 96, 16], interact: 'vlt', label: 'VLT da Baía (Comércio)',
          lights: [{ ox: 48, oy: 24, r: 46, c: '255,201,64', a: 0.2 }] },
        { art: 'cama', x: 4, y: 10, w: 2, h: 1, hit: [0, 8, 30, 16], interact: 'casa_cama', label: 'Cama (descansar)' },
        { art: 'guardaroupa', x: 12, y: 10, w: 2, h: 1, ox: -4, hit: [0, 20, 24, 12], interact: 'guardaroupa', label: 'Guarda-roupa' },
        { art: 'mural', x: 7, y: 9, w: 2, h: 1, solid: false, interact: 'casa_mural', label: 'Mural de lembranças' },
        { art: 'rug', x: 7, y: 11, w: 3, h: 2, ground: true, solid: false },
        { art: 'mesa_casa', x: 10, y: 12, w: 2, h: 1, hit: [0, 8, 28, 10], interact: 'casa_radio', label: 'Rádio' },
        { art: 'plant', x: 4, y: 13, w: 1, h: 1 },
        { art: 'sorveteria', x: 17, y: 15, w: 2, h: 1, hit: [4, 18, 24, 14], interact: 'sorvete', label: 'Sorveteria da orla' },
        { art: 'placa_ribeira', x: 26, y: 15, w: 4, h: 1, hit: [28, 22, 4, 8] },
        { art: 'saveiro', x: 6, y: 21, w: 3, h: 2, solid: false },
        { art: 'saveiro', x: 21, y: 22, w: 3, h: 2, solid: false },
        { art: 'palm', x: 1, y: 16, w: 1, h: 1, ox: -8, hit: [5, 9, 6, 7] },
        { art: 'palm', x: 15, y: 16, w: 1, h: 1, ox: -8, hit: [5, 9, 6, 7] },
        { art: 'palm', x: 30, y: 16, w: 1, h: 1, ox: -8, hit: [5, 9, 6, 7] },
        lamp(2, 7), lamp(12, 7), lamp(20, 15), lamp(31, 7),
        { art: 'bench', x: 18, y: 11, w: 2, h: 1 }, { art: 'bench', x: 25, y: 11, w: 2, h: 1 },
        { art: 'plant', x: 16, y: 9, w: 1, h: 1 }, { art: 'plant', x: 29, y: 9, w: 1, h: 1 }, { art: 'plant', x: 22, y: 13, w: 1, h: 1 },
        { art: 'palm', x: 23, y: 10, w: 1, h: 1, ox: -8, hit: [5, 9, 6, 7] }
      ],
      areas: [
        { x: 4, y: 10, w: 10, h: 4, name: 'Minha casa', sub: 'Beira da praia na Ribeira', onEnter: function () { AF.Audio.play('house_door'); } },
        { x: 0, y: 15, w: 32, h: 9, name: 'Orla da Ribeira', sub: 'Saveiros, sorvete e o pôr do sol na Enseada dos Tainheiros' },
        { x: 0, y: 0, w: 32, h: 15, quiet: true }
      ],
      npcs: [
        { id: 'didi', spec: 'didi', x: 27.5, y: 17.9, dir: 'down', interact: 'didi', label: 'Seu Didi (pescador)' }
      ],
      portals: [],
      spawns: {
        vlt: { x: 24.5, y: 7.9, dir: 'down' },
        cama: { x: 6.5, y: 12.4, dir: 'down' }
      }
    },

    jacobina: {
      name: 'Jacobina — Cidade do Ouro', sub: 'Piemonte da Diamantina · Estação Receptora, 2495',
      build: buildJacobina, legend: LEG_JAC,
      ambient: 'rgba(6,10,44,0.34)',
      particles: 'vagalume',
      props: [
        { art: 'serra', x: 0, y: 0, w: 36, h: 4, solid: false },
        { art: 'mina', x: 2, y: 3, w: 4, h: 2, interact: 'jac_mina', label: 'Mina Velha',
          lights: [{ ox: 32, oy: 20, r: 30, c: '255,201,64', a: 0.2 }] },
        { art: 'estacao', x: 13, y: 3, w: 8, h: 6, interact: 'jac_estacao', label: 'Estação Receptora',
          lights: [{ ox: 60, oy: 70, r: 70, c: '0,229,255', a: 0.26 }, { ox: 92, oy: 10, r: 26, c: '255,63,164', a: 0.4 }] },
        { art: 'console', x: 21, y: 8, w: 3, h: 1, interact: 'jac_console', anim: 'console', label: 'Console de Recepção',
          lights: [{ ox: 24, oy: 8, r: 40, c: '0,229,255', a: 0.32 }] },
        { art: 'cabo', x: 0, y: 8, w: 12, h: 1, ground: true, solid: false },
        { art: 'fibra', x: 12, y: 8, w: 1, h: 1, interact: 'jac_fibra', label: 'Caixa da fibra óptica',
          lights: [{ ox: 8, oy: 12, r: 22, c: '0,229,255', a: 0.4 }] },
        { art: 'cruzeiro', x: 28, y: 2, w: 6, h: 5, interact: 'jac_cruzeiro', label: 'Alto do Cruzeiro',
          lights: [{ ox: 48, oy: 8, r: 30, c: '255,240,200', a: 0.22 }] },
        { art: 'placa_rio', x: 20, y: 13, w: 3, h: 1, hit: [22, 10, 6, 6], interact: 'jac_rio', label: 'Placa do rio' },
        { art: 'placa_jac', x: 11, y: 19, w: 4, h: 1, hit: [30, 10, 6, 6] },
        { art: 'hipertrem', x: 2, y: 19, w: 6, h: 3, interact: 'hipertrem', label: 'Hipertrem para Salvador',
          lights: [{ ox: 48, oy: 30, r: 50, c: '0,229,255', a: 0.22 }] },
        cacto(9, 5), cacto(25, 12), cacto(33, 18), cacto(14, 22), cacto(30, 23), cacto(1, 12),
        moita(4, 11), moita(11, 12), moita(23, 5), moita(26, 17), moita(31, 12), moita(21, 23), moita(8, 16),
        lamp(16, 10), lamp(20, 17), lamp(10, 20)
      ],
      npcs: [
        { id: 'jamal', spec: 'jamal', x: 18.6, y: 10.4, dir: 'down', interact: 'jamal_jac', label: 'Jamal' },
        { id: 'socorro', spec: 'socorro', x: 7.6, y: 6.8, dir: 'down', interact: 'socorro', label: 'Dona Socorro' },
        { id: 'davi', spec: 'davi', x: 12.5, y: 21.6, dir: 'left', interact: 'davi', label: 'Davi' }
      ],
      portals: [],
      spawns: {
        chegada: { x: 5.5, y: 23.0, dir: 'down' },
        estacao: { x: 18.5, y: 11.8, dir: 'up' }
      }
    },

    torre: {
      name: 'Torre da Afrotech', sub: 'Andar de Pesquisa Quântica',
      build: buildTorre, legend: LEG_TORRE,
      ambient: 'rgba(10,8,34,0.16)',
      particles: 'dust',
      dark: [{ x: 1, y: 9, w: 21, h: 6 }, { x: 15, y: 15, w: 4, h: 3 }],
      props: [
        { art: 'lousa', x: 3, y: 0, w: 4, h: 1, anim: 'lousa', label: 'Lousa de Dandara',
          interact: function () { if (S.flag('lousaRead')) AF.Lousa.open(false); else AF.Dialogue.start('lousa'); } },
        { art: 'shelf', x: 8, y: 1, w: 2, h: 1 },
        { art: 'desk', x: 2, y: 4, w: 2, h: 1, lights: [{ ox: 10, oy: 4, r: 24, c: '0,229,255', a: 0.25 }] },
        { art: 'rug', x: 3, y: 5, w: 4, h: 3, ground: true, solid: false },
        { art: 'plant', x: 1, y: 8, w: 1, h: 1 },
        { art: 'plant', x: 10, y: 8, w: 1, h: 1 },
        /* ---- Sala do Computador Quântico: só o computador, isolado ---- */
        { art: 'qcomp', x: 15, y: 1, w: 4, h: 3, interact: 'nucleo', anim: 'qcomp', label: 'Computador Quântico (Núcleo)',
          lights: [{ ox: 32, oy: 50, r: 56, c: function () { return S.flag('restored') ? '0,229,255' : '255,63,164'; }, a: 0.32 },
                   { ox: 32, oy: 26, r: 40, c: '255,201,64', a: 0.16 }] },
        { art: 'painel_amb', x: 13, y: 1, w: 1, h: 1, anim: 'painel_amb', interact: 'sala_painel', label: 'Painel ambiental',
          lights: [{ ox: 8, oy: 10, r: 20, c: '61,255,154', a: 0.3 }] },
        { art: 'placa_blind', x: 20, y: 1, w: 1, h: 1, interact: 'sala_blindagem', label: 'Placa da blindagem' },
        { art: 'amortecedor', x: 13, y: 5, w: 1, h: 1, ground: true, solid: false, interact: 'sala_piso', label: 'Piso flutuante' },
        { art: 'amortecedor', x: 20, y: 5, w: 1, h: 1, ground: true, solid: false, interact: 'sala_piso', label: 'Piso flutuante' },
        /* ---- Antecâmara ---- */
        { art: 'armario', x: 14, y: 7, w: 1, h: 1, ox: -1, interact: 'armario', label: 'Armário (metais e ímãs)' },
        { art: 'painel_acesso', x: 19, y: 7, w: 1, h: 1, interact: 'protocolo', label: 'Painel de acesso',
          lights: [{ ox: 8, oy: 8, r: 18, c: '255,201,64', a: 0.3 }] },
        { x: 16, y: 7, w: 2, h: 1, invisible: true, interact: 'campo', label: 'Interface do Núcleo',
          cond: function () { return !S.flag('tableDone'); } },
        { x: 16, y: 7, w: 2, h: 1, invisible: true, interact: 'porta_sala', label: 'Porta da sala blindada',
          cond: function () { return S.flag('tableDone') && !S.flag('protocolo'); } },
        /* ---- Laboratório: o que vibra e esquenta fica do lado de fora ---- */
        { art: 'compressor', x: 24, y: 2, w: 2, h: 2, interact: 'compressor', anim: 'compressor', label: 'Compressor e bombas',
          lights: [{ ox: 16, oy: 20, r: 30, c: '255,201,64', a: 0.2 }] },
        { art: 'dutos', x: 21, y: 3, w: 2, h: 1, solid: false },
        { art: 'console', x: 29, y: 1, w: 3, h: 1, interact: 'console', anim: 'console', label: 'Simulador de Teletransporte',
          lights: [{ ox: 24, oy: 8, r: 46, c: '0,229,255', a: 0.32 }] },
        { art: 'desk', x: 24, y: 9, w: 2, h: 1 },
        { art: 'desk', x: 29, y: 9, w: 2, h: 1 },
        { art: 'server', x: 32, y: 5, w: 1, h: 1, anim: 'server' },
        { art: 'server', x: 32, y: 7, w: 1, h: 1, anim: 'server' },
        { art: 'plant', x: 23, y: 14, w: 1, h: 1 },
        { art: 'holosign', x: 10, y: 17, w: 4, h: 1, lights: [{ ox: 32, oy: 8, r: 36, c: '255,63,164', a: 0.22 }] },
        { art: 'terminal', x: 9, y: 18, w: 1, h: 1, interact: 'oraculo_terminal', anim: 'terminal', label: 'Terminal Oráculo',
          lights: [{ ox: 8, oy: 8, r: 30, c: '0,229,255', a: 0.35 }] },
        { art: 'plant', x: 8, y: 22, w: 1, h: 1 },
        { art: 'plant', x: 25, y: 22, w: 1, h: 1 },
        { art: 'sofa', x: 21, y: 19, w: 2, h: 1 },
        { x: 3, y: 13, w: 1, h: 1, invisible: true, solid: false, interact: 'fragmento', anim: 'fragment', label: 'Brilho no chão',
          cond: function () { return !S.flag('fragment'); } }
      ],
      lights: [
        { x: 12, y: 19, r: 60, c: '170,190,255', a: 0.22 }, { x: 21, y: 21, r: 60, c: '170,190,255', a: 0.22 },
        { x: 27, y: 6, r: 70, c: '0,229,255', a: 0.14 }, { x: 5.5, y: 4, r: 70, c: '255,190,90', a: 0.16 },
        { x: 17, y: 4, r: 64, c: '120,200,255', a: 0.12 }, { x: 17, y: 8, r: 40, c: '255,201,64', a: 0.14 },
        { x: 2.5, y: 10.5, r: 12, c: '255,40,60', a: 0.5, dark: true }, { x: 11.5, y: 10.5, r: 12, c: '255,40,60', a: 0.5, dark: true },
        { x: 20.5, y: 13.5, r: 12, c: '255,40,60', a: 0.5, dark: true }, { x: 16.5, y: 16.5, r: 12, c: '255,40,60', a: 0.5, dark: true }
      ],
      npcs: [
        { id: 'dandara', spec: 'dandara', x: 8.5, y: 4.9, dir: 'left', interact: 'dandara', label: 'Dandara' },
        { id: 'iasmin', spec: 'iasmin', x: 27.5, y: 6.2, dir: 'down', interact: 'iasmin', label: 'Prof.ª Iasmin' }
      ],
      portals: [
        { x: 16, y: 23, w: 2, h: 1, to: 'praca', spawn: 'from_torre', facing: 'down' }
      ],
      areas: [
        { x: 13, y: 1, w: 8, h: 5, name: 'Sala do Computador Quântico', sub: '≈ 10 mK (−273,14 °C) · piso isolado · blindagem magnética' },
        { x: 14, y: 7, w: 6, h: 2, name: 'Antecâmara', sub: 'Metais e ímãs no armário · uma porta fechada de cada vez' },
        { x: 0, y: 9, w: 34, h: 15, quiet: true }
      ],
      spawns: {
        entrada: { x: 17, y: 22.3, dir: 'up' },
        oraculo: { x: 9.5, y: 19.9, dir: 'up' },
        sala: { x: 16.9, y: 5.2, dir: 'up' },
        antecamara: { x: 16.9, y: 8.6, dir: 'up' }
      }
    }
  };
})(window.AF);
