/* --- ИНИЦИАЛИЗАЦИЯ И ОТЛАДКА --- */
window.onload = function() {
    console.log("Игра загружена. Введите 'dm()' или просто 'dm' (если определено) в консоль для вызова дебаг-кнопки.");

    const railEl = document.getElementById('metal-rail');
    if (railEl) {
        railEl.addEventListener('mousedown', tryHit);
        railEl.addEventListener('touchstart', tryHit);
    }
    
    const genEl = document.getElementById('generator');
    if (genEl) {
        genEl.addEventListener('click', toggleGenerator);
        genEl.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            toggleGenerator();
        });
    }

    initSnow();
    
    // --- CHEAT CODE LISTENER (Клавиатура) ---
    let keySequence = '';
    window.addEventListener('keydown', (e) => {
        keySequence += e.key;
        if (keySequence.length > 5) keySequence = keySequence.slice(-5);
        if (keySequence.includes('dm')) {
            activateDebug();
            keySequence = '';
        }
    });

    window.addEventListener('resize', () => { });
};

// --- КОНСОЛЬНАЯ КОМАНДА ---
Object.defineProperty(window, 'dm', {
    get: function() {
        activateDebug();
        return "Debug Mode Enabled";
    }
});

function activateDebug() {
    document.getElementById('debug-toggle-btn').classList.remove('hidden');
    // Показываем кнопки в главном меню
    document.getElementById('btn-demo-mode').classList.remove('hidden');
    document.getElementById('btn-test-menu').classList.remove('hidden');
    console.log("Debug button and menu options visible!");
}

function initSnow() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement('div');
        flake.classList.add('snowflake');
        const size = Math.random() * 4 + 2 + 'px';
        flake.style.width = size;
        flake.style.height = size;
        flake.style.left = Math.random() * 100 + 'vw';
        const duration = Math.random() * 3 + 2 + 's'; 
        const delay = Math.random() * 5 + 's';
        flake.style.animationDuration = duration;
        flake.style.animationDelay = delay;
        container.appendChild(flake);
    }
}

/* --- DEBUG FUNCTIONS --- */
function toggleDebugMenu() {
    const menu = document.getElementById('debug-menu');
    menu.classList.toggle('hidden');
    document.getElementById('debug-day-input').value = gameState.currentDay;
}

function skipNight() {
    if (gameState.running) {
        gameState.timeLeft = 1;
    }
}

function skipDay() {
    if (gameState.dayMode) {
        endDay();
    }
}

function killAllEnemies() {
    gameState.enemies.forEach(e => {
        if(e.el) e.el.remove();
        e.dead = true;
    });
    gameState.enemies = [];
}

function toggleFlag(flag, value) {
    if (flag === 'guyActive') gameState.guyActive = value;
    if (flag === 'isGuyDead') gameState.isGuyDead = value;
    if (flag === 'infStats') {
        gameState.infStats = value;
        if (value) { gameState.hp = MAX_HP; gameState.stamina = MAX_STAMINA; updateUI(); }
    }
    if (flag === 'infAP') {
        gameState.infAP = value;
        if(gameState.dayMode) updateDayHeader();
    }
}

function toggleVisual(type, enabled) {
    const layer = document.getElementById('debug-layer');
    const id = `debug-vis-${type}`;
    let el = document.getElementById(id);
    
    if (enabled) {
        if (!el) {
            el = document.createElement('div');
            el.id = id;
            el.className = type === 'atk' ? 'debug-radius-attack' : 'debug-radius-light';
            layer.appendChild(el);
        }
        const rad = type === 'atk' ? debugRadiusAtk : debugRadiusLight;
        const diam = rad * 2;
        el.style.width = diam + 'px';
        el.style.height = diam + 'px';
    } else {
        if (el) el.remove();
    }
}

function setRadius(type, value) {
    if (type === 'atk') {
        debugRadiusAtk = parseInt(value);
        document.getElementById('val-atk').innerText = value;
        gameState.railPower = debugRadiusAtk / BASE_SOUND_RANGE;
    }
    if (type === 'light') {
        debugRadiusLight = parseInt(value);
        document.getElementById('val-light').innerText = value;
    }
    toggleVisual(type, true);
}

function setDay() {
    const val = parseInt(document.getElementById('debug-day-input').value);
    gameState.currentDay = val;
    if (gameState.dayMode) updateDayHeader();
}