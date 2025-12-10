/* --- НОЧНОЙ ЦИКЛ --- */

let lastFrameTime = 0;

window.resetFrameTime = function() {
    lastFrameTime = performance.now();
};

function startGame() {
    gameState.started = true;
    gameState.running = true;
    lastFrameTime = performance.now();
    gameLoop(lastFrameTime);
    
    const timerInterval = setInterval(() => {
        if (!gameState.running) return; 
        gameState.timeLeft--;
        document.getElementById('timer-display').innerText = `ДО ПОЕЗДА: ${gameState.timeLeft} сек`;
        if (gameState.timeLeft <= 0) {
            clearInterval(timerInterval);
            winGame();
        }
    }, 1000);
}

function spawnEnemy() {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const enemyEl = document.createElement('div');
    enemyEl.classList.add('enemy');
    const startX = side === 'left' ? -50 : window.innerWidth + 50;
    const enemy = { el: enemyEl, x: startX, side: side, dead: false };
    enemyEl.style.left = startX + 'px';
    if (side === 'left') enemyEl.style.transform = 'scaleX(1)';
    else enemyEl.style.transform = 'scaleX(-1)';
    document.getElementById('game-container').appendChild(enemyEl);
    gameState.enemies.push(enemy);
}

function tryHit(e) {
    if (e.type === 'touchstart') e.preventDefault();
    if (!gameState.running) return;
    
    if (gameState.stamina >= STAMINA_COST) {
        gameState.stamina -= STAMINA_COST;
        updateUI();
        playMetalSound();

        const wave = document.createElement('div');
        wave.classList.add('sound-wave');
        wave.style.animation = 'shockwave 0.5s ease-out forwards';
        document.getElementById('game-container').appendChild(wave);
        setTimeout(() => wave.remove(), 500);

        const towerX = window.innerWidth / 2;
        // Расчет радиуса с учетом прокачки
        const currentRange = BASE_SOUND_RANGE * gameState.railPower; 

        gameState.enemies.forEach(enemy => {
            if (enemy.dead) return;
            const dist = Math.abs(enemy.x - towerX);
            if (dist < currentRange) {
                enemy.dead = true;
                enemy.el.style.backgroundColor = '#555';
                enemy.el.style.transform += ' translateY(-20px) rotate(90deg)';
                enemy.el.style.opacity = '0';
                setTimeout(() => { if(enemy.el.parentNode) enemy.el.remove(); }, 500);
            }
        });
    }
}

function toggleGenerator() {
    if (!gameState.running) return;

    if (gameState.genBroken) {
        // Починка батарейкой
        if (gameState.inventory.batteries > 0) {
            gameState.inventory.batteries--;
            gameState.genTimer = 0; 
            gameState.genBroken = false;
            document.getElementById('generator').classList.remove('broken');
            document.getElementById('generator').innerText = "⚡";
            const feedback = document.createElement('div');
            feedback.innerText = "-1 БАТАРЕЯ";
            feedback.style.position = "absolute";
            feedback.style.bottom = "100px";
            feedback.style.left = "50%";
            feedback.style.color = "#4caf50";
            feedback.style.fontWeight = "bold";
            document.getElementById('game-container').appendChild(feedback);
            setTimeout(() => feedback.remove(), 1000);
        } else {
            const gen = document.getElementById('generator');
            gen.style.transform = "translateX(-50%) rotate(10deg)";
            setTimeout(() => gen.style.transform = "translateX(-50%) rotate(0deg)", 100);
        }
        return;
    }

    if (gameState.genActive) return; 

    gameState.genActive = true;
    document.getElementById('light-barrier').classList.add('active');
    
    setTimeout(() => {
        if(!gameState.running && gameState.timeLeft > 0) {} 
        breakGenerator();
    }, GEN_DURATION);
}

function breakGenerator() {
    gameState.genActive = false;
    gameState.genBroken = true;
    document.getElementById('light-barrier').classList.remove('active');
    const gen = document.getElementById('generator');
    gen.classList.add('broken');
    gen.innerText = "ЧИНЮ";
    gameState.genTimer = GEN_COOLDOWN;
}

function damageTower() {
    gameState.hp -= 0.5; 
    if (gameState.hp <= 0) gameOver();
    if (Math.random() > 0.8) {
        const towerEl = document.getElementById('tower');
        towerEl.style.borderColor = 'red';
        setTimeout(() => towerEl.style.borderColor = '#111', 100);
    }
}

function gameLoop(timestamp) {
    if (!gameState.running) {
        lastFrameTime = timestamp; 
        return;
    }

    if (!timestamp) timestamp = performance.now();
    let dt = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;
    if (dt > 0.1 || dt < 0) dt = 0.016; 
    const fpsScale = dt * 60; 

    if (gameState.stamina <= 20 && typeof triggerTutorial2 !== 'undefined') {
         triggerTutorial2();
    }
    if (!gameState.running) return;

    if (gameState.stamina < MAX_STAMINA) {
        gameState.stamina += STAMINA_REGEN * fpsScale;
    }

    if (gameState.genBroken) {
        gameState.genTimer -= dt * 1000; 
        if (gameState.genTimer <= 0) {
            gameState.genBroken = false;
            document.getElementById('generator').classList.remove('broken');
            document.getElementById('generator').innerText = "⚡";
        }
    }
    
    let spawnRate = 100 - (60 - gameState.timeLeft); 
    if (spawnRate < 20) spawnRate = 20;
    if (Math.random() * 100 < ((100 / spawnRate) + 1) * fpsScale) {
        spawnEnemy();
    }

    const towerCenter = window.innerWidth / 2;
    const isMobile = window.innerWidth <= 768;
    const towerWidth = isMobile ? 55 : 80;
    const barrierRadius = isMobile ? 100 : 150; 

    gameState.enemies.forEach((enemy, index) => {
        if (enemy.dead) return;
        const distToCenter = Math.abs(enemy.x - towerCenter);
        
        let blockedByLight = false;
        if (gameState.genActive && distToCenter <= barrierRadius) blockedByLight = true;

        if (!blockedByLight) {
            const moveAmount = ENEMY_SPEED * fpsScale;
            if (enemy.side === 'left') {
                if (enemy.x < towerCenter - towerWidth/2) enemy.x += moveAmount;
                else damageTower();
            } else {
                if (enemy.x > towerCenter + towerWidth/2) enemy.x -= moveAmount;
                else damageTower();
            }
            enemy.el.style.left = enemy.x + 'px';
        }
    });

    gameState.enemies = gameState.enemies.filter(e => !e.dead || e.el.style.opacity !== '0');
    updateUI();
    
    if (gameState.hp > 0 && gameState.timeLeft > 0) {
        requestAnimationFrame(gameLoop);
    }
}