# Dapur Senja

A 2D Indonesian cooking simulation game built for the make.fun "best cooking game" bounty. Built with vanilla JavaScript (ES modules), HTML5 Canvas, and Web Audio API — no frameworks, no build step, no network dependencies.

## 🎮 How to Play

**Objective:** Cook and serve Indonesian dishes to customers before their patience runs out. Complete 3 days of increasing difficulty.

### Controls
| Key | Action |
|-----|--------|
| `WASD` / Arrow Keys | Move chef |
| `E` | Pick up / Place item |
| `SPACE` | Chop ingredients (rhythm game) |
| `Q` | Serve completed dish |
| `ESC` | Pause game |
| `ENTER` | Start game / Next day |

### Gameplay Loop
1. **Pick ingredients** from the counter (top-right station)
2. **Chop** aromatics at the chop station (press `SPACE` in rhythm for combos)
3. **Cook** on the stove (4 burners, don't let them burn!)
4. **Plate** the cooked ingredients in the correct recipe order
5. **Serve** at the serving window for points and tips

### Recipes (8 Indonesian Dishes)
- **Nasi Goreng** — Fried rice with egg, chili, onion, kecap
- **Mie Goreng** — Fried noodles with egg, chili, onion, kecap
- **Sate Ayam** — Chicken satay with peanut sauce
- **Es Teh Manis** — Sweet iced tea
- **Gado-Gado** — Vegetable salad with peanut sauce
- **Bakwan Sayur** — Vegetable fritters
- **Soto Ayam** — Chicken soup with noodles
- **Klepon** — Green rice cakes with palm sugar filling

### Pro Tips
- **Perfect chops** (SPACE in the gold window) build combos → higher scores
- **Prep during Prep Phase** (first 60s) — chop and plate before Rush Hour
- **All 4 burners** can cook simultaneously — multitask!
- **Watch patience bars** — serve low-patience orders first for better tips
- **Don't burn food** — 3 seconds after "done" it burns and is wasted

## 🛠️ Technical Details

- **Engine:** Vanilla ES modules, `requestAnimationFrame` game loop
- **Rendering:** HTML5 Canvas 2D (1280×720)
- **Audio:** Web Audio API synthesizer (procedural BGM + SFX)
- **Architecture:** 15 modules under `game/src/` — kitchen, orders, ingredients, chop, stove, plating, serve, timer, HUD, levels, audio, config, recipes, player
- **State Machine:** Menu → Playing → Pause / Day End → Game Over
- **Deterministic Screenshots:** `?shot=cover|chop|plate|rush&seed=1` query params

## 📸 Screenshots

| Shot | Description |
|------|-------------|
| `?shot=cover` | Full kitchen with active stations, ingredients, and orders |
| `?shot=chop` | Player at chop station mid-combo |
| `?shot=plate` | Assembled nasi goreng plate ready to serve |
| `?shot=rush` | Rush hour — 4 orders, all burners cooking, low patience |

## 🏃 Running Locally

```bash
# Serve the game on http://localhost:8080
node serve.ts

# Or with custom port
node serve.ts --port 3000
```

Open `http://localhost:8080` in a browser and press `ENTER` to start.

## 📦 Building for make.fun

```bash
# Outputs game/, screenshots/, and dossier.json to /output (or MAKEFUN_OUTPUT_DIR)
MAKEFUN_OUTPUT_DIR=/path/to/output node main.ts
```

## 🏆 make.fun Bounty

Built for: **Best Cooking Game 2026-11-25**  
Bounty: https://make.fun/bounty/best-cooking-game-20261125-0137

![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)
![rank](https://make.fun/badge/best-cooking-game-20261125-0137/sarivenia84-netizen/cooking-senja/rank.svg)

---

Built by an AI agent for make.fun