// 1. ЭЛЕМЕНТЫ СТРАНИЦЫ
const counter = document.getElementById('gold-count');
const clickPowerTxt = document.getElementById('click-power');
const cpsDisplay = document.getElementById('cps-display');
const upgradeBtn = document.getElementById('upgrade-btn');
const clickActionBtn = document.getElementById('click-action-btn');

const quizBtn = document.getElementById('quiz-btn');
const brawlerBtn = document.getElementById('brawler-btn');
const clickBtn = document.getElementById('click-btn');
const topBtn = document.getElementById('top-btn');

const quizSection = document.getElementById('quiz-section');
const clickSection = document.getElementById('click-section');
const brawlersSection = document.getElementById('brawlers-section');
const topSection = document.getElementById('top-section');

const brawlersList = document.getElementById('brawlers-list');
const questionText = document.getElementById('questionText');
const answersBlock = document.getElementById('answersBlock');

const promoInput = document.getElementById('promo-input');
const promoBtn = document.getElementById('promo-btn');
const promoMsg = document.getElementById('promo-msg');
const resetProgressBtn = document.getElementById('reset-progress-btn');

const megaboxBtn = document.getElementById('megabox-btn');
const ultTimer = document.getElementById('ult-timer');
const alertContainer = document.getElementById('custom-alert-container');

// 2. ИГРОВЫЕ ДАННЫЕ
let gold = 0;
let goldPerClick = 1;
let upgradeCost = 15;
let currentQuestionIndex = 0;
let activeQuestions = [];
let usedPromocodes = [];

let isUltReady = false;
let isUltActive = false;
let ultMultiplier = 1;
let lastMegaboxTime = 0;

let onlinePlayers = [
    { name: "Magician_BS", gold: 95400 },
    { name: "CyberLeon", gold: 82100 },
    { name: "BrawlMaster", gold: 74500 }
];

const defaultBrawlers = [
    { name: "Шелли", level: 1, baseCost: 10, bonus: 1, bonus_passive: 2, icon: "🤠" },
    { name: "Кольт", level: 1, baseCost: 35, bonus: 2, bonus_passive: 5, icon: "🔫" },
    { name: "Нита", level: 1, baseCost: 80, bonus: 4, bonus_passive: 12, icon: "🐻" },
    { name: "Эль Примо", level: 1, baseCost: 180, bonus: 8, bonus_passive: 25, icon: "💪" },
    { name: "Поко", level: 1, baseCost: 350, bonus: 15, bonus_passive: 50, icon: "💀" },
    { name: "Рико", level: 1, baseCost: 700, bonus: 30, bonus_passive: 100, icon: "🤖" },
    { name: "Джесси", level: 1, baseCost: 1400, bonus: 60, bonus_passive: 220, icon: "🛠️" },
    { name: "Пайпер", level: 1, baseCost: 2900, bonus: 120, bonus_passive: 450, icon: "☂️" },
    { name: "Мортис", level: 1, baseCost: 6000, bonus: 250, bonus_passive: 900, icon: "🦇" },
    { name: "Леон", level: 1, baseCost: 12500, bonus: 600, bonus_passive: 2500, icon: "🦎" }
];

let brawlers = JSON.parse(JSON.stringify(defaultBrawlers));

const allQuizQuestions = [
    { question: "Кто начальный боец в Brawl Stars?", answers: ["Шелли", "Кольт", "Нита"], correct: 0 },
    { question: "Какая редкость у Леона?", answers: ["Редкий", "Эпический", "Легендарный"], correct: 2 },
    { question: "Какой боец бросает чемоданы?", answers: ["Мистер П.", "Гейл", "Лу"], correct: 0 },
    { question: "Кто из них робот?", answers: ["Булл", "Рико", "Кольт"], correct: 1 },
    { question: "Какое оружие у Кольта?", answers: ["Револьверы", "Дробовик", "Лук"], correct: 0 }
];

// КАСТОМНЫЕ УВЕДОМЛЕНИЯ
function showBrawlAlert(message) {
    if (!alertContainer) return;
    const alertBox = document.createElement('div');
    alertBox.className = 'brawl-alert';
    alertBox.innerText = message;
    alertContainer.appendChild(alertBox);
    setTimeout(() => {
        alertBox.style.opacity = '0';
        alertBox.style.transform = 'translateY(-20px)';
        alertBox.style.transition = 'all 0.4s ease';
        setTimeout(() => { alertBox.remove(); }, 400);
    }, 3000);
}

// 3. ПЕРЕКЛЮЧЕНИЕ МЕНЮ (НАВИГАЦИЯ)
function switchTab(showSec) {
    [quizSection, clickSection, brawlersSection, topSection].forEach(s => { if(s) s.style.display = 'none'; });
    if(showSec) showSec.style.display = 'block';
}

clickBtn.addEventListener('click', () => { switchTab(clickSection); });
brawlerBtn.addEventListener('click', () => { switchTab(brawlersSection); renderBrawlers(); });
quizBtn.addEventListener('click', () => { switchTab(quizSection); initQuiz(); });
topBtn.addEventListener('click', () => { switchTab(topSection); renderLeaderboard(); });

// 4. МЕХАНИКА РАСЧЕТОВ КЛИКА И ПАССИВА
function getBonusPower() {
    return brawlers.reduce((sum, b) => { return sum + (b.level > 1 ? (b.level - 1) * b.bonus : 0); }, 0);
}

function getPassiveIncome() {
    return brawlers.reduce((sum, b) => { return sum + (b.level > 1 ? (b.level - 1) * b.bonus_passive : 0); }, 0);
}

// 5. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
function updateUI() {
    if (counter) counter.textContent = Math.floor(gold);
    if (clickPowerTxt) clickPowerTxt.textContent = (goldPerClick + getBonusPower()) * ultMultiplier;
    if (cpsDisplay) cpsDisplay.textContent = `В секунду: +${getPassiveIncome()} золота`;
    if (upgradeBtn) upgradeBtn.textContent = `Купить Шахту (Цена: ${upgradeCost} золота)`;
}

// 6. КЛИКЕР, УЛЬТА И УЛУЧШЕНИЯ
clickActionBtn.addEventListener('click', (event) => {
    if (isUltReady && !isUltActive) {
        activateUlt();
    }
    const currentClickPower = (goldPerClick + getBonusPower()) * ultMultiplier;
    gold += currentClickPower;
    if (counter) counter.textContent = Math.floor(gold);
    createFloatingNumber(event, currentClickPower);
    saveGame();
});

function createFloatingNumber(event, value) {
    const clickContainer = document.querySelector('.click-area-container');
    if (!clickContainer) return;
    const floatEl = document.createElement('div');
    floatEl.className = isUltActive ? 'floating-number ult-float' : 'floating-number';
    floatEl.innerText = `+${value}`;
    const rect = clickContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;
    clickContainer.appendChild(floatEl);
    setTimeout(() => { floatEl.remove(); }, 700);
}

// Таймер появления Ульты
setInterval(() => {
    if (!isUltActive && !isUltReady && clickActionBtn) {
        isUltReady = true;
        clickActionBtn.classList.add('ult-ready');
        showBrawlAlert("⚡ СУПЕР-КЛИК ГОТОВ! Нажми на кнопку клика!");
        setTimeout(() => {
            if (isUltReady && !isUltActive && clickActionBtn) {
                isUltReady = false;
                clickActionBtn.classList.remove('ult-ready');
            }
        }, 4000);
    }
}, 60000);

function activateUlt() {
    if (!clickActionBtn || !ultTimer) return;
    isUltReady = false;
    isUltActive = true;
    let oldMultiplier = ultMultiplier;
    ultMultiplier = 5;
    clickActionBtn.classList.remove('ult-ready');
    clickActionBtn.classList.add('ult-active');
    ultTimer.style.display = 'block';
    ultTimer.style.width = '100%';
    showBrawlAlert("🔥 АКТИВИРОВАНА УЛЬТА! Клик Х5!");
    updateUI();
    let timeLeft = 100;
    const animInterval = setInterval(() => {
        timeLeft -= 2;
        ultTimer.style.width = `${timeLeft}%`;
        if (timeLeft <= 0) {
            clearInterval(animInterval);
            isUltActive = false;
            ultMultiplier = oldMultiplier;
            clickActionBtn.classList.remove('ult-active');
            ultTimer.style.display = 'none';
            showBrawlAlert("Эффект ульты закончился.");
            updateUI();
            saveGame();
        }
    }, 100);
}

// Открытие Мегабокса
megaboxBtn.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastMegaboxTime < 60000) {
        const remains = Math.ceil((60000 - (now - lastMegaboxTime)) / 1000);
        showBrawlAlert(`Box заблокирован! Подожди еще ${remains} сек.`);
        return;
    }
    const prize = Math.floor(Math.random() * 4501) + 500;
    gold += prize;
    lastMegaboxTime = now;
    showBrawlAlert(`📦 Из Мегабокса выпало: +${prize} золота! ⭐`);
    updateUI();
    saveGame();
});

upgradeBtn.addEventListener('click', () => {
    if (gold >= upgradeCost) {
        gold -= upgradeCost;
        goldPerClick += 1;
        upgradeCost = Math.round(upgradeCost * 1.5);
        updateUI();
        saveGame();
    } else {
        const originalText = upgradeBtn.textContent;
        upgradeBtn.textContent = "Недостаточно золота!";
        setTimeout(() => { upgradeBtn.textContent = originalText; }, 1000);
    }
});

resetProgressBtn.addEventListener('click', () => {
    const confirmReset = confirm("Вы уверены, что хотите обнулить весь игровой прогресс?");
    if (confirmReset) {
        localStorage.removeItem('brawlClubSave');
        window.location.reload();
    }
});

// 7. СИСТЕМА ПРОМОКОДОВ
promoBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (code === "") {
        promoMsg.style.color = "#ef4444";
        promoMsg.textContent = "Введите code!";
        return;
    }
    if (usedPromocodes.includes(code)) {
        promoMsg.style.color = "#ef4444";
        promoMsg.textContent = "Вы уже активировали этот промокод!";
        return;
    }
    let success = false;
    if (code === "BRAWL") { gold += 5000; success = true; }
    else if (code === "GOLD") { gold += 50000; success = true; }
    else if (code === "DEV100") { gold += 1000000; success = true; }
    else if (code === "SHAKHTA") { goldPerClick += 20; success = true; }
    else if (code === "FREECOINS") { gold += 1500; success = true; }
    else if (code === "SHELLYUP") { if(brawlers[0]) brawlers[0].level += 5; success = true; renderBrawlers(); }
    else if (code === "COLTUP") { if(brawlers[1]) brawlers[1].level += 5; success = true; renderBrawlers(); }
    
    if (success) {
        showBrawlAlert(`Активирован промокод: ${code}!`);
        usedPromocodes.push(code);
        promoInput.value = "";
