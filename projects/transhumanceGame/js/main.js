/* --- ИНИЦИАЛИЗАЦИЯ --- */
window.onload = function() {
    console.log("Игра загружена");

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
    
    window.addEventListener('resize', () => { });
};