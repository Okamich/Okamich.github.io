/* --- ЛОГИКА МИНИ-ИГР (FINAL v6 - Debug Update) --- */

let currentActivityType = '';

function startActivity(type, isTestMode = false) {
    const oldHeader = document.getElementById('scavenge-header');
    if (oldHeader) oldHeader.remove();

    currentActivityType = type;
    gameState.testMinigameMode = isTestMode; // Установка флага теста
    
    document.getElementById('mini-game-modal').classList.remove('hidden');
    document.getElementById('mg-close-btn').classList.add('hidden');
    
    let titleText = "АКТИВНОСТЬ";
    if (isTestMode) titleText += " (ТЕСТ)";
    document.getElementById('mg-title').innerText = titleText;
    
    document.getElementById('mg-desc').innerText = "Описание задачи";

    const area = document.getElementById('mg-area');
    area.innerHTML = ''; 
    area.style.transform = "none"; 

    if (type === 'scavenge') initScavenge(area);
    else if (type === 'upgrade') initUpgrade(area);
    else if (type === 'repair') initUpgrade(area);
    else if (type === 'heal') initHeal(area);
    else if (type === 'rest') initRest(area);
    else if (type === 'funeral') initRest(area);
}

// --- ПОИСК ---
function initScavenge(area) {
    document.getElementById('mg-title').innerText = "ПОИСК";
    document.getElementById('mg-desc').innerText = "Найди предметы из списка сверху";
    
    const targets = [
        { shape: 'square', color: '#ffeb3b', found: false },
        { shape: 'circle', color: '#f44336', found: false },
        { shape: 'triangle', color: '#2196f3', found: false }
    ];

    const header = document.createElement('div');
    header.id = 'scavenge-header';
    header.style.marginBottom = "10px"; 
    
    targets.forEach((t, i) => {
        const div = document.createElement('div');
        div.className = 'target-preview';
        div.style.backgroundColor = t.shape === 'triangle' ? 'transparent' : t.color;
        if(t.shape === 'triangle') {
             div.style.width = '0'; div.style.height = '0';
             div.style.borderLeft = '5px solid transparent';
             div.style.borderRight = '5px solid transparent';
             div.style.borderBottom = '10px solid ' + t.color;
        } else if (t.shape === 'circle') div.style.borderRadius = '50%';
        div.id = `target-${i}`;
        header.appendChild(div);
    });

    const descEl = document.getElementById('mg-desc');
    descEl.parentNode.insertBefore(header, descEl);

    const light = document.createElement('div');
    light.id = 'flashlight';
    area.appendChild(light);
    
    const moveHandler = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = area.getBoundingClientRect();
        light.style.left = (clientX - rect.left) + 'px';
        light.style.top = (clientY - rect.top) + 'px';
        if(e.type === 'touchmove') e.preventDefault();
    };
    area.addEventListener('mousemove', moveHandler);
    area.addEventListener('touchmove', moveHandler);

    for(let i=0; i<15; i++) createObject(true);
    targets.forEach((t, index) => createObject(false, t, index));

    function createObject(isTrash, targetData = null, index = -1) {
        const item = document.createElement('div');
        item.className = 'scav-obj';
        item.style.left = Math.random() * 250 + 20 + 'px';
        item.style.top = Math.random() * 200 + 60 + 'px';
        item.style.transform = `rotate(${Math.random()*360}deg)`;

        let shape, color;
        if (isTrash) {
            const shapes = ['shape-square', 'shape-circle', 'shape-triangle'];
            shape = shapes[Math.floor(Math.random() * shapes.length)];
            const colors = ['#555', '#777', '#3e2723', '#4e342e']; 
            color = colors[Math.floor(Math.random() * colors.length)];
        } else {
            shape = `shape-${targetData.shape}`;
            color = targetData.color;
        }
        item.classList.add(shape);
        if (shape === 'shape-triangle') {
            item.style.borderBottomColor = color;
            item.style.color = color;
        } else item.style.background = color;

        item.onclick = function() {
            if (isTrash) {
                area.style.transform = "translateX(5px)";
                setTimeout(()=> area.style.transform = "translateX(0)", 50);
                return;
            }
            this.remove();
            targets[index].found = true;
            const targetEl = document.getElementById(`target-${index}`);
            if(targetEl) targetEl.classList.add('found');
            
            if (targets.every(t => t.found)) finishMiniGame("Найдено: Батарейки и припасы.");
        };
        area.appendChild(item);
    }
}

// --- ГАЙКИ ---
function initUpgrade(area) {
    const title = currentActivityType === 'repair' ? "РЕМОНТ" : "СОРТИРОВКА";
    document.getElementById('mg-title').innerText = title;
    document.getElementById('mg-desc').innerText = "Собери гайки одного цвета на болтах";
    const container = document.createElement('div');
    container.className = 'bolt-container';
    const cols = [];
    let selectedNut = null;

    for(let i=0; i<3; i++) {
        const col = document.createElement('div');
        col.className = 'bolt-column';
        col.onclick = () => handleColClick(i);
        container.appendChild(col);
        cols.push(col);
    }
    area.appendChild(container);

    const startConfig = [['red', 'blue', 'red'], ['blue', 'red', 'blue'], []];
    startConfig.forEach((nuts, colIdx) => {
        nuts.forEach(color => {
            const nut = document.createElement('div');
            nut.className = `nut ${color}`;
            nut.dataset.color = color;
            cols[colIdx].appendChild(nut);
        });
    });

    function handleColClick(idx) {
        const col = cols[idx];
        const topNut = col.lastElementChild;
        if (!selectedNut) {
            if (topNut) { selectedNut = topNut; selectedNut.classList.add('selected'); }
        } else {
            if (selectedNut.parentNode === col) { selectedNut.classList.remove('selected'); selectedNut = null; return; }
            if (col.children.length >= 4) return;
            col.appendChild(selectedNut);
            selectedNut.classList.remove('selected');
            selectedNut = null;
            checkWin();
        }
    }

    function checkWin() {
        let completedCols = 0;
        cols.forEach(col => {
            if (col.children.length === 3) {
                const c1 = col.children[0].dataset.color;
                const c2 = col.children[1].dataset.color;
                const c3 = col.children[2].dataset.color;
                if (c1 === c2 && c2 === c3) completedCols++;
            }
        });
        if (completedCols >= 2) {
            const winMsg = currentActivityType === 'repair' 
                ? "Дверь укреплена! Прочность восстановлена." 
                : "Рельс настроен! Радиус удара увеличен.";
            finishMiniGame(winMsg);
        }
    }
}

// --- СИНТЕЗ ---
function initHeal(area) {
    document.getElementById('mg-title').innerText = "СИНТЕЗ";
    document.getElementById('mg-desc').innerText = "Налей ровно 4л в колбу A (5л).";
    const table = document.createElement('div');
    table.className = 'lab-table';
    let a = 0, b = 0;
    let selectedSource = null;

    const tap = document.createElement('div');
    tap.className = 'lab-tool icon-tap';
    tap.onclick = () => selectSource('tap', tap);
    
    const sink = document.createElement('div');
    sink.className = 'lab-tool icon-sink';
    sink.onclick = () => {
        if (selectedSource === 'flaskA') a = 0;
        else if (selectedSource === 'flaskB') b = 0;
        resetSelection(); updateView();
    };

    const fA = createFlask("A (5л)", 5);
    const fB = createFlask("B (3л)", 3);
    const targetLine = document.createElement('div');
    targetLine.className = 'target-line';
    targetLine.style.bottom = (4/5)*100 + '%';
    fA.appendChild(targetLine);

    table.append(tap, fA, fB, sink);
    area.appendChild(table);

    const statusText = document.createElement('div');
    statusText.id = 'heal-status';
    statusText.style.fontSize = '12px';
    statusText.style.marginTop = '10px';
    statusText.innerText = "Нажми КРАН, затем КОЛБУ.";
    area.appendChild(statusText);

    function createFlask(name, max) {
        const f = document.createElement('div');
        f.className = 'flask'; f.dataset.name = name;
        const liq = document.createElement('div');
        liq.className = 'liquid';
        const lbl = document.createElement('div');
        lbl.className = 'flask-label';
        f.append(liq, lbl);
        f.onclick = () => handleFlaskClick(f, max);
        return f;
    }

    function selectSource(src, el) {
        if (selectedSource === 'tap') tap.classList.remove('selected');
        if (selectedSource === 'flaskA') fA.classList.remove('selected');
        if (selectedSource === 'flaskB') fB.classList.remove('selected');
        selectedSource = src;
        if(el) el.classList.add('selected');
        if(src === 'tap') statusText.innerText = "Выбран КРАН. Нажми колбу чтобы налить.";
        else statusText.innerText = `Выбрана колба. Нажми другую для перелива или СЛИВ.`;
    }

    function resetSelection() {
        if (selectedSource === 'tap') tap.classList.remove('selected');
        if (selectedSource === 'flaskA') fA.classList.remove('selected');
        if (selectedSource === 'flaskB') fB.classList.remove('selected');
        selectedSource = null;
        statusText.innerText = "Выбери источник (КРАН или КОЛБУ).";
    }

    function handleFlaskClick(el, max) {
        const isA = el === fA;
        if (selectedSource === 'tap') {
            if (isA) a = 5; else b = 3;
            resetSelection();
        } else if (selectedSource === null) {
            if (isA && a === 0) return; if (!isA && b === 0) return;
            selectSource(isA ? 'flaskA' : 'flaskB', el);
            return;
        } else if ((selectedSource === 'flaskA' && isA) || (selectedSource === 'flaskB' && !isA)) {
            resetSelection(); return;
        } else if (selectedSource === 'flaskA' && !isA) { 
            const spaceB = 3 - b; const pour = Math.min(a, spaceB);
            a -= pour; b += pour; resetSelection();
        } else if (selectedSource === 'flaskB' && isA) { 
            const spaceA = 5 - a; const pour = Math.min(b, spaceA);
            b -= pour; a += pour; resetSelection();
        }
        updateView();
    }

    function updateView() {
        updateFlask(fA, a, 5, "A"); updateFlask(fB, b, 3, "B");
        if (a === 4) finishMiniGame("Синтез завершен! Лекарство введено.");
    }
    function updateFlask(el, val, max, label) {
        el.querySelector('.liquid').style.height = (val / max * 100) + '%';
        el.querySelector('.flask-label').innerText = `${label} [${val}/${max}]`;
    }
    updateView();
}

// --- РЮКЗАК / ПОХОРОНЫ ---
function initRest(area) {
    const isFuneral = currentActivityType === 'funeral';
    document.getElementById('mg-title').innerText = isFuneral ? "ПОХОРОНЫ" : "РЮКЗАК";
    document.getElementById('mg-desc').innerText = isFuneral ? "Подготовь место в мерзлой земле..." : "Заполни ВСЕ ячейки";
    
    const gridDiv = document.createElement('div');
    gridDiv.className = 'inv-grid';
    const grid = [];
    
    for(let i=0; i<16; i++) {
        const cell = document.createElement('div');
        cell.className = 'inv-cell';
        cell.onclick = () => handleGridClick(i);
        gridDiv.appendChild(cell);
        grid.push({ occupied: false, itemId: null, el: cell });
    }
    area.appendChild(gridDiv);

    const items = [
        { w:2, h:2, id:'big', placed:false },
        { w:2, h:1, id:'med1', placed:false }, { w:2, h:1, id:'med2', placed:false },
        { w:2, h:1, id:'med3', placed:false }, { w:2, h:1, id:'med4', placed:false },
        { w:1, h:1, id:'sml1', placed:false }, { w:1, h:1, id:'sml2', placed:false },
        { w:1, h:1, id:'sml3', placed:false }, { w:1, h:1, id:'sml4', placed:false }
    ];
    let selectedItem = null;
    const pool = document.createElement('div');
    pool.className = 'inv-items-pool';
    
    function renderPool() {
        pool.innerHTML = '';
        items.forEach(it => {
            if(it.placed) return;
            const div = document.createElement('div');
            div.className = 'inv-item-source';
            if(isFuneral) div.style.backgroundColor = "#5d4037"; 
            if (selectedItem === it) div.classList.add('selected');
            div.style.width = (it.w * 30) + 'px';
            div.style.height = (it.h * 30) + 'px';
            div.onclick = () => { selectedItem = it; renderPool(); };
            pool.appendChild(div);
        });
        if(grid.every(c => c.occupied)) {
            const msg = isFuneral ? "Тело предано земле. Светлая память." : "Вещи уложены! Восстановление сил быстрее.";
            finishMiniGame(msg);
        }
    }
    area.appendChild(pool);
    renderPool();

    function handleGridClick(idx) {
        const cellData = grid[idx];
        if (cellData.occupied) {
            const idToRemove = cellData.itemId;
            if (!idToRemove) return;
            grid.forEach(c => {
                if (c.itemId === idToRemove) {
                    c.occupied = false;
                    c.itemId = null;
                    c.el.classList.remove('filled');
                }
            });
            const itemObj = items.find(it => it.id === idToRemove);
            if (itemObj) itemObj.placed = false;
            renderPool();
        } else {
            tryPlace(idx);
        }
    }

    function tryPlace(idx) {
        if(!selectedItem) return;
        const row = Math.floor(idx / 4);
        const col = idx % 4;
        if (col + selectedItem.w > 4) return;
        if (row + selectedItem.h > 4) return;

        const cellsToOccupy = [];
        for(let r=0; r<selectedItem.h; r++) {
            for(let c=0; c<selectedItem.w; c++) {
                const targetIdx = (row+r)*4 + (col+c);
                if (grid[targetIdx].occupied) return;
                cellsToOccupy.push(grid[targetIdx]);
            }
        }
        cellsToOccupy.forEach(c => { 
            c.occupied = true; 
            c.itemId = selectedItem.id; 
            c.el.classList.add('filled'); 
            if(isFuneral) c.el.style.backgroundColor = "#3e2723"; 
        });
        selectedItem.placed = true;
        selectedItem = null;
        renderPool();
    }
}

function finishMiniGame(msg) {
    // В режиме теста мы ничего не меняем в стейте, только выводим алерт
    if (gameState.testMinigameMode) {
        alert("ТЕСТ: Победа! (Состояние игры не изменено)");
        document.getElementById('mini-game-modal').classList.add('hidden');
        return;
    }

    gameState.preparationScore++;

    if (currentActivityType === 'rest') {
        gameState.staminaRegenMod += 0.2;
        gameState.stamina = Math.min(gameState.stamina + 20, MAX_STAMINA);
        msg += " (+20% к скорости восст.)";
    } 
    else if (currentActivityType === 'heal') {
        gameState.healsDone++;
        gameState.healedToday = true;
        msg = `Лечение проведено (${gameState.healsDone}/3).`;
        if (gameState.healsDone >= 3 && !gameState.guyActive) {
            gameState.guyActive = true;
            msg = "Парень очнулся! Он поможет в обороне.";
            alert("СЮЖЕТ: Парень пришел в себя! Теперь он будет ускорять перезарядку генератора и помогать днем.");
        }
    }
    else if (currentActivityType === 'funeral') {
        gameState.funeralPerformed = true;
        msg = "Долг выполнен.";
    }
    else if (currentActivityType === 'upgrade') {
        gameState.railPower += 0.2; 
        msg += " (Радиус звука увеличен)";
    }
    else if (currentActivityType === 'scavenge') {
        gameState.inventory.batteries++;
        msg = "Найдены батарейки и припасы!";
    }
    else if (currentActivityType === 'repair') {
        gameState.hp = Math.min(gameState.hp + 30, MAX_HP);
        if(typeof updateUI === 'function') updateUI();
        msg = "Башня отремонтирована (+30 Прочности)";
    }
    
    const oldHeader = document.getElementById('scavenge-header');
    if (oldHeader) oldHeader.remove();

    document.getElementById('mg-desc').innerText = msg;
    document.getElementById('mg-area').innerHTML = "<div style='display:flex; justify-content:center; align-items:center; height:100%; font-size:60px;'>✅</div>"; 
    document.getElementById('mg-close-btn').classList.remove('hidden');
}

function closeMiniGame() {
    // Если тест - не меняем фазу дня
    if (gameState.testMinigameMode) {
        document.getElementById('mini-game-modal').classList.add('hidden');
        gameState.testMinigameMode = false;
        return;
    }

    const oldHeader = document.getElementById('scavenge-header');
    if (oldHeader) oldHeader.remove();

    document.getElementById('mini-game-modal').classList.add('hidden');
    if (gameState.started || gameState.currentDay > 0) { 
        
        if (gameState.guyActive && gameState.dayPhase === 1 && !gameState.extraActionUsed) {
            gameState.extraActionUsed = true;
            document.getElementById('day-ui-header').innerText += " (ДОП. ДЕЙСТВИЕ)";
            return;
        }

        gameState.dayPhase++;
        if (gameState.dayPhase > 2) endDay();
        else updateDayHeader();
    }
}