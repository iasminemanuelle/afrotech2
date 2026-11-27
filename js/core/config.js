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
    VERSION: '0.8.0',
    NUCLEO_WAIT: 90      // segundos entre as etapas do protocolo no Núcleo (recalibração)
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

  /* Aparência do(a) agente — diversidade de corpos, cabelos e rostos */
  AF.LOOKS = {
    skins: [
      { id: 's0', name: 'Retinta', base: '#3a2014', shade: '#28140c' },
      { id: 's1', name: 'Preta', base: '#4a2a1c', shade: '#331a12' },
      { id: 's5', name: 'Marrom escura', base: '#5c3624', shade: '#40241a' },
      { id: 's2', name: 'Marrom', base: '#6e4230', shade: '#4e2c20' },
      { id: 's6', name: 'Canela', base: '#84523a', shade: '#623a28' },
      { id: 's3', name: 'Parda', base: '#9a6646', shade: '#744a32' },
      { id: 's7', name: 'Morena clara', base: '#b07e5e', shade: '#8a5e44' },
      { id: 's8', name: 'Oliva', base: '#b8946a', shade: '#8e6e4c' },
      { id: 's4', name: 'Clara', base: '#d2a07a', shade: '#a87a58' },
      { id: 's9', name: 'Muito clara', base: '#ecc6a8', shade: '#c49c80' }
    ],
    hairs: [
      { id: 'afro', name: 'Black power' },
      { id: 'puffs', name: 'Puffs' },
      { id: 'cacheado', name: 'Cacheado' },
      { id: 'locs', name: 'Locs' },
      { id: 'trancas', name: 'Box braids' },
      { id: 'nago', name: 'Trança nagô' },
      { id: 'coque', name: 'Coque' },
      { id: 'liso', name: 'Liso longo' },
      { id: 'curto', name: 'Degradê' },
      { id: 'moicano', name: 'Moicano' },
      { id: 'raspado', name: 'Raspado + implante' },
      { id: 'careca', name: 'Careca' },
      { id: 'turbante', name: 'Turbante' }
    ],
    hairColors: [
      { id: 'preto', name: 'Preto', c: '#17101a', l: '#33242e' },
      { id: 'castanho', name: 'Castanho', c: '#3a2418', l: '#5e3c26' },
      { id: 'ruivo', name: 'Ruivo', c: '#8a3418', l: '#c05a2a' },
      { id: 'loiro', name: 'Loiro', c: '#b88a3a', l: '#e8c46a' },
      { id: 'grisalho', name: 'Grisalho', c: '#8a8698', l: '#c4c0d0' },
      { id: 'branco', name: 'Branco', c: '#d4d0dc', l: '#f2f0f8' },
      { id: 'azul', name: 'Azul neon', c: '#1a4aa8', l: '#3aa0ff' },
      { id: 'rosa', name: 'Rosa neon', c: '#a8186a', l: '#ff5ab4' },
      { id: 'verde', name: 'Verde neon', c: '#108a50', l: '#3dff9a' }
    ],
    beards: [
      { id: 'nenhuma', name: 'Sem barba' }, { id: 'bigode', name: 'Bigode' },
      { id: 'cavanhaque', name: 'Cavanhaque' }, { id: 'cheia', name: 'Barba cheia' }
    ],
    glasses: [
      { id: 'nenhum', name: 'Sem óculos' }, { id: 'redondo', name: 'Óculos redondos' }, { id: 'quadrado', name: 'Óculos quadrados' }
    ],
    marks: [
      { id: 'nenhuma', name: 'Nenhuma' }, { id: 'sardas', name: 'Sardas' }, { id: 'vitiligo', name: 'Vitiligo' }
    ],
    bodies: [
      { id: 'padrao', name: 'Padrão' }, { id: 'largo', name: 'Largo' }
    ],
    extras: [
      { id: 'aparelho', name: 'Aparelho auditivo' },
      { id: 'protese', name: 'Braço biônico' },
      { id: 'bengala', name: 'Bengala-guia' }
    ],
    outfits: [
      { id: 'jacket', name: 'Jaqueta' }, { id: 'tee', name: 'Camiseta' }, { id: 'regata', name: 'Regata' },
      { id: 'dress', name: 'Vestido' }, { id: 'macacao', name: 'Macacão' }, { id: 'coat', name: 'Jaleco' }
    ],
    tops: [
      { id: 'noite', name: 'Azul-noite', c: '#232a52', d: '#171c3a' },
      { id: 'vinho', name: 'Vinho', c: '#6a1a4a', d: '#4a1034' },
      { id: 'mata', name: 'Verde-mata', c: '#1f6a4a', d: '#145034' },
      { id: 'mostarda', name: 'Mostarda', c: '#c08a18', d: '#8a6010' },
      { id: 'terracota', name: 'Terracota', c: '#a8442a', d: '#7a2e1c' },
      { id: 'royal', name: 'Azul royal', c: '#1a4a9a', d: '#103470' },
      { id: 'branco', name: 'Branco', c: '#ecebf6', d: '#b8b4d0' },
      { id: 'preto', name: 'Preto', c: '#1e1c28', d: '#12101a' }
    ],
    pants: [
      { id: 'escura', name: 'Escura', c: '#161a2e' }, { id: 'jeans', name: 'Jeans', c: '#2a3a6a' },
      { id: 'caqui', name: 'Cáqui', c: '#8a7a50' }, { id: 'branca', name: 'Branca', c: '#d8d6e6' }, { id: 'vinho', name: 'Vinho', c: '#4a1030' }
    ],
    accents: [
      { id: 'ciano', name: 'Ciano', color: '#00e5ff', dark: '#0089a8' },
      { id: 'magenta', name: 'Magenta', color: '#ff3fa4', dark: '#a8186a' },
      { id: 'ouro', name: 'Ouro', color: '#ffc940', dark: '#b07a10' },
      { id: 'verde', name: 'Verde', color: '#3dff9a', dark: '#10a860' },
      { id: 'laranja', name: 'Laranja', color: '#ff8a3d', dark: '#b0501a' },
      { id: 'violeta', name: 'Violeta', color: '#b07aff', dark: '#6a3ab0' }
    ]
  };
  AF.LOOK_DEFAULT = { skin: 's1', hair: 'afro', hairColor: 'preto', accent: 'ciano', beard: 'nenhuma', glasses: 'nenhum',
    marks: 'nenhuma', body: 'padrao', extras: [], outfit: 'jacket', top: 'noite', pants: 'escura' };

  /* Boutique do Mercado Modelo: roupas e acessórios pagos com Créditos Quânticos.
   * slot: roupa · cabeca · rosto · pescoco · pulso. patch: o que muda no desenho do personagem */
  AF.SHOP = [
    { id: 'fitinha', slot: 'pulso', name: 'Fitinha do Bonfim', price: 1, desc: 'Três nós, três pedidos: a lembrança mais famosa de Salvador.', patch: { wrist: '#3dff9a' } },
    { id: 'micangas', slot: 'pescoco', name: 'Colar de miçangas', price: 4, desc: 'Contas coloridas enfiadas à mão no Mercado.', patch: { beads: ['#ffc940', '#3dff9a', '#ff4d6a'] } },
    { id: 'buzios', slot: 'pescoco', name: 'Colar de búzios', price: 6, desc: 'Conchas brancas da Baía de Todos-os-Santos.', patch: { beads: ['#f2eee0', '#d8d0b8', '#f2eee0'] } },
    { id: 'bone', slot: 'cabeca', name: 'Boné neon', price: 5, desc: 'Aba reta e led na costura.', patch: { hat: 'bone', hatC: '#1e1c28', hatA: 'accent' } },
    { id: 'palha', slot: 'cabeca', name: 'Chapéu de palha', price: 6, desc: 'Trançado de palha de ouricuri, ótimo para a praia.', patch: { hat: 'palha', hatC: '#d8b060', hatA: '#8a3418' } },
    { id: 'panama', slot: 'cabeca', name: 'Chapéu panamá', price: 8, desc: 'Branco com fita preta: elegância de Ribeira no domingo.', patch: { hat: 'panama', hatC: '#ecebe0', hatA: '#1e1c28' } },
    { id: 'torco', slot: 'cabeca', name: 'Torço de capulana', price: 7, desc: 'Tecido estampado amarrado na cabeça.', patch: { hat: 'torco', hatC: '#ffc940', hatA: '#a8186a' } },
    { id: 'fone', slot: 'cabeca', name: 'Fone holográfico', price: 9, desc: 'Toca ijexá, samba-reggae e o que mais vier.', patch: { hat: 'fone', hatC: '#e8e6ff', hatA: 'accent' } },
    { id: 'oculos_sol', slot: 'rosto', name: 'Óculos escuros', price: 6, desc: 'Lentes escuras contra o sol da Cidade Baixa.', patch: { glassesStyle: 'escuro', glasses: '#14121e' } },
    { id: 'visor', slot: 'rosto', name: 'Visor de realidade aumentada', price: 12, desc: 'Mostra a esfera de Bloch de tudo o que você olha. (Mentira: mostra o horário do ônibus.)', patch: { visor: 'accent' } },
    { id: 'camisa_bloco', slot: 'roupa', name: 'Camiseta de bloco afro', price: 8, desc: 'Verde, amarelo, vermelho e preto, como nos blocos do Pelourinho.', patch: { outfit: 'tee', top: '#ffc940', topD: '#b07a10', print: 'bloco' } },
    { id: 'bata', slot: 'roupa', name: 'Bata de linho branca', price: 6, desc: 'Leve e fresca, do jeito da sexta-feira em Salvador.', patch: { outfit: 'bata', top: '#f2f0f8', topD: '#c4c0dc' } },
    { id: 'abada', slot: 'roupa', name: 'Abadá de trio', price: 10, desc: 'Regata listrada para pular atrás do trio elétrico.', patch: { outfit: 'regata', top: '#ff3fa4', topD: '#a8186a', print: 'listras' } },
    { id: 'chita', slot: 'roupa', name: 'Vestido de chita', price: 10, desc: 'Flores grandes em fundo vermelho, alegria de festa.', patch: { outfit: 'dress', top: '#d8243a', topD: '#a01428', print: 'floral' } },
    { id: 'kente', slot: 'roupa', name: 'Bata estampa kente', price: 12, desc: 'Faixas de ouro e verde inspiradas nos tecidos da África Ocidental.', patch: { outfit: 'bata', top: '#ffc940', topD: '#b07a10', print: 'kente' } },
    { id: 'surf', slot: 'roupa', name: 'Camisa floral e bermuda', price: 8, desc: 'O kit do Prof. Hohenfeld para a prainha.', patch: { outfit: 'tee', top: '#1a8a9a', topD: '#106070', print: 'floral', shorts: true, pants: '#1a2a5a', barefoot: true } },
    { id: 'jaqueta_neon', slot: 'roupa', name: 'Jaqueta neon Afrotech', price: 15, desc: 'Costuras que brilham na cor do seu neon.', patch: { outfit: 'jacket', top: '#14121e', topD: '#0c0a14', print: 'neon' } }
  ];
  AF.SHOP_BY_ID = {};
  AF.SHOP.forEach(function (it) { AF.SHOP_BY_ID[it.id] = it; });
  AF.SHOP_SLOTS = { roupa: 'Roupa', cabeca: 'Cabeça', rosto: 'Rosto', pescoco: 'Pescoço', pulso: 'Pulso' };

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
