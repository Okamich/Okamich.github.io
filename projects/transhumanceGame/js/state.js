/* --- КОНФИГУРАЦИЯ И ГЛОБАЛЬНОЕ СОСТОЯНИЕ --- */

const GAME_DURATION = 60; 
const MAX_HP = 100;
const MAX_STAMINA = 100;
const STAMINA_COST = 25;
const STAMINA_REGEN = 0.1; 
const ENEMY_SPEED = 1.5;
const BASE_SOUND_RANGE = 300; 
const GEN_DURATION = 5000; 
const GEN_COOLDOWN = 10000; 
const LIGHT_RADIUS = 150; 
const FINAL_DAY = 5; 

let gameState = {
    started: false,
    running: false,
    dayMode: false,
    currentDay: 1,  
    dayPhase: 0, 
    hp: MAX_HP,
    stamina: MAX_STAMINA,
    timeLeft: GAME_DURATION,
    enemies: [],
    lastSpawn: 0,
    genActive: false,
    genBroken: false,
    genTimer: 0,
    
    railPower: 1.0, 
    inventory: {
        batteries: 0 
    },
    
    healsDone: 0,         
    guyActive: false,     
    extraActionUsed: false, 
    
    healedToday: false,   
    daysIgnored: 0,       
    isGuyDead: false,     
    funeralPerformed: false, 
    preparationScore: 0,  

    staminaRegenMod: 1.0, 
    
    waves: [],
    
    // DEBUG FLAGS
    debugMode: false, // Глобальный флаг дебага (для отображения кнопки)
    infStats: false,  // Бесконечные HP и Stamina
    infAP: false,     // Бесконечные очки действий днем
    testMinigameMode: false // Активен ли режим теста МГ
};

// Переменные для визуализации дебаг радиусов
let debugRadiusAtk = BASE_SOUND_RANGE;
let debugRadiusLight = LIGHT_RADIUS;