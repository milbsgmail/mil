// --- 1. Переменные и инициализация ---
let gold = 0, gPerClick = 1, upCost = 15, curQIdx = 0, actQs = [], usedPromos = [], isUltRdy = false, isUltAct = false, ultMult = 1, lastBox = 0;
let onlinePlayers = [{ name: "Magician_BS", gold: 95400 }, { name: "CyberLeon", gold: 82100 }, { name: "BrawlMaster", gold: 74500 }];

const defBrawlers = [
    { name: "Шелли", level: 1, baseCost: 10, bonus: 1, bonus_passive: 2, icon: "🤠", rarity: "rare" },
    { name: "Кольт", level: 1, baseCost: 35, bonus: 2, bonus_passive: 5, icon: "🔫", rarity: "epic" },
    { name: "Нита", level: 1, baseCost: 80, bonus: 4, bonus_passive: 12, icon: "🐻", rarity: "epic" },
    { name: "Леон", level: 1, baseCost: 250, bonus: 10, bonus_passive: 35, icon: "🦎", rarity: "legendary" }
];
let brawlers = JSON.parse(JSON.stringify(defBrawlers));

const allQs = [
    { question: "Кто начальный боец в Brawl Stars?", answers: ["Шелли", "Кольт", "Нита"], correct: 0 },
    { question: "Какая редкость у Леона?", answers: ["Редкий", "Эпический", "Легендарный"], correct: 2 },
    { question: "Какая валюта используется для покупки Шахты в нашей игре?", answers: ["Кристаллы", "Золото", "Стар Поинты"], correct: 1 },
    { question: "Какое животное вызывает Нита своим Супером?", answers: ["Медведь", "Собака", "Хамелеон"], correct: 0 },
    { question: "Какое максимальное количество вопросов в нашей викторине?", answers: ["3", "10", "5"], correct: 2 }
];

// --- 2. Получение элементов DOM ---
const counter = document.getElementById('gold-count'),
      clickPowerTxt = document.getElementById('click-power'),
      cpsDisplay = document.getElementById('cps-display'),
      upgradeBtn = document.getElementById('upgrade-btn'),
      clickActionBtn = document.getElementById('click-action-btn'),
      quizBtn = document.getElementById('quiz-btn'),
      brawlerBtn = document.getElementById('brawler-btn'),
      clickBtn = document.getElementById('click-btn'),
      topBtn = document.getElementById('top-btn'),
      quizSection = document.getElementById('quiz-section'),
      clickSection = document.getElementById('click-section'),
      brawlersSection = document.getElementById('brawlers-section'),
      topSection = document.getElementById('top-section'),
      brawlersList = document.getElementById('brawlers-list'),
      questionText = document.getElementById('questionText'),
      answersBlock = document.getElementById('answersBlock'),
      promoInput = document.getElementById('promo-input'),
      promoBtn = document.getElementById('promo-btn'),
      promoMsg = document.getElementById('promo-msg'),
      resetProgressBtn = document.getElementById('reset-progress-btn'),
      megaboxBtn = document.getElementById('megabox-btn'),
      ultTimer = document.getElementById('ult-timer'),
      alertContainer = document.getElementById('custom-alert-container');

// --- 3. Сохранение / Загрузка прогресса ---
function saveGame() { 
    localStorage.setItem('brawlClubSave', JSON.stringify({ gold, gPerClick, upCost, usedPromos, brawlers: brawlers.map(b => ({ name: b.name, level: b.level })), onlinePlayers, lastBox })); 
}

function loadGame() {
    const saved = localStorage.getItem('brawlClubSave'); 
    if (!saved) { updateUI(); return; }
    try {
        const d = JSON.parse(saved);
        if (d.gold !== undefined) gold = d.gold; 
        if (d.gPerClick !== undefined) gPerClick = d.gPerClick; 
        if (d.upCost !== undefined) upCost = d.upCost; 
        if (d.usedPromos !== undefined) usedPromos = d.usedPromos; 
        if (d.onlinePlayers !== undefined) onlinePlayers = d.onlinePlayers; 
        if (d.lastBox !== undefined) lastBox = d.lastBox;
        if (d.brawlers !== undefined) {
            d.brawlers.forEach(sb => { 
                const ib = brawlers.find(b => b.name === sb.name); 
                if (ib) ib.level = sb.level; 
            });
        }
    } catch (e) { console.error(e); } 
    updateUI();
}

// --- 4. Кастомные Уведомления (BrawlAlert) ---
function showBrawlAlert(m) {
    if (!alertContainer) return; 
    const b = document.createElement('div'); 
    b.className = 'brawl-alert'; 
    b.innerText = m; 
    alertContainer.appendChild(b);
    setTimeout(() => { 
        b.style.opacity = '0'; 
        b.style.transform = 'translateY(-20px)'; 
        b.style.transition = 'all 0.4s'; 
        setTimeout(() => b.remove(), 400); 
    }, 3000);
}

// --- 5. Навигация (Вкладки) ---
function switchTab(s) { 
    [quizSection, clickSection, brawlersSection, topSection].forEach(x => { if(x) x.style.display = 'none'; }); 
    if(s) s.style.display = 'block'; 
}
if(clickBtn) clickBtn.addEventListener('click', () => switchTab(clickSection));
if(brawlerBtn) brawlerBtn.addEventListener('click', () => { switchTab(brawlersSection); renderBrawlers(); });
if(quizBtn) quizBtn.addEventListener('click', () => { switchTab(quizSection); initQuiz(); });
if(topBtn) topBtn.addEventListener('click', () => { switchTab(topSection); renderLeaderboard(); });

// --- 6. Экономические Расчеты и Интерфейс ---
function getBClick() { return brawlers.reduce((s, b) => s + (b.level > 1 ? (b.level - 1) * b.bonus : 0), 0); }
function getBPass() { return brawlers.reduce((s, b) => s + (b.level > 1 ? (b.level - 1) * b.bonus_passive : 0), 0); }

function updateUI() {
    if (counter) counter.textContent = Math.floor(gold); 
    if (clickPowerTxt) clickPowerTxt.textContent = (gPerClick + getBClick()) * ultMult;
    if (cpsDisplay) cpsDisplay.textContent = `В секунду: +${getBPass()} золота`; 
    if (upgradeBtn) upgradeBtn.textContent = `Купить Шахту (Цена: ${upCost} золота)`;
}

// Пассивный доход раз в секунду
setInterval(() => {
    let income = getBPass();
    if (income > 0) {
        gold += income;
        if (counter) counter.textContent = Math.floor(gold);
    }
}, 1000);

// --- 7. Клик и Ультра-Механика ---
if (clickActionBtn) {
    clickActionBtn.addEventListener('click', (e) => {
        if (isUltRdy && !isUltAct) activateUlt(); 
        const p = (gPerClick + getBClick()) * ultMult; 
        gold += p;
        if (counter) counter.textContent = Math.floor(gold); 
        createFloatNum(e, p); 
        saveGame();
    });
}

function createFloatNum(e, v) {
    const c = document.querySelector('.click-area-container'); 
    if (!c) return; 
    
    const f = document.createElement('div');
    f.className = isUltAct ? 'floating-number ult-float' : 'floating-number'; 
    f.innerText = `+${v}`;
    
    // Считаем точные координаты клика относительно контейнера кнопки
    const r = c.getBoundingClientRect(); 
    f.style.left = `${e.clientX - r.left}px`; 
    f.style.top = `${e.clientY - r.top}px`; 
    
    // Случайный разлет: по горизонтали от -40px до +40px, по вертикали от -80px до -130px
    const randomX = Math.floor(Math.random() * 81) - 40;
    const randomY = Math.floor(Math.random() * 51) - 130;
    
    f.style.setProperty('--x-dir', `${randomX}px`);
    f.style.setProperty('--y-dir', `${randomY}px`);
    
    c.appendChild(f); 
    
    setTimeout(() => f.remove(), 600);
}

// Таймер готовности Супера
setInterval(() => {
    if (!isUltAct && !isUltRdy && clickActionBtn) {
        isUltRdy = true; 
        clickActionBtn.classList.add('ult-ready'); 
        showBrawlAlert("⚡ СУПЕР-КЛИК ГОТОВ!");
        setTimeout(() => { 
            if (isUltRdy && !isUltAct && clickActionBtn) { 
                isUltRdy = false; 
                clickActionBtn.classList.remove('ult-ready'); 
            } 
        }, 4000);
    }
}, 60000);

function activateUlt() {
    if (!clickActionBtn || !ultTimer) return; 
    isUltRdy = false; 
    isUltAct = true; 
    ultMult = 5; 
    clickActionBtn.classList.remove('ult-ready'); 
    clickActionBtn.classList.add('ult-active'); 
    ultTimer.style.display = 'block'; 
    ultTimer.style.width = '100%'; 
    updateUI();
    
    let duration = 5000, start = null;
    function step(ts) {
        if (!start) start = ts; 
        let progress = ts - start; 
        ultTimer.style.width = `${Math.max(0, 100 - (progress / duration) * 100)}%`;
        if (progress < duration) requestAnimationFrame(step);
        else { 
            isUltAct = false; 
            ultMult = 1; 
            clickActionBtn.classList.remove('ult-active'); 
            ultTimer.style.display = 'none'; 
            updateUI(); 
            saveGame(); 
        }
    } 
    requestAnimationFrame(step);
}

// Покупка Шахты
if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
        if (gold >= upCost) { 
            gold -= upCost; 
            gPerClick += 1; 
            upCost = Math.round(upCost * 1.5); 
            updateUI(); 
            showBrawlAlert("⚒️ Шахта куплена!"); 
            saveGame(); 
        } else {
            showBrawlAlert("❌ Недостаточно золота!");
        }
    });
}

// --- 8. Прокачка Бойцов ---
function renderBrawlers() {
    if (!brawlersList) return; 
    brawlersList.innerHTML = '';
    
    brawlers.forEach((b, i) => {
        const cost = Math.round(b.baseCost * Math.pow(1.6, b.level - 1)); 
        const card = document.createElement('div'); 
        card.className = `brawler-card brawler-${b.rarity || 'rare'}`;
        card.innerHTML = `
            <div class="avatar-fallback">${b.icon}</div>
            <h3 style="margin:5px 0;color:#ffcc00; text-shadow: 1px 1px 0 #000;">${b.name}</h3>
            <p style="margin:2px 0;font-size:14px;font-weight:bold;">Уровень: ${b.level}</p>
            <p style="margin:2px 0;font-size:12px;color:#4ade80;font-weight:bold;">Клик: +${(b.level - 1) * b.bonus}</p>
            <p style="margin:2px 0;font-size:12px;color:#60a5fa;font-weight:bold;">Пассив: +${(b.level - 1) * b.bonus_passive}/с</p>
            <button id="buy-brawler-${i}" style="padding:6px 12px;font-size:13px;width:100%;margin-top:10px;">Прокачать (${cost} З.)</button>
        `;
        brawlersList.appendChild(card);
        
