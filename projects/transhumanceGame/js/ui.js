/* --- УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ И МЕНЮ --- */

function startFromMenu() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('intro-screen').classList.remove('hidden');
}

function startDemoMode() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    document.getElementById('main-menu').classList.add('hidden');
    startDayPhase();
}

const introSlides = [
    "Метель застала тебя в пути на станцию. Начало вечереть, а солнце уже опускалось за горизонт.<br>Ты замерзал в лесу, пока не набрел на старую башню смотрителя Ж/Д станции.",
    "В надежде, ты дернул ручку но дверь оказалась заперта. «Эй, есть кто дома!?», - ты крикнул и сильно постучал в дверь.",
    "Ты уже собрался было идти дальше, как внезапно, дверь открылась и в узкой щели дверного проема ты увидел красивую девушку в тулупе явно не её размера. «Эм, мне бы ...», - не успел ты закончить фразу, как дверь открылась и девушка, с силой втянула тебя внутрь",
    "Закрыв за тобой дверь, она забаррикадировала её тяжелыми ящиками и столом, а затем взяв тебя за руку поспешила наверх башни.",
    "Наверху ты застал страшную картину. Старик сидел возле кровати обтирая молодого юношу. который был перевязан бинтами, пропитанными кровью. «Кто там, Машка?» не оборачиваясь спросил старик.",
    "Прокашлявшись, ты решил представиться - «Здрасте, я тут заблудился, а еще эта метель....». Но не успел ты закончить, как с улицы донесся ужасающий вой...",
    "Старик обернулся на тебя, на его лице был страх, но в глазах виднелся огонь битвы. «Они приходят из леса», — говорит старик. — «Тени с красными глазами. Пули их не берут», Старик дает тебе кувалду, - «Им страшен только резонанс. Громкий звук металла дробит их сущность»"
];

let currentIntroIndex = 0;
document.getElementById('intro-text').innerHTML = introSlides[0];

function nextIntro() {
    currentIntroIndex++;
    if (currentIntroIndex === 5) playHowlSound();
    if (currentIntroIndex < introSlides.length) {
        document.getElementById('intro-text').innerHTML = introSlides[currentIntroIndex];
    } else {
        document.getElementById('intro-screen').classList.add('hidden');
        startTutorial1();
    }
}

let tutorial2Shown = false;
let currentTutorialStep = 0; 

function startTutorial1() {
    currentTutorialStep = 1;
    document.getElementById('tutorial-overlay').classList.remove('hidden');
    document.getElementById('tutorial-box').className = 'tutorial-box pos-rail';
    document.getElementById('tutorial-text').innerHTML = "Бей в сигнальную рельсу! <br>Им страшен только громкий звук, он дробит их сущность";
}

function showStaminaTutorial() {
    currentTutorialStep = 2;
    document.getElementById('tutorial-box').className = 'tutorial-box pos-stamina';
    document.getElementById('tutorial-text').innerHTML = "Бей только когда они рядом, иначе звук до них не достанет и ты потратишь силы впустую!";
}

function showHpTutorial() {
    currentTutorialStep = 3;
    document.getElementById('tutorial-box').className = 'tutorial-box pos-hp';
    document.getElementById('tutorial-text').innerHTML = "Если прочность двери опустится до минимума, то мы все обречены...";
}

function triggerTutorial2() {
    if (tutorial2Shown) return;
    tutorial2Shown = true;
    gameState.running = false; 
    currentTutorialStep = 4;
    document.getElementById('tutorial-overlay').classList.remove('hidden');
    document.getElementById('tutorial-box').className = 'tutorial-box pos-gen';
    document.getElementById('tutorial-text').innerHTML = "Машка — врубай генератор. <br>Свет их ненадолго задержит, а ты Гость, передохни, но не зевай! Свет не вечен — генератор ломается.";
}

function closeTutorial() {
    if (currentTutorialStep === 1) { showStaminaTutorial(); return; }
    if (currentTutorialStep === 2) { showHpTutorial(); return; }
    document.getElementById('tutorial-overlay').classList.add('hidden');
    if (!gameState.started) {
        startGame();
    } else {
        gameState.running = true;
        if (window.resetFrameTime) window.resetFrameTime(); 
        requestAnimationFrame(gameLoop);
    }
}

function updateUI() {
    document.getElementById('hp-bar').style.width = (gameState.hp / MAX_HP * 100) + '%';
    document.getElementById('stamina-bar').style.width = (gameState.stamina / MAX_STAMINA * 100) + '%';
}

function gameOver() {
    gameState.running = false;
    document.getElementById('game-over-screen').classList.remove('hidden');
}

function winGame() {
    gameState.running = false;
    playTrainSound();
    const train = document.getElementById('train');
    train.style.transition = 'left 2s linear';
    train.style.left = '2000px'; 
    gameState.enemies.forEach(e => { if(e.el) e.el.remove(); });
    document.getElementById('win-screen').classList.remove('hidden');
}