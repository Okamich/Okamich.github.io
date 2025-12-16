/* --- ДНЕВНОЙ ЦИКЛ (ОБНОВЛЕННЫЙ) --- */

function startDayPhase() {
    gameState.running = false;
    gameState.dayMode = true;
    gameState.dayPhase = 0; 
    gameState.enemies = []; 
    gameState.waves = [];
    
    gameState.extraActionUsed = false;
    gameState.healedToday = false; 
    
    document.getElementById('win-screen').classList.add('hidden');
    document.getElementById('night-layer').classList.add('hidden');
    document.getElementById('ui-layer').classList.add('hidden'); 
    document.getElementById('day-screen').classList.remove('hidden');
    
    updateDayHeader();
}

function updateDayHeader() {
    const phases = ["УТРО", "ПОЛДЕНЬ", "ВЕЧЕР"];
    const phaseClasses = ["morning", "noon", "evening"];
    
    const phaseName = phases[gameState.dayPhase];
    const currentClass = phaseClasses[gameState.dayPhase];

    let headerText = `ДЕНЬ ${gameState.currentDay}: ${phaseName}`;
    if (gameState.guyActive && gameState.dayPhase === 1 && !gameState.extraActionUsed) {
         headerText += " (ПАРЕНЬ ПОМОГАЕТ: +1 ДЕЙСТВИЕ)";
    }
    if (gameState.infAP) {
        headerText += " [INF AP]";
    }

    document.getElementById('day-ui-header').innerText = headerText;
    
    const dayScreen = document.getElementById('day-screen');
    phaseClasses.forEach(c => dayScreen.classList.remove(c));
    dayScreen.classList.add(currentClass);

    const btnHeal = document.getElementById('btn-heal');
    if (btnHeal) {
        if (gameState.guyActive || gameState.isGuyDead) {
            btnHeal.style.display = 'none';
        } else {
            btnHeal.style.display = 'inline-block';
        }
    }

    const btnFuneral = document.getElementById('btn-funeral');
    if (btnFuneral) {
        if (gameState.isGuyDead && !gameState.funeralPerformed) {
            btnFuneral.classList.remove('hidden');
            btnFuneral.style.display = 'inline-block';
        } else {
            btnFuneral.classList.add('hidden');
            btnFuneral.style.display = 'none';
        }
    }

    const btnRepair = document.getElementById('btn-repair');
    if (btnRepair) {
        if (gameState.hp < MAX_HP) {
            btnRepair.classList.remove('hidden');
            btnRepair.style.display = 'inline-block'; 
        } else {
            btnRepair.classList.add('hidden');
            btnRepair.style.display = 'none';
        }
    }
    
    if (gameState.isGuyDead) {
        const guySprite = document.querySelector('.wounded-guy');
        if (guySprite) guySprite.style.display = 'none';
    }
}

function endDay() {
    if (!gameState.guyActive && !gameState.isGuyDead) {
        if (gameState.healedToday) {
            gameState.daysIgnored = 0; 
        } else {
            gameState.daysIgnored++; 
            if (gameState.daysIgnored >= 3) {
                gameState.isGuyDead = true;
                alert("СЮЖЕТ: Вы слышите плач Маши. Парень скончался от ран...");
            }
        }
    }

    gameState.dayMode = false;
    gameState.currentDay++;
    gameState.timeLeft = GAME_DURATION; 
    
    gameState.stamina = MAX_STAMINA; 
    gameState.genBroken = false;     
    gameState.genActive = false;     
    gameState.genTimer = 0;
    
    const genEl = document.getElementById('generator');
    if (genEl) {
        genEl.classList.remove('broken');
        genEl.innerText = "⚡";
    }
    const barrier = document.getElementById('light-barrier');
    if (barrier) barrier.classList.remove('active');
    
    if (typeof updateUI === 'function') updateUI();

    document.getElementById('day-screen').classList.add('hidden');
    
    // ВМЕСТО ПРЯМОГО ЗАПУСКА ПОКАЗЫВАЕМ ЭКРАН ПЕРЕХОДА
    showNightStartScreen();
}