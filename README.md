# FERRO-9 — Fuga da Fábrica

Um jogo de **plataforma, ação e puzzle magnético** feito em HTML5 Canvas, sem bibliotecas e sem assets externos.

Você é **FERRO-9**, um pequeno robô de manutenção que acorda em uma fábrica abandonada. Recupere seus módulos magnéticos, atravesse cinco setores e destrua o Núcleo Central para conquistar sua liberdade.

![gênero](https://img.shields.io/badge/g%C3%AAnero-plataforma%20%C2%B7%20a%C3%A7%C3%A3o%20%C2%B7%20puzzle-ff8c42)
![canvas](https://img.shields.io/badge/HTML5-Canvas-4da6ff)
![sem dependências](https://img.shields.io/badge/depend%C3%AAncias-0-4fffe6)

## Como jogar

Abra o arquivo `index.html` no navegador ou sirva a pasta com qualquer servidor estático:

```bash
# com Python
python -m http.server 8123

# com Node
npx serve .
```

Depois acesse `http://localhost:8123`.

> Não é necessário instalar nada. O jogo funciona 100% offline.

## Controles

| Tecla | Ação |
| --- | --- |
| `A` / `D` ou `←` / `→` | Andar |
| `Shift` | Correr |
| `Espaço` / `W` / `↑` | Pular (segure para pular mais alto) |
| `J` ou clique esquerdo | **Golpe magnético** — combo de 3 acertos, empurra caixas e rebate projéteis |
| `K` ou clique direito | **Raio de energia** — tiro à distância (custa 8 de energia) |
| `Q` ou `1` | **Ímã azul** — atrai metal (segure) |
| `E` ou `2` | **Ímã vermelho** — repele e reflete projéteis (segure) |
| `R` ou `3` | **Campo magnético** — escudo (segure) |
| `F` ou `4` | **Supercarga** — saltos gigantes por 6s |
| `M` | Liga/desliga o som |
| `Esc` / `P` | Pausar |
| `Enter` / `Espaço` | Avançar diálogo / cutscene |
| `Esc` | Pular a cutscene |

## Poderes

- 🔵 **Ímã azul** — atrai caixas, engrenagens, inimigos e projéteis de metal. Use caixas para criar pontes sobre fossos.
- 🔴 **Ímã vermelho** — empurra inimigos e devolve os tiros dos inimigos (inclusive contra chefes).
- 🟣 **Campo magnético** — escudo que bloqueia dano e destrói projéteis inimigos.
- 🟡 **Supercarga** — saltos gigantes e mais velocidade por 6 segundos.

A energia é limitada e se regenera com o tempo. Use os poderes com moderação.

## Combate

- ⚔️ **Golpe magnético** (`J` / clique esquerdo) — combo de três acertos com alcance curto, empurrão e knockback. Também empurra caixas e rebate projéteis inimigos.
- ⚡ **Raio de energia** (`K` / clique direito) — dispara um projétil à distância por **8 de energia**. Causa dano dobrado nos chefes.
- Os golpes encadeiam em um combo rápido: acerte no ritmo para manter o terceiro acerto, que é mais forte.
- Inimigos agora têm **avisos de ataque**: o Andarilho patrulha, persegue e dá investidas; o Drone orbita, mira e dispara rajadas com aviso a laser.
- Os chefes usam **ondas de choque**, **chuva de metal** e **rajadas radiais**, com avisos visuais antes de cada ataque.

## Dificuldades

Escolha o modo no menu principal em **DIFICULDADE**. A seleção é salva automaticamente e pode ser trocada a qualquer momento fora da fase.

| Modo | Vida | Dano recebido | Inimigos | Chefes | Energia |
| --- | --- | --- | --- | --- | --- |
| **FÁCIL** | 8 | 50% | 25% menos vida, 15% mais lentos | 25% menos vida | Regenera 35% mais rápido |
| **NORMAL** | 5 | 100% | Padrão | Padrão | Padrão |
| **DIFÍCIL** | 5 | 150% | 35% mais vida, 12% mais rápidos | 25% mais vida | Regenera 10% mais devagar |
| **PESADELO** | 4 | 200% | 70% mais vida, 25% mais rápidos | 50% mais vida | Regenera 20% mais devagar |

Nas dificuldades maiores os inimigos também atiram mais rápido, fazem rajadas maiores e atacam com mais frequência.

## Cutscenes e história

Cada uma das cinco fases começa com uma **cutscene animada de três cenas**, desenhada proceduralmente no canvas, seguida por uma **tela de história** com o objetivo da fase.

- `Enter` / `Espaço` / clique avançam o texto (o primeiro toque revela a cena inteira).
- `Esc` pula a cutscene direto para a tela de história.
- A cutscene é reproduzida ao iniciar uma nova partida, continuar um save ou avançar de fase. Ao escolher uma fase no **SELECIONAR FASE**, o jogo começa direto na ação.

## Fases

1. **Fábrica Abandonada** — onde tudo começou.
2. **Laboratório Secreto** — experimentos proibidos.
3. **Cidade Robótica** — as luzes nunca dormem.
4. **Usina Elétrica** — o coração da energia.
5. **Núcleo Central** — o fim da linha.

Cada fase termina em uma arena com um **chefe mecânico**. Reflita os projéteis com o ímã vermelho, arremesse caixas de metal e acerte o núcleo para abrir a saída.

## Recursos

- Tutorial interativo no início do jogo, incluindo os ataques.
- 5 fases com temas e trilhas sonoras próprias.
- Cutscene animada e mini-história para cada fase.
- Combate corpo a corpo com combo e tiro de energia.
- 4 dificuldades com escala de vida, dano, velocidade e agressividade.
- 5 chefes com padrões de ataque e segunda fase.
- Física de plataforma com coyote time, jump buffer e pulo variável.
- Puzzles com caixas de metal dinâmicas.
- Engrenagens e núcleos escondidos para colecionar.
- Checkpoints, progresso salvo em `localStorage` e seleção de fases.
- Áudio sintetizado via WebAudio (sem arquivos de som).
- Efeitos de partículas, parallax e screen shake.

## Estrutura do projeto

```text
index.html          ponto de entrada
css/style.css       layout, moldura e efeito CRT
js/core.js          utilidades, input, áudio e partículas
js/level.js         construção e definição das 5 fases
js/entities.js      jogador, caixas, inimigos, chefes, projéteis e itens
js/game.js          loop, estados, progresso e regras
js/render.js        cenário, HUD, tutorial e menus
```

## Progresso

O progresso é salvo automaticamente no navegador (`localStorage`, chave `ferro9_save_v1`): fases liberadas, poderes desbloqueados e coletáveis. Use **APAGAR PROGRESSO** no menu para recomeçar do zero.

## Licença

Este projeto está disponível para uso pessoal e educacional. Divirta-se!
