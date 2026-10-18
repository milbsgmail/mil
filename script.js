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

// 2. ИГРОВЫЕ ДАННЫЕ
let gold = 0;
let goldPerClick = 1;
let upgradeCost = 15;
let currentQuestionIndex = 0;
let activeQuestions = [];
let usedPromocodes = [];

let onlinePlayers = [
    { name: "Magician_BS", gold: 95400 },
    { name: "CyberLeon", gold: 82100 },
    { name: "BrawlMaster", gold: 74500 }
];

const defaultBrawlers = [
    { name: "Шелли", level: 1, baseCost: 10, bonus: 1, bonus_passive: 2 },
    { name: "Кольт", level: 1, baseCost: 35, bonus: 2, bonus_passive: 5 },
    { name: "Нита", level: 1, baseCost: 80, bonus: 4, bonus_passive: 12 },
    { name: "Эль Примо", level: 1, baseCost: 180, bonus: 8, bonus_passive: 25 },
    { name: "Поко", level: 1, baseCost: 350, bonus: 15, bonus_passive: 50 },
    { name: "Рико", level: 1, baseCost: 700, bonus: 30, bonus_passive: 100 },
    { name: "Джесси", level: 1, baseCost: 1400, bonus: 60, bonus_passive: 220 },
    { name: "Пайпер", level: 1, baseCost: 2900, bonus: 120, bonus_passive: 450 },
    { name: "Мортис", level: 1, baseCost: 6000, bonus: 250, bonus_passive: 900 },
    { name: "Леон", level: 1, baseCost: 12500, bonus: 600, bonus_passive: 2500 }
];

let brawlers = JSON.parse(JSON.stringify(defaultBrawlers));

const allQuizQuestions = [
    { question: "Кто начальный боец в Brawl Stars?", answers: ["Шелли", "Кольт", "Нита"], correct: 0 },
    { question: "Какая редкость у Леона?", answers: ["Редкий", "Эпический", "Легендарный"], correct: 2 },
    { question: "Какой боец бросает чемоданы?", answers: ["Мистер П.", "Гейл", "Лу"], correct: 0 },
    { question: "Кто из них робот?", answers: ["Булл", "Рико", "Кольт"], correct: 1 },
    { question: "Какое оружие у Кольта?", answers: ["Револьверы", "Дробовик", "Лук"], correct: 0 }
];

// 3. ПЕРЕКЛЮЧЕНИЕ МЕНЮ (НАВИГАЦИЯ)
function switchTab(showSec) {
    [quizSection, clickSection, brawlersSection, topSection].forEach(s => s.style.display = 'none');
    showSec.style.display = 'block';
}

clickBtn.addEventListener('click', () => switchTab(clickSection));
brawlerBtn.addEventListener('click', () => { switchTab(brawlersSection); renderBrawlers(); });
quizBtn.addEventListener('click', () => { switchTab(quizSection); initQuiz(); });
topBtn.addEventListener('click', () => { switchTab(topSection); renderLeaderboard(); });

// 4. МЕХАНИКА РАСЧЕТОВ КЛИКА И ПАССИВА
function getBonusPower() {
    return brawlers.reduce((sum, b) => sum + (b.level > 1 ? (b.level - 1) * b.bonus : 0), 0);
}

function getPassiveIncome() {
    return brawlers.reduce((sum, b) => sum + (b.level > 1 ? (b.level - 1) * b.bonus_passive : 0), 0);
}

function updateUI() {
    counter.textContent = Math.floor(gold);
    clickPowerTxt.textContent = goldPerClick + getBonusPower();
    cpsDisplay.textContent = `В секунду: +${getPassiveIncome()} золота`;
    upgradeBtn.textContent = `Купить Шахту (Цена: ${upgradeCost} золота)`;
}

// 5. КЛИКЕР И УЛУЧШЕНИЯ
clickActionBtn.addEventListener('click', (event) => {
    const currentClickPower = goldPerClick + getBonusPower();
    gold += currentClickPower;
    counter.textContent = Math.floor(gold);
    
    // Создание анимации вылетающего золота в месте клика
    createFloatingNumber(event, currentClickPower);
    saveGame();
});

function createFloatingNumber(event, value) {
    const clickContainer = document.querySelector('.click-area-container');
    if (!clickContainer) return;

    const floatEl = document.createElement('div');
    floatEl.className = 'floating-number';
    floatEl.innerText = `+${value}`;

    const rect = clickContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    floatEl.style.left = `${x}px`;
    floatEl.style.top = `${y}px`;

    clickContainer.appendChild(floatEl);

    setTimeout(() => {
        floatEl.remove();
    }, 700);
}

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

// Кнопка сброса игрового прогресса
if (resetProgressBtn) {
    resetProgressBtn.addEventListener('click', () => {
        const confirmReset = confirm("Вы уверены, что хотите обнулить весь игровой прогресс? Это действие нельзя отменить!");
        if (confirmReset) {
            localStorage.removeItem('brawlClubSave');
            window.location.reload();
        }
    });
}

// 6. СИСТЕМА ПРОМОКОДОВ
promoBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (code === "") {
        promoMsg.style.color = "#ef4444";
        promoMsg.textContent = "Введите код!";
        return;
    }
    if (usedPromocodes.includes(code)) {
        promoMsg.style.color = "#ef4444";
        promoMsg.textContent = "Вы уже активировали этот промокод!";
        return;
    }

    if (code === "BRAWL") {
        gold += 5000;
        promoMsg.style.color = "#4ade80";
        promoMsg.textContent = "Успешно! Получено +5,000 золота!";
    } else if (code === "GOLD") {
        gold += 50000;
        promoMsg.style.color = "#4ade80";
        promoMsg.textContent = "Супер-код! Получено +50,000 золота!";
    } else if (code === "DEV100") {
        gold += 1000000;
        promoMsg.style.color = "#a855f7";
        promoMsg.textContent = "Режим Создателя! Получено +1,000,000 золота! 👑";
    } else if (code === "SHELLYUP") {
        if (brawlers[0]) brawlers[0].level += 5;
        promoMsg.style.color = "#3b82f6";
        promoMsg.textContent = "Шелли прокачалась сразу на +5 уровней! 🔥";
    } else if (code === "COLTUP") {
        if (brawlers[1]) brawlers[1].level += 5;
        promoMsg.style.color = "#ec4899";
        promoMsg.textContent = "Кольт прокачался сразу на +5 уровней! 🔫";
    } else if (code === "SHAKHTA") {
        goldPerClick += 20;
        promoMsg.style.color = "#fb923c";
        promoMsg.textContent = "Шахтерский бонус! Сила клика +20! ⛏️";
    } else if (code === "FREECOINS") {
        gold += 1500;
        promoMsg.style.color = "#eab308";
        promoMsg.textContent = "Монетки в кармане! Получено +1,500 золота! 🪙";
    } else {
        promoMsg.style.color = "#ef4444";
        promoMsg.textContent = "Такого промокода не существует!";
        return;
    }

    usedPromocodes.push(code);
    promoInput.value = "";
    updateUI();
    saveGame();
});

// 7. ОТРЕНДЕРИТЬ СПИСОК БОЙЦОВ
function renderBrawlers() {
    brawlersList.innerHTML = "";
    brawlers.forEach((b, i) => {
        let cost = Math.round(b.baseCost * Math.pow(1.6, b.level - 1));
        const card = document.createElement('div');
        card.className = "brawler-card";
        
        // Порядковый номер файла картинки (images/1.png для Шелли и т.д.)
        const imgNumber = i + 1;
        
        card.innerHTML = `
            <img src="images/${imgNumber}.png" alt="${b.name}" class="brawler-avatar">
            <h3 class="brawler-name">${b.name}</h3>
            <div class="brawler-level">Уровень: <b>${b.level}</b></div>
            <div class="brawler-stats">
                <div>💥 Сила клика: +${(b.level - 1) * b.bonus}</div>
                <div>⏱️ Пассивный доход: +${(b.level - 1) * b.bonus_passive}/с</div>
            </div>
            <button id="up-brawler-${i}" class="brawler-up-btn">Прокачать: ${cost}</button>
        `;
        brawlersList.appendChild(card);

        const upBtn = document.getElementById(`up-brawler-${i}`);
        if (gold < cost) {
            upBtn.style.opacity = "0.6";
        }

        upBtn.addEventListener('click', () => {
            if (gold >= cost) {
                gold -= cost;
                b.level += 1;
                saveGame();
                updateUI();
                renderBrawlers();
            } else {
                const oldTxt = upBtn.textContent;
                upBtn.textContent = "Недостаточно золота!";
                setTimeout(() => { upBtn.textContent = `Прокачать: ${cost}`; }, 1000);
            }
        });
    });
}

// 8. ДИНАМИЧЕСКАЯ ТАБЛИЦА ЛИДЕРОВ
function renderLeaderboard() {
    const tableBody = document.querySelector('table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = "";
    
    let allPlayers = [...onlinePlayers, { name: "Вы (Игрок)", gold: gold }];
    allPlayers.sort((a, b) => b.gold - a.gold);
    
    allPlayers.forEach((player, index) => {
        const row = document.createElement('tr');
        if (player.name === "Вы (Игрок)") {
            row.style.color = "#ffcc00";
