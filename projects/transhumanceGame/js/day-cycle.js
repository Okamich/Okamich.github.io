/* --- ДНЕВНОЙ ЦИКЛ --- */

function startDayPhase() {
    gameState.running = false;
    gameState.dayMode = true;
    gameState.dayPhase = 0; 
    gameState.enemies = []; 
    
    document.getElementById('win-screen').classList.add('hidden');
    document.getElementById('night-layer').classList.add('hidden');
    document.getElementById('ui-layer').classList.add('hidden'); 
    document.getElementById('day-screen').classList.remove('hidden');
    
    updateDayHeader();
}

function updateDayHeader() {
    const phases = ["УТРО", "ПОЛДЕНЬ", "ВЕЧЕР"];
    const phaseName = phases[gameState.dayPhase];
    document.getElementById('day-ui-header').innerText = `ДЕНЬ ${gameState.currentDay}: ${phaseName}`;
}

function endDay() {
    gameState.dayMode = false;
    gameState.currentDay++;
    gameState.timeLeft = GAME_DURATION; 
    
    document.getElementById('day-screen').classList.add('hidden');
    document.getElementById('night-layer').classList.remove('hidden');
    document.getElementById('ui-layer').classList.remove('hidden');
    
    const train = document.getElementById('train');
    train.style.transition = 'none';
    train.style.left = '-2000px';

    startGame(); 
}