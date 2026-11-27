/* =========================================================================
 * dialogues.js — roteiros de diálogo, escolhas e testes de 2d6
 * Baseado no Manual da Professora (Afrotech Vol. 2) e organizado pelos
 * Três Momentos Pedagógicos (Delizoicov e Angotti):
 *   Atos 1–2 · Problematização Inicial  (ouvir hipóteses, sem corrigir)
 *   Ato 3    · Organização do Conhecimento (Prof.ª Iasmin, quiz, simulador)
 *   Ato 4    · Aplicação do Conhecimento (circuito, validação, relatório)
 *
 * Nó:     { speaker, text, choices, next, onEnter(S), redirect(S) -> id }
 * Escolha:{ t, next, close, action(S), if(S), req:{attr,min},
 *           test:{ attr, dc, bonus(S), problem, success, fail, ruido, reason } }
 * Placeholders: {name} {NAME} {cls} {stab} {max} {cq} {cost} {table}
 * ========================================================================= */
(function (AF) {
  'use strict';
  var S = AF.State;

  AF.SPEAKERS = {
    oraculo: { name: 'Oráculo', portrait: 'oraculo' },
    k7: { name: 'Drone Vigia K-7', portrait: 'k7' },
    dandara: { name: 'Dandara', spec: 'dandara' },
    iasmin: { name: 'Prof.ª Iasmin', spec: 'iasmin' },
    jamal: { name: 'Jamal (Jacobina)', spec: 'jamal' },
    cici: { name: 'Dona Cici', spec: 'cici' },
    kaua: { name: 'Kauã', spec: 'kaua' },
    zeza: { name: 'Dona Zeza', spec: 'zeza' },
    socorro: { name: 'Dona Socorro', spec: 'socorro' },
    davi: { name: 'Davi', spec: 'davi' },
    hohenfeld: { name: 'Prof. Hohenfeld', spec: 'hohenfeld' },
    miayo: { name: 'Mi Ayô', spec: 'miayo' },
    lu: { name: 'Dona Lu (Boutique)', spec: 'lu' },
    didi: { name: 'Seu Didi', spec: 'didi' },
    player: { name: '{name}', player: true },
    narrador: { name: '', portrait: null }
  };

  function oracleCost() {
    return Math.max(2, 6 - S.level('investimento') - (S.d && S.d.classId === 'executivo' ? 1 : 0));
  }
  AF.oracleCost = oracleCost;

  function alarmDC() { return S.flag('alarm') ? 1 : 0; }

  /* Reação de Dandara às hipóteses (sem dar a resposta: problematiza) */
  var REACT_Q1 = [
    'Você escreveu que tudo o que é transportado precisa se mover. Guarde essa ideia… e me responda depois: e se o que precisa chegar a Jacobina não for a cápsula, mas a INFORMAÇÃO sobre ela?',
    'Como nos filmes: a matéria some aqui e reaparece lá. Será que a física permite isso? Ou será que o que viaja é outra coisa?',
    'Informação, e não matéria… boa pista. Mas como enviar a informação de um estado que não pode nem ser lido sem ser destruído?',
    'Não saber ainda é um ótimo começo. Toda pesquisa começa com uma pergunta honesta.'
  ];
  var REACT_Q4 = [
    'Destruída de vez? E se a informação da cápsula chegou… e ninguém soube "desembaralhar"?',
    'Outra dimensão… os filmes adoram — e uma interpretação da quântica fala mesmo em muitos mundos. Mas vamos testar primeiro a hipótese mais simples.',
    'Embaralhada. É exatamente o que meus logs sugerem. Mas por quê? E como consertar?',
    'Um ataque? O Oráculo não registrou invasão… mas o Núcleo guardou algo estranho. Mantenha essa hipótese aberta.'
  ];

  AF.DIALOGUES = {

    /* ===================== ATO 1 · PROBLEMATIZAÇÃO ===================== */
    intro: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Ano 2495. Salvador é a capital global da tecnologia e da cultura. A rede elétrica, o transporte e as finanças rodam em computação clássica; a computação quântica ainda é tecnologia de laboratório de elite.', next: 'b' },
      b: { speaker: 'narrador', text: 'De repente, todas as comunicações cessam. Nenhuma mensagem atravessa o canal quântico. No alto do Elevador Lacerda 2.0, as projeções que narravam a história da Bahia piscam e somem. O mundo acabou de ficar mudo.', next: 'c' },
      c: { speaker: 'oraculo', text: 'Conexão estabelecida. Agente {name}, aqui é o Oráculo, interface de diagnóstico da Afrotech. Olhe para sua ficha: você não é mais estudante — é especialista convocado(a) para uma força-tarefa de emergência.', next: 'd' },
      d: { speaker: 'oraculo', text: 'Missão inicial: descobrir o que causou o colapso no canal quântico e restaurar o fluxo de informações. Esqueça o que sabe sobre transporte de objetos. Aqui, a informação viaja por outros caminhos.', next: 'e' },
      e: { speaker: 'oraculo', text: 'Seu destino é a Torre da Afrotech, o monólito de grafeno e vidro a leste da praça. Mas antes passe no Elevador Lacerda: lá você tira a Credencial de Operador(a) de Portas, sem a qual o drone do portão não deixa ninguém entrar. E lembre: aqui, erro não é fim de jogo. É ruído — e ruído a gente corrige.',
        choices: [
          { t: 'A caminho da Torre.', close: true, action: function () { introJournal(); ciciChama(); } },
          { t: 'O que exatamente parou de funcionar?', next: 'f' }
        ] },
      f: { speaker: 'oraculo', text: 'O canal QUÂNTICO — o que transfere estados de qubits entre as estações. O canal CLÁSSICO, de bits comuns, ainda funciona por backup. Guarde essa diferença: ela vai ser decisiva.',
        onEnter: function () { S.unlock('bit'); S.unlock('canal_classico'); },
        choices: [{ t: 'Entendido. A caminho da Torre.', close: true, action: function () { introJournal(); ciciChama(); } }] }
    } },

    oraculo_terminal: { start: 'menu', nodes: {
      menu: { speaker: 'oraculo',
        text: 'TERMINAL ORÁCULO // Assinatura: {stab}/{max} · Créditos: {cq} CQ. Respondo apenas sobre o Canal Quântico e a física que o sustenta.',
        choices: [
          { t: 'Consultar o Oráculo (perguntas de física quântica)', next: 'faq' },
          { t: 'Rodar diagnóstico da rede (busca de Grover)', if: function () { return !S.flag('diagDone'); },
            test: { attr: 'busca', dc: 7, problem: true, success: 'diag_ok', fail: 'diag_fail', ruido: 5, reason: 'varredura interrompida' } },
          { t: 'Restaurar Estabilidade ({cost} CQ)', if: function () { return S.d.stability < S.maxStability(); }, next: 'heal' },
          { t: 'Investir Créditos em atributos', close: true, action: function () { AF.Panel.open('ficha', { upgrade: true }); } },
          { t: 'Encerrar conexão.', close: true }
        ] },
      faq: { speaker: 'oraculo', text: 'Formule bem a sua pergunta, agente. Escolha um tema:',
        choices: [
          { t: 'Superposição e medição', next: 'p1' },
          { t: 'Emaranhamento e teletransporte', next: 'p2' },
          { t: 'Tecnologia, história e Brasil', next: 'p3' },
          { t: 'Voltar', next: 'menu' }
        ] },
      p1: { speaker: 'oraculo', text: 'Tema: SUPERPOSIÇÃO E MEDIÇÃO.',
        choices: [
          { t: 'Um qubit é 0 e 1 ao mesmo tempo?', next: 'f_qubit' },
          { t: 'E o gato de Schrödinger?', next: 'f_gato' },
          { t: 'O que acontece de verdade na medição?', next: 'f_interp' },
          { t: 'Do que um qubit é feito? O que é spin?', next: 'f_spin' },
          { t: 'Por que os qubits precisam de tanto frio?', next: 'f_frio' },
          { t: 'Outro tema', next: 'faq' }
        ] },
      p2: { speaker: 'oraculo', text: 'Tema: EMARANHAMENTO E TELETRANSPORTE.',
        choices: [
          { t: 'Como superposição e emaranhamento se relacionam com o teletransporte?', next: 'f_rel' },
          { t: 'O emaranhamento manda mensagens mais rápido que a luz?', next: 'f_luz' },
          { t: 'O emaranhamento já foi comprovado?', next: 'f_bell' },
          { t: 'O teletransporte quântico já foi feito de verdade?', next: 'f_real' },
          { t: 'A Fotografia Quântica pode copiar um estado?', next: 'f_foto' },
          { t: 'Outro tema', next: 'faq' }
        ] },
      p3: { speaker: 'oraculo', text: 'Tema: TECNOLOGIA, HISTÓRIA E BRASIL.',
        choices: [
          { t: 'O que é o algoritmo de Grover?', next: 'f_grover' },
          { t: 'Dá para atravessar paredes por tunelamento?', next: 'f_tunel' },
          { t: 'Quem inventou a computação quântica?', next: 'f_hist' },
          { t: 'Existe computação quântica no Brasil?', next: 'f_br' },
          { t: 'O que é criptografia quântica?', next: 'f_cripto' },
          { t: 'Quem vai ganhar o próximo Ba-Vi?', next: 'f_off' },
          { t: 'Outro tema', next: 'faq' }
        ] },

      f_qubit: { speaker: 'oraculo', onEnter: function () { S.unlock('superposicao'); S.unlock('qubit'); },
        text: 'É um jeito comum de falar, mas cuidado. O qubit está num estado α|0⟩ + β|1⟩. Ao medir, aparece SÓ 0 ou SÓ 1, com probabilidades |α|² e |β|². Não é "metade de cada": é uma combinação com amplitudes.', next: 'p1' },
      f_gato: { speaker: 'oraculo', onEnter: function () { S.unlock('decoerencia'); },
        text: 'Schrödinger imaginou o gato em 1935 para mostrar como seria estranho levar a superposição a objetos do cotidiano. Na prática, objetos grandes interagem tanto com o ambiente que perdem a coerência quase instantaneamente: é a decoerência.', next: 'p1' },
      f_interp: { speaker: 'oraculo', onEnter: function () { S.unlock('medicao'); S.unlock('interpretacoes'); },
        text: 'A teoria prevê as probabilidades com enorme precisão; o que "acontece de verdade" ainda é debatido. Copenhague: a medida colapsa o estado. Muitos Mundos: todos os resultados ocorrem, em ramos diferentes da realidade — a ideia por trás dos multiversos da ficção.', next: 'p1' },
      f_spin: { speaker: 'oraculo', onEnter: function () { S.unlock('spin'); S.unlock('qubit'); },
        text: 'De qualquer sistema com dois níveis: polarização de um fóton, níveis de energia de um átomo, spin de um elétron. Em 1922, Stern e Gerlach mostraram, com átomos de prata, que o spin medido numa direção só dá dois resultados: para cima ou para baixo.', next: 'p1' },
      f_frio: { speaker: 'oraculo', onEnter: function () { S.unlock('decoerencia'); },
        text: 'Calor é agitação: vibrações, campos magnéticos e radiação do ambiente "medem" o qubit sem querer e destroem a superposição (decoerência). Por isso muitos processadores quânticos trabalham a cerca de 10 milikelvin — mais frio que o espaço sideral — numa sala só deles, com piso isolado de vibrações e paredes que blindam campos magnéticos.', next: 'p1' },

      f_rel: { speaker: 'oraculo', onEnter: function () { S.unlock('teletransporte'); S.unlock('emaranhamento'); },
        text: 'Ótima pergunta — foi feita por estudantes de verdade. São três peças: a SUPERPOSIÇÃO guarda a informação no qubit de Dandara; o EMARANHAMENTO cria o canal entre Salvador e Jacobina; a MEDIÇÃO mais 2 bits clássicos dizem a Jamal como corrigir o qubit dele.', next: 'f_rel2' },
      f_rel2: { speaker: 'oraculo', text: 'Sem emaranhamento, não há canal. Sem os bits, não há correção. Sem superposição, não haveria informação quântica para enviar.', next: 'p2' },
      f_luz: { speaker: 'oraculo', onEnter: function () { S.unlock('emaranhamento'); S.unlock('canal_classico'); },
        text: 'Não. As medidas em Salvador e em Jacobina ficam correlacionadas, mas cada uma, sozinha, parece pura aleatoriedade. A correlação só aparece quando se comparam os resultados — por um canal clássico. Einstein falou em "ação fantasmagórica", mas ela não carrega mensagem.', next: 'p2' },
      f_bell: { speaker: 'oraculo', onEnter: function () { S.unlock('epr_bell'); },
        text: 'Sim. Em 1935, Einstein, Podolsky e Rosen (EPR) usaram o emaranhamento para dizer que a teoria era incompleta. Em 1964, John Bell propôs um teste. Os experimentos de Clauser, Aspect e Zeilinger confirmaram a mecânica quântica — Nobel de Física de 2022.', next: 'p2' },
      f_real: { speaker: 'oraculo', onEnter: function () { S.unlock('teletransporte'); },
        text: 'Sim! Em 1997, o grupo de Anton Zeilinger, em Innsbruck, teletransportou o estado de polarização de um fóton. Em 2017, o satélite chinês Micius teletransportou estados de fótons entre o solo e o espaço, a mais de mil quilômetros. Matéria? Nunca.', next: 'p2' },
      f_foto: { speaker: 'oraculo', onEnter: function () { S.unlock('nao_clonagem'); },
        text: 'Não de um estado desconhecido: o teorema da não-clonagem proíbe. Fotografar é medir, e medir altera o estado. Na Afrotech, a Fotografia Quântica captura registros clássicos — logs, imagens, resultados de medida —, nunca o qubit em si.', next: 'p2' },

      f_grover: { speaker: 'oraculo', onEnter: function () { S.unlock('grover'); },
        text: 'Um algoritmo quântico de busca, criado por Lov Grover em 1996. Para achar um item entre N sem ordem, um computador clássico precisa de cerca de N/2 tentativas; o de Grover, de cerca de √N. Com um milhão de itens: uns mil passos, em vez de meio milhão.', next: 'p3' },
      f_tunel: { speaker: 'oraculo', onEnter: function () { S.unlock('tunelamento'); },
        text: 'Partículas, sim: um elétron tem probabilidade de atravessar uma barreira que, pela física clássica, seria intransponível — é assim que funcionam os microscópios de tunelamento. Para uma pessoa, a probabilidade é tão pequena que nunca acontece. A Furtividade da sua ficha é metáfora.', next: 'p3' },
      f_hist: { speaker: 'oraculo', onEnter: function () { S.unlock('circuito'); },
        text: 'Nos anos 1930, Alan Turing descreveu o computador programável. Em 1982, Richard Feynman propôs usar sistemas quânticos para simular a natureza. Em 1985, David Deutsch descreveu um computador quântico universal. Depois vieram os algoritmos de Shor (fatoração) e Grover (busca).', next: 'p3' },
      f_br: { speaker: 'oraculo', onEnter: function () { S.unlock('brasil'); },
        text: 'Sim. 2025 foi o Ano Internacional da Ciência e Tecnologia Quânticas. Em Salvador, o CIMATEC Quantum (2024) testa criptografia quântica; o SENAI-SP recebeu, em 2023, um computador quântico educacional de 3 qubits. A Afrotech de 2495 começou com sementes assim.', next: 'p3' },
      f_cripto: { speaker: 'oraculo', onEnter: function () { S.unlock('criptografia'); S.unlock('medicao'); },
        text: 'É usar estados quânticos para distribuir chaves secretas. Como medir perturba o estado, quem tenta espionar deixa rastros — e é descoberto. O teclado de backup da Torre usa um código rotativo desse tipo.', next: 'p3' },
      f_off: { speaker: 'oraculo', text: 'CONSULTA FORA DO ESCOPO. O Oráculo responde apenas sobre o Canal Quântico e a física que o sustenta. Reformule sua pergunta, agente. (Dica de mediação: na dúvida, pergunte a um colega — o conhecimento quântico é compartilhado.)', next: 'p3' },

      diag_ok: { speaker: 'oraculo',
        text: 'Varredura de Grover concluída — cerca de √N consultas em vez de N. Padrão encontrado: os pares emaranhados continuam lá, mas um pulso apagou a TABELA DE CORREÇÃO dos receptores. O estado chega, embaralhado; ninguém sabe como desembaralhar.',
        onEnter: function () {
          S.setFlag('diagDone'); S.addCredits(3); S.unlock('grover'); S.unlock('decoerencia');
          S.addJournal('Diagnóstico do Oráculo', 'Varredura de Grover: os pares emaranhados continuam ativos, mas um pulso apagou a tabela de correção dos receptores. Os estados chegam embaralhados.');
        }, next: 'menu' },
      diag_fail: { speaker: 'oraculo',
        text: 'Varredura interrompida por ruído quântico. Dados parciais: "...receptores... tabela... corr█ção... perd█da...". Tente de novo quando quiser.', next: 'menu' },
      heal: { speaker: 'oraculo', redirect: function () {
        var cost = oracleCost();
        if (S.d.credits >= cost) { S.addCredits(-cost, true); S.heal(9999); AF.Toast.show('Estabilidade restaurada (−' + cost + ' CQ)', 'cyan'); return 'heal_ok'; }
        if (S.d.stability < S.maxStability() * 0.35) { S.heal(Math.round(S.maxStability() * 0.35)); return 'heal_free'; }
        return 'heal_no';
      } },
      heal_ok: { speaker: 'oraculo', text: 'Assinatura quântica reestabilizada. Coerência em 100%.', next: 'menu' },
      heal_free: { speaker: 'oraculo', text: 'Créditos insuficientes, mas seu nível está crítico. Protocolo de emergência: estabilização parcial gratuita.', next: 'menu' },
      heal_no: { speaker: 'oraculo', text: 'Créditos insuficientes. Testes bem-sucedidos e descobertas rendem novos Créditos Quânticos.', next: 'menu' }
    } },

    elevador: { start: 'a', nodes: {
      a: { speaker: 'narrador', redirect: function () { return S.flag('restored') ? 'b' : 'a2'; } },
      a2: { speaker: 'narrador', text: function () {
        return 'O Elevador Lacerda — o Espinhaço. Deixou de ser só transporte: é o "nervo óptico" que liga os supercomputadores da Cidade Alta aos laboratórios e portos da Cidade Baixa. Hoje só o backup clássico pulsa nos cabos. ' +
          (S.flag('miniElevador') ? 'No painel da cabine, sua Credencial de Operador(a) de Portas brilha em dourado.'
            : 'Na porta da cabine, um aviso do Oráculo: "TREINAMENTO OBRIGATÓRIO — antes de entrar na Torre da Afrotech, todo(a) agente tira aqui a Credencial de Operador(a) de Portas: primeiro as portas lógicas clássicas, depois as quânticas."');
      },
        choices: [
          { t: function () { return S.flag('miniElevador') ? 'Treinar de novo no painel de portas' : (S.flag('portasClassicas') ? 'Continuar o treinamento: Elevador de Hadamard (' + Math.min(5, S.count('elevSolved')) + '/5)' : 'Começar o treinamento de portas lógicas'); },
            close: true, action: function () { AF.Mini.elevador(); } },
          { t: 'Por que preciso disso para entrar na Torre?', next: 'a3', if: function () { return !S.flag('miniElevador'); } },
          { t: 'Depois.', close: true }
        ] },
      a3: { speaker: 'oraculo', text: 'Todo computador — clássico ou quântico — é feito de portas. Lá dentro, você vai reconstruir um circuito de teletransporte com H, CNOT, X e Z. Quem não sabe o que uma porta faz com um bit não entende o que ela faz com um qubit. O drone K-7 só libera o portão com a credencial.', next: 'a2' },
      b: { speaker: 'narrador', text: 'O Espinhaço brilha, pulsando com petabytes de informação. Na porta da cabine, a placa mudou: "ELEVADOR DE HADAMARD — Cidade Baixa = |0⟩, Cidade Alta = |1⟩. Operadores de portas quânticas, bem-vindos!"',
        choices: [
          { t: 'Operar o painel de portas do Elevador (desafio)', close: true, action: function () { AF.Mini.elevador(); } },
          { t: 'Como assim, Cidade Baixa é |0⟩?', next: 'c' },
          { t: 'Só admirar a vista.', close: true }
        ] },
      c: { speaker: 'narrador', text: 'O painel explica: a cabine agora é um qubit. Embaixo, |0⟩; em cima, |1⟩. As portas X, H e Z mudam o estado da cabine; quando os passageiros chegam, cada um aparece em UMA estação — e a contagem revela as chances. Cinco desafios, do mais simples à fase invisível.', next: 'b' }
    } },

    mercado: { start: 'a', nodes: {
      a: { speaker: 'narrador', redirect: function () { return S.flag('restored') ? 'z' : 'a2'; } },
      a2: { speaker: 'narrador', text: 'Mercado Modelo — portas abertas, maquininhas quânticas apagadas. Um cartaz escrito à mão: "SÓ DINHEIRO CLÁSSICO HOJE". Ao lado, outro: "GINCANA DAS FITINHAS — volta quando o canal quântico voltar". Sem os microclimas artificiais, o calor da Bahia já começa a subir.' },
      z: { speaker: 'zeza', text: 'Chegou quem consertou a rede! Eu sou Zeza, artesã de fitinha aqui do Mercado Modelo há quarenta anos. Com o canal de volta, a Gincana das Fitinhas também voltou: eu aqui, Jamal lá em Jacobina, e um desafio que só o emaranhamento resolve.',
        choices: [
          { t: 'Quero jogar a Gincana das Fitinhas (desafio)', close: true, action: function () { AF.Mini.mercado(); } },
          { t: 'O que é que tem de quântico numa fitinha?', next: 'z2' },
          { t: 'Até mais, Dona Zeza.', close: true }
        ] },
      z2: { speaker: 'zeza', text: 'A fitinha mesmo, nada: é só pra gente lembrar das cores. O quântico é o par de partículas emaranhadas que o canal entrega para mim e para Jamal antes de cada rodada. Com elas, a gente combina mais do que qualquer combinado de boca permite… e sem trocar uma palavra.', next: 'z' }
    } },

    painel: { start: 'a', nodes: {
      a: { speaker: 'narrador', redirect: function () { return S.flag('restored') ? 'ok' : 'a2'; } },
      a2: { speaker: 'narrador', text: 'PAINEL DA REDE URBANA — O que era uma rede de trilhões de dados por segundo agora é vácuo. Canal clássico (backup): OPERACIONAL. Canal quântico: SILÊNCIO. Último pacote: estado da cápsula D-7, SALVADOR → JACOBINA — sem confirmação de recebimento.',
        onEnter: function () {
          S.unlock('canal_classico'); S.unlock('bit');
          S.addJournal('Cápsula D-7', 'O painel da praça mostra o último pacote antes do Silêncio: o estado da cápsula D-7, de Salvador para Jacobina, sem confirmação de recebimento. O canal clássico ainda funciona.');
        } },
      ok: { speaker: 'narrador', text: 'PAINEL DA REDE URBANA — Nós ativos: 512/512. Canal quântico: ATIVO. Última entrega: estado da cápsula D-7 → JACOBINA, fidelidade 100%.' }
    } },

    cici: { start: 'a', nodes: {
      a: { speaker: 'cici', redirect: function () { return S.flag('restored') ? 'fim' : 'a2'; } },
      a2: { speaker: 'cici', text: 'Ô, meu bem! Desceu agora pelo Elevador? Desde o Silêncio, os carros autônomos pararam no meio da avenida e nem o pagamento quântico do meu tabuleiro funciona.',
        choices: [
          { t: 'A senhora sabe como convencer aquele drone do portão?', req: { attr: 'labia', min: 1 }, next: 'dica', if: function () { return !S.flag('gateOpen'); } },
          { t: 'Dona Cici, posso tirar uma dúvida do seu neto?', next: 'app1', if: function () { return S.flag('quizDone') && !S.flag('ciciApp'); } },
          { t: 'Como está Salvador sem a rede?', next: 'cidade' },
          { t: 'Tem ou não tem pimenta? (desafio do acarajé)', close: true, if: function () { return !S.flag('acarajeQ'); }, action: function () { AF.Mini.acaraje(); } },
          { t: 'Jogar de novo: tem ou não tem pimenta?', close: true, if: function () { return S.flag('acarajeQ'); }, action: function () { AF.Mini.acaraje(); } },
          { t: 'Será que tem um acarajé pra dar uma força?', if: function () { return !S.flag('acaraje'); }, next: 'acaraje' },
          { t: 'Até mais, Dona Cici.', close: true }
        ] },
      dica: { speaker: 'cici', text: 'Aquele K-7 é cheio de protocolo, mas respeita quem fala com firmeza em nome da Afrotech. Diga que foi convocado(a), olho no olho.',
        onEnter: function () { S.setFlag('ciciTip'); AF.Toast.show('Dica: +1 no teste de Lábia com o K-7', 'gold'); }, next: 'a2' },
      cidade: { speaker: 'cici', text: 'Parada, meu bem. O povo sacode os aparelhos e nada. Dizem que os servidores da Afrotech, lá no fundo da baía, funcionam até no ritmo dos tambores… Lenda ou não, hoje eles calaram junto com a cidade.', next: 'a2' },
      acaraje: { speaker: 'cici', text: 'Toma, quentinho, com vatapá e camarão. Por conta da casa — pra você ter força de consertar essa rede.',
        onEnter: function () { S.setFlag('acaraje'); S.heal(25); AF.Toast.show('+25 Estabilidade', 'green'); }, next: 'a2' },
      app1: { speaker: 'cici', text: 'Meu neto falou que, com esse tal de teletransporte quântico, dá pra mandar acarajé pra Jacobina num piscar de olhos. Dá?',
        choices: [
          { t: 'Dá, sim: o acarajé some aqui e aparece lá.', next: 'app_err' },
          { t: 'Não: o teletransporte quântico passa o ESTADO de partículas, não a matéria. O acarajé fica.', next: 'app_ok' },
          { t: 'Dá, mas só se for de noite.', next: 'app_err' }
        ] },
      app_err: { speaker: 'cici', text: 'Hum… e por que a Afrotech ainda usa cabo de fibra, então? Pensa melhor, meu bem.', onEnter: function () { S.inc('errCici'); }, next: 'app1' },
      app_ok: { speaker: 'cici', text: 'Então o acarajé continua indo de ônibus! E o que é que vocês mandam? Informação, é? Informação quentinha que nem acarajé… gostei.',
        onEnter: function () { S.record('aplicacao', 'cici', S.count('errCici') + 1); S.setFlag('ciciApp'); divulgacao(); }, next: 'a2' },
      fim: { speaker: 'cici', text: 'Ouviu? As maquininhas voltaram a apitar! Foi você, né? Volte sempre, que o acarajé é por minha conta. Ah: Zeza abriu a gincana no Mercado Modelo, e o Elevador virou brincadeira de qubit!',
        choices: [
          { t: 'Jogar de novo: tem ou não tem pimenta?', close: true, action: function () { AF.Mini.acaraje(); } },
          { t: 'Até mais, Dona Cici.', close: true }
        ] }
    } },

    /* Início da missão: Dona Cici chama para o minigame do acarajé */
    cici_chama: { start: 'a', nodes: {
      a: { speaker: 'cici', text: 'Ei, {name}! Psiu! Antes de subir pra Torre, passa no meu tabuleiro. Meu neto ligou uma tal de pimenteira quântica no meu tacho: eu embrulho o acarajé no papel e nem eu sei se ele vem quente ou frio. Só abrindo! Tem ou não tem pimenta? Aposta comigo?',
        choices: [
          { t: 'Bora! Tem ou não tem pimenta?', close: true, action: function () { AF.Mini.acaraje(); } },
          { t: 'Depois, Dona Cici. A rede é urgente.', close: true, action: function () { AF.Toast.show('Dona Cici espera no tabuleiro (sul da praça)', 'gold'); } }
        ] }
    } },

    /* ===================== PRAINHA DA BAÍA · PROF. HOHENFELD ===================== */
    hohenfeld: { start: 'a', nodes: {
      a: { speaker: 'narrador', redirect: function () { return S.flag('metHohenfeld') ? 'm' : 'a2'; } },
      a2: { speaker: 'narrador', text: 'De frente para o mar, um professor de lycra de surfe e bermuda, cabelo e cavanhaque pretos, desenha ondas a giz numa lousinha apoiada num cavalete. A prancha está fincada na areia. Ao fundo, o Forte São Marcelo pisca no meio da baía.', next: 'b' },
      b: { speaker: 'hohenfeld', text: 'Boa tarde, {name}! Chegou na hora da maré — acabei de sair da água. Sente aí. Você veio da Torre, não veio? Tem cara de quem passou o dia conversando com qubit.',
        onEnter: function () { S.setFlag('metHohenfeld'); }, next: 'm' },
      m: { speaker: 'hohenfeld', text: 'O que você quer saber? Aqui na prainha o tempo é outro: dá para conversar sem pressa.',
        choices: [
          { t: 'O senhor é professor de física?', next: 'c' },
          { t: 'Como se ensina física quântica para quem nunca viu um qubit?', next: 'd' },
          { t: 'Conta uma história da física quântica?', next: 'hist' },
          { t: 'E as mulheres na ciência? Me conta delas.', next: 'mul' },
          { t: 'Por que contar ciência num RPG?', next: 'f' },
          { t: 'O senhor surfa?', next: 'surf' },
          { t: 'Restauramos o canal quântico!', if: function () { return S.flag('restored') && !S.flag('hohenfeldStory'); }, next: 'r' },
          { t: 'Até logo, professor.', close: true }
        ] },
      c: { speaker: 'hohenfeld', text: 'Fui, sou e vou continuar sendo. Mas, se você quer saber o que eu faço de verdade na sala de aula… Sou um contador de história.',
        onEnter: function () {
          S.setFlag('hohenfeldQuote');
          S.addJournal('Prof. Hohenfeld', 'Na Prainha da Baía conheci o Prof. Hohenfeld, que desenha ondas a giz de frente para o mar. Perguntei se ele era professor de física. A resposta: "Sou um contador de história."');
        }, next: 'c2' },
      c2: { speaker: 'hohenfeld', text: 'A física é uma das histórias mais bonitas que a humanidade já contou sobre o mundo. Tem mistério, tem briga, tem reviravolta. Quem mostra só a fórmula entrega o final do livro sem contar o enredo — e aí ninguém quer ler.', next: 'm' },
      d: { speaker: 'hohenfeld', text: 'Do jeito que se conta qualquer boa história: começando pela pergunta, não pela resposta. Primeiro deixo a turma estranhar o mundo — por que o acarajé da pimenteira de Dona Cici não "decide" se é quente ou frio? Depois a gente organiza as ideias. No fim, a turma usa o que aprendeu num problema novo.', next: 'd2' },
      d2: { speaker: 'hohenfeld', text: 'E escuto muito. O estudante chega cheio de hipóteses — de filme, de desenho, da conversa com a avó. Nenhuma é lixo: é ponto de partida. Paulo Freire lembrava que ninguém educa ninguém e ninguém se educa sozinho: a gente se educa junto, mediado pelo mundo.', next: 'm' },
      e: { speaker: 'hohenfeld', text: 'Então escute. Em 1935, Einstein, Podolsky e Rosen argumentaram que a mecânica quântica devia estar incompleta: partículas separadas pareciam combinadas demais. Anos depois, Einstein chamaria isso de "ação fantasmagórica à distância".', next: 'e2' },
      e2: { speaker: 'hohenfeld', text: 'No mesmo ano de 1935, Schrödinger respondeu com o gato na caixa — e deu nome ao fenômeno: emaranhamento. Quase trinta anos depois, em 1964, John Bell transformou a briga filosófica numa conta que dava para testar no laboratório.', next: 'e3' },
      e3: { speaker: 'hohenfeld', text: 'Os experimentos vieram: Clauser, Aspect, Zeilinger… Em 1993 propuseram o teletransporte quântico; em 1997 ele foi feito com fótons. E em 2022 os três receberam o Nobel. Viu? Uma discussão de café virou a tecnologia que você acabou de consertar.',
        onEnter: function () { S.unlock('epr_bell'); heard('epr', 'q'); }, next: 'hist' },

      /* ---- histórias da mecânica quântica ---- */
      hist: { speaker: 'hohenfeld', text: 'Tenho um baú de histórias. Escolha uma — eu conto do jeito que conto para a turma.',
        choices: [
          { t: function () { return tick('planck') + '1900 · Planck e o "ato de desespero"'; }, next: 'q_planck' },
          { t: function () { return tick('einstein') + '1905 · Einstein e os pacotes de luz'; }, next: 'q_einstein' },
          { t: function () { return tick('ondas') + '1913–1924 · Bohr, de Broglie e as ondas de matéria'; }, next: 'q_ondas' },
          { t: function () { return tick('helgoland') + '1925–1927 · Heisenberg numa ilha, Schrödinger e a incerteza'; }, next: 'q_helg' },
          { t: function () { return tick('epr') + '1935–2022 · o emaranhamento: de briga a Nobel'; }, next: 'e' },
          { t: function () { return tick('nobel25') + '2025 · um circuito quântico do tamanho de uma mão'; }, next: 'q_nobel' },
          { t: 'Voltar', next: 'm' }
        ] },
      q_planck: { speaker: 'hohenfeld', text: 'Em 1900, Max Planck tentava explicar a cor da luz que sai de um corpo quente — um ferro em brasa, um forno. Nada fechava. Ele então supôs que a energia era trocada em pacotinhos, os quanta. Anos depois, chamou isso de "um ato de desespero".', next: 'q_planck2' },
      q_planck2: { speaker: 'hohenfeld', text: 'Repare: a física quântica nasceu de um remendo que deu certo. Planck nem acreditava muito nele. É assim que a ciência anda: alguém aceita uma ideia esquisita porque ela explica o que o resto não explica.', onEnter: function () { heard('planck', 'q'); }, next: 'hist' },
      q_einstein: { speaker: 'hohenfeld', text: 'Em 1905, um jovem funcionário de um escritório de patentes, Albert Einstein, levou os quanta a sério: a própria luz viria em pacotes — os fótons. Isso explicava o efeito fotoelétrico, a luz arrancando elétrons de um metal.', next: 'q_einstein2' },
      q_einstein2: { speaker: 'hohenfeld', text: 'E olhe a ironia: o Nobel de Einstein, de 1921, foi pelo efeito fotoelétrico, não pela relatividade. O mesmo Einstein que ajudou a criar a quântica passou a vida brigando com ela.', onEnter: function () { heard('einstein', 'q'); }, next: 'hist' },
      q_ondas: { speaker: 'hohenfeld', text: 'Em 1913, Niels Bohr desenhou um átomo em que o elétron só pode ocupar certas órbitas — e pula de uma para outra soltando luz. Em 1924, Louis de Broglie virou o jogo: se a luz é onda e partícula, o elétron também pode ser. Ondas de matéria!', next: 'q_ondas2' },
      q_ondas2: { speaker: 'hohenfeld', text: 'Três anos depois, elétrons passando por um cristal fizeram figura de interferência, como as ondas que eu desenho nessa lousa. A natureza confirmou a ousadia de um estudante de doutorado.', onEnter: function () { heard('ondas', 'q'); }, next: 'hist' },
      q_helg: { speaker: 'hohenfeld', text: 'Em 1925, Werner Heisenberg, com uma crise de alergia, foi se tratar na ilha de Helgoland, no Mar do Norte. Voltou com a primeira versão da mecânica quântica, feita de tabelas de números. No ano seguinte, Schrödinger escreveu a sua famosa equação de ondas.', next: 'q_helg2' },
      q_helg2: { speaker: 'hohenfeld', text: 'Em 1927 veio o princípio da incerteza: não dá para conhecer, ao mesmo tempo e com precisão total, a posição e a velocidade de um elétron. E naquele mesmo ano, na Conferência de Solvay, os maiores físicos do mundo se reuniram para brigar sobre o que tudo aquilo significava.', onEnter: function () { heard('helgoland', 'q'); }, next: 'hist' },
      q_nobel: { speaker: 'hohenfeld', text: 'Em 1984 e 1985, John Clarke, Michel Devoret e John Martinis montaram um circuito supercondutor com uma junção Josephson e viram a corrente "tunelar" por uma barreira e só aceitar níveis de energia quantizados — num objeto grande o bastante para segurar na mão.', next: 'q_nobel2' },
      q_nobel2: { speaker: 'hohenfeld', text: 'Isso rendeu o Nobel de Física de 2025, e é a semente dos qubits supercondutores, como os do Núcleo da Afrotech. E tem Brasil nessa história: o trabalho teórico do físico brasileiro Amir Caldeira ajudou a mostrar como observar esse efeito.',
        onEnter: function () { heard('nobel25', 'q'); S.unlock('tunelamento_macro'); }, next: 'hist' },

      /* ---- mulheres na ciência ---- */
      mul: { speaker: 'hohenfeld', text: 'Essa é a parte da história que muito livro esqueceu de contar. Escolha uma cientista.',
        choices: [
          { t: function () { return tick('curie') + 'Marie Curie · dois Nobel e a única mulher em Solvay'; }, next: 'w_curie' },
          { t: function () { return tick('noether') + 'Emmy Noether · simetrias e leis de conservação'; }, next: 'w_noether' },
          { t: function () { return tick('meitner') + 'Lise Meitner · a fissão nuclear'; }, next: 'w_meitner' },
          { t: function () { return tick('wu') + 'Chien-Shiung Wu · fótons emaranhados e o espelho quebrado'; }, next: 'w_wu' },
          { t: function () { return tick('hermann') + 'Grete Hermann · a falha na prova de von Neumann'; }, next: 'w_hermann' },
          { t: function () { return tick('nobel_m') + 'As mulheres no Nobel de Física'; }, next: 'w_nobel' },
          { t: 'Cientistas do Brasil e da Bahia…', next: 'mul_br' },
          { t: 'Voltar', next: 'm' }
        ] },
      mul_br: { speaker: 'hohenfeld', text: 'Aqui pertinho tem muita história boa. Qual delas?',
        choices: [
          { t: function () { return tick('elisa') + 'Elisa Frota-Pessôa · pioneira da física no Brasil'; }, next: 'w_elisa' },
          { t: function () { return tick('sonia') + 'Sonia Guimarães · a primeira doutora negra em física'; }, next: 'w_sonia' },
          { t: function () { return tick('katemari') + 'Katemari Rosa · física na UFBA, aqui em Salvador'; }, next: 'w_katemari' },
          { t: function () { return tick('jaqueline') + 'Jaqueline Goes de Jesus · a baiana do genoma'; }, next: 'w_jaqueline' },
          { t: 'Voltar', next: 'mul' }
        ] },
      w_curie: { speaker: 'hohenfeld', text: 'Marie Curie estudou a radioatividade — e cunhou a própria palavra. Ganhou o Nobel de Física em 1903 e o de Química em 1911: até hoje é a única pessoa premiada em duas ciências diferentes.', next: 'w_curie2' },
      w_curie2: { speaker: 'hohenfeld', text: 'Em 1927, na Conferência de Solvay, onde Einstein, Bohr, Heisenberg e Schrödinger discutiram a nova mecânica quântica, ela era a única mulher na fotografia. Imagine a coragem de estar naquela sala.', onEnter: function () { heard('curie', 'w'); }, next: 'mul' },
      w_noether: { speaker: 'hohenfeld', text: 'Emmy Noether provou, em 1918, um teorema que hoje está em toda a física: cada simetria da natureza corresponde a uma grandeza que se conserva. Se as leis não mudam com o tempo, a energia se conserva; se não mudam de lugar para lugar, o momento se conserva.', next: 'w_noether2' },
      w_noether2: { speaker: 'hohenfeld', text: 'Por ser mulher, durante anos ela deu aula na Universidade de Göttingen sem salário, com o curso anunciado no nome de um colega. Quando ela morreu, Einstein escreveu que ela era um gênio da matemática.', onEnter: function () { heard('noether', 'w'); }, next: 'mul' },
      w_meitner: { speaker: 'hohenfeld', text: 'Lise Meitner, com o sobrinho Otto Frisch, explicou entre 1938 e 1939 o que acontecia nas experiências de Otto Hahn: o núcleo do urânio estava se partindo em dois. Deram a isso o nome de fissão nuclear.', next: 'w_meitner2' },
      w_meitner2: { speaker: 'hohenfeld', text: 'O Nobel de Química de 1944 foi só para Hahn. Meitner ficou de fora. A ciência tentou consertar depois: o elemento químico 109 se chama meitnério, em homenagem a ela.', onEnter: function () { heard('meitner', 'w'); }, next: 'mul' },
      w_wu: { speaker: 'hohenfeld', text: 'Chien-Shiung Wu era uma experimentadora brilhante. Em 1950, com o estudante Irving Shaknov, mediu os pares de fótons que nascem quando um elétron e um pósitron se aniquilam: as polarizações vinham correlacionadas. Hoje esse é lembrado como um dos primeiros experimentos com partículas emaranhadas.', next: 'w_wu2' },
      w_wu2: { speaker: 'hohenfeld', text: 'Em 1956, ela mostrou que a natureza distingue a esquerda da direita — a violação da paridade, o "espelho quebrado". O Nobel de 1957 foi para os dois teóricos que propuseram a ideia, Lee e Yang. O experimento que provou foi o dela.', onEnter: function () { heard('wu', 'w'); }, next: 'mul' },
      w_hermann: { speaker: 'hohenfeld', text: 'Em 1932, John von Neumann publicou uma "prova" de que a mecânica quântica não podia ser completada com variáveis escondidas. Em 1935, a filósofa e matemática Grete Hermann mostrou que a prova tinha uma falha.', next: 'w_hermann2' },
      w_hermann2: { speaker: 'hohenfeld', text: 'Quase ninguém deu ouvidos a ela. Três décadas depois, John Bell encontrou o mesmo problema — e partiu dali para criar o teste que hoje leva o nome dele. A história também é feita de quem não foi escutado.', onEnter: function () { heard('hermann', 'w'); }, next: 'mul' },
      w_nobel: { speaker: 'hohenfeld', text: 'Até 2025, só cinco mulheres tinham recebido o Nobel de Física: Marie Curie (1903), Maria Goeppert Mayer (1963, pelo modelo de camadas do núcleo), Donna Strickland (2018, lasers), Andrea Ghez (2020, o buraco negro no centro da nossa galáxia) e Anne L\'Huillier (2023, pulsos de luz de attossegundos).', next: 'w_nobel2' },
      w_nobel2: { speaker: 'hohenfeld', text: 'Cinco em mais de um século. Não é falta de talento: é falta de porta aberta. Por isso eu conto essas histórias — para que alguém da sua turma pense "esse lugar também é meu".', onEnter: function () { heard('nobel_m', 'w'); }, next: 'mul' },
      w_elisa: { speaker: 'hohenfeld', text: 'Elisa Frota-Pessôa queria ser engenheira, mas diziam que era "coisa de homem". Foi para a física: em 1942 ela se tornou uma das duas primeiras mulheres formadas em física no Brasil.', next: 'w_elisa2' },
      w_elisa2: { speaker: 'hohenfeld', text: 'Em 1949, ajudou a fundar o Centro Brasileiro de Pesquisas Físicas, no Rio. Estudava partículas com emulsões nucleares: chapas fotográficas levadas ao alto das montanhas para registrar os raios cósmicos.', onEnter: function () { heard('elisa', 'w'); }, next: 'mul_br' },
      w_sonia: { speaker: 'hohenfeld', text: 'Sonia Guimarães, filha de um tapeceiro de São Paulo, estudou sempre em escola pública. Em 1989, com o doutorado na Universidade de Manchester, tornou-se a primeira mulher negra brasileira doutora em física.', next: 'w_sonia2' },
      w_sonia2: { speaker: 'hohenfeld', text: 'Em 1993 virou professora do ITA — a primeira professora negra do instituto, numa época em que ele nem aceitava alunas mulheres. Ela costuma dizer que ser a primeira só faz sentido se houver muitas depois.', onEnter: function () { heard('sonia', 'w'); }, next: 'mul_br' },
      w_katemari: { speaker: 'hohenfeld', text: 'Katemari Rosa é física e professora do Instituto de Física da UFBA, aqui em Salvador. Ela pesquisa o ensino de física e como gênero e raça atravessam a ciência.', next: 'w_katemari2' },
      w_katemari2: { speaker: 'hohenfeld', text: 'E faz uma coisa que eu admiro muito: reúne as histórias de vida de cientistas negras e negros do Brasil, para que elas não se percam. Contadora de história, como eu gosto.', onEnter: function () { heard('katemari', 'w'); }, next: 'mul_br' },
      w_jaqueline: { speaker: 'hohenfeld', text: 'Jaqueline Goes de Jesus é biomédica, nascida em Salvador, formada aqui na Bahia. Em 2020, a equipe que ela coordenou com Ester Sabino, na USP, sequenciou o genoma do novo coronavírus no Brasil em cerca de 48 horas.', next: 'w_jaqueline2' },
      w_jaqueline2: { speaker: 'hohenfeld', text: 'Não é física quântica, é biologia — mas é a mesma ciência: perguntar, medir, testar e contar para todo mundo. E começou numa iniciação científica, como pode começar a de alguém da sua turma.', onEnter: function () { heard('jaqueline', 'w'); }, next: 'mul_br' },
      surf: { speaker: 'hohenfeld', text: 'Desde menino! E o mar é a melhor aula de ondas que existe: crista, vale, comprimento de onda, interferência quando duas séries se cruzam… A diferença é que a onda quântica não molha ninguém: o que ela dá é a chance de encontrar a partícula aqui ou ali.', next: 'm' },
      f: { speaker: 'hohenfeld', text: 'Porque no RPG o estudante não assiste à história: vive. Cada rolagem de dados é uma hipótese posta à prova; cada erro vira ruído que se corrige, não castigo. E a turma resolve junto — um ajuda o outro a chegar onde, sozinho, ainda não chegaria.', next: 'm' },
      r: { speaker: 'hohenfeld', text: 'Eu vi o Elevador acender daqui da praia! Agora me diga, {name}: se você fosse contar essa aventura para uma turma do primeiro ano, por onde começaria?',
        choices: [
          { t: 'Pela fórmula do protocolo, no quadro, logo de cara.', next: 'r_no' },
          { t: 'Pelo mistério: a cidade que silenciou e a cápsula que não chegou a Jacobina.', next: 'r_ok' },
          { t: 'Pela lista de definições do glossário.', next: 'r_no' }
        ] },
      r_no: { speaker: 'hohenfeld', onEnter: function () { S.inc('errHoh'); }, text: 'Hum… e quem vai querer ouvir o final antes do começo? A fórmula é o desfecho. Tente de novo: o que prendeu VOCÊ nessa história?', next: 'r' },
      r_ok: { speaker: 'hohenfeld', text: 'Isso! Primeiro o enigma, depois as ideias, por fim a aplicação. Quem conta assim não está fugindo da física: está mostrando por que ela importa. Pronto: agora você também é um contador de história.',
        onEnter: function () {
          S.record('aplicacao', 'hohenfeld', S.count('errHoh') + 1);
          S.setFlag('hohenfeldStory'); S.addCredits(5);
          S.addJournal('Contar a história', 'O Prof. Hohenfeld me perguntou como eu contaria a missão para uma turma. Começar pelo mistério (a cidade em silêncio, a cápsula que não chegou), depois organizar as ideias e, por fim, aplicar. "Agora você também é um contador de história."');
        }, next: 'm' }
    } },

    alunos: { start: 'a', nodes: {
      a: { speaker: 'narrador', redirect: function () { return S.flag('hohenfeldQuote') ? 'b' : 'a2'; } },
      a2: { speaker: 'narrador', text: 'Dois estudantes de farda branca e azul, sentados na areia, cochicham: "Psiu! O professor vai contar de novo a história do gato na caixa. Pergunta pra ele se ele é professor de física — a resposta é a melhor parte."' },
      b: { speaker: 'narrador', text: '"Viu? Ele sempre diz isso. A gente veio pela física e fica pela história", cochicha a estudante, sem tirar os olhos da lousinha.' }
    } },

    prancha: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'A prancha do Prof. Hohenfeld, fincada na areia, ainda pingando. No deck, um adesivo desbotado: "A onda é a probabilidade. O surfista é a medida."' }
    } },

    /* ===================== AULA DE NATAÇÃO · MI AYÔ ===================== */
    miayo: { start: 'a', nodes: {
      a: { speaker: 'miayo', redirect: function () { return S.d.swim ? 'nadando' : 'b'; } },
      b: { speaker: 'miayo', text: 'Ê, gente! Aula aberta de natação no mar! Bora, todo mundo, não tem idade, não tem tamanho, não tem pressa: a água da Baía de Todos-os-Santos é de todo mundo. Vem nadar, {name}?',
        choices: [
          { t: 'Bora nadar!', next: 'traje' },
          { t: 'Como é a aula?', next: 'aula' },
          { t: 'Hoje só vou olhar.', next: 'olhar' }
        ] },
      aula: { speaker: 'miayo', text: 'Aquecimento na areia, depois a gente entra junto. Primeiro, respirar: solta o ar debaixo d\'água e puxa quando o rosto sai. Na aula de hoje, quem quiser nada até as três boias laranja. E regra de ouro: no mar, ninguém nada sozinho.', next: 'b' },
      olhar: { speaker: 'miayo', text: 'Tudo bem! O convite fica de pé. Quem olha o mar com calma também aprende: repare como as ondas chegam em séries.' },
      traje: { speaker: 'miayo', text: 'Primeiro, traje de natação! No vestiário tem de tudo. Touca e óculos são por conta da aula. Qual vai ser?',
        choices: [
          { t: 'Maiô', close: true, action: function () { swimGo('maio'); } },
          { t: 'Sunga', close: true, action: function () { swimGo('sunga'); } },
          { t: 'Bermuda e camisa de lycra', close: true, action: function () { swimGo('bermuda'); } },
          { t: 'Pensando melhor, depois.', close: true }
        ] },
      nadando: { speaker: 'miayo', text: 'Tá indo bem! Boias encontradas: {boias}/3.',
        choices: [
          { t: 'Continuar nadando', close: true },
          { t: 'Sair da água e trocar de roupa', close: true, action: function () { AF.Swim.stop(); AF.Toast.show('De volta à roupa de sempre', 'dim'); } }
        ] }
    } },
    miayo_dentro: { start: 'a', nodes: {
      a: { speaker: 'miayo', text: 'Ficou massa! Agora é entrar na água pela espuma, aqui na frente, e nadar até as três boias laranja. Eu fico de olho daqui da areia. Respira no ritmo!' }
    } },
    miayo_fim: { start: 'a', nodes: {
      a: { speaker: 'miayo', text: 'Três boias! Ê, nadador(a)! Viu como a respiração no ritmo deixa tudo mais leve? É que nem qubit, {name}: sem calma e sem cuidado com o ambiente, a coisa desanda. Pode nadar mais um pouco ou sair quando quiser — é só falar comigo.' }
    } },

    /* ===================== BOUTIQUE DO MERCADO · DONA LU ===================== */
    lu: { start: 'a', nodes: {
      a: { speaker: 'lu', text: function () {
        return S.flag('restored') ? 'Oi, meu amor! Boutique do Mercado Modelo: roupa, chapéu, colar e a fitinha do Bonfim. Com o canal de volta, a maquininha quântica aceita seus Créditos de novo!'
          : 'Oi, meu amor! A maquininha quântica pifou com o Silêncio, mas Crédito Quântico eu anoto no caderninho. Roupa, chapéu, colar e a fitinha do Bonfim: pode provar à vontade.';
      },
        choices: [
          { t: 'Ver roupas e acessórios', close: true, action: function () { AF.Shop.open(); } },
          { t: 'Qual é a história da fitinha do Bonfim?', next: 'fita' },
          { t: 'Como ganho mais Créditos Quânticos?', next: 'cq' },
          { t: 'Até mais, Dona Lu.', close: true }
        ] },
      fita: { speaker: 'lu', text: 'A fitinha do Senhor do Bonfim é a lembrança mais famosa de Salvador. Amarra no pulso com três nós, um pedido em cada nó, e deixa ela lá até cair sozinha. Dizem que quem corta antes perde os pedidos!', next: 'a' },
      cq: { speaker: 'lu', text: 'Pelo que o povo da Afrotech me conta: acertando os testes, vencendo os desafios, explicando a ciência para a vizinhança e fazendo descobertas. E o Terminal Oráculo também mexe com Créditos, viu?', next: 'a' }
    } },

    /* ===================== VLT DA BAÍA E CASA NA RIBEIRA ===================== */
    vlt: { start: 'a', nodes: {
      a: { speaker: 'narrador', redirect: function () {
        if (AF.World.mapId === 'ribeira') return 'volta';
        return S.flag('restored') ? 'ida' : 'off';
      } },
      off: { speaker: 'narrador', text: 'VLT da Baía — Comércio · Calçada · Bonfim · Ribeira. Painel: "OPERAÇÃO SUSPENSA — a sinalização da linha depende do canal quântico". Um aviso escrito à mão: "Agente, primeiro a missão. Depois, casa."' },
      ida: { speaker: 'narrador', text: function () {
        return 'VLT da Baía — Comércio · Água de Meninos · São Joaquim · Calçada · Largo de Roma · Bonfim · Ribeira. Painel: "Próxima partida: agora. Viagem de cerca de 1 minuto pela beira da baía."' + (S.flag('casa') ? '' : ' Depois de um dia desses, a sua casa na beira da praia, na Ribeira, chama.');
      },
        choices: [
          { t: 'Embarcar para casa, na Ribeira', close: true, action: function () { AF.Trip.play('casa'); } },
          { t: 'Agora não.', close: true }
        ] },
      volta: { speaker: 'narrador', text: 'VLT da Baía — sentido Comércio. Painel: "Embarque imediato".',
        choices: [
          { t: 'Voltar ao Comércio', close: true, action: function () { AF.Trip.play('casa_volta'); } },
          { t: 'Ficar em casa mais um pouco.', close: true }
        ] }
    } },
    casa_cama: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: function () {
        return S.flag('casa') ? 'Sua cama, com a janela aberta para o mar. Estabilidade: {stab}/{max}.'
          : 'Sua cama. Lençol cheirando a sol, a janela aberta para a Enseada dos Tainheiros e o barulho baixinho das ondas. Depois de salvar o Canal Quântico, você merece.';
      },
        choices: [
          { t: 'Dormir até amanhã', close: true, action: function () { AF.Home.rest(); } },
          { t: 'Dormir e ver os créditos de novo', if: function () { return S.flag('creditsSeen'); }, close: true, action: function () { AF.Home.sleep(true); } },
          { t: 'Ainda não.', close: true }
        ] }
    } },
    casa_acorda: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Bom dia! O sol entra pela janela e os saveiros já estão na água. Estabilidade restaurada por completo. Da cozinha do vizinho vem cheiro de café; da rua, o sino do VLT.', next: 'b' },
      b: { speaker: 'oraculo', text: 'Bom dia, agente {name}. Canal quântico: 512 de 512 nós ativos. Salvador funciona — e, por hoje, ninguém precisa de você com urgência. Aproveite a orla.' }
    } },
    guardaroupa: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Seu guarda-roupa. Tudo o que você comprou na Boutique do Mercado fica aqui.',
        choices: [
          { t: 'Trocar de roupa', close: true, action: function () { AF.Wardrobe.open(); } },
          { t: 'Fechar o guarda-roupa.', close: true }
        ] }
    } },
    casa_mural: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: function () {
        var it = [];
        if (S.flag('restored')) it.push('o recorte do jornal "SALVADOR VOLTA A FALAR"');
        if (S.flag('miniElevador')) it.push('a Credencial de Operador(a) de Portas');
        if (S.flag('acarajeQ')) it.push('o papel do acarajé de Dona Cici');
        if (S.flag('jacobina')) it.push('um bilhete do Hipertrem para Jacobina');
        if (S.flag('natacao')) it.push('a touca da aula de Mi Ayô');
        if (S.flag('cruzeiroVista')) it.push('um cartão-postal do Alto do Cruzeiro');
        if (S.flag('memoria')) it.push('uma carta |?⟩ do jogo do Kauã');
        if (S.flag('mulheresCiencia')) it.push('uma lista de cientistas escrita pelo Prof. Hohenfeld');
        return 'Mural de lembranças. Presos com tachinhas: ' + (it.length ? it.join(', ') + '.' : 'por enquanto, só fotos da família.');
      } }
    } },
    casa_radio: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'O rádio toca a Rádio Ribeira: ijexá de afoxé, depois samba-reggae, depois um samba de roda do Recôncavo. O locutor avisa que a Lavagem do Bonfim já tem data marcada.' }
    } },
    sorvete: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Sorveteria da orla da Ribeira. Sabores do dia: tapioca, coco, cajá, umbu, mangaba e chocolate. Uma bola: 2 CQ.',
        choices: [
          { t: 'Uma bola de tapioca (2 CQ)', if: function () { return S.d.credits >= 2; }, next: 'tomar' },
          { t: 'Uma bola de cajá (2 CQ)', if: function () { return S.d.credits >= 2; }, next: 'tomar' },
          { t: 'Só olhar.', close: true }
        ] },
      tomar: { speaker: 'narrador', onEnter: function () { if (S.spend(2)) { S.heal(15); AF.Audio.play('cash'); AF.Toast.show('+15 Estabilidade', 'green'); } },
        text: 'Gelado, doce e com gosto de infância. Você senta no murinho da orla e olha os saveiros.' }
    } },
    didi: { start: 'a', nodes: {
      a: { speaker: 'didi', text: 'Bom dia, vizinho(a)! Quarenta anos remendando rede aqui na Enseada dos Tainheiros. Ouvi dizer que foi você que fez Salvador voltar a falar.',
        choices: [
          { t: 'Como o senhor sabe a hora de sair para pescar?', next: 'mare' },
          { t: 'O senhor confia nessa tecnologia quântica?', next: 'quant' },
          { t: 'Bom dia, Seu Didi.', close: true }
        ] },
      mare: { speaker: 'didi', text: 'Pela maré, ora. A Lua puxa a água do mar, o Sol ajuda, e duas vezes por dia ela enche e duas vezes ela vaza. Tem tábua de maré, mas meu avô sabia só de olhar a Lua.', next: 'a' },
      quant: { speaker: 'didi', text: 'Eu confio no que eu entendo. Mas, depois que meu neto me explicou que o tal teletransporte não leva peixe nenhum, só informação, eu dormi tranquilo: meu saveiro continua tendo serviço!', next: 'a' }
    } },

    /* ===================== HIPERTREM E JACOBINA ===================== */
    hipertrem: { start: 'a', nodes: {
      a: { speaker: 'narrador', redirect: function () {
        if (AF.World.mapId === 'jacobina') return 'volta';
        return S.flag('restored') ? 'ida' : 'off';
      } },
      off: { speaker: 'narrador', text: 'Hipertrem Salvador–Jacobina. Painel: "SERVIÇO SUSPENSO — a sinalização da linha depende do canal quântico". A cápsula do trem dorme sobre o trilho magnético.' },
      ida: { speaker: 'narrador', text: 'Hipertrem Salvador–Jacobina, linha do Piemonte da Diamantina. Painel: "Próxima partida: agora. Viagem de matéria — pessoas e bagagens. Para estados quânticos, use o canal da Afrotech."',
        choices: [
          { t: 'Embarcar para Jacobina', close: true, action: function () { AF.Trip.play('jacobina'); } },
          { t: 'Por que o trem demora e o estado da D-7 não?', next: 'ida2' },
          { t: 'Agora não.', close: true }
        ] },
      ida2: { speaker: 'narrador', text: 'Uma placa responde: "O trem leva VOCÊ — matéria, que precisa atravessar os cerca de 300 km. O teletransporte não leva matéria: Jacobina já tinha a sua metade do par emaranhado, e só 2 bits clássicos viajam pela fibra, na velocidade da luz no vidro."', next: 'ida' },
      volta: { speaker: 'narrador', text: 'Hipertrem Jacobina–Salvador. Painel: "Embarque imediato para o Comércio."',
        choices: [
          { t: 'Voltar para Salvador', close: true, action: function () { AF.Trip.play('jacobina_volta'); } },
          { t: 'Ficar mais um pouco.', close: true }
        ] }
    } },

    jamal_chegada: { start: 'a', nodes: {
      a: { speaker: 'jamal', text: '{name}! Seja bem-vindo(a) a Jacobina, a Cidade do Ouro! Foi aqui, nessa estação, que o estado da D-7 apareceu no meu qubit. A cápsula ficou em Salvador; só a informação veio.', next: 'b' },
      b: { speaker: 'jamal', text: 'E chegou em boa hora: a D-8 está saindo de Salvador. Quer operar a recepção comigo no console? Daqui você vai ver o que Dandara nunca vê: como é esperar os bits sem saber de nada.',
        choices: [
          { t: 'Bora para o console!', close: true, action: function () { AF.Mini.jacobina(); } },
          { t: 'Primeiro quero conhecer a cidade.', close: true, action: function () { AF.Toast.show('Console de Recepção: à direita da estação', 'gold'); } }
        ] }
    } },

    jamal_jac: { start: 'a', nodes: {
      a: { speaker: 'jamal', text: 'Pois não, consultor(a)? A estação é toda sua.',
        choices: [
          { t: 'Operar a Recepção em Jacobina (desafio)', close: true, action: function () { AF.Mini.jacobina(); } },
          { t: 'Como é receber o estado sem saber os bits?', next: 'b' },
          { t: 'O estado chegou mais rápido que a luz?', next: 'c' },
          { t: 'Até mais, Jamal.', close: true }
        ] },
      b: { speaker: 'jamal', text: 'Antes dos bits, o meu qubit é uma mistura das quatro possibilidades — o estado certo, ou ele com X, com Z, ou com os dois. Na média, a seta dele fica no CENTRO da esfera de Bloch: pura incerteza. Se eu medir nessa hora, jogo a cápsula fora.', next: 'a' },
      c: { speaker: 'jamal', text: 'Não. O par emaranhado foi distribuído antes, mas sem os 2 bits eu não sei qual correção usar. E os bits vêm pela fibra: uns 300 km a cerca de 200 mil km por segundo, coisa de 1,5 milésimo de segundo. Rápido, mas nunca mais rápido que a luz.', next: 'a' }
    } },

    socorro: { start: 'a', nodes: {
      a: { speaker: 'socorro', text: 'Boa noite, meu filho. Meu avô bateu bateia nessas serras a vida inteira. Jacobina nasceu atrás do ouro, lá no tempo da colônia, e até hoje tem ouro saindo daí de baixo.',
        choices: [
          { t: 'O que o garimpo tem a ver com o teletransporte?', next: 'b' },
          { t: 'Pergunta de Dona Socorro', if: function () { return !S.flag('socorroOk'); }, next: 'q' },
          { t: 'Boa noite, Dona Socorro.', close: true }
        ] },
      b: { speaker: 'socorro', text: 'Pepita não se copia, meu filho. Quem achou, levou: não tem como fazer outra igualzinha olhando para ela. Jamal me explicou que esse tal estado quântico é parecido — ninguém consegue tirar cópia. Por isso, quando chega aqui, o de Salvador já se desfez.', next: 'a' },
      q: { speaker: 'socorro', text: 'Então me responda: depois que Jamal recebeu o estado da D-7, ficaram duas cópias dele, uma lá e outra cá?',
        choices: [
          { t: 'Sim: uma em Salvador e outra em Jacobina.', next: 'q_err' },
          { t: 'Não: a medição de Dandara desfez o original. O teletransporte transfere, não copia (não-clonagem).', next: 'q_ok' },
          { t: 'Só se Dandara medir duas vezes.', next: 'q_err' }
        ] },
      q_err: { speaker: 'socorro', onEnter: function () { S.inc('errSocorro'); S.damage(2, 'cópia impossível'); },
        text: 'Ô, meu filho… se desse para copiar, eu fazia pepita em casa! Pense no que acontece com o qubit de Dandara quando ela mede.', next: 'q' },
      q_ok: { speaker: 'socorro', onEnter: function () {
          S.record('aplicacao', 'socorro', S.count('errSocorro') + 1); S.setFlag('socorroOk'); S.addCredits(3); S.unlock('nao_clonagem');
        }, text: 'É isso! Igual pepita: ou está aqui, ou está lá. Leve essa fitinha dourada de lembrança de Jacobina.', next: 'a' }
    } },

    davi: { start: 'a', nodes: {
      a: { speaker: 'davi', redirect: function () { return S.flag('daviOk') ? 'z' : 'b'; } },
      b: { speaker: 'davi', text: 'Oxe! Você veio de Salvador? Veio pelo canal quântico, teletransportado?',
        choices: [
          { t: 'Vim, sim: sumi lá e apareci aqui.', next: 'err' },
          { t: 'Não: vim de Hipertrem. Matéria viaja de trem; pelo canal quântico só vai o estado de partículas, e com ajuda de 2 bits.', next: 'ok' },
          { t: 'Vim pela fibra óptica.', next: 'err' }
        ] },
      err: { speaker: 'davi', onEnter: function () { S.inc('errDavi'); }, text: 'Hum… mas então por que tem um trem parado ali na plataforma? Tá me enrolando!', next: 'b' },
      ok: { speaker: 'davi', onEnter: function () { S.record('aplicacao', 'davi', S.count('errDavi') + 1); S.setFlag('daviOk'); S.addCredits(2); },
        text: 'Ahh, então gente vai de trem e informação vai de canal. Quando eu crescer, vou trabalhar na estação com Jamal!', next: 'z' },
      z: { speaker: 'davi', text: 'Já subiu o Alto do Cruzeiro? São mais de 200 degraus, mas lá de cima dá para ver a serra toda!' }
    } },

    jac_estacao: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Estação Receptora Jacobina. Na cúpula, os qubits de Jamal esperam congelados; a antena aponta para o céu limpo do sertão. Do lado oeste chega o cabo de fibra óptica que vem de Salvador.' }
    } },
    jac_console: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Console de Recepção. Tela: "Cápsula D-8 a caminho · par emaranhado pronto · aguardando bits clássicos".',
        choices: [
          { t: 'Operar a Recepção em Jacobina (desafio)', close: true, action: function () { AF.Mini.jacobina(); } },
          { t: 'Deixar para depois.', close: true }
        ] }
    } },
    jac_fibra: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Caixa de emenda da fibra óptica Salvador–Jacobina. A luz anda no vidro a uns 200 mil km por segundo; nos cerca de 300 km até Salvador, os 2 bits levam por volta de 1,5 milésimo de segundo. Rápido, mas não instantâneo: é esse o limite de velocidade do teletransporte.',
        onEnter: function () { S.unlock('canal_classico'); } }
    } },
    jac_mina: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Mina Velha: a boca de uma antiga galeria de ouro, escorada com madeira. Jacobina nasceu da corrida do ouro no período colonial, e o metal ainda sai do subsolo da serra. Um vagonete enferrujado repousa sobre os trilhos.' }
    } },
    jac_cruzeiro: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: function () {
        return 'Alto do Cruzeiro: um mirante alcançado por mais de 200 degraus. Lá de cima se veem os vales e as serras que cercam Jacobina, no extremo norte da Chapada Diamantina. Na catraca do mirante: "Ingresso: 20 CQ — a renda mantém a escadaria iluminada". Você tem {cq} CQ.';
      },
        choices: [
          { t: 'Pagar 20 CQ e subir os degraus', if: function () { return S.d.credits >= 20; }, close: true, action: function () {
            if (!S.spend(20)) return;
            AF.Audio.play('cash');
            if (!S.flag('cruzeiroVista')) {
              S.setFlag('cruzeiroVista');
              S.addJournal('Mirante do Alto do Cruzeiro', 'Paguei 20 CQ e subi os mais de 200 degraus do Alto do Cruzeiro. Lá de cima: as serras roxas ao entardecer, as luzes de Jacobina ao longo do vale, o Rio do Ouro brilhando e a antena da Estação de Jamal piscando em ciano.');
            }
            setTimeout(function () { AF.Panorama.open(); }, 250);
          } },
          { t: function () { return 'Subir (faltam ' + Math.max(0, 20 - S.d.credits) + ' CQ)'; }, if: function () { return S.d.credits < 20; }, next: 'pobre' },
          { t: 'Agora não.', close: true }
        ] },
      pobre: { speaker: 'narrador', text: 'A catraca não gira. Créditos Quânticos vêm de testes bem-sucedidos, desafios e descobertas — Jamal, Dona Socorro e Davi têm perguntas para você.' }
    } },
    jac_rio: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Placa: "RIO DO OURO". Foi às margens do Rio do Ouro e do Itapicuru-Mirim que surgiu o arraial que deu origem a Jacobina.' }
    } },

    hohenfeld_lousa: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Na lousinha, uma onda desenhada a giz, um ψ no canto e uma frase com a letra do professor: "Toda equação já foi, um dia, uma pergunta de alguém."' }
    } },

    kaua: { start: 'a', nodes: {
      a: { speaker: 'kaua', text: 'E aí! Sou Kauã, entregador de drones. Sem rede quântica, minhas rotas viraram labirinto.',
        choices: [
          { t: 'Conhece algum jeito discreto de passar pelo portão da Torre?', req: { attr: 'furtividade', min: 1 }, next: 'furt', if: function () { return !S.flag('gateOpen'); } },
          { t: 'Seu drone está parado de um jeito estranho. O que houve?', req: { attr: 'percepcao', min: 2 }, next: 'per' },
          { t: 'Quer entender o teletransporte da Afrotech?', next: 'app1', if: function () { return S.flag('quizDone') && !S.flag('kauaApp1'); } },
          { t: 'Você tinha uma dúvida sobre emaranhamento…', next: 'app2', if: function () { return S.flag('kauaApp1') && !S.flag('kauaApp2'); } },
          { t: 'O que você sabe do Elevador Lacerda?', next: 'elev' },
          { t: function () { return S.flag('memoria') ? 'Jogar de novo o Jogo da Memória Quântico' : 'Bora jogar o Jogo da Memória Quântico?'; }, close: true, action: function () { AF.Mini.memoria(); } },
          { t: 'Valeu, Kauã.', close: true }
        ] },
      furt: { speaker: 'kaua', text: 'O sensor do K-7 gira num ciclo fixo. Quem anda pela sombra no momento certo passa batido. O pessoal da Afrotech chama isso de "tunelar" — é só apelido, viu?',
        onEnter: function () { S.setFlag('kauaTip'); AF.Toast.show('Dica: +1 no teste de Furtividade com o K-7', 'gold'); }, next: 'a' },
      per: { speaker: 'kaua', text: 'Boa! Ele perdeu a referência com a base. E se liga: lá dentro da Torre, o corredor tá sem energia, com gás e piso com ruído quântico. Quem enxerga bem no escuro sofre menos.',
        onEnter: function () { S.addJournal('Aviso do Kauã', 'Dentro da Torre, o corredor está sem energia e há piso contaminado por ruído quântico. Percepção ajuda a enxergar.'); }, next: 'a' },
      elev: { speaker: 'kaua', text: 'O Espinhaço? Os cabos sobem pela estrutura até a Cidade Alta, e os servidores ficam submersos na baía pra esfriar. Quando a rede quântica volta, ele fica todo ciano. Lindo demais.', next: 'a' },
      app1: { speaker: 'kaua', text: 'Bora! Me disseram que a Afrotech teletransporta gente pra Jacobina em um segundo. Então é por isso que meus drones vão perder o emprego?',
        choices: [
          { t: 'Isso: em breve vão teletransportar pessoas e encomendas.', next: 'app1_err' },
          { t: 'Não: só o estado quântico de uma partícula viaja; nenhuma matéria vai junto. E ainda depende de 2 bits pela fibra.', next: 'app1_ok' },
          { t: 'Sim, mas só objetos pequenos, como drones.', next: 'app1_err' }
        ] },
      app1_err: { speaker: 'kaua', text: 'Sério? Então por que a Torre precisa de cabo de fibra óptica, hein? Tá estranho isso aí.', onEnter: function () { S.inc('errKaua1'); }, next: 'app1' },
      app1_ok: { speaker: 'kaua', text: 'Ahh, então meus drones continuam no trampo! A informação viaja, a encomenda vai de drone. Massa.',
        onEnter: function () { S.record('aplicacao', 'kaua1', S.count('errKaua1') + 1); S.setFlag('kauaApp1'); divulgacao(); }, next: 'a' },
      app2: { speaker: 'kaua', text: 'Pergunta difícil: se o emaranhamento é instantâneo, dá pra mandar mensagem mais rápido que a luz? Seria a entrega mais rápida do mundo!',
        choices: [
          { t: 'Dá: basta medir aqui que lá muda na hora.', next: 'app2_err' },
          { t: 'Não: cada medida, sozinha, é aleatória. A correlação só vira informação quando os resultados são comparados por um canal clássico.', next: 'app2_ok' },
          { t: 'Dá, mas a Afrotech guarda segredo.', next: 'app2_err' }
        ] },
      app2_err: { speaker: 'kaua', text: 'Hum… mas quem escolhe o resultado da medida? Se ninguém escolhe, como é que eu mando "oi"?', onEnter: function () { S.inc('errKaua2'); }, next: 'app2' },
      app2_ok: { speaker: 'kaua', text: 'Entendi: o resultado é sorteado, então não dá pra escolher a mensagem. A luz continua sendo a mais rápida. Valeu, professor(a)!',
        onEnter: function () { S.record('aplicacao', 'kaua2', S.count('errKaua2') + 1); S.setFlag('kauaApp2'); S.unlock('emaranhamento'); divulgacao(); }, next: 'a' }
    } },

    k7: { start: 'a', nodes: {
      a: { speaker: 'k7', redirect: function () { return S.flag('gateOpen') ? 'open' : (S.flag('miniElevador') ? 'closed' : 'sem_cred'); } },
      open: { speaker: 'k7', text: 'PORTÃO LIBERADO. BOA SORTE, AGENTE {NAME}.' },
      sem_cred: { speaker: 'k7', text: 'BZZT. TORRE AFROTECH EM PROTOCOLO DE EMERGÊNCIA. CREDENCIAL DE OPERADOR(A) DE PORTAS: NÃO ENCONTRADA. CONCLUA O TREINAMENTO DE PORTAS LÓGICAS NO ELEVADOR LACERDA, AO NORTE DA PRAÇA.',
        onEnter: function () { AF.Toast.show('Objetivo: treinamento de portas no Elevador Lacerda', 'gold'); } },
      closed: { speaker: 'k7',
        text: function () {
          var n = S.count('k7fails');
          return n === 0 ? 'BZZT. ACESSO RESTRITO. TORRE AFROTECH EM PROTOCOLO DE EMERGÊNCIA. IDENTIFIQUE-SE.'
                         : 'ALERTA NÍVEL ' + n + '. ABORDAGENS REPETIDAS TÊM DIFICULDADE MAIOR. NOVA ESTRATÉGIA RECOMENDADA.';
        },
        choices: [
          { t: 'Convencer o K-7 de que você foi convocado(a)',
            test: { attr: 'labia', dc: function () { return 7 + S.count('k7_labia'); },
              bonus: function () { return S.flag('ciciTip') ? 1 : 0; },
              success: 'ok_labia', fail: 'f_labia', ruido: 10, reason: 'alerta de segurança' } },
          { t: 'Passar pela sombra durante a varredura do sensor',
            test: { attr: 'furtividade', dc: function () { return 7 + S.count('k7_furt'); },
              bonus: function () { return S.flag('kauaTip') ? 1 : 0; },
              success: 'ok_furt', fail: 'f_furt', ruido: 10, reason: 'alerta de segurança' } },
          { t: '[Hacker] Injetar um pacote de autenticação no K-7', if: function () { return S.d.classId === 'hacker'; },
            test: { attr: 'inteligencia', dc: function () { return 6 + S.count('k7_hack'); },
              success: 'ok_int', fail: 'f_hack', ruido: 8, reason: 'pacote rejeitado' } },
          { t: 'Examinar o portão', close: true, action: function () { setTimeout(function () { AF.Dialogue.start('portao'); }, 0); } },
          { t: 'Afastar-se.', close: true }
        ] },
      ok_labia: { speaker: 'k7', text: '...CONVOCAÇÃO CONFIRMADA NO REGISTRO DA AFROTECH. BEM-VINDO(A), AGENTE {NAME}. TRAVAS LIBERADAS.', next: 'entrada' },
      ok_furt: { speaker: 'narrador', text: 'Você desliza pela sombra enquanto o sensor gira para o outro lado. (Um "tunelamento" de mentirinha: para pessoas, é só metáfora.) Um clique seco, e as travas magnéticas recuam.', onEnter: function () { S.unlock('tunelamento'); }, next: 'entrada' },
      ok_int: { speaker: 'k7', text: 'PACOTE... AUTENTICADO. INTEGRIDADE CONFIRMADA. TRAVAS LIBERADAS.', next: 'entrada' },
      entrada: { speaker: 'narrador', text: 'Você entra no átrio antes que a multidão perceba. O ar-condicionado de emergência sopra frio, e as luzes de neon azul da Afrotech piscam, reconhecendo você como membro autorizado.', onEnter: gateOpened },
      f_labia: { speaker: 'k7', redirect: function () { S.inc('k7_labia'); return gateFail(); } },
      f_furt: { speaker: 'k7', redirect: function () { S.inc('k7_furt'); return gateFail(); } },
      f_hack: { speaker: 'k7', redirect: function () { S.inc('k7_hack'); return gateFail(); } },
      fail_txt: { speaker: 'k7', text: 'TENTATIVA REGISTRADA. RUÍDO DETECTADO NA SUA ASSINATURA. VOLTE À ÁREA PÚBLICA.', next: 'closed' },
      alarme: { speaker: 'narrador', text: 'O sistema trava e um alarme agudo ecoa pelo saguão, atraindo drones de segurança desgovernados. Na confusão, a porta fica entreaberta e você entra — mas o tempo agora é curto: algo, ou alguém, ouviu o erro.',
        onEnter: function () { S.setFlag('alarm'); gateOpened(); AF.Toast.show('Torre em alerta: testes do Núcleo +1 de dificuldade', 'magenta'); } }
    } },

    portao: { start: 'a', nodes: {
      a: { speaker: 'narrador', redirect: function () { return S.flag('gateOpen') ? 'aberto' : (S.flag('miniElevador') ? 'b' : 'sem_cred'); } },
      aberto: { speaker: 'narrador', text: 'As portas de policarbonato estão abertas. O átrio da Afrotech espera, mergulhado em penumbra azulada.' },
      sem_cred: { speaker: 'narrador', text: 'As portas de policarbonato estão seladas. Um letreiro pisca: "ACESSO SÓ COM CREDENCIAL DE OPERADOR(A) DE PORTAS — treinamento no Elevador Lacerda".' },
      b: { speaker: 'narrador', text: 'As portas de policarbonato estão seladas. O reconhecimento facial está offline; resta um teclado numérico de backup que exige um código rotativo de criptografia quântica.',
        onEnter: function () { S.unlock('criptografia'); },
        choices: [
          { t: 'Hackear o teclado de backup',
            test: { attr: 'inteligencia', dc: function () { return 8 + S.count('k7_int'); }, problem: true,
              success: 'ok', fail: 'f_int', ruido: 10, reason: 'alarme do teclado' } },
          { t: 'Achar a válvula hidráulica e forçar a abertura',
            test: { attr: 'percepcao', dc: function () { return 8 + S.count('k7_per'); },
              success: 'ok', fail: 'f_per', ruido: 10, reason: 'vapor da tubulação' } },
          { t: 'Voltar.', close: true }
        ] },
      ok: { speaker: 'narrador', text: 'Com um clique seco, as travas magnéticas recuam. Você entra no átrio principal antes que a multidão perceba. As luzes de neon azul piscam, reconhecendo você como membro autorizado.', onEnter: gateOpened },
      f_int: { speaker: 'narrador', redirect: function () { S.inc('k7_int'); var r = gateFail(); return r === 'alarme' ? 'alarme' : 'falha'; } },
      f_per: { speaker: 'narrador', redirect: function () { S.inc('k7_per'); var r = gateFail(); return r === 'alarme' ? 'alarme' : 'falha'; } },
      falha: { speaker: 'narrador', text: 'O código rotativo muda antes que você termine. Cada tentativa errada deixa rastro — exatamente como na criptografia quântica, onde quem espiona é detectado.', next: 'b' },
      alarme: { speaker: 'narrador', text: 'Um alarme agudo ecoa e drones desgovernados se aproximam. Na confusão, a porta fica entreaberta e você entra — mas algo, ou alguém, ouviu o erro.',
        onEnter: function () { S.setFlag('alarm'); gateOpened(); AF.Toast.show('Torre em alerta: testes do Núcleo +1 de dificuldade', 'magenta'); } }
    } },

    /* ===================== ATO 2 · PROBLEMATIZAÇÃO (Torre) ===================== */
    torre_entrada: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'O átrio, antes cheio de hologramas de boas-vindas, está numa penumbra azulada. Cheiro de ozônio e metal resfriado. O elevador interno não funciona.', next: 'b' },
      b: { speaker: 'oraculo', text: 'Agente, o corredor central está sem energia e com gás denso: o Labirinto do Silêncio. Ao norte fica a antecâmara da Sala do Computador Quântico — o Núcleo vive isolado lá dentro. Conecte-se à interface na antecâmara antes que o sistema reinicie e apague os logs. O gabinete de Dandara fica a oeste.' }
    } },

    campo: { start: 'a', nodes: {
      a: { speaker: 'oraculo', redirect: function () { return S.flag('nucleoLogs') ? 'lock' : 'b'; } },
      b: { speaker: 'narrador', text: 'Atrás da porta blindada, travada por um campo de contenção, fica o Núcleo: o computador quântico da Afrotech, sozinho numa sala só dele — um "lustre dourado" a 10 milikelvin, sobre um piso que não vibra. Daqui da antecâmara, alguém precisa conectar um terminal e estabilizar os dados antes que o sistema reinicie e apague os logs.',
        choices: [
          { t: 'Estabilizar os dados pela teoria quântica (Ciência)',
            test: { attr: 'inteligencia', dc: function () { return 8 + alarmDC(); }, problem: true, success: 'ok', fail: 'fail', ruido: 8, reason: 'feedback quântico' } },
          { t: 'Varredura dos logs com busca de Grover (Tecnologia)',
            test: { attr: 'busca', dc: function () { return 8 + alarmDC(); }, problem: true, success: 'ok', fail: 'fail', ruido: 8, reason: 'feedback quântico' } },
          { t: 'Capturar um registro dos logs antes do reboot',
            test: { attr: 'fotografia', dc: function () { return 7 + alarmDC(); }, problem: true, success: 'ok', fail: 'fail', ruido: 8, reason: 'feedback quântico' } },
          { t: 'Deixar para depois.', close: true }
        ] },
      ok: { speaker: 'narrador', text: 'As mãos voam pelo terminal. O gráfico de emaranhamento mostra algo surpreendente: os pares continuam emaranhados — o canal não foi cortado. O que sumiu foi a tabela de correção dos receptores. E a origem do pulso aponta para uma coordenada fora de qualquer mapa conhecido.',
        onEnter: function () {
          S.setFlag('nucleoLogs'); S.setFlag('nucleoLogsOk'); S.addCredits(3); S.unlock('emaranhamento');
          S.addJournal('Logs do Núcleo', 'Os pares continuam emaranhados: o canal não foi cortado. O pulso apagou a tabela de correção dos receptores. A origem do pulso é uma coordenada fora de qualquer mapa conhecido.');
        }, next: 'c' },
      fail: { speaker: 'narrador', text: 'O sistema sofre um feedback quântico e uma descarga estática joga você para trás. Você recupera só um fragmento: uma voz distorcida que diz "...não foi um erro, foi um convite". O Núcleo entra em lockdown total.',
        onEnter: function () {
          S.setFlag('nucleoLogs');
          S.addJournal('Fragmento do Núcleo', 'Uma voz distorcida nos logs: "...não foi um erro, foi um convite". O Núcleo entrou em lockdown: só reabre com um protocolo de correção completo.');
        }, next: 'c' },
      c: { speaker: 'oraculo', text: 'O campo de contenção só cai diante de um protocolo de correção completo (00, 01, 10 e 11). Procure Dandara, no gabinete a oeste.' },
      lock: { speaker: 'oraculo', text: 'CAMPO DE CONTENÇÃO ATIVO. O Núcleo só aceita um protocolo de correção completo. Progresso da tabela: {table}/4.' }
    } },

    dandara: { start: 'a', nodes: {
      a: { speaker: 'dandara', redirect: function () {
        if (!S.flag('metDandara')) return 'm1';
        if (S.flag('restored')) return 'fim';
        if (S.flag('lousaRead') && !S.flag('dandaraReact')) return 'r1';
        if (!S.flag('lousaRead')) return 'n1';
        if (S.flag('codeDecoded')) return 'n5';
        if (S.flag('tableDone')) return 'n4';
        if (S.flag('quizDone')) return 'n3';
        return 'n2';
      } },
      m1: { speaker: 'dandara', text: '{name}! Você atravessou o Labirinto do Silêncio. Eu sou Dandara, chefe do Laboratório de Entrelaçamento.', next: 'm2' },
      m2: { speaker: 'dandara', text: 'Quando o Silêncio começou, eu estava enviando a informação da cápsula D-7 para Jamal, na estação de Jacobina. Estava tudo pronto: o par emaranhado, a medição, os bits pela fibra… e então, nada.', next: 'm3' },
      m3: { speaker: 'dandara', text: 'Eu poderia te explicar tudo agora. Mas aprendi com a Prof.ª Iasmin que a gente só entende de verdade o que tenta explicar primeiro. Na minha lousa estão as quatro perguntas que me tiram o sono. Quero ouvir as SUAS hipóteses.',
        onEnter: function () { S.setFlag('metDandara'); },
        choices: [
          { t: 'Por que você não me diz logo a resposta?', next: 'm4' },
          { t: 'Já registrei minhas hipóteses na lousa.', if: function () { return S.flag('lousaRead'); }, next: 'r1' },
          { t: 'Vou até a lousa.', if: function () { return !S.flag('lousaRead'); }, close: true }
        ] },
      m4: { speaker: 'dandara', text: 'Porque resposta pronta não vira conhecimento. Nesta etapa não existe hipótese errada: suas ideias vão para o Diário de Bordo e, no laboratório, a gente confronta tudo com a física.',
        choices: [
          { t: 'Combinado.', if: function () { return !S.flag('lousaRead'); }, close: true },
          { t: 'Combinado — já registrei minhas hipóteses.', if: function () { return S.flag('lousaRead'); }, next: 'r1' }
        ] },
      r1: { speaker: 'dandara', text: function () { return REACT_Q1[S.d.hyp.q1 !== undefined ? S.d.hyp.q1 : 3]; }, next: 'r2' },
      r2: { speaker: 'dandara', text: function () { return REACT_Q4[S.d.hyp.q4 !== undefined ? S.d.hyp.q4 : 2]; }, next: 'r3' },
      r3: { speaker: 'dandara', text: 'Leve suas hipóteses à Prof.ª Iasmin, no Laboratório de Teoria Quântica, a leste do corredor. É lá que a gente organiza o conhecimento. E leve isto: um Terminal Quântico portátil.',
        onEnter: function () {
          S.setFlag('dandaraReact'); S.setFlag('terminal');
          AF.Toast.show('Terminal Quântico portátil recebido — ' + (AF.Touch && AF.Touch.on ? 'botão Terminal' : 'tecla Q'), 'gold');
          S.addJournal('Dandara e a cápsula D-7', 'Dandara enviava a informação da cápsula D-7 para Jamal (Jacobina) quando o Silêncio começou. Ela não quis me dar respostas prontas: ouviu minhas hipóteses e me mandou ao laboratório da Prof.ª Iasmin.',
            'Crônica: Dandara fala de qubits como quem fala de parentes. Dá vontade de entender tudo.');
        },
        choices: [{ t: 'Rumo ao laboratório.', close: true }] },
      n1: { speaker: 'dandara', text: 'A lousa está na parede, à esquerda. O pulso embaralhou a escrita — talvez você precise de um olhar atento, de uma boa captura ou de muito raciocínio.' },
      n2: { speaker: 'dandara', text: 'A Prof.ª Iasmin está no Laboratório de Teoria Quântica, à direita do corredor. Leve suas hipóteses: ela adora desmontá-las com carinho.' },
      n3: { speaker: 'dandara', text: 'Siga o Roteiro de Operação: faça pelo menos 10 teletransportes no simulador e anote, para cada par de bits, o que fez a seta vermelha cair sobre a sombra verde.' },
      n4: { speaker: 'dandara', text: 'Tabela completa! Agora mostre seus registros à Prof.ª Iasmin. Ela vai querer a REGRA, não só a lista.' },
      n5: { speaker: 'dandara', text: 'Vocês decifraram o código. O campo de contenção caiu: vá ao Núcleo, ao norte do corredor. Na antecâmara, cumpra o protocolo de entrada da sala blindada — e reconstrua o protocolo de teletransporte antes que a última conexão caia.' },
      fim: { speaker: 'dandara', text: function () {
        var h = S.d.hyp.q1;
        var antes = h !== undefined ? '"' + AF.HIPOTESES[0].options[h] + '"' : 'uma hipótese';
        return 'O canal voltou a cantar e Jamal recebeu o estado da D-7 com fidelidade total. Lembra do que você escreveu na lousa? ' + antes + '. E agora, o que você responderia?';
      }, next: 'fim2' },
      fim2: { speaker: 'dandara', text: 'Nenhuma matéria viajou: só o estado quântico mudou de lugar. Isso é teletransporte de verdade. Salvador te agradece, {name}.' }
    } },

    lousa: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'No gabinete, livros de física quântica dividem espaço com livros da história de Salvador e uma bancada de óptica. A lousa de vidro de Dandara brilha em âmbar — as perguntas parecem gritos de alguém tentando entender o impossível.', next: 'b' },
      b: { speaker: 'oraculo', text: 'O em█ranhamento foi desf█ito. A cápsula… não está em lugar nenhum, logo, está em todos. Para acessar os logs de Dandara, o sistema exige uma validação de lógica quântica.',
        choices: [
          { t: 'Decifrar a escrita entre as interferências', test: { attr: 'percepcao', dc: 7, problem: true, success: 'ok', fail: 'fail', ruido: 8, reason: 'interferência na lousa' } },
          { t: 'Capturar um registro estável da lousa', test: { attr: 'fotografia', dc: 7, problem: true, success: 'ok', fail: 'fail', ruido: 8, reason: 'captura instável' } },
          { t: 'Reconstruir as perguntas pelo contexto', test: { attr: 'inteligencia', dc: 8, problem: true, success: 'ok', fail: 'fail', ruido: 8, reason: 'reconstrução falhou' } },
          { t: 'Voltar.', close: true }
        ] },
      ok: { speaker: 'narrador', text: 'A estática cede e a escrita de Dandara se estabiliza. O sistema aceita a validação e libera um vídeo de segurança gravado segundos antes do colapso.',
        onEnter: function () {
          if (!S.flag('video')) {
            S.setFlag('video');
            S.addJournal('Vídeo de segurança de Dandara', '"Registro D-7, 03h12. Par emaranhado estável. CNOT, Hadamard… medi: 1 0. Enviando os bits pela fibra. Jamal, aplique a corre—" [sinal perdido]');
          }
        },
        choices: [{ t: 'Registrar minhas hipóteses', close: true, action: function () { AF.Lousa.hypotheses(function () { AF.Dialogue.start('dandara'); }); } }] },
      fail: { speaker: 'narrador', text: 'Você hesita nos termos e o sistema interpreta a hesitação como tentativa de invasão: um terminal se bloqueia com um choque estático. Dá para ler só fragmentos.',
        choices: [
          { t: 'Ler os fragmentos', close: true, action: function () { AF.Lousa.open(true); } },
          { t: 'Tentar outra abordagem', next: 'b' }
        ] }
    } },

    fragmento: { start: 'a', nodes: {
      a: { speaker: 'narrador', redirect: function () { return S.flag('fragment') ? 'vazio' : 'b'; } },
      b: { speaker: 'narrador', text: 'Entre as faíscas do piso, um cristal de memória ainda brilha. Ele reproduz a voz de Dandara: "Registro 17 — se a tabela se perder, lembre: os bits contam o que aconteceu com o qubit de Jamal. Um conta a FASE, o outro conta o BIT."',
        onEnter: function () {
          S.setFlag('fragment'); S.addCredits(5);
          S.addJournal('Fragmento de memória', 'Cristal com a voz de Dandara: "os bits contam o que aconteceu com o qubit de Jamal. Um conta a FASE, o outro conta o BIT."',
            'Crônica: guardei o cristal no bolso. Algumas memórias da cidade sobrevivem até ao Silêncio.');
        } },
      vazio: { speaker: 'narrador', text: 'O cristal agora está apagado.' }
    } },

    /* ===================== ATO 3 · ORGANIZAÇÃO DO CONHECIMENTO ===================== */
    iasmin: { start: 'a', nodes: {
      a: { speaker: 'iasmin', redirect: function () {
        if (S.flag('restored')) return 'fim';
        if (!S.flag('dandaraReact')) return 'cedo';
        if (S.flag('codeDecoded')) return 'nucleo';
        if (S.flag('tableDone')) return 'codigo';
        if (S.flag('quizDone')) return 'depois';
        if (S.flag('iasminLesson')) return 'pronto';
        return 'l1';
      } },
      cedo: { speaker: 'iasmin', text: 'Olá! Sou a Prof.ª Iasmin. Antes de qualquer explicação, fale com Dandara e registre suas hipóteses na lousa dela. Eu gosto de começar pelo que vocês já pensam.' },
      l1: { speaker: 'narrador', text: 'O Oráculo projeta um rastro de luz azul até uma sala circular de quadros digitais flutuantes. No centro, cercada por esferas e vetores, a Prof.ª Iasmin apaga uma equação e encara você.', next: 'l2' },
      l2: { speaker: 'iasmin', text: 'Você chegou na hora certa. O que acontece lá fora não é só uma falha técnica: é uma ruptura na forma como Salvador se comunica com o futuro. Para consertar o que Dandara e Jamal começaram, você precisa entender a linguagem do invisível.', next: 'l3' },
      l3: { speaker: 'iasmin', text: 'SUPERPOSIÇÃO. Um bit é como uma lâmpada: acesa (1) ou apagada (0). Um qubit é como esta seta numa esfera: |0⟩ no polo norte, |1⟩ no polo sul — e ela pode apontar para qualquer direção entre eles. Isso é α|0⟩ + β|1⟩.',
        onEnter: function () { S.unlock('superposicao'); S.unlock('bloch'); }, next: 'l4' },
      l4: { speaker: 'iasmin', text: 'MEDIÇÃO. Mas a medida só pergunta "0 ou 1?". A seta colapsa para um dos polos, com probabilidades |α|² e |β|², e a direção original se perde. Medir não é só olhar: é interferir. Por isso essa riqueza é tão poderosa — e tão frágil.',
        onEnter: function () { S.unlock('medicao'); }, next: 'l5' },
      l5: { speaker: 'iasmin', text: 'EMARANHAMENTO. Agora, duas setas ligadas por um fio de luz. O estado do par não pode ser escrito como "uma seta para cada um". Medidos, os resultados combinam, mesmo a 300 km. Einstein chamou isso de ação fantasmagórica à distância.',
        onEnter: function () { S.unlock('emaranhamento'); S.unlock('par_bell'); }, next: 'l6' },
      l6: { speaker: 'iasmin', text: 'Mas atenção: sozinha, cada medida parece aleatória. Nenhuma mensagem viaja pelo laço. É esse vínculo que une Dandara e Jamal — e, sem ele, o canal quântico silencia.', next: 'l7' },
      l7: { speaker: 'iasmin', text: 'TELETRANSPORTE. Não é mover matéria pelo espaço, como nos filmes. É mover o ESTADO. Dandara não envia a seta: envia uma "receita" de 2 bits clássicos pela fibra. A seta de Jamal já está quase lá — só falta o conserto que a receita indica.',
        onEnter: function () { S.unlock('teletransporte'); }, next: 'duvidas' },
      duvidas: { speaker: 'iasmin', text: 'Antes de iniciarmos o protocolo: alguém tem alguma dúvida sobre a informação — sobre a superposição?',
        onEnter: function () { S.setFlag('iasminLesson'); },
        choices: [
          { t: 'Então o qubit é 0 e 1 ao mesmo tempo?', next: 'd_qubit' },
          { t: 'E o gato de Schrödinger, que está vivo e morto?', next: 'd_gato' },
          { t: 'Por que medir muda o estado?', next: 'd_med' },
          { t: 'O Oráculo disse que a cápsula "não está em lugar nenhum, logo está em todos".', if: function () { return S.flag('lousaRead'); }, next: 'd_oraculo' },
          { t: 'Sem dúvidas — pode mandar o quiz!', close: true, action: function () { AF.Quiz.open(false); } }
        ] },
      d_qubit: { speaker: 'iasmin', text: 'É um bom começo de frase, mas eu prefiro outra: o qubit está numa COMBINAÇÃO de 0 e 1. Se você medir, vai ver só 0 ou só 1. Os números α e β não dizem "quanto ele é 0"; dizem a probabilidade: |α|² e |β|².', next: 'duvidas' },
      d_gato: { speaker: 'iasmin', text: 'O gato é uma provocação do próprio Schrödinger, de 1935! Na prática, um gato — ou qualquer objeto grande — interage tanto com o ambiente que perde a superposição quase na hora. É a decoerência. Por isso nossos qubits vivem isolados e congelados.',
        onEnter: function () { S.unlock('decoerencia'); }, next: 'duvidas' },
      d_med: { speaker: 'iasmin', text: 'Porque, para medir, é preciso interagir: um fóton, um campo, um detector. Essa interação força um resultado. A teoria prevê as probabilidades com precisão; o que "acontece de verdade" ainda é debatido — pergunte ao Oráculo sobre as interpretações.',
        onEnter: function () { S.unlock('interpretacoes'); }, next: 'duvidas' },
      d_oraculo: { speaker: 'iasmin', text: 'Poético, mas impreciso. O estado da D-7 está num lugar bem definido: o qubit de Jamal — só que embaralhado. "Estar em todo lugar" é coisa de filme. O que falta é a correção.', next: 'duvidas' },
      pronto: { speaker: 'iasmin', text: 'E então, pronto(a) para o quiz? Ou quer rever alguma parte?',
        choices: [
          { t: 'Pode mandar o quiz!', close: true, action: function () { AF.Quiz.open(false); } },
          { t: 'Rever a explicação', next: 'l3' },
          { t: 'Tenho uma dúvida', next: 'duvidas' },
          { t: 'Daqui a pouco.', close: true }
        ] },
      depois: { speaker: 'iasmin', text: 'O Simulador de Teletransporte está no console ao norte do laboratório — ou no seu Terminal portátil (botão Terminal ou tecla Q). Siga o Roteiro de Operação: ao menos 10 rodadas e anote tudo.',
        choices: [
          { t: 'Abrir o simulador', close: true, action: function () { AF.Sim.open('treino'); } },
          { t: 'Pode me explicar a esfera de Bloch?', next: 'bloch' },
          { t: 'Revisar os conceitos (refazer o quiz)', close: true, action: function () { AF.Quiz.open(true); } },
          { t: 'Até já.', close: true }
        ] },
      bloch: { speaker: 'iasmin', text: 'Imagine o qubit como uma seta: |0⟩ no polo norte, |1⟩ no polo sul. A porta X gira a seta 180° em torno do eixo x; a porta Z gira 180° em torno do eixo z. No simulador, teste cada uma e veja o que acontece com a seta vermelha.',
        onEnter: function () { S.unlock('bloch'); }, next: 'depois' },
      codigo: { speaker: 'iasmin', text: 'Vocês completaram a tabela da verdade! Agora, sentem aqui: quero a REGRA, não só a lista. Decifrem o código comigo.',
        choices: [
          { t: 'Decifrar o código', close: true, action: function () { AF.Quiz.codigo(); } },
          { t: 'Ainda não.', close: true }
        ] },
      nucleo: { speaker: 'iasmin', text: 'O tempo de simulação acabou. Agora é o Núcleo: reconstruam a arquitetura real do protocolo antes que a última conexão caia. Eu confio em vocês.' },
      fim: { speaker: 'iasmin', text: 'Eu sabia! Na sala de aula, vocês ainda vão montar este circuito no IBM Quantum Composer e gravar um vídeo explicando tudo. Quem disse que eu "estava inventando" vai ter que assistir.' }
    } },

    console: { start: 'a', nodes: {
      a: { speaker: 'narrador', redirect: function () {
        if (!S.flag('terminal')) return 'off';
        if (!S.flag('quizDone')) return 'auth';
        AF.Dialogue.closeThen(function () { AF.Sim.open('treino'); });
        return null;
      } },
      off: { speaker: 'narrador', text: 'CONSOLE DO SIMULADOR — BLOQUEADO. Autorização da engenheira-chefe (Dandara) necessária.' },
      auth: { speaker: 'narrador', text: 'CONSOLE DO SIMULADOR — Aguardando liberação da Prof.ª Iasmin (quiz de conceitos).' }
    } },

    criostato: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'O "lustre dourado": um refrigerador de diluição que mantém os qubits a cerca de 10 milikelvin — mais frio que o espaço sideral. Sem esse frio, e sem o isolamento da sala, o calor, as vibrações e os campos magnéticos destruiriam a superposição em instantes (decoerência).',
        onEnter: function () { S.unlock('decoerencia'); } }
    } },

    /* ============ SALA DO COMPUTADOR QUÂNTICO: antecâmara e isolamento ============ */
    porta_sala: { start: 'a', nodes: {
      a: { speaker: 'oraculo', text: 'Porta interna da sala blindada: TRAVADA. O campo de contenção caiu, mas ninguém entra na sala do computador quântico sem cumprir o protocolo de entrada. Use o painel de acesso, à direita.',
        choices: [
          { t: 'Iniciar o protocolo de entrada agora', close: true, action: function () { AF.Dialogue.start('protocolo'); } },
          { t: 'Depois.', close: true }
        ] }
    } },

    protocolo: { start: 'a', nodes: {
      a: { speaker: 'oraculo', redirect: function () {
        if (S.flag('protocolo')) return 'feito';
        if (!S.flag('tableDone')) return 'cedo';
        return 'p0';
      } },
      cedo: { speaker: 'oraculo', text: 'PAINEL DE ACESSO — Sala em lockdown: o campo de contenção só cai quando a tabela de correção estiver completa (simulador do laboratório). O protocolo de entrada ficará disponível depois disso.' },
      feito: { speaker: 'oraculo', text: 'PAINEL DE ACESSO — Protocolo cumprido. Temperatura do processador: 0,010 K · vibração no piso: dentro do limite · campo magnético residual: menor que 1 microtesla. Pode entrar.' },
      p0: { speaker: 'oraculo', text: 'PROTOCOLO DE ENTRADA — SALA DO COMPUTADOR QUÂNTICO. Os qubits perdem a superposição com qualquer perturbação: calor, vibração, campo magnético, ondas de rádio. Três etapas antes da porta interna abrir.', next: 'p1' },
      p1: { speaker: 'oraculo', text: 'Etapa 1 de 3 · Objetos pessoais. O que fica no armário da antecâmara?',
        choices: [
          { t: 'Só o casaco: lá dentro faz −273 °C.', next: 'e1a' },
          { t: 'Celular, chaves e ferramentas de ferro: ímãs e metais magnéticos perturbam o campo da sala blindada.', next: 'ok1' },
          { t: 'Nada: a blindagem protege de tudo.', next: 'e1b' }
        ] },
      e1a: { speaker: 'oraculo', onEnter: function () { S.inc('errSala1'); S.damage(2, 'protocolo de entrada'); },
        text: 'Negativo. A sala está em temperatura normal: o frio extremo fica só dentro do refrigerador de diluição, em volta do processador. O perigo para os qubits é outro.', next: 'p1' },
      e1b: { speaker: 'oraculo', onEnter: function () { S.inc('errSala1'); S.damage(2, 'protocolo de entrada'); },
        text: 'Negativo. A blindagem barra campos que vêm de FORA. Um ímã ou uma chave de ferro levados para DENTRO ficam do lado de cá da blindagem.', next: 'p1' },
      ok1: { speaker: 'oraculo', onEnter: function () { S.record('sala', 1, S.count('errSala1') + 1); },
        text: 'Correto. Objetos guardados. As paredes da sala têm camadas de mu-metal, uma liga de níquel e ferro que desvia campos magnéticos, e uma malha de cobre que barra ondas de rádio e de celular.', next: 'p2' },
      p2: { speaker: 'oraculo', text: 'Etapa 2 de 3 · Portas. Como se atravessa a antecâmara?',
        choices: [
          { t: 'Fecha a porta externa e só depois abre a interna: assim sempre há uma porta fechada e a blindagem nunca fica aberta para o corredor.', next: 'ok2' },
          { t: 'Abre as duas portas juntas para passar mais rápido.', next: 'e2' },
          { t: 'Tanto faz: porta não tem nada a ver com qubit.', next: 'e2' }
        ] },
      e2: { speaker: 'oraculo', onEnter: function () { S.inc('errSala2'); S.damage(2, 'protocolo de entrada'); },
        text: 'Negativo. A blindagem só funciona fechada. Com as duas portas abertas, campos e ruído eletromagnético do corredor entram direto na sala.', next: 'p2' },
      ok2: { speaker: 'oraculo', onEnter: function () { S.record('sala', 2, S.count('errSala2') + 1); },
        text: 'Correto. Porta externa fechada.', next: 'p3' },
      p3: { speaker: 'oraculo', text: 'Etapa 3 de 3 · Para registro: por que o computador quântico precisa de uma sala só para ele?',
        choices: [
          { t: 'Porque ele emite radiação perigosa para as pessoas.', next: 'e3a' },
          { t: 'Porque qualquer calor, vibração ou campo magnético que chegue aos qubits faz eles perderem a superposição e o emaranhamento: a decoerência.', next: 'ok3' },
          { t: 'Porque é segredo industrial da Afrotech.', next: 'e3b' }
        ] },
      e3a: { speaker: 'oraculo', onEnter: function () { S.inc('errSala3'); S.damage(2, 'protocolo de entrada'); },
        text: 'Negativo. O isolamento protege os qubits do mundo, e não o contrário.', next: 'p3' },
      e3b: { speaker: 'oraculo', onEnter: function () { S.inc('errSala3'); S.damage(2, 'protocolo de entrada'); },
        text: 'Negativo. O motivo é físico: o estado quântico é frágil.', next: 'p3' },
      ok3: { speaker: 'oraculo', onEnter: function () {
          S.record('sala', 3, S.count('errSala3') + 1);
          S.setFlag('protocolo'); S.addCredits(4); S.unlock('isolamento'); S.unlock('decoerencia');
          AF.Audio.play('door'); AF.Toast.show('Porta interna liberada', 'cyan');
          S.addJournal('Sala do Computador Quântico', 'O Núcleo fica isolado numa sala só dele. Para entrar: metais e ímãs no armário e uma porta fechada de cada vez na antecâmara. Lá dentro: o processador a cerca de 10 mK (−273,14 °C) no refrigerador de diluição, piso flutuante sobre amortecedores contra vibrações, paredes de mu-metal e malha de cobre contra campos magnéticos e ondas de rádio. Os compressores, que vibram, ficam no laboratório, do lado de fora. Tudo isso para evitar a decoerência.');
        }, text: 'Correto. Protocolo cumprido: porta interna liberada. Ande devagar — o piso é flutuante — e não encoste no refrigerador.' }
    } },

    armario: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Armário da antecâmara. Etiqueta: "Deixe aqui celular, chaves, relógio, ferramentas de ferro e qualquer ímã. Campos magnéticos perturbam os qubits." Lá dentro, alguém esqueceu uma chave de fenda e um chaveiro com ímã de geladeira do Pelourinho.' }
    } },

    sala_painel: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: function () {
        return 'PAINEL AMBIENTAL · Temperatura do processador: 0,010 K (−273,14 °C; o zero absoluto é −273,15 °C) · Vibração no piso: menos de 1 micrômetro por segundo · Campo magnético residual: menos de 1 microtesla, dezenas de vezes menor que o campo da Terra · Estado: ' +
          (S.flag('restored') ? 'operação normal.' : 'estável — o problema não é o frio, é a tabela de correção apagada.');
      }, onEnter: function () { S.unlock('isolamento'); }, next: 'b' },
      b: { speaker: 'oraculo', text: 'Os cinco estágios do refrigerador, de cima para baixo: 50 K, 4 K, 1 K, 0,1 K e cerca de 0,01 K, onde fica o chip. Os cabos de controle descem com filtros e atenuadores, para não levar calor nem ruído até os qubits. A eletrônica de controle, que é clássica, fica fora da sala.', next: 'c' },
      c: { speaker: 'oraculo', text: 'Nem todo computador quântico é assim: os de íons presos usam vácuo ultra-alto e lasers, e os fotônicos trabalham com luz, mas costumam precisar de detectores resfriados. Em todos, a luta é a mesma: proteger o estado quântico da decoerência.' }
    } },
    sala_blindagem: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Placa: "PAREDES BLINDADAS. Camadas de mu-metal (liga de níquel e ferro) desviam campos magnéticos — inclusive o da Terra. Uma malha de cobre forma uma gaiola de Faraday contra ondas de rádio, Wi-Fi e celular. A blindagem só funciona com as portas fechadas."', onEnter: function () { S.unlock('isolamento'); } }
    } },
    sala_piso: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Tampa de inspeção do piso flutuante. A laje da sala não encosta na estrutura da Torre: ela se apoia em amortecedores. Assim, passos no corredor, o Elevador Lacerda e o trânsito da Cidade Baixa não chegam até o refrigerador — e as vibrações não esquentam nem perturbam os qubits.', onEnter: function () { S.unlock('isolamento'); } }
    } },
    compressor: { start: 'a', nodes: {
      a: { speaker: 'narrador', text: 'Compressor do tubo pulsado e bombas da mistura de hélio-3 e hélio-4 do refrigerador de diluição. Eles vibram e fazem barulho — por isso ficam AQUI, no laboratório, e não na sala do computador. Até lá só chegam mangueiras e cabos, atravessando a blindagem por passagens com filtros.', onEnter: function () { S.unlock('isolamento'); } }
    } },

    /* ===================== ATO 4 · APLICAÇÃO DO CONHECIMENTO ===================== */
    nucleo: { start: 'a', nodes: {
      a: { speaker: 'oraculo', redirect: function () {
        if (S.flag('restored')) return 'fim';
        if (!S.flag('codeDecoded')) return 'antes';
        if (!S.flag('nucleusSync')) return 'b';
        return 'etapas';
      } },
      antes: { speaker: 'oraculo', text: 'Este é o Núcleo: um refrigerador de diluição de cinco estágios — 50 K, 4 K, 1 K, 0,1 K e, embaixo, o processador a cerca de 10 mK (−273,14 °C). Protocolo de correção incompleto: antes de reconstruir o circuito, decifre a regra da tabela com a Prof.ª Iasmin.',
        onEnter: function () { S.unlock('isolamento'); S.unlock('decoerencia'); } },
      b: { speaker: 'oraculo', text: 'As luzes oscilam e um cronômetro vermelho pulsa nas paredes: o colapso total é iminente. Conecte-se ao Grande Núcleo e estabilize a interface.',
        choices: [
          { t: 'Estabilizar pela física quântica (Ciência)', test: { attr: 'inteligencia', dc: function () { return 8 + alarmDC(); }, problem: true, success: 'sync', fail: 'fail', ruido: 8, reason: 'interface instável' } },
          { t: 'Varrer a interface com busca de Grover (Tecnologia)', test: { attr: 'busca', dc: function () { return 8 + alarmDC(); }, problem: true, success: 'sync', fail: 'fail', ruido: 8, reason: 'interface instável' } },
          { t: 'Carregar a tabela de correção do seu buffer', req: { attr: 'armazenamento', min: 1 },
            test: { attr: 'armazenamento', dc: function () { return 7 + alarmDC(); }, success: 'sync', fail: 'fail', ruido: 8, reason: 'buffer corrompido' } },
          { t: 'Ainda não estou pronto(a).', close: true }
        ] },
      fail: { speaker: 'oraculo', text: 'Feedback quântico! A interface rejeitou sua assinatura. Recalibre e tente de novo — pode trocar de abordagem.', next: 'b' },
      sync: { speaker: 'oraculo', text: 'Interface estável. PROTOCOLO SALVADOR 2495: Etapa 1 — reconstruir o circuito de 3 qubits. Etapa 2 — validá-lo ao vivo. Etapa 3 — registrar o Relatório de Consultoria. Entre uma etapa e outra, o Núcleo recalibra os qubits por 1min30s.',
        onEnter: function () { S.setFlag('nucleusSync'); }, next: 'etapas' },
      etapas: { speaker: 'oraculo', text: function () {
        var NW = AF.NucleoWait;
        if (!S.flag('circuitBuilt')) return 'Status da cidade: aguardando reconstrução do protocolo. Etapa 1: reconstrua o circuito, porta por porta.';
        if (!NW.ready()) return 'RECALIBRANDO OS QUBITS. O refrigerador volta a 10 mK e os pulsos de micro-ondas são reajustados. Próxima etapa em ' + NW.fmt(NW.remaining()) + '.';
        if (!S.flag('validated')) return 'Circuito pronto e qubits calibrados. Etapa 2: a validação ao vivo — cinco teletransportes perfeitos seguidos, sem ver a seta.';
        return 'Validação concluída e Núcleo recalibrado. Etapa 3: o Relatório de Consultoria Afrotech.';
      },
        choices: [
          { t: 'Etapa 1: Reconstruir o circuito', if: function () { return !S.flag('circuitBuilt'); }, close: true,
            action: function () { AF.Quiz.circuito(function () { AF.NucleoWait.start('validacao'); }); } },
          { t: function () { return 'Acompanhar a recalibração (' + AF.NucleoWait.fmt(AF.NucleoWait.remaining()) + ')'; }, if: function () { return S.flag('circuitBuilt') && !AF.NucleoWait.ready(); }, close: true,
            action: function () { AF.NucleoWait.open(); } },
          { t: 'Etapa 2: Validação ao vivo (5 teletransportes)', if: function () { return S.flag('circuitBuilt') && !S.flag('validated') && AF.NucleoWait.ready(); }, close: true,
            action: function () { AF.Sim.open('final'); } },
          { t: 'Etapa 3: Relatório de Consultoria', if: function () { return S.flag('validated') && AF.NucleoWait.ready(); }, close: true,
            action: function () { AF.Quiz.relatorio(function () { AF.Game.victory(); }); } },
          { t: 'Daqui a pouco.', close: true }
        ] },
      fim: { speaker: 'oraculo', text: 'O Núcleo pulsa em azul cerúleo. Canal Quântico: ATIVO. 512 de 512 nós sincronizados. Bem-vindo(a) de volta ao futuro.' }
    } }
  };

  /* ---------- funções auxiliares ---------- */
  function swimGo(v) {
    AF.Swim.start(v);
    setTimeout(function () { AF.Dialogue.start('miayo_dentro'); }, 250);
  }
  /* histórias do Prof. Hohenfeld: marca as ouvidas e dá recompensa ao ouvir quatro de cada baú */
  function tick(id) { return S.count('hh_' + id) ? '✓ ' : ''; }
  function heard(id, kind) {
    if (S.count('hh_' + id)) return;
    S.d.counters['hh_' + id] = 1;
    var q = ['planck', 'einstein', 'ondas', 'helgoland', 'epr', 'nobel25'], w = ['curie', 'noether', 'meitner', 'wu', 'hermann', 'nobel_m', 'elisa', 'sonia', 'katemari', 'jaqueline'];
    var nq = q.filter(function (k) { return S.count('hh_' + k); }).length, nw = w.filter(function (k) { return S.count('hh_' + k); }).length;
    if (kind === 'q' && nq >= 4 && !S.flag('hohenfeldHist')) {
      S.setFlag('hohenfeldHist'); S.addCredits(3);
      S.addJournal('Histórias da mecânica quântica', 'O Prof. Hohenfeld me contou como a quântica nasceu: o "ato de desespero" de Planck (1900), os fótons de Einstein (1905), o átomo de Bohr e as ondas de matéria de de Broglie, Heisenberg em Helgoland e a incerteza (1927), a briga do emaranhamento que virou Nobel (2022) e o circuito do tamanho de uma mão (Nobel de 2025).');
    }
    if (kind === 'w' && nw >= 4 && !S.flag('mulheresCiencia')) {
      S.setFlag('mulheresCiencia'); S.addCredits(3);
      S.addJournal('Mulheres na ciência', 'Marie Curie, Emmy Noether, Lise Meitner, Chien-Shiung Wu, Grete Hermann; no Brasil, Elisa Frota-Pessôa, Sonia Guimarães, Katemari Rosa e Jaqueline Goes de Jesus. O Prof. Hohenfeld diz que conta essas histórias para que alguém da turma pense: "esse lugar também é meu".');
    }
  }
  /* Ao fim da introdução, Dona Cici chama para o minigame do acarajé */
  function ciciChama() {
    if (S.flag('acarajeQ')) return;
    setTimeout(function () {
      if (AF.Game.mode === 'play' && !AF.UI.blocking()) AF.Dialogue.start('cici_chama');
    }, 900);
  }
  function introJournal() {
    S.addJournal('Convocação', 'O Oráculo me convocou: nenhuma mensagem atravessa o canal quântico de Salvador (o "Silêncio"). Missão: descobrir a causa do colapso e restaurar o fluxo de informações. O canal clássico ainda funciona.',
      'Crônica: a cidade nunca esteve tão quieta. Até os letreiros neon parecem cochichar.');
  }
  function gateOpened() {
    if (S.flag('gateOpen')) return;
    S.setFlag('gateOpen'); S.addCredits(3);
    AF.Audio.play('gate');
    S.addJournal('Bloqueio de emergência', S.flag('alarm')
      ? 'Entrei na Torre, mas disparei o alarme: a porta ficou entreaberta e o sistema está em alerta.'
      : 'Passei pelo bloqueio de emergência da Torre da Afrotech.');
  }
  function gateFail() {
    var n = S.inc('k7fails');
    return n >= 2 ? 'alarme' : 'fail_txt';
  }
  function divulgacao() {
    S.addCredits(2);
    S.addJournal('Divulgação científica no Comércio', 'Expliquei o teletransporte quântico para a vizinhança do Comércio. Aplicar o conhecimento é também saber contar para quem não estava no laboratório.');
  }
})(window.AF);
