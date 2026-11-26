# Afrotech — Volume 2: *Silêncio no Canal Quântico*

Protótipo jogável (MVP) da versão digital — **para PC e celular** — do RPG de mesa educativo **Afrotech Vol. 2**.
Salvador, 2495, em clima afrofuturista e cyberpunk: o canal quântico da cidade ficou em silêncio
e o(a) agente convocado(a) pela Afrotech precisa reconstruir o **protocolo de teletransporte quântico**.

- **Tecnologia:** HTML5 + CSS3 + JavaScript puro (Canvas 2D). Não usa bibliotecas, build nem internet.
- **Arte e som:** toda a pixel art (personagens, tiles, prédios) e os efeitos sonoros são gerados por código.
- **Fontes:** VT323 e Press Start 2P já vêm em `assets/fonts` (licença SIL OFL).

---

## 1. Como rodar no computador (passo a passo)

### Opção A — abrir direto (mais simples, funciona offline)
1. Descompacte o arquivo `afrotech-vol2.zip` numa pasta qualquer (ex.: `Documentos/afrotech-vol2`).
2. Abra a pasta e dê **dois cliques em `index.html`**.
3. O jogo abre no navegador. Use **Google Chrome, Microsoft Edge ou Firefox** atualizados.
4. Se abrir pequeno, maximize a janela ou aperte **F11** (tela cheia). O jogo escala os pixels automaticamente.

> Os scripts são carregados sem módulos ES justamente para funcionar com `file://`, sem servidor.

### Opção B — servidor local (recomendado para sala de aula ou desenvolvimento)
Com Python instalado, abra um terminal **dentro da pasta do jogo** e rode:

```bash
python -m http.server 8000        # Windows (ou: py -m http.server 8000)
python3 -m http.server 8000       # macOS / Linux
```

Depois acesse **http://localhost:8000** no navegador. No VS Code, a extensão *Live Server* faz o mesmo.

### Salvamento
- O progresso é salvo automaticamente (troca de cena, a cada 30 s e ao fechar o simulador) no `localStorage` do navegador.
- Na tela inicial, **Continuar** retoma a missão. Para recomeçar do zero, basta clicar em **Novo jogo**.

---

## 1.1 Como jogar no celular ou tablet

O mesmo jogo detecta a tela de toque e liga sozinho os **controles na tela**. Ele funciona **em pé** e **deitado**:

| Posição | Como fica |
|---|---|
| Em pé (retrato) | Cena em cima. Embaixo ficam a Estabilidade, os Créditos, o objetivo atual, os atalhos (Ficha · Diário · Terminal · Menu), o joystick e o botão **E**. Nada cobre a cena. |
| Deitado (paisagem) | Uma faixa fina no topo mostra Estabilidade, Créditos, objetivo e atalhos; a cena fica logo abaixo, sem nada por cima. O joystick e o botão **E** ficam nos cantos e ficam quase transparentes quando o personagem passa por trás deles. |

**Para os estudantes jogarem, o jogo precisa estar num endereço da internet**, porque o celular não abre bem um `index.html` solto.
Escolha uma das opções:

1. **GitHub Pages (grátis):** crie um repositório, envie o conteúdo da pasta `afrotech-vol2`, vá em *Settings → Pages* e escolha a branch `main`. O link fica parecido com `https://seu-usuario.github.io/afrotech-vol2/`.
2. **Netlify Drop (grátis, sem conta técnica):** acesse *app.netlify.com/drop* e arraste a pasta do jogo. Ele gera um link na hora.
3. **Rede da escola:** num computador da sala rode `python -m http.server 8000` e, nos celulares conectados ao mesmo Wi-Fi, acesse `http://IP-DO-COMPUTADOR:8000`.

Hospedado assim, o jogo vira um **app instalável**: no Android (Chrome) use *⋮ → Instalar app / Adicionar à tela inicial*; no iPhone (Safari) use *Compartilhar → Adicionar à Tela de Início*. Depois da primeira visita ele **funciona offline** (service worker em `sw.js`).
O progresso fica salvo no próprio aparelho.

**Controles de toque**

| Toque | Ação |
|---|---|
| Joystick (metade esquerda) | Andar em qualquer direção (quanto mais longe do centro, mais rápido) |
| Botão **E** | Interagir. Ele pulsa quando há alguém ou algo por perto. O balão sobre o objeto também pode ser tocado |
| Caixa de diálogo | Toque para pular o texto e avançar. Toque numa opção para escolher |
| Ficha · Diário · Terminal · Menu | Atalhos (em pé, abaixo do objetivo; deitado, na faixa do topo) |
| Simulador | Toque nas portas X e Z e depois em Verificar. Arraste o circuito para o lado para vê-lo inteiro |
| Menu → Tela cheia / Controles na tela | Esconde as barras do navegador (Android) · liga/desliga os controles de toque |

Para testar o modo celular no computador, abra `index.html?touch=1` (e `?touch=0` desliga).

## 2. Controles

| Tecla | Ação |
|---|---|
| `W A S D` / setas | Mover |
| `E` / `Espaço` / `Enter` | Interagir · avançar diálogo |
| `1`–`4` ou mouse | Escolher opções de diálogo e respostas |
| `X` `Z` `R` `Enter` | Simulador: aplicar Porta X / Porta Z, reiniciar o q2, verificar a solução |
| `F` | Ficha & Atributos |
| `J` / `Tab` | Diário de Bordo (Tab troca de aba dentro do painel) |
| `Q` | Terminal Quântico (simulador) — liberado após Dandara e o quiz |
| `Esc` | Menu de pausa / fechar janelas |
| `O` | Destaca o objetivo atual (clique nele para abrir o Diário) |
| `M` | Liga/desliga todo o som (a música tem liga/desliga e volume próprios no Menu) |
| `H` | (no quiz) usar dica de Inteligência |
| `R` | (no simulador, após verificar) repetir a mesma rodada |

**HUD que não atrapalha a cena:** a Estabilidade, os Créditos, o objetivo atual e os atalhos ficam numa **faixa acima da cena**,
nunca por cima da sala. Quando a tela é baixa (ex.: notebook em tela cheia), a cena perde uma faixa fina na altura para a faixa do
HUD caber — os pixels continuam do mesmo tamanho. O objetivo novo pisca em dourado; clicar nele abre o Diário de Bordo.

---

## 3. Roteiro jogável (Três Momentos Pedagógicos)

A versão 0.2 segue o **Manual da Professora** e a dissertação *Afrotech: uma abordagem gamificada
sociointeracionista em RPG* (MNPEF/UNEB). A missão é organizada pelos Três Momentos Pedagógicos
(Delizoicov e Angotti), e o HUD mostra em qual deles o(a) estudante está.

| Momento | No jogo | O que o(a) estudante faz |
|---|---|---|
| **Problematização Inicial** (Atos 1–2) | Tabuleiro de Dona Cici, Praça Cairu, bloqueio de emergência, Labirinto do Silêncio, Interface com o Núcleo, gabinete de Dandara | Começa com o minigame **"Tem ou não tem pimenta?"** (o acarajé de Schrödinger). Depois levanta **hipóteses** para as 4 perguntas da lousa — sem certo nem errado. Dandara responde com novas perguntas, não com respostas. |
| **Organização do Conhecimento** (Ato 3) | Laboratório de Teoria Quântica | Aula da Prof.ª Iasmin (superposição, medição, emaranhamento, teletransporte), dúvidas, quiz, **Roteiro de Operação** no simulador e **Decifrando o Código**. |
| **Aplicação do Conhecimento** (Ato 4 e Comércio) | Sala do Computador Quântico (Núcleo) | Reconstrói o **circuito de 3 qubits** porta por porta, valida o protocolo ao vivo, monta o **Relatório de Consultoria** (as 4 perguntas do vídeo) e explica o teletransporte para Dona Cici e Kauã. |

No final, a **transmissão do Oráculo** compara as hipóteses iniciais com o que a física mostrou e
lembra as tarefas fora do jogo: montar o circuito no **IBM Quantum Composer** e gravar o **vídeo de 3 a 5 minutos**.

### Fontes do conteúdo
- **Narrativa e falas do manual:** Salvador 2495, Elevador Lacerda como "Espinhaço", bloqueio de emergência com
  código rotativo, Labirinto do Silêncio, Interface com o Núcleo ("...não foi um erro, foi um convite"), holograma
  do Oráculo, as 4 perguntas da lousa, a aula e o quiz da Prof.ª Iasmin, o Roteiro de Operação (Apêndice 1),
  o Protocolo Salvador 2495 e a transmissão final.
- **Dissertação:** postulados (estado, medida e regra de Born, evolução unitária), spin e Stern-Gerlach, EPR e Bell,
  estado não fatorável, Tabela 1 (o que Jamal recebe para cada medida), Feynman, Deutsch, Turing, Grover,
  CIMATEC Quantum e as falas dos estudantes no relato de experiência — a pergunta "como superposição e
  emaranhamento se relacionam ao teletransporte?", o gato de Schrödinger, Copenhague × Muitos Mundos (Loki).
- **O Oráculo responde só dentro do tema**, como o NotebookLM do relato: cerca de 15 perguntas em três temas
  (e recusa as que estão fora do escopo).

### Ajustes de precisão física
Para evitar concepções alternativas comuns, alguns trechos foram reescritos com cuidado:
- "0 e 1 ao mesmo tempo" → combinação α|0⟩ + β|1⟩; a medida dá **um** resultado, com probabilidade |α|² ou |β|².
- Emaranhamento: correlação a qualquer distância, mas **sem mensagem instantânea** (por isso os 2 bits clássicos).
- A fala "a cápsula não está em lugar nenhum, logo está em todos" virou um glitch do Oráculo, que a Prof.ª Iasmin corrige.
- **Fotografia Quântica** captura registros clássicos (não pode copiar qubits: não-clonagem); **Furtividade** usa o
  tunelamento só como metáfora. As duas coisas são explicadas no jogo.
- Caso 11: o manual usa ZX ("Z seguida de X"); o jogo aceita X→Z e Z→X e explica a fase global.

### Sala do Computador Quântico isolada (v0.6)

O computador quântico da Afrotech (o **Núcleo**) fica **sozinho numa sala**, ao norte do corredor, como nos
laboratórios reais — muitos sistemas precisam de temperatura perto do zero absoluto e de isolamento contra
vibrações e campos magnéticos para não perder os estados quânticos (decoerência).

| Onde | O que tem | O que ensina |
|---|---|---|
| **Sala blindada** (paredes de cobre e mu-metal) | Refrigerador de diluição ("lustre dourado") de 5 estágios — 50 K, 4 K, 1 K, 0,1 K e ≈ 10 mK (−273,14 °C) no processador — dentro da lata de vácuo e sobre uma base anti-vibração; painel ambiental; placa da blindagem; tampas do piso flutuante | Frio extremo só dentro do refrigerador; mu-metal desvia campos magnéticos (inclusive o da Terra); malha de cobre (gaiola de Faraday) barra ondas de rádio; piso apoiado em amortecedores; cabos com filtros; outras tecnologias (íons presos, fótons) usam outros isolamentos |
| **Antecâmara** | Armário para metais e ímãs, painel de acesso, interface do Núcleo (Ato 2) | **Protocolo de entrada** em 3 etapas — o que fica no armário, uma porta fechada de cada vez, por que a sala existe. Errar vira ruído quântico; acertar libera a porta interna (registrado para a professora) |
| **Laboratório** (fora da sala) | Compressor do tubo pulsado e bombas de hélio-3/hélio-4, com dutos atravessando a parede | O que vibra e faz barulho fica do lado de fora |

Para entrar na sala no Ato 4, é preciso ter completado a tabela no simulador e cumprir o protocolo no painel de acesso.

### Minigames e a Prainha da Baía (v0.4)

| Onde e quando | Minigame | Analogia com a missão |
|---|---|---|
| **Tabuleiro de Dona Cici** · início da missão (Dona Cici chama logo depois da introdução; também pelo diálogo com ela) | **Tem ou não tem pimenta? — o Acarajé de Schrödinger.** 1) Aposte "quente" ou "frio" antes de abrir o papel (3 rodadas; abrir de novo confirma o mesmo resultado). 2) Ajuste o botão da pimenteira para atender os pedidos "1 em cada 4 quentes" e "3 em cada 4" e frite 20 acarajés. 3) Duas perguntas sobre o gato. | Superposição (não é "meio apimentado" nem ignorância), medição/colapso, **regra de Born** (amplitude 0,5 → 25%) e os limites da analogia: um acarajé de verdade, como o gato, perde a superposição na hora (decoerência). |
| **Elevador Lacerda** · liberado depois de restaurar o canal | **Elevador de Hadamard.** Cidade Baixa = \|0⟩, Cidade Alta = \|1⟩. Monte sequências de portas X, H e Z e envie 20 passageiros. 5 desafios: X; H (50/50); **H·H** com previsão (interferência); só H e Z para subir (**H·Z·H = X**); e uma cabine que "chegou de Jacobina" em (\|0⟩ − \|1⟩)/√2. | As portas e a **fase** das correções de Jamal; interferência; a seta das amplitudes num círculo (horizontal = Baixa, vertical = Alta). |
| **Mercado Modelo** · liberado depois de restaurar o canal (Dona Zeza aparece na porta) | **Gincana das Fitinhas** — o desafio de Bell (jogo CHSH). Dona Zeza (Salvador) e Jamal (Jacobina) recebem fitinhas Amarela ou Verde e respondem SIM/NÃO sem se comunicar. 1) Combinado clássico: no máximo 75%. 2) Fitinhas emaranhadas: escolha os ângulos de medição e passe de 80% (ótimo: 0°/45° e 22,5°/−22,5° ≈ 85%). 3) "Isso é telefone?" | Emaranhamento, desigualdade de Bell, Nobel de 2022 e **não-sinalização**: as respostas de cada lado, sozinhas, são 50/50 — por isso o teletransporte precisa do canal clássico. |

**Prainha da Baía:** o mapa da praça foi estendido para o sul. Desça a **Rampa do Mercado** (escadaria ao lado do
Mercado Modelo, com a placa "PRAIA") até a areia: Forte São Marcelo no meio da baía, saveiro, coqueiros e o
**Prof. Hohenfeld** com sua lousinha e dois estudantes. Ele conversa sobre **ensinar física**: começar pela pergunta,
escutar as hipóteses da turma, contar a história da quântica (EPR e o gato em 1935, Bell em 1964, teletransporte em
1993/1997, Nobel de 2022) e por que usar RPG. Ao perguntar se ele é professor de física, ele responde:
**"Sou um contador de história."** Depois da missão, ele pede que você conte a aventura para uma turma.

### Estação de Jamal em Jacobina (v0.5)

Depois da missão, o **Hipertrem Salvador–Jacobina** (leste da praça, ao lado da Torre) leva o(a) jogador(a) a um
mapa novo: **Jacobina, a Cidade do Ouro**, no extremo norte da Chapada Diamantina, a uns 300 km de Salvador. Lá estão
a **Estação Receptora** de Jamal (com a fibra óptica chegando do oeste), a **Mina Velha**, o **Alto do Cruzeiro**,
o **Rio do Ouro**, mandacarus, vaga-lumes e três personagens:

| Quem / onde | O que acontece | Conceito |
|---|---|---|
| **Jamal** e o **Console de Recepção** | Minigame **Recepção em Jacobina**: 5 cápsulas chegando de Salvador. Antes dos 2 bits, o qubit de Jamal aparece como uma mistura das 4 possibilidades (4 setas fantasmas e um ponto no centro da esfera de Bloch). O botão "Medir agora" mostra o que acontece se ele não esperar; quando os bits chegam pela fibra, aplica-se X e/ou Z e confere-se a fidelidade com o original. Fecha com 2 perguntas. | Lado do receptor, estado misto, **nada mais rápido que a luz** (≈ 1,5 ms em 300 km de fibra), medição não "lê" α e β. |
| **Dona Socorro**, garimpeira, na Mina Velha | "Pepita não se copia": pergunta se ficaram duas cópias da D-7. | **Não-clonagem**: o teletransporte transfere, não copia. |
| **Davi**, na plataforma | "Você veio teletransportado?" | Matéria vai de trem; pelo canal só vai o estado. |
| Placas e pontos de interesse | Caixa da fibra óptica, Mina Velha, Alto do Cruzeiro (mais de 200 degraus), Rio do Ouro. | Canal clássico e um pouco da história da cidade. |

Para voltar, use o Hipertrem da plataforma.

### Trilha sonora baiana (v0.7)
Cada lugar do jogo tem a sua música, **gerada ao vivo pelo navegador** (WebAudio): não há arquivo de áudio para baixar, funciona
offline e todas as melodias são **composições originais** do jogo. A troca entre lugares é suave, e a música abaixa durante os diálogos.

| Onde | Faixa | Ritmo da Bahia | Instrumentos sintetizados |
|---|---|---|---|
| Tela de título | *Salvador, 2495* | **Ijexá** dos afoxés | agogô, atabaques (rum, rumpi, lê), xequerê, flauta e pad futurista |
| Praça Cairu (Comércio) | *Comércio* | **Samba-reggae** de bloco afro | surdos (fundo e dobra), caixa, timbal na clave, repique, coro e metais |
| Prainha da Baía | *Maré na Baía* | **Canção praieira** com ijexá leve | violão, ondas, flauta, agogô |
| Torre (labirinto e laboratório) | *Labirinto do Silêncio* | **Toque de Angola** (capoeira) | berimbau gunga (chiado, dom, dim), caxixi, pandeiro, atabaque, agogô |
| Sala do Computador Quântico | *10 milikelvin* | quase silêncio | pings de qubit e um berimbau distante |
| Jacobina | *Serra do Ouro* | **Baião** do sertão baiano | zabumba, triângulo, sanfona |
| Minigames e simulador | *Roda de Ideias* | **Samba de roda** do Recôncavo | viola machete, pandeiro, palmas, prato-e-faca, coro |
| Tela de vitória | *Trio no Circuito* | **Axé** de trio elétrico | guitarra baiana, metais, surdo, caixa, timbal |

A música conta a história: **antes da missão**, o samba-reggae da praça "falha", porque o Silêncio derruba batidas e a melodia chega
em pedaços; **depois do Canal restaurado**, o bloco volta completo, com coro e metais, e no labirinto o berimbau viola entra improvisando.
Na primeira vez em cada lugar, um aviso discreto mostra o nome da faixa e o ritmo.

**Controles:** Menu (`Esc`) → *Música: ligada/desligada* e *Volume da música: baixo/médio/alto* (a escolha fica salva no aparelho).
A tecla `M` continua desligando todo o som. Para editar ou criar faixas, veja `js/core/music.js`: cada faixa é um objeto com
`bpm`, `steps` e uma função `play` que escreve os padrões como texto (`'x..x..x...x.x...'` = clave do samba-reggae).

### Extras
Diagnóstico da rede (Busca Quântica / Grover), fragmento de memória escondido no corredor escuro,
acarajé da Dona Cici, compressor do laboratório e divulgação científica no Comércio.

## 3.1 Modo professor(a): resultados da turma

Cada estudante joga no próprio celular ou computador; os resultados chegam à professora por **código** ou **arquivo**,
sem login e sem internet.

**Estudante:** no **Menu → Relatório para a professora** (ou no botão do final da missão), escreve **nome e turma** e
toca em **Copiar código** (ou **Enviar…**, no celular) para mandar pelo WhatsApp, e-mail etc. Também pode **baixar um
arquivo .json**. O código começa com `AFROTECH2:` e só leva o nome e a turma digitados, além dos dados do jogo.
Dá para gerar um relatório novo a qualquer momento: o painel guarda sempre o mais recente de cada estudante.

**Professor(a):** na tela inicial, **Modo professor(a)** (ou abra `index.html#professor`).
1. Cole os códigos na caixa — pode colar várias mensagens de uma vez ou a **conversa inteira exportada do WhatsApp**;
   o painel acha os códigos sozinho e ignora o resto. Ou importe vários arquivos `.json` de uma vez.
2. Veja o resumo: estudantes, quantos concluíram, tempo médio, **acertos de primeira**; onde a turma está;
   **perguntas mais difíceis**; desafios concluídos; erros no simulador por par de bits; e as **hipóteses iniciais**
   da lousa (ótimo ponto de partida para a discussão da Problematização).
3. Filtre por turma, toque num nome para ver os detalhes (hipóteses, cada resposta, escolhas do Relatório de Consultoria).
4. **Baixar planilha (CSV)** — abre no Excel/LibreOffice (separador `;`, acentos em UTF-8) com uma linha por estudante
   e ~80 colunas — ou **Copiar tabela** para colar no Google Planilhas.
5. **Ver exemplo (turma fictícia)** mostra o painel com dados inventados, marcados como "exemplo".

Os relatórios ficam guardados **só no aparelho da professora** (armazenamento do navegador). Exporte a planilha
para ter uma cópia; **Limpar tudo** apaga os dados.

O que é registrado: tempo de jogo e de cada marco, hipóteses, tentativas em cada pergunta (quiz, Decifrando o Código,
circuito, acarajé, gincana, Jacobina, perguntas de aplicação de Dona Cici, Kauã, Dona Socorro, Davi e Prof. Hohenfeld),
escolhas do relatório, rodadas e falhas no simulador, testes de 2d6, ruído, decoerências, glossário, diário, perguntas
ao Oráculo e os resultados dos minigames (apostas, pedidos, previsão do H·H, melhor combinado clássico, medições
antes dos bits).

## 4. Regras de RPG implementadas

### Teste de 2d6
`total = d1 + d2 + nível do atributo + bônus de classe (+ dicas obtidas com NPCs)`
**Sucesso se total ≥ dificuldade** (padrão do manual: **7**). 12 natural = sucesso crítico (+2 CQ);
2 natural = falha crítica (ruído extra). Toda rolagem é animada e registrada em *Painel → Testes 2d6*.
As opções de diálogo mostram antes o atributo, o modificador e a dificuldade (`LAB +2 · DIF 7`).

### Atributos (custo em Créditos Quânticos por nível, máx. 3) — 60 CQ na criação
| Atributo | Custo | Efeito no jogo |
|---|---|---|
| Inteligência | 10 | Testes de análise/invasão; +1 dica no quiz por nível |
| Armazenamento | 10 | +10 de Estabilidade máx. por nível; nível 1+ mantém a tabela visível no desafio final |
| Fotografia Quântica | 8 | Nível 1+ revela o qubit de Jamal na esfera de Bloch (só em simulação); decifrar a lousa |
| Furtividade | 8 | Passar pelo Drone K-7 sem ser visto |
| Lábia | 6 | Convencer o K-7; falas extras (ex.: dica da Dona Cici) |
| Percepção | 6 | Raio de visão no corredor escuro; nível 2+ revela o piso com ruído; falas extras |
| Busca Quântica | 12 | Diagnóstico da rede, sincronia do Núcleo; +5 s por nível no desafio final |
| $ Investimento | 7 | +3 CQ de reserva por nível; desconto para restaurar Estabilidade no Oráculo |

Créditos que sobram viram reserva. No **Terminal Oráculo** dá para restaurar Estabilidade e investir CQ em atributos.
Como no manual, **Armazenamento** reduz a dificuldade dos testes de resolução de problemas (+1 na lousa e no Núcleo).

### Especialidades
Cientista Quântico(a), Hacker Quântico(a), Cronista Cibernético(a), Analista de Dados e Especialista em
Hardware, além de **Executivo(a)** (do manual) — cada uma com bônus de teste e uma vantagem (dica extra no quiz,
rota de invasão, crônicas no Diário, créditos extras, histograma de medições, Estabilidade extra). O botão *Distribuição recomendada* faz a criação rápida.

### Erro = ruído quântico (sem game over)
Falhas em testes, respostas erradas no quiz e correções erradas no simulador tiram **Estabilidade**, disparam
efeito de *glitch* e alertas (o K-7 aumenta a dificuldade da abordagem repetida, pedindo outra estratégia).
Com Estabilidade 0 ocorre **decoerência**: o Oráculo reestabiliza o(a) agente no terminal mais próximo com 50%.

---

## 5. O simulador (física de verdade, formato do Apêndice 1)

`js/quantum/qsim.js` simula um **vetor de estado de 3 qubits** com amplitudes complexas:

1. Dandara recebe um estado desconhecido `|ψ⟩ = α|0⟩ + β|1⟩` em q0.
2. Par `|β₀₀⟩ = (|00⟩ + |11⟩)/√2` entre q1 (Salvador) e q2 (Jacobina).
3. `CNOT(q0→q1)` e `H(q0)`.
4. Medição de q0 e q1 pela regra de Born → bits `b₁b₂` (25% cada). A seta de Dandara **some**: não-clonagem.
5. Os bits viajam pela fibra; no **treino**, Jamal vê a **seta vermelha** (onde o q2 está) e a **sombra verde**
   (onde deveria estar) e usa **X** e **Z** livremente até alinhar, depois clica em **Verificar** — como no roteiro.
6. A **fidelidade** `|⟨ψ|φ⟩|²` é calculada; as portas aparecem como rotações na **esfera de Bloch**.
7. Na **validação ao vivo** (Núcleo), não há seta nem sombra — como na vida real: só os bits e a regra.

| Bits b₁b₂ | Estado de Jamal (Tabela 1 da dissertação) | Correção |
|---|---|---|
| 00 | α\|0⟩ + β\|1⟩ | I (nada) |
| 01 | α\|1⟩ + β\|0⟩ | X |
| 10 | α\|0⟩ − β\|1⟩ | Z |
| 11 | α\|1⟩ − β\|0⟩ | ZX (ou XZ: diferem só por fase global) |

Os estados sorteados evitam os eixos da esfera para que toda correção errada produza fidelidade visivelmente baixa.

## 6. Estrutura de pastas

```
afrotech-vol2/
├── index.html              ← abra este arquivo
├── manifest.webmanifest    ← dados do app instalável (PWA)
├── sw.js                   ← service worker: jogo offline quando hospedado
├── README.md
├── css/
│   ├── style.css           ← interface neon (HUD, diálogos, modais, simulador)
│   └── mobile.css          ← layout de celular/tablet (retrato e paisagem) e controles de toque
├── assets/
│   ├── fonts/              ← VT323 e Press Start 2P (+ licenças OFL)
│   └── icons/              ← ícones do app (esfera de Bloch em pixel art)
└── js/
    ├── core/
    │   ├── config.js       ← constantes, atributos/custos, classes, paleta
    │   ├── state.js        ← estado, estabilidade, flags, diário, salvar/carregar
    │   ├── input.js        ← teclado (WASD/setas/E/Esc/Tab/F/J/Q/O/M) e ações virtuais de toque
    │   ├── audio.js        ← efeitos sonoros sintetizados (WebAudio)
    │   └── music.js        ← trilha sonora baiana sintetizada (sequenciador, instrumentos e 8 faixas)
    ├── gfx/
    │   ├── pixel.js        ← sprites procedurais com contorno, fonte bitmap 3×5
    │   ├── characters.js   ← personagens 16×22 (4 direções, caminhada, cabelos, roupas)
    │   ├── tiles.js        ← calçada portuguesa, paralelepípedo, baía, escarpa, pisos da Torre
    │   └── art.js          ← Cidade Alta, Elevador Lacerda, Torre, Mercado, sala blindada, refrigerador de diluição…
    ├── world/
    │   ├── maps.js         ← Praça Cairu (Comércio) e interior da Torre
    │   └── world.js        ← colisão, câmera, NPCs, interação, luz neon, zona escura, partículas
    ├── systems/
    │   ├── dice.js         ← teste de 2d6 animado
    │   └── dialogue.js     ← diálogos com escolhas, requisitos e testes
    ├── content/
    │   ├── dialogues.js    ← roteiro de todos os NPCs e terminais
    │   ├── quiz.js         ← hipóteses da lousa, quiz, Decifrando o Código, circuito e relatório
    │   └── glossary.js     ← Glossário Quântico (31 conceitos)
    ├── quantum/
    │   ├── qsim.js         ← simulador de vetor de estado (H, X, Z, CNOT, medição)
    │   └── bloch.js        ← esfera de Bloch e rotações
    ├── ui/
    │   ├── ui.js           ← modais, notificações, efeitos de tela
    │   ├── hud.js          ← faixa do HUD fora da cena (status, objetivo, atalhos) e balão "E · Interagir"
    │   ├── panel.js        ← Ficha, Diário, Glossário, Testes, pausa, controles
    │   ├── quiz.js         ← motor de perguntas + circuito de 3 qubits desenhado por etapas
    │   ├── lousa.js        ← lousa de Dandara (hipóteses) e Roteiro de Operação
    │   ├── simulator.js    ← Simulador de Teletransporte (treino e desafio final)
    │   ├── minigames.js    ← Acarajé de Schrödinger, Elevador de Hadamard, Gincana das Fitinhas, Recepção em Jacobina
    │   ├── report.js       ← modo professor(a): relatório do estudante (código/arquivo) e painel da turma
    │   ├── create.js       ← tela inicial e criação de ficha
    │   └── touch.js        ← joystick, botão E, atalhos de toque, tela cheia
    └── main.js             ← laço do jogo, resolução adaptativa (celular), progressão, final
```

---

## 7. Como editar e expandir

- **Textos e escolhas:** `js/content/dialogues.js`. Um teste de 2d6 é só uma escolha com
  `test: { attr: 'labia', dc: 7, success: 'no_ok', fail: 'no_falha', ruido: 10 }`.
  Opções que exigem atributo usam `req: { attr: 'percepcao', min: 2 }`.
- **Perguntas:** `js/content/quiz.js` — hipóteses da lousa (`AF.HIPOTESES`, com o texto "o que a física mostrou"),
  quiz, Decifrando o Código, circuito e relatório (cada alternativa tem um `why`).
- **Perguntas ao Oráculo:** nós `p1`, `p2`, `p3` e `f_*` do roteiro `oraculo_terminal` em `dialogues.js`.
- **Conceitos do glossário:** `js/content/glossary.js`; desbloqueie com `AF.State.unlock('id')`.
- **Mapas:** `js/world/maps.js` — grade de tiles + lista de objetos (`props`), NPCs, portais, pontos de entrada e
  sub-regiões (`areas`, que mostram a faixa de título ao entrar, como a Prainha da Baía). NPCs aceitam `cond`
  (ex.: Dona Zeza só aparece depois da missão).
- **Minigames:** `js/ui/minigames.js` — pedidos do acarajé (`AC_ORDERS`), perguntas (`AC_Q`) e desafios do
  Elevador (`EL_PUZ`: estado inicial, meta, portas permitidas e texto de conclusão).
- **Equilíbrio:** custos, dificuldade base e créditos iniciais ficam em `js/core/config.js`.

## 8. Próximos passos sugeridos
- Cena da Cidade Alta antes da descida.
- Campo de texto livre na lousa para o(a) estudante escrever a própria hipótese (hoje são alternativas).
- Modo professor(a) com coleta automática (exigiria um servidor ou login dos estudantes).
- Mais NPCs e eventos de ruído dinâmicos no Comércio; faixas extras (ex.: arrocha, maculelê, chula do Recôncavo).
- Empacotar como aplicativo de desktop (Electron ou Tauri) para instalar nos laboratórios.
- Acessibilidade: remapear teclas, ajustar tamanho de texto e modo de alto contraste.
