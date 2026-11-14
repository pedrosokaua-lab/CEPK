# CÓDIGO VERDE

**Um platformer de ação no Colégio Presidente Kennedy.**

Você é **VEGA**, monitor de segurança do CEPK. Na madrugada em que o Sistema Verde assumiu a escola, portões se trancaram, câmeras começaram a caçar e todos os corredores viraram uma armadilha. Atravesse o pátio, os corredores, o ginásio, o laboratório e a diretoria para libertar o colégio.

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
| `J` ou clique esquerdo | Atacar com a arma equipada (8 direções) |
| `E` | **Parry** — aparar ataques verdes e projéteis (janela perfeita de 0.14s) |
| `K` | **Foco** (segure; desacelera inimigos e projéteis) |
| `1` / `2` / `3` | Trocar de arma |
| `Q` | **Pulso** (após desbloquear) |
| `R` | **Escudo** (segure; após desbloquear) |
| `F` | **Adrenalina** (após desbloquear) |
| `M` | Ligar / desligar som |
| `Esc` / `P` | Pausar |

Armas:
- **Bastão** — combo rápido de três golpes, com finalizador mais forte. Equilibrado e seguro.
- **Estilingue** — distância. Gasta energia, mas acerta alvos fora do alcance do bastão.
- **Martelo** — corpo a corpo. Lento e pesado. Quebra a guarda, arremessa inimigos e impulsiona caixas.

Poderes:
- **PULSO (`Q`)** — onda de choque que destrói projéteis e empurra inimigos.
- **FOCO (`K`)** — desacelera inimigos e projéteis enquanto você segura.
- **ESCUDO (`R`)** — barreira de energia que absorve dano.
- **ADRENALINA (`F`)** — mais velocidade, salto e dano por 6 segundos.

Nenhum poder magnético: o combate agora gira em torno de armas, posicionamento, dash, pulo duplo e parry.

## Parry

Aperte **E** pouco antes do impacto. Os primeiros instantes são um **PARRY PERFEITO**: reflete tudo em volta, atordoa mais e recarrega o dash. Projéteis **verdes** e ataques marcados podem ser aparados e voltam como arma; ataques **vermelhos** são imparáveis e exigem dash ou escudo. Um parry bem-sucedido também atordoa inimigos e chefes próximos e concede energia refundida + dash reset se for perfeito.

## Kennedito e a História

**Kennedito** é um lobo furry verde, mascote do CEPK e amigo de VEGA. Ele foi capturado pelo Sistema Verde e mantido em uma jaula na última fase antes da diretora. Resgatá-lo é uma missão real:

- Quatro **pistas/pegadas** estão espalhadas pelos níveis 1‑4. Coletar todas melhora o abençoamento do resgate.
- No nível 5, antes do chefão, há uma **jaula** contendo Kennedito. Aperte **E** / **J** perto da jaula para iniciar o resgate.
- O resgate concede **+1 HP máximo**; com as quatro pistas, a bênção sobe para **+2 HP máximo** e cura VEGA por completo.
- O resgate também abre o **gate de resgate** que bloqueia a passagem para a diretora.
- Após o resgate, Kennedito luta ao seu lado contra a diretora.

## História completa

1. **Pátio Central** — O sinal de emergência dispara. VEGA acorda e deve atravessar o pátio, coletando o PULSO.
2. **Corredores** — O FOCUS é encontrado; armários e câmeras patrulham o labirinto.
3. **Ginásio** — O ESCUDO protege contra ataques pesados; o Swooper patrulha as arquibancadas.
4. **Laboratório** — A ADRENALINA concede velocidade superior; há turrets e chargers novos; coleta de pistas.
5. **Diretoria** — O confronto final. Kennedito está cativo; resgatá‑lo abre o gate de resgate antes da diretora. Derrotando a diretora, o Sistema Verde é desativado e a escola é libertada.

## Fases

1. **Pátio Central** — o começo do sinal e o primeiro poder.
2. **Corredores** — armários, câmeras e o Foco.
3. **Ginásio** — a arena de treino e o Escudo.
4. **Laboratório** — reatores, lasers e a Adrenalina.
5. **Diretoria** — o confronto final com o Sistema Verde e o resgate de Kennedito.

Cada fase tem história, cutscene animada, checkpoints, colecionáveis, desafios de plataforma, **arena de chefe** e **sala de saída** próprias.

## Arenas de chefe

Ao entrar na área final de cada fase, a câmera trava em uma arena dedicada:

- Um **gatilho** dispara a cutscene exclusiva do chefe (dois slides com arte própria).
- O **portão de entrada** se fecha e o **portão de saída** permanece travado durante a luta.
- A arena tem teto, colunas, refletores, faixas de perigo e o emblema do chefe.
- Se VEGA cair, o chefe é resetado e a luta recomeça sem repetir a cutscene.
- Ao derrotar o chefe, os dois portões se abrem e a **sala de saída** é liberada.

## Sala de saída

Depois de cada arena existe uma câmara de saída independente, com portal animado, moldura de metal, colunas laterais, anéis de energia, partículas, iluminação no piso e a placa **SAÍDA**. Enquanto o chefe estiver de pé, o portal aparece bloqueado com correntes e luz vermelha.

## Direção de arte

- **Cenários** com parallax, iluminação ambiente, poeira suspensa, bolhas de laboratório, chuva na diretoria, nuvens e holofotes no pátio.
- **Cutscenes encenadas**: VEGA aparece em primeiro plano, com aura, rim light e arma; a câmera tem leve deriva cinematográfica, holofotes e partículas de brasas nos alertas de chefe.
- **Inimigos detalhados**: Walkers com cinto, emblema, rádio e joelheiras; drones com braços de rotor, luzes de navegação e lente; torretas com pés estabilizadores, tambor e ventilação; Chargers com ariete, escapamentos e núcleo; Swoopers com nervuras nas asas, cauda e propulsor.
- **Chefes** com placas de armadura, rebites, ombreiras e núcleo pulsante, além de silhuetas próprias em cada arena.

## Chefes

- **O PORTEIRO** — guarda o pátio com investidas e ondas de choque. Arena: Guarita do Pátio.
- **A INSPETORA** — caça à distância e corta o espaço com lâminas. Arena: Corredor Sem Saída.
- **O TÉCNICO** — salta, gira e usa o peso da quadra. Arena: Quadra Fechada.
- **A COORDENADORA** — clones, teleportes e padrões de projéteis. Arena: Protocolo de Contenção.
- **A DIRETORA** — três fases, feixes, invocações e um sinal vermelho. Arena: Sinal Vermelho.

Os chefes telegrafam ataques, mudam de fase conforme perdem vida e podem ser atordoados com parry. Cada um tem cutscene de entrada, arena temática e sala de saída própria.

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
- poderes desbloqueados;
- crachás e núcleos coletados;
- pistas de Kennedito coletadas;
- dificuldade escolhida.

A chave nova é `codigo_verde_save_v1`. Saves antigos de `ferro9_save_v1` são lidos uma vez e migrados, mas poderes magnéticos antigos são descartados.

## Tecnologia

- HTML5 Canvas 2D com resolução interna de 1280×720.
- Tiles de 32px e visual pixel-art desenhado por código.
- Física própria de plataforma, colisão por eixos e limites de mundo.
- Áudio procedural com Web Audio API.
- Zero dependências, zero build, zero assets externos.

## Estrutura

```text
index.html
css/style.css
js/core.js       — constantes, utilidades, input, áudio, partículas, save
js/level.js      — construtor de fases, temas, tutorial, níveis e histórias
js/entities.js   — VEGA, armas, parry, inimigos, chefes, projéteis e pickups
js/game.js       — estados, fluxo de telas, tutorial, poderes e câmera
js/render.js     — cenários, HUD, menus, cutscenes e telas de fim
```

Feito para o **Colégio Presidente Kennedy**.
