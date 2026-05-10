const rainGlyphs = '010101QQYYVEILROOTSIGILRABBIT#$_+-=<>[]{}';
const rainWords = ['RDP', 'RDG', 'BROKER', 'TLS', 'CERT', 'SESSION', 'DESKTOP', 'DENIED', 'QQYY', 'LOCKED', 'HOST'];
const rainFrameDelay = 82;
const dayStartHour = 7;
const nightStartHour = 19;
const themeModes = ['auto', 'day', 'night'];
const themeStorageKey = 'qqyy-theme-mode';
let matrixAudioContext;
let matrixAudioGain;

document.addEventListener('DOMContentLoaded', () => {
    setupAutoTheme();
    setupMobileMenu();
    setupMatrixRain();
    setupInternalGateway();
    setupMatrixGameEasterEgg();
});

function setupAutoTheme() {
    const toggle = document.querySelector('[data-theme-toggle]');
    let selectedMode = getStoredThemeMode();

    const updateTheme = () => {
        const theme = selectedMode === 'auto' ? getAutoTheme() : selectedMode;

        document.documentElement.dataset.theme = theme;
        document.body.dataset.theme = theme;
        document.body.dataset.themeMode = selectedMode;
        document.documentElement.style.colorScheme = theme === 'day' ? 'light' : 'dark';

        if (toggle) {
            toggle.textContent = selectedMode.toUpperCase();
            toggle.dataset.themeMode = selectedMode;
            toggle.setAttribute('aria-label', `Theme mode: ${selectedMode}`);
        }
    };

    if (toggle) {
        toggle.addEventListener('click', () => {
            selectedMode = themeModes[(themeModes.indexOf(selectedMode) + 1) % themeModes.length];
            storeThemeMode(selectedMode);
            updateTheme();
        });
    }

    updateTheme();
    window.setInterval(updateTheme, 60000);
}

function getAutoTheme() {
    const hour = new Date().getHours();
    return hour >= dayStartHour && hour < nightStartHour ? 'day' : 'night';
}

function getStoredThemeMode() {
    try {
        const storedMode = window.localStorage.getItem(themeStorageKey);
        return themeModes.includes(storedMode) ? storedMode : 'auto';
    } catch (error) {
        return 'auto';
    }
}

function storeThemeMode(mode) {
    try {
        window.localStorage.setItem(themeStorageKey, mode);
    } catch (error) {
        // Ignore private browsing or locked storage.
    }
}

function setupMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('#site-navigation');

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';

        toggle.setAttribute('aria-expanded', String(!isOpen));
        menu.classList.toggle('is-open', !isOpen);
    });
}

function setupMatrixRain() {
    const canvas = document.querySelector('.matrix-rain');

    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const context = canvas.getContext('2d');
    const columns = [];
    let width = 0;
    let height = 0;
    let fontSize = 16;
    let frame = 0;
    let lastDraw = 0;

    function resize() {
        const ratio = window.devicePixelRatio || 1;

        width = window.innerWidth;
        height = window.innerHeight;
        fontSize = width < 560 ? 12 : 14;

        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.font = `${fontSize}px "Courier New", monospace`;

        columns.length = 0;

        for (let x = 0; x < width; x += fontSize * 0.9) {
            columns.push({
                x,
                y: Math.random() * -height,
                speed: fontSize * (0.38 + Math.random() * 0.52),
                resetOffset: 160 + Math.random() * 900,
                word: Math.random() < 0.24 ? pickRainWord() : ''
            });
        }
    }

    function draw(timestamp = 0) {
        if (timestamp - lastDraw < rainFrameDelay) {
            window.requestAnimationFrame(draw);
            return;
        }

        lastDraw = timestamp;
        frame += 1;

        const themeStyle = getComputedStyle(document.body);
        const rainFade = themeStyle.getPropertyValue('--rain-fade').trim() || 'rgba(1, 4, 2, 0.054)';
        const rainHead = themeStyle.getPropertyValue('--rain-head').trim() || '#f3fff6';
        const rainMid = themeStyle.getPropertyValue('--rain-mid').trim() || '#9dffb8';
        const rainBody = themeStyle.getPropertyValue('--rain-body').trim() || '#20f06b';
        const rainShadow = themeStyle.getPropertyValue('--rain-shadow').trim() || '#00ff6a';

        context.fillStyle = rainFade;
        context.fillRect(0, 0, width, height);
        context.font = `${fontSize}px "Courier New", monospace`;

        columns.forEach((column, index) => {
            const glyph = column.word ? column.word[Math.floor(frame / 2) % column.word.length] : pickRainGlyph();
            const isHead = (frame + index) % 9 === 0;

            context.fillStyle = isHead ? rainHead : index % 5 === 0 ? rainMid : rainBody;
            context.shadowColor = rainShadow;
            context.shadowBlur = isHead ? 22 : 8;
            context.fillText(glyph, column.x, column.y);

            if (column.y > height + column.resetOffset) {
                column.y = Math.random() * -height * 0.45;
                column.word = Math.random() < 0.3 ? pickRainWord() : '';
            } else {
                column.y += column.speed;
            }
        });

        window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
}

function pickRainGlyph() {
    return rainGlyphs[Math.floor(Math.random() * rainGlyphs.length)];
}

function pickRainWord() {
    return rainWords[Math.floor(Math.random() * rainWords.length)];
}

function getMatrixAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
        return null;
    }

    try {
        if (!matrixAudioContext) {
            matrixAudioContext = new AudioContextClass();
            matrixAudioGain = matrixAudioContext.createGain();
            matrixAudioGain.gain.value = 0.08;
            matrixAudioGain.connect(matrixAudioContext.destination);
        }

        if (matrixAudioContext.state === 'suspended') {
            matrixAudioContext.resume().catch(() => {});
        }

        return matrixAudioContext;
    } catch (error) {
        return null;
    }
}

function playMatrixTone(frequency, duration, options = {}) {
    const context = getMatrixAudio();

    if (!context || !matrixAudioGain) {
        return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const delay = options.delay || 0;
    const start = context.currentTime + delay;
    const volume = options.volume || 0.22;

    oscillator.type = options.type || 'square';
    oscillator.frequency.setValueAtTime(frequency, start);

    if (options.endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, options.endFrequency), start + duration);
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(matrixAudioGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
}

function playMatrixSound(kind) {
    if (kind === 'open') {
        playMatrixTone(110, 0.08, { type: 'sawtooth', volume: 0.12, endFrequency: 220 });
        playMatrixTone(440, 0.12, { delay: 0.06, type: 'triangle', volume: 0.16, endFrequency: 880 });
        return;
    }

    if (kind === 'shoot') {
        playMatrixTone(520, 0.07, { type: 'square', volume: 0.18, endFrequency: 180 });
        return;
    }

    if (kind === 'hit') {
        playMatrixTone(140, 0.14, { type: 'sawtooth', volume: 0.18, endFrequency: 70 });
        playMatrixTone(90, 0.16, { delay: 0.04, type: 'square', volume: 0.12 });
        return;
    }

    if (kind === 'collect') {
        playMatrixTone(660, 0.08, { type: 'triangle', volume: 0.14, endFrequency: 990 });
        playMatrixTone(1320, 0.08, { delay: 0.05, type: 'sine', volume: 0.08 });
        return;
    }

    if (kind === 'win') {
        [392, 523, 659, 784].forEach((note, index) => {
            playMatrixTone(note, 0.12, { delay: index * 0.07, type: 'triangle', volume: 0.14 });
        });
        return;
    }

    if (kind === 'lose') {
        playMatrixTone(220, 0.2, { type: 'sawtooth', volume: 0.16, endFrequency: 82 });
    }
}

function setupInternalGateway() {
    const form = document.querySelector('[data-access-form]');
    const status = document.querySelector('[data-access-status]');
    const clock = document.querySelector('[data-access-clock]');

    if (clock) {
        const updateClock = () => {
            const now = new Date();
            clock.textContent = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        };

        updateClock();
        window.setInterval(updateClock, 1000);
    }

    if (!form || !status) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const secretInput = form.querySelector('input[type="password"]');

        if (secretInput) {
            secretInput.value = '';
        }

        status.textContent = 'status: connection refused // trusted device certificate required';
        status.classList.add('is-denied');
        form.classList.remove('is-denied');
        void form.offsetWidth;
        form.classList.add('is-denied');
        playMatrixSound('hit');
    });
}

function setupMatrixGameEasterEgg() {
    const secretCode = 'rabbit';
    let typedCode = '';
    let labelClicks = 0;

    document.addEventListener('keydown', (event) => {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';

        if (document.body.classList.contains('matrix-game-open') || ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) {
            return;
        }

        if (event.key.length !== 1) {
            return;
        }

        typedCode = `${typedCode}${event.key.toLowerCase()}`.slice(-secretCode.length);

        if (typedCode === secretCode) {
            typedCode = '';
            launchMatrixGame();
        }
    });

    document.querySelectorAll('.eyebrow, .terminal-line').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            labelClicks += 1;

            if (labelClicks >= 3) {
                labelClicks = 0;
                launchMatrixGame();
            }
        });
    });
}

function launchMatrixGame() {
    if (document.querySelector('.matrix-game-overlay')) {
        return;
    }

    playMatrixSound('open');
    document.body.classList.add('matrix-game-open');

    const overlay = document.createElement('section');
    overlay.className = 'matrix-game-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'matrix-game-title');
    overlay.innerHTML = `
        <div class="matrix-game-terminal" tabindex="-1">
            <div class="matrix-game-bar">
                <span id="matrix-game-title">RABBIT_TANK.EXE</span>
                <button class="matrix-game-close" type="button" aria-label="Close game">x</button>
            </div>
            <div class="matrix-game-hud" aria-live="polite">
                <span data-game-score>nodes 0/7</span>
                <span data-game-lives>armor 3</span>
                <span data-game-status>dual screen link active</span>
            </div>
            <div class="matrix-game-layout">
                <canvas class="matrix-game-canvas" width="720" height="420" aria-label="Mini Matrix tank action game"></canvas>
                <aside class="matrix-game-radar" aria-hidden="true">
                    <span>RADAR</span>
                    <canvas class="matrix-radar-canvas" width="160" height="160"></canvas>
                    <span>LINK OK</span>
                </aside>
            </div>
            <p class="matrix-game-help">move: arrows / wasd &nbsp; fire: space &nbsp; collect nodes, break faults, avoid red tanks</p>
            <button class="matrix-game-restart" type="button">restart</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeButton = overlay.querySelector('.matrix-game-close');
    const restartButton = overlay.querySelector('.matrix-game-restart');
    const canvas = overlay.querySelector('.matrix-game-canvas');
    const radarCanvas = overlay.querySelector('.matrix-radar-canvas');
    const scoreOutput = overlay.querySelector('[data-game-score]');
    const livesOutput = overlay.querySelector('[data-game-lives]');
    const statusOutput = overlay.querySelector('[data-game-status]');
    const context = canvas.getContext('2d');
    const radarContext = radarCanvas.getContext('2d');
    const keys = new Set();
    const player = { x: 96, y: 96, size: 18, speed: 2.4, dirX: 1, dirY: 0, cooldown: 0, invulnerable: 0 };
    const bullets = [];
    const enemyBullets = [];
    const enemies = [];
    const nodes = [];
    const blocks = [];
    let score = 0;
    let lives = 3;
    let finished = false;
    let lastEnemyShot = 0;
    let animationFrame;

    function resizeGameCanvas() {
        const ratio = window.devicePixelRatio || 1;
        const bounds = canvas.getBoundingClientRect();

        canvas.width = Math.max(320, Math.floor(bounds.width * ratio));
        canvas.height = Math.max(240, Math.floor(bounds.height * ratio));
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function resetGame() {
        score = 0;
        lives = 3;
        finished = false;
        lastEnemyShot = 0;
        bullets.length = 0;
        enemyBullets.length = 0;
        enemies.length = 0;
        nodes.length = 0;
        blocks.length = 0;
        player.x = 96;
        player.y = 96;
        player.dirX = 1;
        player.dirY = 0;
        player.cooldown = 0;
        player.invulnerable = 0;
        seedArena();
        statusOutput.textContent = 'dual screen link active';
        updateHud();
        playMatrixSound('open');
    }

    function seedArena() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const blockSize = 32;
        const blockLayout = [
            [5, 2], [6, 2], [11, 2], [12, 2],
            [3, 5], [4, 5], [8, 5], [14, 5],
            [6, 8], [7, 8], [11, 8], [12, 8],
            [2, 10], [15, 10]
        ];

        blockLayout.forEach(([x, y]) => {
            const block = {
                x: Math.min(width - 48, x * 42),
                y: Math.min(height - 58, y * 32),
                w: blockSize,
                h: blockSize,
                hp: 2
            };

            if (!collidesCircleRect(player, block, 34)) {
                blocks.push(block);
            }
        });

        [
            [width - 92, 74],
            [width - 116, height - 78],
            [width * 0.52, height - 88],
            [width * 0.68, height * 0.42]
        ].forEach(([x, y], index) => {
            enemies.push({
                x,
                y,
                size: 18,
                dirX: index % 2 === 0 ? -1 : 0,
                dirY: index % 2 === 0 ? 0 : 1,
                drift: 0,
                cooldown: 40 + index * 18,
                hp: 2
            });
        });

        for (let i = 0; i < 7; i += 1) {
            nodes.push({
                x: 60 + Math.random() * (width - 120),
                y: 60 + Math.random() * (height - 120),
                size: 10,
                glyph: ['QQYY', 'ROOT', 'VEIL', 'PATH', 'GATE', 'WAKE', 'TRACE'][i]
            });
        }
    }

    function updateHud() {
        scoreOutput.textContent = `nodes ${score}/7`;
        livesOutput.textContent = `armor ${lives}`;
    }

    function closeGame() {
        window.cancelAnimationFrame(animationFrame);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('resize', resizeGameCanvas);
        document.body.classList.remove('matrix-game-open');
        overlay.remove();
    }

    function onKeyDown(event) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's', ' ', 'Escape'].includes(event.key)) {
            event.preventDefault();
        }

        if (event.key === 'Escape') {
            closeGame();
            return;
        }

        if (event.key === ' ' && player.cooldown <= 0 && !finished) {
            fireBullet(player, bullets, '#a7ffbd');
            player.cooldown = 22;
            statusOutput.textContent = 'pulse round fired';
            playMatrixSound('shoot');
        }

        keys.add(event.key.toLowerCase());
    }

    function onKeyUp(event) {
        keys.delete(event.key.toLowerCase());
    }

    function fireBullet(source, target, color) {
        target.push({
            x: source.x + source.dirX * (source.size + 4),
            y: source.y + source.dirY * (source.size + 4),
            dx: source.dirX || 1,
            dy: source.dirY || 0,
            speed: 5.4,
            size: 4,
            color
        });
    }

    function update(timestamp) {
        if (!finished) {
            movePlayer();
            moveEnemies(timestamp);
            moveBullets(bullets, true);
            moveBullets(enemyBullets, false);
            checkNodeCollisions();
            player.cooldown = Math.max(0, player.cooldown - 1);
            player.invulnerable = Math.max(0, player.invulnerable - 1);
        }

        drawGame();
        drawRadar();
        animationFrame = window.requestAnimationFrame(update);
    }

    function movePlayer() {
        let dx = 0;
        let dy = 0;

        if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
        if (keys.has('arrowright') || keys.has('d')) dx += 1;
        if (keys.has('arrowup') || keys.has('w')) dy -= 1;
        if (keys.has('arrowdown') || keys.has('s')) dy += 1;

        if (dx !== 0 || dy !== 0) {
            if (Math.abs(dx) > Math.abs(dy)) {
                player.dirX = Math.sign(dx);
                player.dirY = 0;
            } else {
                player.dirX = 0;
                player.dirY = Math.sign(dy);
            }
        }

        moveTank(player, dx, dy, player.speed);
    }

    function moveTank(tank, dx, dy, speed) {
        if (dx === 0 && dy === 0) {
            return;
        }

        const length = Math.hypot(dx, dy) || 1;
        const next = {
            ...tank,
            x: tank.x + (dx / length) * speed,
            y: tank.y + (dy / length) * speed
        };

        if (!isBlocked(next)) {
            tank.x = clamp(next.x, tank.size, canvas.clientWidth - tank.size);
            tank.y = clamp(next.y, tank.size, canvas.clientHeight - tank.size);
        }
    }

    function moveEnemies(timestamp) {
        enemies.forEach((enemy, index) => {
            enemy.drift -= 1;

            if (enemy.drift <= 0) {
                const options = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                const choice = options[Math.floor(Math.random() * options.length)];
                enemy.dirX = choice[0];
                enemy.dirY = choice[1];
                enemy.drift = 48 + Math.random() * 80;
            }

            moveTank(enemy, enemy.dirX, enemy.dirY, 1.1 + index * 0.08);

            if (timestamp - lastEnemyShot > 700 && Math.random() < 0.16) {
                aimAtPlayer(enemy);
                fireBullet(enemy, enemyBullets, '#ff6b6b');
                lastEnemyShot = timestamp;
            }
        });
    }

    function aimAtPlayer(enemy) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            enemy.dirX = Math.sign(dx) || 1;
            enemy.dirY = 0;
        } else {
            enemy.dirX = 0;
            enemy.dirY = Math.sign(dy) || 1;
        }
    }

    function moveBullets(items, fromPlayer) {
        for (let i = items.length - 1; i >= 0; i -= 1) {
            const bullet = items[i];
            bullet.x += bullet.dx * bullet.speed;
            bullet.y += bullet.dy * bullet.speed;

            if (bullet.x < -12 || bullet.y < -12 || bullet.x > canvas.clientWidth + 12 || bullet.y > canvas.clientHeight + 12) {
                items.splice(i, 1);
                continue;
            }

            const blockIndex = blocks.findIndex((block) => pointInRect(bullet.x, bullet.y, block));

            if (blockIndex >= 0) {
                blocks[blockIndex].hp -= 1;
                if (blocks[blockIndex].hp <= 0) {
                    blocks.splice(blockIndex, 1);
                    playMatrixSound('hit');
                }
                items.splice(i, 1);
                continue;
            }

            if (fromPlayer) {
                const enemyIndex = enemies.findIndex((enemy) => distance(bullet, enemy) < enemy.size);
                if (enemyIndex >= 0) {
                    enemies[enemyIndex].hp -= 1;
                    items.splice(i, 1);
                    playMatrixSound('hit');
                    if (enemies[enemyIndex].hp <= 0) {
                        enemies.splice(enemyIndex, 1);
                        statusOutput.textContent = 'fault tank erased';
                    }
                }
            } else if (distance(bullet, player) < player.size && player.invulnerable <= 0) {
                items.splice(i, 1);
                damagePlayer();
            }
        }
    }

    function checkNodeCollisions() {
        for (let i = nodes.length - 1; i >= 0; i -= 1) {
            if (distance(player, nodes[i]) < player.size + nodes[i].size + 4) {
                nodes.splice(i, 1);
                score += 1;
                statusOutput.textContent = score >= 7 ? 'rabbit path unlocked' : 'node synced';
                updateHud();
                playMatrixSound('collect');

                if (score >= 7) {
                    finished = true;
                    playMatrixSound('win');
                }
            }
        }

        enemies.forEach((enemy) => {
            if (distance(player, enemy) < player.size + enemy.size && player.invulnerable <= 0) {
                damagePlayer();
            }
        });
    }

    function damagePlayer() {
        lives -= 1;
        player.invulnerable = 70;
        statusOutput.textContent = lives <= 0 ? 'armor collapsed' : 'armor hit';
        updateHud();
        playMatrixSound('hit');

        if (lives <= 0) {
            finished = true;
            playMatrixSound('lose');
        }
    }

    function isBlocked(tank) {
        return blocks.some((block) => collidesCircleRect(tank, block, tank.size));
    }

    function collidesCircleRect(circle, rect, radius) {
        const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
        const closestY = clamp(circle.y, rect.y, rect.y + rect.h);

        return Math.hypot(circle.x - closestX, circle.y - closestY) < radius;
    }

    function pointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
    }

    function distance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function drawGame() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        context.clearRect(0, 0, width, height);
        context.fillStyle = 'rgba(0, 8, 3, 0.34)';
        context.fillRect(0, 0, width, height);
        drawArenaGrid(width, height);
        drawBlocks();
        drawNodes();
        drawBullets(bullets);
        drawBullets(enemyBullets);
        enemies.forEach((enemy) => drawTank(enemy, '#ff6060', '#ff2020'));
        drawTank(player, player.invulnerable % 8 < 4 ? '#a7ffbd' : '#f8d66d', '#00ff6a');

        if (finished) {
            context.fillStyle = 'rgba(0, 0, 0, 0.56)';
            context.fillRect(0, 0, width, height);
            context.fillStyle = score >= 7 ? '#a7ffbd' : '#ff6b6b';
            context.font = 'bold 28px "Courier New", monospace';
            context.textAlign = 'center';
            context.fillText(score >= 7 ? 'THE RABBIT PATH OPENS' : 'TANK LINK LOST', width / 2, height / 2 - 8);
            context.font = '15px "Courier New", monospace';
            context.fillText('press restart or esc', width / 2, height / 2 + 24);
            context.textAlign = 'start';
        }
    }

    function drawArenaGrid(width, height) {
        context.strokeStyle = 'rgba(0, 255, 106, 0.13)';
        context.lineWidth = 1;
        for (let x = 0; x < width; x += 32) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }
        for (let y = 0; y < height; y += 32) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }
    }

    function drawBlocks() {
        blocks.forEach((block) => {
            context.fillStyle = block.hp > 1 ? 'rgba(0, 255, 106, 0.18)' : 'rgba(248, 214, 109, 0.18)';
            context.strokeStyle = block.hp > 1 ? '#00ff6a' : '#f8d66d';
            context.shadowColor = context.strokeStyle;
            context.shadowBlur = 10;
            context.fillRect(block.x, block.y, block.w, block.h);
            context.strokeRect(block.x + 0.5, block.y + 0.5, block.w - 1, block.h - 1);
            context.shadowBlur = 0;
        });
    }

    function drawNodes() {
        context.font = 'bold 13px "Courier New", monospace';
        nodes.forEach((node) => {
            context.fillStyle = '#a7ffbd';
            context.shadowColor = '#00ff6a';
            context.shadowBlur = 16;
            context.beginPath();
            context.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            context.fill();
            context.fillText(node.glyph, node.x + 13, node.y + 4);
            context.shadowBlur = 0;
        });
    }

    function drawBullets(items) {
        items.forEach((bullet) => {
            context.fillStyle = bullet.color;
            context.shadowColor = bullet.color;
            context.shadowBlur = 12;
            context.fillRect(bullet.x - bullet.size, bullet.y - bullet.size, bullet.size * 2, bullet.size * 2);
            context.shadowBlur = 0;
        });
    }

    function drawTank(tank, color, glow) {
        context.save();
        context.translate(tank.x, tank.y);
        context.shadowColor = glow;
        context.shadowBlur = 16;
        context.fillStyle = color;
        context.strokeStyle = glow;
        context.lineWidth = 2;
        context.fillRect(-tank.size, -tank.size * 0.72, tank.size * 2, tank.size * 1.44);
        context.strokeRect(-tank.size, -tank.size * 0.72, tank.size * 2, tank.size * 1.44);
        context.fillStyle = 'rgba(0, 0, 0, 0.45)';
        context.fillRect(-tank.size * 0.78, -tank.size, tank.size * 0.42, tank.size * 2);
        context.fillRect(tank.size * 0.36, -tank.size, tank.size * 0.42, tank.size * 2);
        context.fillStyle = color;
        context.beginPath();
        context.arc(0, 0, tank.size * 0.52, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(tank.dirX * (tank.size + 16), tank.dirY * (tank.size + 16));
        context.stroke();
        context.restore();
    }

    function drawRadar() {
        const width = radarCanvas.width;
        const height = radarCanvas.height;
        const scaleX = width / canvas.clientWidth;
        const scaleY = height / canvas.clientHeight;

        radarContext.clearRect(0, 0, width, height);
        radarContext.fillStyle = 'rgba(0, 8, 3, 0.8)';
        radarContext.fillRect(0, 0, width, height);
        radarContext.strokeStyle = 'rgba(0, 255, 106, 0.28)';
        radarContext.strokeRect(0.5, 0.5, width - 1, height - 1);
        drawRadarDot(player, '#a7ffbd', 4, scaleX, scaleY);
        enemies.forEach((enemy) => drawRadarDot(enemy, '#ff6060', 3, scaleX, scaleY));
        nodes.forEach((node) => drawRadarDot(node, '#f8d66d', 2, scaleX, scaleY));
    }

    function drawRadarDot(item, color, size, scaleX, scaleY) {
        radarContext.fillStyle = color;
        radarContext.shadowColor = color;
        radarContext.shadowBlur = 8;
        radarContext.fillRect(item.x * scaleX - size / 2, item.y * scaleY - size / 2, size, size);
        radarContext.shadowBlur = 0;
    }

    closeButton.addEventListener('click', closeGame);
    restartButton.addEventListener('click', resetGame);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', resizeGameCanvas);
    resizeGameCanvas();
    resetGame();
    overlay.querySelector('.matrix-game-terminal').focus();
    animationFrame = window.requestAnimationFrame(update);
}
