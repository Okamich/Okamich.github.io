/* --- НОЧНОЙ ЦИКЛ (ОБНОВЛЕННЫЙ) --- */

let lastFrameTime = 0;

window.resetFrameTime = function() {
    lastFrameTime = performance.now();
};

function startGame() {
    gameState.started = true;
    gameState.running = true;
    lastFrameTime = performance.now();
    
    // Обновляем счетчик ночи
    const nightHeader = document.getElementById('night-ui-header');
    if(nightHeader) nightHeader.innerText = "НОЧЬ " + gameState.currentDay;

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
    
    let type = 'normal';
    let speed = ENEMY_SPEED;
    let hp = 1;
    
    const rand = Math.random();
    const day = gameState.currentDay;

    if (day >= 2 && rand > 0.7) {
        if (day >= 3 && rand > 0.8) {
             type = 'heavy';
             speed = ENEMY_SPEED * 0.5; 
             hp = 2;
             enemyEl.classList.add('heavy');
        } else {
             type = 'small';
             speed = ENEMY_SPEED * 1.5; 
             enemyEl.classList.add('small');
        }
    }

    const startX = side === 'left' ? -50 : window.innerWidth + 50;
    
    const enemy = { 
        id: Date.now() + Math.random(), 
        el: enemyEl, 
        x: startX, 
        side: side, 
        dead: false,
        type: type,
        speed: speed,
        hp: hp,
        state: 'approach' 
    };
    
    enemyEl.style.left = startX + 'px';
    if (side === 'left') enemyEl.style.transform = 'scaleX(1)';
    else enemyEl.style.transform = 'scaleX(-1)';
    
    document.getElementById('game-container').appendChild(enemyEl);
    gameState.enemies.push(enemy);
}

function tryHit(e) {
    if (e.type === 'touchstart') e.preventDefault();
    if (!gameState.running) return;
    
    const cost = gameState.infStats ? 0 : STAMINA_COST;
    
    if (gameState.stamina >= cost) {
        gameState.stamina -= cost;
        updateUI();
        playMetalSound();

        const wave = document.createElement('div');
        wave.classList.add('sound-wave');
        wave.style.animation = 'shockwave 0.6s ease-out forwards';
        const railRect = document.getElementById('metal-rail').getBoundingClientRect();
        const hitX = railRect.left + railRect.width / 2;
        const hitY = railRect.bottom - 50;
        document.getElementById('game-container').appendChild(wave);
        setTimeout(() => wave.remove(), 600);

        for(let i=0; i<12; i++) {
            const p = document.createElement('div');
            p.classList.add('impact-particle');
            const angle = Math.random() * Math.PI * 2;
            const dist = 50 + Math.random() * 100;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            p.style.left = hitX + 'px';
            p.style.top = hitY + 'px';
            p.style.transition = 'all 0.5s ease-out';
            document.getElementById('game-container').appendChild(p);
            requestAnimationFrame(() => {
                p.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
                p.style.opacity = '0';
            });
            setTimeout(() => p.remove(), 500);
        }

        const currentRange = BASE_SOUND_RANGE * gameState.railPower; 
        gameState.waves.push({
            id: Date.now(),
            timer: 0,
            duration: 0.6, 
            maxRadius: currentRange,
            hitList: [] 
        });
    }
}

function toggleGenerator() {
    if (!gameState.running) return;

    if (gameState.genBroken) {
        if (gameState.infStats || gameState.inventory.batteries > 0) {
            if(!gameState.infStats) gameState.inventory.batteries--;
            gameState.genTimer = 0; 
            gameState.genBroken = false;
            document.getElementById('generator').classList.remove('broken');
            document.getElementById('generator').innerText = "⚡";
            const feedback = document.createElement('div');
            feedback.innerText = gameState.infStats ? "DEV FIX" : "-1 БАТАРЕЯ";
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
    
    if (gameState.guyActive) {
        gameState.genTimer = GEN_COOLDOWN * 0.5; 
    } else {
        gameState.genTimer = GEN_COOLDOWN; 
    }
}

function damageTower() {
    if (gameState.infStats) return; 
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
        gameState.stamina += (STAMINA_REGEN * gameState.staminaRegenMod) * fpsScale;
    }

    if (gameState.genBroken) {
        gameState.genTimer -= dt * 1000; 
        if (gameState.genTimer <= 0) {
            gameState.genBroken = false;
            document.getElementById('generator').classList.remove('broken');
            document.getElementById('generator').innerText = "⚡";
        }
    }
    
    const debugLayer = document.getElementById('debug-layer');
    if (debugLayer) {
        debugLayer.innerHTML = ''; 
        
        const atkVis = document.getElementById('debug-vis-atk');
        if (atkVis) {
            const diam = debugRadiusAtk * 2;
            atkVis.style.width = diam + 'px';
            atkVis.style.height = diam + 'px';
        }
        const lightVis = document.getElementById('debug-vis-light');
        if (lightVis) {
            const diam = debugRadiusLight * 2;
            lightVis.style.width = diam + 'px';
            lightVis.style.height = diam + 'px';
        }
    }

    if (!gameState.waves) gameState.waves = [];
    gameState.waves.forEach(wave => {
        wave.timer += dt;
    });
    gameState.waves = gameState.waves.filter(w => w.timer < w.duration);

    const towerCenter = window.innerWidth / 2;

    gameState.waves.forEach(wave => {
        let t = wave.timer / wave.duration;
        let easeOut = 1 - Math.pow(1 - t, 3);
        let currentRadius = wave.maxRadius * easeOut;

        gameState.enemies.forEach(enemy => {
            if (enemy.dead) return;
            if (wave.hitList.includes(enemy.id)) return;

            const dist = Math.abs(enemy.x - towerCenter);
            
            if (dist < currentRadius) {
                wave.hitList.push(enemy.id);
                enemy.hp--;
                
                if (enemy.hp <= 0) {
                    enemy.dead = true;
                    enemy.el.style.backgroundColor = '#555';
                    enemy.el.style.transform += ' translateY(-20px) rotate(90deg)';
                    enemy.el.style.opacity = '0';
                    setTimeout(() => { if(enemy.el.parentNode) enemy.el.remove(); }, 500);
                } else {
                    enemy.el.classList.add('hit-flash');
                    setTimeout(() => enemy.el.classList.remove('hit-flash'), 100);
                    const pushBack = enemy.side === 'left' ? -20 : 20;
                    enemy.x += pushBack;
                }
            }
        });
    });

    let spawnRateBase = 100 - (60 - gameState.timeLeft); 
    if (spawnRateBase < 20) spawnRateBase = 20;
    let dayMultiplier = 1 + (gameState.currentDay * 0.2);
    
    if (Math.random() * 100 < ((100 / spawnRateBase) * dayMultiplier) * fpsScale) {
        spawnEnemy();
    }

    const isMobile = window.innerWidth <= 768;
    const towerWidth = isMobile ? 55 : 80;
    const barrierRadius = isMobile ? 100 : 150; 

    gameState.enemies.forEach((enemy) => {
        if (enemy.dead) return;
        const distToCenter = Math.abs(enemy.x - towerCenter);
        
        let blockedByLight = false;
        if (gameState.genActive && distToCenter <= barrierRadius) {
            blockedByLight = true;
        }

        let moveAmount = enemy.speed * fpsScale;

        if (enemy.type === 'small') {
            if (blockedByLight && enemy.state === 'approach') {
                enemy.state = 'flee';
            }
            if (enemy.state === 'flee') {
                if (distToCenter > barrierRadius + 250) {
                    enemy.state = 'approach';
                }
                if (enemy.side === 'left') {
                    enemy.x -= moveAmount * 1.5; 
                } else {
                    enemy.x += moveAmount * 1.5;
                }
                if (enemy.side === 'left') enemy.el.style.transform = 'scaleX(-1)';
                else enemy.el.style.transform = 'scaleX(1)';
            } else {
                if (enemy.side === 'left') {
                    if (enemy.x < towerCenter - towerWidth/2) enemy.x += moveAmount;
                    else damageTower();
                    enemy.el.style.transform = 'scaleX(1)';
                } else {
                    if (enemy.x > towerCenter + towerWidth/2) enemy.x -= moveAmount;
                    else damageTower();
                    enemy.el.style.transform = 'scaleX(-1)';
                }
            }
        } else {
            if (blockedByLight) {
                enemy.x += (Math.random() - 0.5) * 2; 
            } else {
                if (enemy.side === 'left') {
                    if (enemy.x < towerCenter - towerWidth/2) enemy.x += moveAmount;
                    else damageTower();
                } else {
                    if (enemy.x > towerCenter + towerWidth/2) enemy.x -= moveAmount;
                    else damageTower();
                }
            }
        }
        enemy.el.style.left = enemy.x + 'px';
    });

    gameState.enemies = gameState.enemies.filter(e => !e.dead || e.el.style.opacity !== '0');
    updateUI();
    
    if (gameState.hp > 0 && gameState.timeLeft > 0) {
        requestAnimationFrame(gameLoop);
    }
}

function gameOver() {
    if (gameState.infStats) return; 

    gameState.running = false;
    
    let title = "ОНИ ПРОРВАЛИСЬ";
    let desc = "Дверь сломана. ";
    
    if (!gameState.isGuyDead && gameState.guyActive) {
        desc += "Вы спрятались на чердаке. Внизу слышны крики Деда, Маши и парня. Вы один выжили, но какой ценой?";
    } else {
        desc += "Это конец. Вы пытались, но твари оказались сильнее. Никто не выжил.";
    }
    
    document.getElementById('go-title').innerText = title;
    document.getElementById('go-desc').innerText = desc;
    document.getElementById('game-over-screen').classList.remove('hidden');
}

function winGame() {
    gameState.running = false;
    playTrainSound();
    
    const train = document.getElementById('train');
    train.style.transition = 'left 2s linear';
    train.style.left = '2000px'; 
    gameState.enemies.forEach(e => { if(e.el) e.el.remove(); });
    
    const winScreen = document.getElementById('win-screen');
    const winTitle = document.getElementById('win-title');
    const winDesc = document.getElementById('win-desc');
    const nextBtn = document.getElementById('btn-next-day');
    
    if (gameState.currentDay >= FINAL_DAY) {
        winTitle.innerText = "ФИНАЛ: ПОЕЗД ПРИБЫЛ";
        nextBtn.style.display = 'none'; 
        
        let story = "";
        
        if (!gameState.isGuyDead) {
            if (gameState.preparationScore >= 12) {
                story = "Дед, Маша, окрепший парень и ты — все успели запрыгнуть в вагон. Запасов хватит до города. Вы справились.";
                winTitle.style.color = "#4caf50"; 
            } else {
                story = "Поезд замедлил ход. Припасов слишком мало для всех. Дед мрачно посмотрел на вас, сунул ружье в руки Маше и остался на перроне прикрывать отход. Вы уезжаете, глядя, как его фигуру окружают тени.";
                winTitle.style.color = "#ffeb3b"; 
            }
        } 
        else {
            if (gameState.funeralPerformed) {
                story = "Вы с Машей и Дедом погрузились в вагон. Сын покоится в земле, долг выполнен. Дед молчит, но он жив. Жизнь продолжается.";
                winTitle.style.color = "#ff9800"; 
            } else {
                story = "Поезд прибыл, но Дед отказался идти. 'Я не оставлю его гнить здесь одного', — сказал он, глядя на башню. Вы с Машей уехали вдвоем. Сквозь шум колес был слышен последний выстрел.";
                winTitle.style.color = "#607d8b"; 
            }
        }
        
        winDesc.innerText = story;
        
    } else {
        winTitle.innerText = "ПОЕЗД ПРОЕХАЛ";
        winDesc.innerText = "Звук гудка разогнал тварей. Вы дожили до утра. Но они вернутся.";
        nextBtn.style.display = 'inline-block';
    }

    winScreen.classList.remove('hidden');
}