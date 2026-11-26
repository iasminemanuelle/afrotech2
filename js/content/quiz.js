/* =========================================================================
 * quiz.js — conjuntos de perguntas do jogo
 *   AF.HIPOTESES     — lousa de Dandara (Problematização: sem certo/errado)
 *   AF.QUIZ          — quiz da Prof.ª Iasmin (Organização do Conhecimento)
 *   AF.QUIZ_CODIGO   — "Decifrando o Código" (Apêndice 1 do manual)
 *   AF.QUIZ_CIRCUITO — Reconstrução do circuito de 3 qubits (Aplicação)
 *   AF.QUIZ_RELATORIO— Relatório de Consultoria Afrotech (Aplicação)
 * Cada alternativa traz o "porquê": o erro também ensina.
 * ========================================================================= */
(function (AF) {
  'use strict';

  /* ---------- 1º Momento: Problematização Inicial (hipóteses) ---------- */
  AF.HIPOTESES = [
    { id: 'q1', q: 'É possível transportar algo sem que ele se mova fisicamente?',
      options: [
        'Não. Tudo o que é transportado precisa se mover pelo espaço.',
        'Sim, como nos filmes: a matéria some aqui e reaparece lá.',
        'Talvez — se o que for "transportado" for informação, e não matéria.',
        'Ainda não sei. Preciso investigar.'
      ],
      science: 'Matéria, não. Mas o ESTADO quântico, sim: ele passou de Salvador a Jacobina sem que nenhuma partícula viajasse.' },
    { id: 'q2', q: 'O que é informação quântica?',
      options: [
        'Dados de computador que andam mais rápido.',
        'Informação guardada no estado de sistemas quânticos, como qubits.',
        'Informação que está em vários lugares ao mesmo tempo.',
        'Ainda não sei. Preciso investigar.'
      ],
      science: 'É a informação guardada no estado de um sistema quântico (o qubit): amplitudes α e β que não podem ser copiadas nem lidas por inteiro numa medida.' },
    { id: 'q3', q: 'Como ela é codificada e transmitida?',
      options: [
        'É codificada pelo emaranhamento e transmitida pela superposição.',
        'Por fibra óptica, como a internet de sempre.',
        'Por ondas de rádio ou satélite.',
        'Ainda não sei. Preciso investigar.'
      ],
      science: 'Codificada no estado do qubit (superposição); transmitida pelo teletransporte: par emaranhado + medição + 2 bits pela fibra + correção com portas X e Z.' },
    { id: 'q4', q: 'O que pode ter acontecido com a cápsula de informação?',
      options: [
        'Foi destruída de vez.',
        'Foi parar em outra dimensão ou linha do tempo.',
        'Chegou a Jacobina, mas embaralhada.',
        'Foi roubada num ataque hacker.'
      ],
      science: 'O estado da D-7 estava no qubit de Jamal, mas embaralhado: o pulso apagou a tabela de correção. Com a tabela reconstruída, ele foi recuperado com fidelidade de 100%.' }
  ];

  /* ---------- 2º Momento: quiz da Prof.ª Iasmin ---------- */
  AF.QUIZ = [
    {
      q: 'No sistema antigo, um bit era só 0 ou 1. A seta de Dandara pode apontar para qualquer direção da esfera, não só para os polos |0⟩ e |1⟩. Como chamamos esse estado, que combina |0⟩ e |1⟩?',
      unlock: ['qubit', 'superposicao'],
      options: [
        { t: 'Superposição.', ok: true,
          why: 'Isso! |ψ⟩ = α|0⟩ + β|1⟩: as amplitudes α e β dizem "quanto" de |0⟩ e de |1⟩ há na combinação.' },
        { t: 'Emaranhamento.',
          why: 'Quase! Emaranhamento envolve dois ou mais qubits. Um qubit sozinho, fora dos polos, está em superposição.' },
        { t: 'Decoerência.',
          why: 'Decoerência é justamente a PERDA da superposição, causada pelo ambiente.' },
        { t: 'Colapso.',
          why: 'Colapso é o que acontece na medição: a seta "cai" para |0⟩ ou |1⟩.' }
      ]
    },
    {
      q: 'Dandara mede o qubit |ψ⟩ = α|0⟩ + β|1⟩. O que ela obtém?',
      unlock: ['medicao', 'interpretacoes'],
      options: [
        { t: 'Os valores de α e β, com precisão.',
          why: 'Uma medida só devolve 0 ou 1. Para estimar α e β seria preciso medir muitas cópias — e não dá para copiar (não-clonagem)!' },
        { t: '0 ou 1, com probabilidades |α|² e |β|²; depois disso, o estado passa a ser |0⟩ ou |1⟩.', ok: true,
          why: 'Exato: é a regra de Born. Medir é interferir — a superposição original se perde.' },
        { t: '0 e 1 juntos, os dois ao mesmo tempo.',
          why: 'Na medida aparece um único resultado. A frase "0 e 1 ao mesmo tempo" é só um jeito de falar da superposição ANTES da medida.' },
        { t: 'Sempre 0,5, a média entre 0 e 1.',
          why: 'O resultado de uma medida é 0 ou 1. As probabilidades é que dependem de |α|² e |β|².' }
      ]
    },
    {
      q: 'Dandara e Jamal estão a uns 300 km de distância, mas compartilham um vínculo: o estado do par não pode ser escrito como "uma seta para cada um", e os resultados das medidas ficam correlacionados. Qual é o nome desse fenômeno?',
      unlock: ['emaranhamento', 'par_bell', 'epr_bell'],
      options: [
        { t: 'Superposição.', why: 'Superposição é de um qubit só. Aqui o estado pertence ao PAR.' },
        { t: 'Tunelamento quântico.', why: 'Tunelamento é atravessar barreiras de energia — outro fenômeno quântico.' },
        { t: 'Emaranhamento quântico.', ok: true,
          why: 'Isso! Um estado emaranhado não é fatorável. Einstein o chamou de "ação fantasmagórica à distância".' },
        { t: 'Interferência.', why: 'Interferência é a soma (ou cancelamento) de amplitudes, como ondas.' }
      ]
    },
    {
      q: 'Com o par |Φ+⟩ = (|00⟩ + |11⟩)/√2, Dandara mede o dela e obtém 1. O que Jamal obterá medindo na mesma base — e isso serve de mensagem?',
      unlock: ['canal_classico'],
      options: [
        { t: '1, e assim Dandara consegue mandar mensagens instantâneas.',
          why: 'O resultado combina, mas Dandara não escolhe se vai dar 0 ou 1. Sem combinar por um canal clássico, Jamal só vê uma sequência aleatória.' },
        { t: '0, porque os qubits de um par são sempre opostos.',
          why: 'Isso valeria para outro par de Bell (|Ψ+⟩). No |Φ+⟩ os resultados são iguais.' },
        { t: '1, com certeza; mas isso NÃO serve de mensagem, porque o resultado de Dandara é aleatório.', ok: true,
          why: 'Perfeito: correlação não é comunicação. É por isso que o teletransporte ainda precisa dos bits clássicos.' },
        { t: '0 ou 1 com 50% cada, sem relação com Dandara.',
          why: 'Antes da medida de Dandara seria 50/50, mas o emaranhamento correlaciona os resultados.' }
      ]
    },
    {
      q: 'O roteiro diz que Jamal recebe dois bits clássicos (00, 01, 10 ou 11) por um cabo de fibra óptica comum. Se o teletransporte é quântico, por que ainda precisamos desses bits "lentos"?',
      unlock: ['bit', 'teletransporte'],
      options: [
        { t: 'Para mandar a cápsula em pedaços pelo cabo.', why: 'Nada da cápsula viaja pelo cabo — só 2 bits.' },
        { t: 'Para Jamal saber qual porta lógica de correção aplicar e "desentortar" a seta.', ok: true,
          why: 'Isso! Sem os bits, o qubit de Jamal é indistinguível de ruído. Eles viajam no máximo à velocidade da luz: o teletransporte não fere a relatividade.' },
        { t: 'Para Jamal medir o qubit e ler o estado.', why: 'Se Jamal medisse, destruiria o estado. Os bits indicam a correção, sem medir.' },
        { t: 'Só por segurança: daria para funcionar sem eles.', why: 'Sem os bits, Jamal tem 1 chance em 4 de acertar — e nem saberia se acertou.' }
      ]
    },
    {
      q: 'Ao final do protocolo, onde está o estado da cápsula D-7 — e o que restou em Salvador?',
      unlock: ['nao_clonagem'],
      options: [
        { t: 'Nos dois lugares: Jamal recebeu uma cópia.', why: 'Copiar um estado desconhecido é impossível (teorema da não-clonagem).' },
        { t: 'A cápsula viajou fisicamente até Jacobina.', why: 'Nenhuma matéria viaja. Isso é ficção, como em Star Trek ou Jumper.' },
        { t: 'Está no qubit de Jamal; em Salvador, o original foi destruído pela medição.', ok: true,
          why: 'Exato: o estado mudou de lugar, sem cópia e sem transportar matéria.' },
        { t: '"Em lugar nenhum, logo em todos", como disse o Oráculo.', why: 'Poético, mas impreciso: o estado está num lugar bem definido — o qubit de Jamal.' }
      ]
    }
  ];

  /* ---------- Fim do 2º Momento: Decifrando o Código ---------- */
  AF.QUIZ_CODIGO = [
    {
      q: 'O padrão do bit da DIREITA: sempre que b₂ = 1 (casos 01 e 11), qual porta você foi obrigado(a) a usar?',
      unlock: ['porta_x'],
      options: [
        { t: 'Porta X.', ok: true, why: 'Isso: b₂ vem de q1 e avisa que |0⟩ e |1⟩ foram trocados (inversão de bit).' },
        { t: 'Porta Z.', why: 'Confira sua tabela: Z aparece quando o bit da ESQUERDA é 1.' },
        { t: 'Nenhuma.', why: 'Sem correção, a seta não cai sobre a sombra quando b₂ = 1.' },
        { t: 'Depende do humor do Oráculo.', why: 'A física é rigorosa: a mesma regra vale sempre.' }
      ]
    },
    {
      q: 'O padrão do bit da ESQUERDA: sempre que b₁ = 1 (casos 10 e 11), qual porta é obrigatória?',
      unlock: ['porta_z'],
      options: [
        { t: 'Porta X.', why: 'X corresponde ao bit da direita.' },
        { t: 'Porta Z.', ok: true, why: 'Isso: b₁ vem de q0 (depois do H) e avisa que o sinal de β foi invertido (inversão de fase).' },
        { t: 'Porta H.', why: 'H é usada por Dandara, não na correção de Jamal.' },
        { t: 'Nenhuma.', why: 'Sem Z, o sinal de β continua invertido.' }
      ]
    },
    {
      q: 'Teletransporte vs. correio: se Dandara já manda bits pelo cabo, por que não mandou logo a informação inteira por ele?',
      unlock: ['teletransporte'],
      options: [
        { t: 'Porque o cabo é lento demais para dados grandes.', why: 'Velocidade não é o problema: são só 2 bits!' },
        { t: 'Porque a seta pode apontar para infinitas direções (α e β são números contínuos), e Dandara nem consegue lê-la: uma medida dá só 1 bit e destrói o estado.', ok: true,
          why: 'Exato! Um bit é só 0 ou 1. Com o par emaranhado, 2 bits bastam para "transportar" a seta inteira.' },
        { t: 'Porque bits clássicos não passam por fibra óptica.', why: 'Passam, sim — é assim que a internet funciona.' },
        { t: 'Porque seria proibido por lei.', why: 'O limite é físico, não jurídico.' }
      ]
    },
    {
      q: 'No caso 11, o manual diz "Z seguida de X" (ZX). Se você aplicou X e depois Z, também funcionou. Por quê?',
      unlock: ['fase_global'],
      options: [
        { t: 'Porque a ordem das portas nunca importa.', why: 'Em geral, importa! Aqui a diferença é só um sinal (−1) no estado inteiro.' },
        { t: 'Porque XZ e ZX diferem apenas por uma fase global (−1), que nenhuma medição consegue detectar.', ok: true,
          why: 'Isso: estados que diferem só por fase global são fisicamente idênticos.' },
        { t: 'Porque o simulador está com defeito.', why: 'Não está: é física de verdade.' },
        { t: 'Porque Z e X são a mesma porta.', why: 'Não são: X inverte o bit; Z inverte a fase.' }
      ]
    }
  ];

  /* ---------- 3º Momento: Reconstrução do circuito (IBM Quantum Composer) ---------- */
  AF.QUIZ_CIRCUITO = [
    { q: 'Etapa 1/8 — Quantos qubits o protocolo precisa?', stage: 1, unlock: ['circuito'],
      options: [
        { t: '1: só o qubit da informação.', why: 'Sem par emaranhado, não há canal.' },
        { t: '2: um em Salvador e um em Jacobina.', why: 'Falta o qubit com a informação |ψ⟩.' },
        { t: '3: q0 com a informação |ψ⟩ e q1, q2 formando o par emaranhado.', ok: true, why: 'Isso: arquitetura de 3 qubits, como no manual.' },
        { t: '4: dois em cada cidade.', why: 'Três bastam.' }
      ] },
    { q: 'Etapa 2/8 — Para criar o par, primeiro colocamos q1 em superposição. Qual porta?', stage: 2, unlock: ['porta_h'],
      options: [
        { t: 'X', why: 'X só troca |0⟩ por |1⟩: não cria superposição.' },
        { t: 'Z', why: 'Z mexe na fase; em |0⟩, não faz nada.' },
        { t: 'H (Hadamard)', ok: true, why: 'H|0⟩ = (|0⟩ + |1⟩)/√2.' },
        { t: 'Medidor', why: 'Medir agora destruiria tudo.' }
      ] },
    { q: 'Etapa 3/8 — Qual porta emaranha q1 com q2, formando |β₀₀⟩ = (|00⟩ + |11⟩)/√2?', stage: 3, unlock: ['cnot', 'par_bell'],
      options: [
        { t: 'CNOT com controle em q1 e alvo em q2.', ok: true, why: 'Isso: depois disso, q2 pode viajar até Jacobina.' },
        { t: 'H em q2.', why: 'Deixaria os dois em superposição, mas independentes (não emaranhados).' },
        { t: 'X em q1.', why: 'Não cria correlação entre os qubits.' },
        { t: 'Medir q1.', why: 'Medir desfaz a superposição.' }
      ] },
    { q: 'Etapa 4/8 — Dandara "conecta" |ψ⟩ ao par. Qual porta, com controle em q0 e alvo em q1?', stage: 4,
      options: [
        { t: 'Z', why: 'Z é de um qubit só.' },
        { t: 'CNOT', ok: true, why: 'CNOT(q0→q1) mistura a informação de |ψ⟩ com o par.' },
        { t: 'H', why: 'H vem depois, em q0.' },
        { t: 'Nenhuma: basta medir.', why: 'Sem a CNOT, a medida não "passa" nada para Jamal.' }
      ] },
    { q: 'Etapa 5/8 — Antes de medir, Dandara aplica qual porta em q0?', stage: 5,
      options: [
        { t: 'H (Hadamard)', ok: true, why: 'Isso: o H permite que a informação de fase vá parar no bit b₁.' },
        { t: 'X', why: 'Não é a porta do protocolo nesse ponto.' },
        { t: 'CNOT de q2 para q0', why: 'q2 já está em Jacobina.' },
        { t: 'Nenhuma', why: 'Sem o H, a informação de fase se perderia.' }
      ] },
    { q: 'Etapa 6/8 — Quais qubits Dandara mede?', stage: 6, unlock: ['medicao'],
      options: [
        { t: 'Só q0.', why: 'São dois bits: falta medir q1.' },
        { t: 'q0 e q1, os dois que estão em Salvador.', ok: true, why: 'Isso: o resultado b₁b₂ é 00, 01, 10 ou 11, com 25% cada.' },
        { t: 'q0, q1 e q2.', why: 'Medir q2 destruiria o estado que queremos em Jacobina!' },
        { t: 'Nenhum.', why: 'Sem a medida, não há bits para enviar.' }
      ] },
    { q: 'Etapa 7/8 — Como b₁ e b₂ chegam a Jacobina?', stage: 7, unlock: ['canal_classico'],
      options: [
        { t: 'Pelo próprio emaranhamento, instantaneamente.', why: 'O emaranhamento não carrega mensagem.' },
        { t: 'Por um canal clássico (fibra óptica), no máximo à velocidade da luz.', ok: true, why: 'Exato: duas linhas duplas no circuito representam bits clássicos.' },
        { t: 'Jamal adivinha.', why: 'Acertaria só 1 vez em 4 — e nem saberia.' },
        { t: 'Teletransportando os bits.', why: 'Bits clássicos viajam por canais comuns.' }
      ] },
    { q: 'Etapa 8/8 — Qual correção Jamal aplica em q2?', stage: 8, unlock: ['protocolo'],
      options: [
        { t: 'X se b₂ = 1 e Z se b₁ = 1 (ou seja: 00 → I, 01 → X, 10 → Z, 11 → ZX).', ok: true, why: 'Circuito completo! É exatamente o que vocês vão montar no IBM Quantum Composer.' },
        { t: 'Sempre H.', why: 'H não desfaz as trocas de bit e fase.' },
        { t: 'X se b₁ = 1 e Z se b₂ = 1.', why: 'Invertido: confira sua tabela do simulador.' },
        { t: 'Medir q2 para conferir.', why: 'Medir destruiria o estado teletransportado.' }
      ] }
  ];

  /* ---------- 3º Momento: Relatório de Consultoria Afrotech ---------- */
  AF.QUIZ_RELATORIO = [
    { q: '1. Explicação científica — Como o emaranhamento foi usado para conectar as estações de Dandara e Jamal?',
      options: [
        { t: 'O emaranhamento enviou a cápsula instantaneamente para Jacobina.', why: 'Matéria não viaja, e o emaranhamento sozinho não envia nada.' },
        { t: 'O par |β₀₀⟩ foi dividido entre as cidades e serviu de "canal quântico": com ele, 2 bits clássicos bastam para transferir o estado.', ok: true,
          why: 'Isso vai para os arquivos da cidade.' },
        { t: 'O emaranhamento copiou o estado de Dandara para Jamal.', why: 'Não há cópia: não-clonagem.' },
        { t: 'Os qubits trocaram mensagens mais rápido que a luz.', why: 'Correlação não é comunicação.' }
      ] },
    { q: '2. O momento crítico — O que acontece na medição de Dandara? Por que a seta original desaparece de Salvador?',
      options: [
        { t: 'A seta é enviada pela fibra e some de Salvador.', why: 'Pela fibra vão só 2 bits.' },
        { t: 'Nada: a medição só observa, sem alterar.', why: 'Na quântica, medir é interferir.' },
        { t: 'A medição colapsa q0 e q1 em 2 bits; o original é destruído (não-clonagem) e o q2 de Jamal passa a uma de quatro versões de |ψ⟩.', ok: true,
          why: 'Exato — o colapso da função de onda é o coração do protocolo.' },
        { t: 'A seta se divide em duas metades, uma em cada cidade.', why: 'Estados quânticos não se dividem assim.' }
      ] },
    { q: '3. Justificativa técnica — Por que a informação é preservada, mesmo "despedaçada" em 2 bits clássicos?',
      options: [
        { t: 'Porque os 2 bits contêm toda a seta.', why: 'Dois bits não descrevem uma seta contínua.' },
        { t: 'Porque a parte quântica da informação já está no qubit de Jamal; os bits só dizem qual correção (I, X, Z ou ZX) desfaz o embaralhamento.', ok: true,
          why: 'Isso: a receita chega pela fibra, o "ingrediente" quântico já está em Jacobina.' },
        { t: 'Porque Jamal mede o qubit e reconstrói a seta.', why: 'Medir destruiria o estado.' },
        { t: 'Porque a informação não importa, só os bits.', why: 'A informação quântica é o objetivo do protocolo!' }
      ] },
    { q: '4. Visão de futuro — Como o teletransporte quântico pode melhorar a infraestrutura de Salvador?',
      options: [
        { t: 'Rede de dados à prova de espionagem (criptografia quântica).', ok: true,
          why: 'Ótima proposta: espionar exige medir, e medir deixa rastro.' },
        { t: 'Interligar os computadores quânticos da cidade numa internet quântica.', ok: true,
          why: 'Ótima proposta: o teletransporte é peça-chave de uma internet quântica.' },
        { t: 'Teletransportar ônibus e pessoas entre a Cidade Alta e a Cidade Baixa.',
          why: 'Reveja: o protocolo transfere estados, não matéria. O Elevador Lacerda continua necessário!' },
        { t: 'Proteger os dados da rede de energia solar com comunicação quântica segura.', ok: true,
          why: 'Ótima proposta: segurança de dados em infraestrutura crítica — exatamente o que o CIMATEC Quantum pesquisa hoje.' }
      ] }
  ];
})(window.AF);
