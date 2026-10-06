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
const restartQuizBtn = document.getElementById('restart-quiz-btn');
const leaderboardBody = document.getElementById('leaderboard-body');

const promoInput = document.getElementById('promo-input');
const promoBtn = document.getElementById('promo-btn');
const promoMsg = document.getElementById('promo-msg');

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

// 3. МЕНЮ С ТАБАМИ
function switchTab(showSec) {
    [quizSection, clickSection, brawlersSection, topSection].forEach(s => s.style.display = 'none');
    showSec.style.display = 'block';
}

quizBtn.addEventListener('click', () => { 
    switchTab(quizSection); 
    if (activeQuestions.length === 0) {
        initQuiz();
    }
});

clickBtn.addEventListener('click', () => switchTab(clickSection));

brawlerBtn.addEventListener('click', () => { 
    switchTab(brawlersSection); 
    renderBrawlers(); 
});

topBtn.addEventListener('click', () => { 
    switchTab(topSection); 
    renderLeaderboard(); 
});

// 4. КЛИКЕР И АПГРЕЙДЫ
function getBonusPower() {
    return brawlers.reduce((sum, b) => sum + (b.level > 1 ? (b.level - 1) * b.bonus : 0), 0);
}

function getPassiveIncome() {
    return brawlers.reduce((sum, b) => sum + (b.level > 1 ? (b.level - 1) * b.bonus_passive : 0), 0);
}

function updateClickPower() {
    clickPowerTxt.textContent = goldPerClick + getBonusPower();
    cpsDisplay.textContent = `В секунду: +${getPassiveIncome()} золота`;
}

clickActionBtn.addEventListener('click', () => {
    gold += (goldPerClick + getBonusPower());
    counter.textContent = Math.floor(gold);
    saveGame();
});

upgradeBtn.addEventListener('click', () => {
    if (gold >= upgradeCost) {
        gold -= upgradeCost; 
        goldPerClick += 1; 
        upgradeCost = Math.round(upgradeCost * 1.5);
        counter.textContent = Math.floor(gold); 
        updateClickPower();
        upgradeBtn.textContent = 'Купить Шахту (Цена: ' + upgradeCost + ' золота)';
        saveGame();
    } else {
        const txt = upgradeBtn.textContent; 
        upgradeBtn.textContent = "Недостаточно золота!";
        setTimeout(() => { upgradeBtn.textContent = txt; }, 1000);
    }
});

// ПРОМОКОДЫ
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
        promoMsg.textContent = "Режим Создателя! Вы получили 1,000,000 золота! 👑";
    } else if (code === "SHELLYUP") {
        brawlers[0].level += 5; 
        promoMsg.style.color = "#3b82f6"; 
        promoMsg.textContent = "Шелли прокачалась сразу на +5 уровней! 🔥";
    } else if (code === "COLTUP") {
        brawlers[1].level += 5; 
        promoMsg.style.color = "#ec4899"; 
        promoMsg.textContent = "Кольт прокачался сразу на +5 уровней! 🔫";
    } else if (code === "SHAKHTA") {
        goldPerClick += 20; 
        promoMsg.style.color = "#fb923c"; 
        promoMsg.textContent = "Шахтерский бонус! Сила клика увеличена на +20! ⛏️";
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
    counter.textContent = Math.floor(gold);
    updateClickPower();
    promoInput.value = "";
    saveGame();
});

// 5. МАГАЗИН БОЙЦОВ
function renderBrawlers() {
    brawlersList.innerHTML = "";
    brawlers.forEach((b, i) => {
        let cost = Math.round(b.baseCost * Math.pow(1.6, b.level - 1));
        const card = document.createElement('div');
        card.className = "brawler-card";
        card.innerHTML = `
            <h3>${b.name}</h3>
            <p>Уровень: <b>${b.level}</b></p>
            <p style="font-size:12px; margin: 2px 0;">+${(b.level - 1) * b.bonus} к клику</p>
            <p style="font-size:12px; color: #4ade80; margin: 2px 0;">+${(b.level - 1) * b.bonus_passive}/сек пассивно</p>
            <button id="up-brawler-${i}" style="width:90%; margin-top: 8px; background:${gold < cost ? '#4b5563':'#ffcc00'}">Прокачать: ${cost}</button>
        `;
        brawlersList.appendChild(card);
        
        document.getElementById(`up-brawler-${i}`).addEventListener('click', () => {
            if (gold >= cost) {
                gold -= cost; 
                b.level += 1; 
                counter.textContent = Math.floor(gold);
                saveGame(); 
                updateClickPower(); 
                renderBrawlers();
            }
        });
    });
}

// 6. ВИКТОРИНА
function initQuiz() {
    activeQuestions = [...allQuizQuestions].sort(() => 0.5 - Math.random()).slice(0, 5);
    currentQuestionIndex = 0;
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= activeQuestions.length) {
        questionText.textContent = "Викторина пройдена!";
        answersBlock.innerHTML = "<p style='color: #4ade80; font-weight: bold;'>Вы ответили на все вопросы! Награда: +500 золота! 🏆</p>";
        gold += 500;
        counter.textContent = Math.floor(gold);
        saveGame();
        return;
    }

    let qObj = activeQuestions[currentQuestionIndex];
    questionText.textContent = qObj.question;
    answersBlock.innerHTML = '';

    qObj.answers.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.textContent = ans;
        btn.className = 'quiz-answer-btn';
        btn.onclick = () => {
            if (idx === qObj.correct) {
                alert("Правильно! +50 золота! 🎉");
                gold += 50;
                counter.textContent = Math.floor(gold);
                currentQuestionIndex++;
                saveGame();
                loadQuestion();
            } else {
                alert("Неправильно! Попробуй еще раз.");
            }
        };
        answersBlock.appendChild(btn);
    });
}

restartQuizBtn.addEventListener('click', () => {
    initQuiz();
});

// 7. ТОП ИГРОКОВ
function renderLeaderboard() {
    leaderboardBody.innerHTML = '';
    let fullLeaderboard = [...onlinePlayers];
    fullLeaderboard.push({ name: "Ты (Текущая сессия)", gold: Math.floor(gold), isPlayer: true });
    fullLeaderboard.sort((a, b) => b.gold - a.gold);

    fullLeaderboard.forEach((player, idx) => {
        const row = document.createElement('tr');
        if (player.isPlayer) {
            row.className = 'player-row';
        }
        row.innerHTML = `
            <td>${idx + 1}</td>
            <td>${player.name}</td>
ф
