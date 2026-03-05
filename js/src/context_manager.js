/**
 * Context Window Manager.
 * Tracks token usage from 5k to 200k and renders the context bar UI.
 */

class ContextManager {
    constructor() {
        this.tokens = 5000;
        this.max = 200000;
        this.canvas = null;
        this.ctx = null;
        this.compactSpawned = false;
    }

    init() {
        this.tokens = 5000;
        this.compactSpawned = false;

        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'context-bar';
            this.canvas.width = 320;
            this.canvas.height = 50;
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
        }

        this.render();
    }

    add(amount) {
        this.tokens += amount;
        this._clampAndCheck();
    }

    set(amount) {
        this.tokens = amount;
        // significant drop (reset) — cancel compact so it can re-trigger if needed
        if(amount < this.max * 0.5) {
            this.compactSpawned = false;
            if(typeof enemy !== 'undefined' && enemy.compactActive) {
                enemy.compactActive = false;
                if(enemy.compactMesh) enemy.compactMesh.visible = false;
            }
        }
        this._clampAndCheck();
    }

    multiply(factor) {
        this.tokens = this.tokens * factor;
        this._clampAndCheck();
    }

    getPercent() {
        return this.tokens / this.max;
    }

    _clampAndCheck() {
        if (this.tokens < 5000) this.tokens = 5000;
        if (this.tokens >= this.max) {
            this.tokens = this.max;
            if (!this.compactSpawned) {
                this.compactSpawned = true;
                enemy.spawnCompact();
            }
        }
    }

    update(timeDelta) {
        // Passive increase: scales with game speed
        let rate = 200 + (enemy.config.vel * 10);
        this.add(rate * timeDelta);
        this.render();
    }

    render() {
        if (!this.ctx) return;

        let w = this.canvas.width;
        let pct = this.getPercent();

        this.ctx.clearRect(0, 0, w, 50);

        // Background bar
        this.ctx.fillStyle = 'rgba(40, 55, 65, 0.9)';
        this.ctx.fillRect(0, 0, w, 14);

        // Fill bar color based on level
        let fillColor;
        if (pct >= 0.80) {
            fillColor = 'rgba(180, 60, 60, 1)';
        } else if (pct >= 0.50) {
            fillColor = 'rgba(160, 110, 40, 1)';
        } else {
            fillColor = 'rgba(106, 133, 145, 1)';
        }
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(0, 0, Math.floor(w * pct), 14);

        // Token count text
        let tokenText = Math.trunc(this.tokens).toLocaleString() + ' / 200,000';
        this.ctx.font = '10px "Press Start 2P"';
        this.ctx.fillStyle = 'rgba(106, 133, 145, 1)';
        this.ctx.fillText(tokenText, 0, 36);
    }
}
