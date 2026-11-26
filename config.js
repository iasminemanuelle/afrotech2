/* =========================================================================
 * Afrotech Vol. 2 — Silêncio no Canal Quântico
 * config.js — constantes, atributos, classes e paleta
 * ========================================================================= */
window.AF = window.AF || {};

(function (AF) {
  'use strict';

  AF.CONFIG = {
    W: 384,              // resolução interna (pixels de jogo)
    H: 216,
    TILE: 16,
    BASE_DC: 7,          // dificuldade padrão do manual: 2d6 + mod >= 7
    START_CREDITS: 60,   // Créditos Quânticos para criar a ficha
    MAX_LEVEL: 3,
    BASE_STABILITY: 100,
    PLAYER_SPEED: 74,    // px de jogo por segundo
    SAVE_KEY: 'afrotech_v2_save',
    VERSION: '0.7.0'
  };

  /* Atributos e custos (Créditos Quânticos por nível) — conforme o manual */
  AF.ATTRS = [
    { id: 'inteligencia', name: 'Inteligência', short: 'INT', cost: 10,
      desc: 'Entender e manipular conceitos quânticos (superposição, emaranhamento e interferência). Testes de análise; +1 dica no quiz por nível.' },
    { id: 'armazenamento', name: 'Armazenamento', short: 'ARM', cost: 10,
      desc: 'Armazenar e recuperar informação. +10 de Estabilidade máx. por nível; nível 1+ reduz a dificuldade da resolução de problemas e retém a tabela de correção no desafio final.' },
    { id: 'fotografia', name: 'Fotografia Quântica', short: 'FOT', cost: 8,
      desc: 'Captura registros (logs, imagens, resultados de medida) para analisar depois. Bônus para decifrar a lousa e salvar os logs do Núcleo. Não copia qubits: a não-clonagem proíbe!' },
    { id: 'furtividade', name: 'Furtividade', short: 'FUR', cost: 8,
      desc: 'Entrar sem ser notado(a). Inspirada no tunelamento quântico (para partículas, atravessar barreiras é possível; para pessoas, é metáfora).' },
    { id: 'labia', name: 'Lábia', short: 'LAB', cost: 6,
      desc: 'Convencer pelas palavras. Bônus em negociações e falas extras com NPCs.' },
    { id: 'percepcao', name: 'Percepção', short: 'PER', cost: 6,
      desc: 'Notar o que está parcialmente escondido. Aumenta a visão no corredor sem energia; nível 2+ revela o piso com ruído.' },
    { id: 'busca', name: 'Busca Quântica', short: 'BQ', cost: 12,
      desc: 'Localizar informação escondida com algoritmos quânticos (como o de Grover). Bônus em varreduras; +5 s por nível no desafio final.' },
    { id: 'investimento', name: '$ Investimento', short: 'INV', cost: 7,
      desc: 'Gerir recursos (Créditos Quânticos, energia, tempo de processamento). +3 CQ de reserva por nível e desconto no Terminal Oráculo.' }
  ];
  AF.ATTR_BY_ID = {};
  AF.ATTRS.forEach(function (a) { AF.ATTR_BY_ID[a.id] = a; });

  /* Classes / especialidades */
  AF.CLASSES = [
    { id: 'cientista', name: 'Cientista Quântico(a)',
      desc: 'Pesquisador(a) organizado(a), disciplinado(a) e curioso(a). Investiga e levanta as informações para resolver os problemas.',
      perk: '+1 em testes de Inteligência e Busca Quântica; +1 dica extra no quiz.',
      testBonus: { inteligencia: 1, busca: 1 }, quizHints: 1, stabilityBonus: 0, bonusCredits: 0,
      preset: { inteligencia: 2, busca: 1, armazenamento: 1, percepcao: 1, labia: 1 } },
    { id: 'hacker', name: 'Hacker Quântico(a)',
      desc: 'Resolve problemas com algoritmos quânticos, quebra códigos e navega no ciberespaço.',
      perk: '+1 em testes de Furtividade e Inteligência; rota de invasão exclusiva no portão.',
      testBonus: { furtividade: 1, inteligencia: 1 }, quizHints: 0, stabilityBonus: 0, bonusCredits: 0,
      preset: { inteligencia: 1, furtividade: 2, busca: 1, percepcao: 1, fotografia: 1, labia: 1 } },
    { id: 'cronista', name: 'Cronista Cibernético(a)',
      desc: 'Registra a história da missão e analisa padrões sociais. Guardião(ã) do Diário de Bordo.',
      perk: '+1 em testes de Lábia e Percepção; registra crônicas extras no Diário.',
      testBonus: { labia: 1, percepcao: 1 }, quizHints: 0, stabilityBonus: 0, bonusCredits: 0,
      preset: { labia: 2, percepcao: 2, fotografia: 1, armazenamento: 1, inteligencia: 1, investimento: 1 } },
    { id: 'executivo', name: 'Executivo(a)',
      desc: 'Gestor(a) de recursos e negociador(a) de influência. Faz a Afrotech funcionar mesmo em crise.',
      perk: '+1 em testes de Lábia e Investimento; começa com +6 CQ e paga menos no Oráculo.',
      testBonus: { labia: 1, investimento: 1 }, quizHints: 0, stabilityBonus: 0, bonusCredits: 6,
      preset: { labia: 2, investimento: 2, percepcao: 1, inteligencia: 1, armazenamento: 1 } },
    { id: 'analista', name: 'Analista de Dados',
      desc: 'Enxerga padrões no ruído. Prepara a tabela das rodadas e transforma resultados em regras.',
      perk: '+1 em testes de Busca Quântica e Armazenamento; vê o histograma de medições no simulador.',
      testBonus: { busca: 1, armazenamento: 1 }, quizHints: 0, stabilityBonus: 0, bonusCredits: 0,
      preset: { busca: 2, armazenamento: 1, inteligencia: 1, investimento: 1, percepcao: 1 } },
    { id: 'hardware', name: 'Especialista em Hardware',
      desc: 'Conhece cada criostato e cada cabo do Espinhaço. Testa as portas X e Z na prática.',
      perk: '+1 em testes de Fotografia Quântica e Percepção; +15 de Estabilidade máxima.',
      testBonus: { fotografia: 1, percepcao: 1 }, quizHints: 0, stabilityBonus: 15, bonusCredits: 0,
      preset: { fotografia: 2, percepcao: 2, armazenamento: 1, furtividade: 1, inteligencia: 1 } }
  ];
  AF.CLASS_BY_ID = {};
  AF.CLASSES.forEach(function (c) { AF.CLASS_BY_ID[c.id] = c; });

  /* Aparência do(a) agente */
  AF.LOOKS = {
    skins: [
      { id: 's1', name: 'Retinta', base: '#4a2a1c', shade: '#331a12' },
      { id: 's2', name: 'Marrom', base: '#6e4230', shade: '#4e2c20' },
      { id: 's3', name: 'Parda', base: '#9a6646', shade: '#744a32' },
      { id: 's4', name: 'Clara', base: '#d2a07a', shade: '#a87a58' }
    ],
    hairs: [
      { id: 'afro', name: 'Black Power' },
      { id: 'locs', name: 'Tranças / Locs' },
      { id: 'turbante', name: 'Turbante' },
      { id: 'curto', name: 'Degradê' },
      { id: 'raspado', name: 'Raspado + implante' }
    ],
    accents: [
      { id: 'ciano', name: 'Ciano', color: '#00e5ff', dark: '#0089a8' },
      { id: 'magenta', name: 'Magenta', color: '#ff3fa4', dark: '#a8186a' },
      { id: 'ouro', name: 'Ouro', color: '#ffc940', dark: '#b07a10' },
      { id: 'verde', name: 'Verde', color: '#3dff9a', dark: '#10a860' }
    ]
  };

  AF.PAL = {
    outline: '#120c1c',
    night: '#0b0a1a',
    cyan: '#00e5ff', cyanD: '#0089a8', cyanL: '#7af9ff',
    magenta: '#ff3fa4', magentaD: '#a8186a',
    gold: '#ffc940', goldD: '#b07a10',
    green: '#3dff9a', greenD: '#10a860',
    red: '#ff4d6a', white: '#e8e6ff'
  };
})(window.AF);
