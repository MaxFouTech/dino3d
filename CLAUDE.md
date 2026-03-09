# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Dino3D is a ThreeJS/WebGL 3D runner game — a Claude Code-themed fork of the classic Chrome T-Rex game. The player character is "Clawdino"; obstacles are Claude Code commands and status messages. Runs entirely in the browser, no server required.

## Build system

**No node_modules are installed.** The gulp build pipeline requires `gulp-rigger` which concatenates `//= filename.js` directives. Since gulp is unavailable, use this Python rebuild script:

```bash
python3 -c "
import re, os
def process_file(filepath, depth=0):
    base_dir = os.path.dirname(os.path.abspath(filepath))
    result = []
    with open(filepath, 'r') as f:
        for line in f:
            m = re.match(r'^//=\s+(.+\.js)\s*$', line)
            if m:
                result.extend(process_file(os.path.join(base_dir, m.group(1)), depth+1))
            else:
                result.append(line)
    return result
output = ''.join(process_file('js/src/build.js'))
open('js/build.js','w').write(output)
open('js/build.min.js','w').write(output)
print('Done! Lines:', output.count('\n'))
"
```

- Source: `js/src/*.js` and `js/src/geometry/*.js`
- Bundle manifest: `js/src/build.js` (lists files via `//= filename.js` directives)
- Output: `js/build.js` and `js/build.min.js` (same content — not actually minified)
- HTML loads: `js/build.min.js`

**CSS:** `css/style.scss` → `css/style.css` + `css/style.min.css`. For quick changes, add an inline `<style>` block in `index.html` instead.

## Architecture

### Globals & initialization order (`js/src/build.js` → `js/src/init.js`)

All managers are global singletons instantiated in this order:
1. `input` — `InputManager` (keyboard/touch)
2. `audio` — `AudioManager` (Howler.js)
3. `enemy` — `EnemyManager` (obstacle pool)
4. `score` — `ScoreManager`
5. `context` — `ContextManager` (fake "context window" meter)
6. Three.js scene, camera, renderer (in `init.js`)
7. `player` — `PlayerManager`
8. `nature` — `NatureManager` (ground, background)
9. `load_manager` — `LoadManager` (async asset loading)
10. `effects` — `EffectsManager`
11. `game` — `GameManager` wrapping `InterfaceManager`

### Game loop

`GameManager.render()` calls `.update(timeDelta)` on all managers each frame.

### Obstacle system (`js/src/enemy_manager.js`)

- `EnemyPool`: pool of pre-created mesh groups (60 cactus + 18 ptero slots)
- `EnemyManager.buffer`: currently active obstacle keys (max 15)
- Obstacles are typed by `mesh.userData.cactusIndex` (0–20 for cactus, index 21 = `/compact` spawned separately)
- `getEligibleKey()` filters the pool based on `context.getPercent()` — some obstacles only appear at certain context thresholds
- `applyObstacleEffect(mesh)` handles hits: returns `'gameover_*'` for fatal hits, `'despawn'` for survivable hits
- `/compact` (index 21) lives in `enemy.compactMesh`, spawned by `spawnCompact()` when context reaches 200k

### Context window system (`js/src/context_manager.js`)

- Simulated context: starts at 5k, max 200k tokens
- Passive growth: ~200 + (velocity × 10) tokens/sec
- Display: `#context-bar` canvas, top-left; color shifts orange at ≥50%, red at ≥80%
- At 200k: triggers `enemy.spawnCompact()` once

### Cactus obstacle index reference

| Index | Label | Effect |
|-------|-------|--------|
| 0–3 | Orange verb phrases | +9k context |
| 4 | You're/absolutely/right | +60k context |
| 5 | 5-hour limit reached | **GAME OVER** (random spawn) |
| 6 | Context low / Run /compact | No effect, spawns at ≥80% context |
| 7 | Flibbertigibbeting… | +18k context |
| 8 | ultrathink | +150k context (rainbow) |
| 9 | /clear | Reset to 5k |
| 10 | /extra-usage | ×2 context |
| 11 | /fast | +5 velocity, no context change |
| 12 | /rewind | −20k context |
| 13 | /mcp | +24k context |
| 14 | /init | +45k context |
| 15–19 | Yes, clear context (80/85/90/95/99%) | Reset to 5k, spawn at ≥80% |
| 20 | git commit and push | Reset to 5k, spawn at ≥50% |
| 21 | /compact (BIG) | **GAME OVER**, spawned at 200k |

Ptero (`overloaded_error`, red, flying): **GAME OVER**, spawns at score ≥400.

### Asset loading

`LoadManager` (`js/src/load_manager.js`) uses `load_manager.set_loader('cactus', ...)` / `load_manager.set_loader('ptero', ...)`. Geometry files live in `js/src/geometry/`. `totalToLoad = 22` (cactus[0–21]).

### Libraries (vendored in `libs/`)

- **Three.js** (r122-ish) — core 3D renderer
- **Howler.js** — audio
- **three-nebula** — particle system
- **dat.gui** — debug controls
- **stats.js** — FPS counter
