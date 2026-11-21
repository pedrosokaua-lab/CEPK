# CÓDIGO VERDE

**Um platformer de ação no Colégio Presidente Kennedy.**

Você é um dos monitores de segurança do CEPK — **VEGA**, **LUNA**, **BRUNO** ou **NINA**. Na madrugada em que o Sistema Verde assumiu a escola, portões se trancaram, câmeras começaram a caçar e todos os corredores viraram uma armadilha. Atravesse o pátio, os corredores, o ginásio, o laboratório e a diretoria para libertar o colégio.

![gênero](https://img.shields.io/badge/g%C3%AAnero-plataforma%20%C2%B7%20a%C3%A7%C3%A3o-6dff9e)
![canvas](https://img.shields.io/badge/HTML5-Canvas-7fe7ff)
![sem dependências](https://img.shields.io/badge/depend%C3%AAncias-0-b6ff9a)

## Como jogar

Abra `index.html` no navegador ou sirva a pasta com qualquer servidor estático:

```bash
# com Python
python -m http.server 8123

# com Node
npx serve .
```

Depois acesse `http://localhost:8123`.

> O jogo funciona 100% offline, sem bibliotecas, sem imagens externas e sem áudio pré-gravado. Toda a arte e a trilha são geradas em tempo real pelo Canvas e pela Web Audio API.

## Controles

| Tecla | Ação |
| --- | --- |
| `A` / `D` ou `←` / `→` | Andar |
| `Shift` | Segurar para correr; tocar para **dash** (impulso) |
| `Espaço` / `W` / `↑` | Pular; aperte de novo no ar para **pulo duplo** |
| `L` | **Dash alternativo** (impulso no ar) |
| `J` ou clique esquerdo | Atacar com a arma equipada (8 direções); **segure 0,55s** para o ataque carregado |
| `E` | **Parry** — aparar ataques verdes e projéteis (janela perfeita de 0.14s) |
| `1` / `2` / `3` | Trocar de arma |
| `M` | Ligar / desligar som |
| `Esc` / `P` | Pausar |

**Parkour:** o combate e a travessia usam apenas armas, dash, parry, pulo duplo, salto de parede e plataformas móveis. Não há mais poderes: cada vão e cada chaminé tem uma rota clara com esses recursos.

## Personagens

A **seleção de personagem abre ao iniciar a partida** (e também pelo menu **PERSONAGEM**). Cada monitor tem atributos, retrato e paleta próprios, e a escolha fica salva no progresso:

| Personagem | Perfil | Destaque |
| --- | --- | --- |
| **VEGA** | Monitor | Equilibrado e confiável, sem fraquezas |
| **LUNA** | Atleta | +14% de velocidade, mas −1 de vida máxima |
| **BRUNO** | Técnico | +2 de vida máxima e +18% de dano, porém mais lento |
| **NINA** | Hacker | +35% de energia e +4% de velocidade, com dano um pouco menor |

A seleção aparece em cartões animados com retrato, barras de atributos e descrição, e pode ser trocada também no menu de pausa.

Armas (cada uma tem um **ataque carregado** ao segurar `J` por 0,55s, que gasta energia):
- **Bastão** — combo rápido de três golpes, com finalizador mais forte. Carregado: **CORTE RADIAL 360°**, acerta todos os lados e reflete projéteis.
- **Estilingue** — distância. Gasta energia, mas acerta alvos fora do alcance do bastão. Carregado: **RAJADA TRIPLA**, três pelotas em leque com recuo.
- **Martelo** — corpo a corpo. Lento e pesado. Quebra a guarda, arremessa inimigos e impulsiona caixas. Carregado: **IMPACTO SÍSMICO**, onda de choque dupla que atravessa o chão.

## Inimigos

Cada fase mistura classes e variantes com silhuetas, cores e comportamentos próprios:

| Classe | Variantes | Comportamento |
| --- | --- | --- |
| **Walker** | padrão, `runner`, `brute`, `bomber`, `shield` | Patrulha de solo; corre, aguenta dano, explode ao morrer ou bloqueia golpes frontais |
| **Drone** | padrão, `sniper`, `sprayer` | Voo com tiro preciso ou rajadas em leque |
| **Turret** | padrão, `mortar`, `laser` | Dispara projéteis em arco ou carrega um feixe horizontal |
| **Charger** | padrão, `armored`, `berserk` | Investe em linha reta; versões com mais vida ou fúria ao levar dano |
| **Swooper** | padrão, `bomber`, `swarm` | Ronda e mergulha; solta bombas ou ataca em enxame veloz |

As fases 1 a 5 somam de 10 a 17 inimigos cada, sempre com várias variantes em cena — a Fase 5 chega a onze comportamentos diferentes.

**Aparência:** os inimigos voltaram ao desenho procedural original (por classe e variante). Apenas os chefes usam sprites pixel-art, com projéteis condizentes com a criatura: lâminas, teias, runas e pedras.

## Parry

Aperte **E** pouco antes do impacto. Os primeiros instantes são um **PARRY PERFEITO**: reflete tudo em volta, atordoa mais e recarrega o dash. Projéteis **verdes** e ataques marcados podem ser aparados e voltam como arma; ataques **vermelhos** são imparáveis e exigem dash. Um parry bem-sucedido também atordoa inimigos e chefes próximos e concede energia refundida + dash reset se for perfeito.

## Kennedito e a História

**Kennedito** é um lobo furry verde, mascote do CEPK e amigo de VEGA. Ele foi capturado pelo Sistema Verde e mantido em uma jaula na última fase antes da diretora. Resgatá-lo é uma missão real:

- Quatro **pistas/pegadas** estão espalhadas pelos níveis 1‑4. Coletar todas melhora o abençoamento do resgate.
- No nível 5, antes do chefão, há uma **jaula** contendo Kennedito. Aperte **E** / **J** perto da jaula para iniciar o resgate.
- O resgate concede **+1 HP máximo**; com as quatro pistas, a bênção sobe para **+2 HP máximo** e cura VEGA por completo.
- O resgate também abre o **gate de resgate** que bloqueia a passagem para a diretora.
- Após o resgate, Kennedito luta ao seu lado contra a diretora.

## História completa

1. **Pátio Central** — O sinal de emergência dispara. VEGA acorda e atravessa o pátio com armas, dash e parry.
2. **Corredores** — Armários e câmeras patrulham o labirinto; o caminho é vencido no salto e na leitura dos inimigos.
3. **Ginásio** — O Swooper patrulha as arquibancadas e as plataformas móveis cruzam a quadra.
4. **Laboratório** — Turrets e chargers novos guardam os reatores; coleta de pistas.
5. **Diretoria** — O confronto final. Kennedito está cativo; resgatá‑lo abre o gate de resgate antes da diretora. Derrotando a diretora, o Sistema Verde é desativado e a escola é libertada.

## Fases

1. **Pátio Central** — o começo do sinal, com plataformas móveis e uma rota clara sobre o fosso.
2. **Corredores** — armários, câmeras e plataformas fixas no grande vão do hall.
3. **Ginásio** — a arena de treino, com escada de plataformas sobre o fosso e chaminés de salto de parede.
4. **Laboratório** — reatores, lasers e um parkour de plataformas móveis.
5. **Diretoria** — o confronto final com o Sistema Verde, uma torre de salto de parede e o resgate de Kennedito.

Cada fase tem história, cutscene animada, checkpoints, colecionáveis, desafios de plataforma, **arena de chefe** e **sala de saída** próprias. O parkour combina pulo duplo, dash, salto de parede e plataformas móveis — cada seção tem uma rota visível e sem sobreposição de mecânicas.

## Arenas de chefe

Ao entrar na área final de cada fase, a câmera trava em uma arena dedicada:

- Um **gatilho** dispara a cutscene exclusiva do chefe (dois slides com arte própria).
- **O chefe e a arena ficam escondidos até essa cutscene.** O chefe só é criado quando a luta começa; antes disso, a área é um corredor comum.
- Ao fim da cutscene, o **portão de entrada** se fecha e o **portão de saída** permanece travado durante a luta.
- Todas as arenas foram ampliadas para **24 tiles de largura (768px internos)**, com três pilares de cobertura e uma engrenagem suspensa no centro.
- **Jogador e chefe ficam contidos na arena** durante o combate: nem investidas, teleportes, saltos, recuos ou atordoamentos atravessam os portões. A contenção é reaplicada depois de cada atualização de física.
- A arena tem parede de fundo com painéis, treliça de teto, lâmpadas, **quatro refletores volumétricos**, holofote que segue o chefe, selo giratório, marca d'água com o nome do alvo e piso de combate com círculo, rachaduras e detritos.
- Durante a luta, **luzes de emergência piscam**, um **lockdown vermelho** cobre a sala e uma linha de varredura percorre a arena.
- Se o jogador cair, o chefe é resetado e a luta recomeça sem repetir a cutscene.
- Ao derrotar o chefe, o lockdown cessa, os portões se abrem e um **caminho luminoso com setas** aponta para a saída.

## Sala de saída

Depois de cada arena existe uma câmara de saída independente, com portal animado, moldura de metal, colunas laterais, anéis de energia, partículas, iluminação no piso e a placa **SAÍDA**. Enquanto o chefe estiver de pé, o portal aparece bloqueado com correntes e luz vermelha. O corredor entre o portão e o portal é **largo e sem pilares**, e os portões têm dois tiles de largura para garantir a passagem depois da vitória.

## Direção de arte

- **Paletas por ambiente**: pátio em azul-noite com janelas âmbar, corredores em teal e terrazzo, ginásio em madeira e vinho, laboratório em aço azul e diretoria em vinho e dourado. O verde fica reservado ao Sistema Verde e à identidade do HUD.
- **Piso contínuo**: superfícies desenhadas por trechos, com juntas de laje alinhadas ao mundo, rachaduras, manchas, poças, ralos, musgo e materiais próprios por tema — sem a antiga grade de blocos.
- **Cenários** com parallax em camadas, skyline, fachada escolar contínua com janelas acesas/apagadas/quebradas, calhas, ar-condicionado, caixa d'água, relógio, cerca, postes e cones de luz. Interiores com armários, quadros de avisos, tanques de laboratório, racks, estantes, janelas com chuva e arquibancadas.
- **Cutscenes encenadas**: VEGA aparece em primeiro plano, com aura, rim light e arma; a câmera faz **push-in** com tremor sutil, flash de abertura e vinheta. Nos alertas de chefe há holofotes na cor do alvo, linhas de velocidade radiais, névoa baixa, retículo de mira, silhueta gigante do chefe, partículas de brasas, cabeçalho **ALVO PRIORITÁRIO** e letterbox animado.
- **Inimigos** com silhuetas, cores e animações próprias por classe e variante, desenhadas por código — sem sprites externos.
- **Chefes com sprites e ataques coerentes**: o **Porteiro** é a Armadura Animada (espada e escudo, pedras azuladas); a **Inspetora** é a Assassina das Sombras (leques de lâminas); o **Técnico** é o Ogro Bruto (marteladas e rochas); a **Coordenadora** é a Necromante (runas, clones e orbes); a **Diretora** é a Rainha-Aranha (teias, anéis e rajadas). Cada um mantém aura de fase, telegrafia e barra própria.
- **Personagens e armas redesenhados**: cada monitor tem rosto, cabelo, jaqueta, emblema e silhueta próprios; o bastão, o estilingue e o martelo ganharam sprites detalhados com brilho, correias e núcleo de energia.
- **HUD informativo**: retrato animado, corações, energia, objetivo atual, progresso de checkpoints e de estações do tutorial, barra de progresso do mapa com marcação da arena, dica contextual, seletor de armas e barra de chefe com fases.

## Chefes

- **O PORTEIRO** — guarda o pátio com investidas e ondas de choque. Arena: Guarita do Pátio.
- **A INSPETORA** — caça à distância e corta o espaço com lâminas. Arena: Corredor Sem Saída.
- **O TÉCNICO** — salta, gira e usa o peso da quadra. Arena: Quadra Fechada.
- **A COORDENADORA** — clones, teleportes e padrões de projéteis. Arena: Protocolo de Contenção.
- **A DIRETORA** — três fases, feixes, invocações e um sinal vermelho. Arena: Sinal Vermelho.

Os chefes telegrafam ataques e podem ser atordoados com parry. **Todos os cinco têm três fases**: a fase 2 começa em 66% da vida e a fase 3 em 32%. A cada fase eles ficam mais rápidos, encurtam os telegraphs, reduzem a recuperação e encadeiam combos extras. Cada um tem cutscene de entrada, arena temática e sala de saída própria.

Vida e ritmo dos chefes no modo Normal:

| Chefe | Vida | Velocidade | Padrões principais |
| --- | --- | --- | --- |
| O Porteiro | 100 | 84 | investida, marretada, ondas de choque, reforços, terremoto, meteoros |
| A Inspetora | 150 | 96 | leque, lâminas, teleporte, chuva, feixe, laser, barragem |
| O Técnico | 210 | 92 | salto, giro, pedras, ondas, impacto, terremoto, meteoros |
| A Coordenadora | 280 | 104 | clones, teleporte, leque, anel, chuva, órbita, laser |
| A Diretora | 420 | 112 | anel, feixe, reforços, clones, chuva, leque, laser, meteoros, órbita, terremoto |

Além dos ataques clássicos, cada chefe ganhou **seis novos golpes** distribuídos pelas três fases:

- **Laser** — carrega um feixe horizontal que varre a arena; na fase 3 vira duas linhas.
- **Meteoro** — marca colunas no chão e despeja projéteis em queda.
- **Barragem** — rajada rápida de projéteis teleguiados em leque.
- **Órbita** — projéteis circulam o chefe e depois disparam em todas as direções.
- **Investida relâmpago (`rush`)** — avanço curto e violento com rastro de energia.
- **Terremoto (`quake`)** — salto seguido de impacto que gera ondas de choque no piso.

Os ataques especiais (pedras, feixes vermelhos e projéteis marcados) causam **2 de dano**; o contato comum continua em 1–2 para manter as lutas justas.

## Dificuldade

Quatro modos disponíveis no menu:

- **Fácil** — mais vida, menos dano e inimigos mais lentos.
- **Normal** — a experiência equilibrada.
- **Difícil** — menos vida, inimigos agressivos e chefes resistentes.
- **Pesadelo** — o CEPK no limite: pouca vida, dano alto e chefes implacáveis.

A dificuldade pode ser alterada a qualquer momento pelo menu.

## Progresso

O jogo salva automaticamente no `localStorage`:

- fases liberadas e concluídas;
- crachás e núcleos coletados;
- pistas de Kennedito coletadas;
- personagem escolhido;
- dificuldade escolhida.

A chave nova é `codigo_verde_save_v1`. Saves antigos de `ferro9_save_v1` são lidos uma vez e migrados; poderes antigos são ignorados.

## Tecnologia

- HTML5 Canvas 2D com resolução interna de 1280×720.
- Tiles de 32px e visual pixel-art: cenários, inimigos, HUD e efeitos desenhados por código, com sprites locais apenas para os chefes.
- Física própria de plataforma, colisão por eixos e limites de mundo.
- Áudio procedural com Web Audio API.
- Zero dependências e zero build: todos os sprites são arquivos locais em `assets/`, sem bibliotecas ou serviços externos.

## Estrutura

```text
index.html
css/style.css
assets/          — folhas de sprites dos inimigos e chefes
js/core.js       — constantes, utilidades, input, áudio, partículas, save
js/level.js      — construtor de fases, temas, tutorial, níveis e histórias
js/sprites.js    — carregamento das folhas, mapeamento e estilo dos ataques
js/entities.js   — VEGA, armas, dash, parry, inimigos, chefes, projéteis e pickups
js/game.js       — estados, fluxo de telas, tutorial, arena do chefe e câmera
js/render.js     — cenários, HUD, menus, cutscenes e telas de fim
```

Feito para o **Colégio Presidente Kennedy**.
