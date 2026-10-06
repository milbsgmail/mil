// 1. ЭЛЕМЕНТЫ СТРАНИЦЫ
const counter = document.getElementById('gold-count');
const clickPowerTxt = document.getElementById('click-power');
const cpsDisplay = document.getElementById('cps-display'); // Элемент пассивного дохода
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

// 2. ИГРОВЫЕ ДАННЫЕ
let gold = 0, goldPerClick = 1, upgradeCost = 15, currentQuestionIndex = 0, activeQuestions = [];
let onlinePlayers = [{ name: "Magician_BS", gold: 95400 }, { name: "CyberLeon", gold: 82100 }, { name: "BrawlMaster", gold: 74500 }];

// Изменили баланс бойцов: теперь они дают И к клику, И пассивный доход (bonus_passive) в секунду!
let brawlers = [
    { name: "Шелли", level: 1, baseCost: 10, bonus: 1, bonus_passive: 1 },
    { name: "Кольт", level: 1, baseCost: 35, bonus: 2, bonus_passive: 3 },
    { name: "Нита", level: 1, baseCost: 80, bonus: 4, bonus_passive: 8 },
    { name: "Эль Примо", level: 1, baseCost: 180, bonus: 8, bonus_passive: 15 },
    { name: "Поко", level: 1, baseCost: 350, bonus: 15, bonus_passive: 35 },
    { name: "Рико", level: 1, baseCost: 700, bonus: 30, bonus_passive: 75 },
    { name: "Джесси", level: 1, baseCost: 1400, bonus: 60, bonus_passive: 160 },
    { name: "Пайпер", level: 1, baseCost: 2900, bonus: 120, bonus_passive: 350 },
    { name: "Мортис", level: 1, baseCost: 6000, bonus: 250, bonus_passive: 800 },
    { name: "Леон", level: 1, baseCost: 12500, bonus: 600, bonus_passive: 2000 }
];

const allQuizQuestions = [
    { question: "Кто начальный боец в Brawl Stars?", answers: ["Шелли", "Кольт", "Нита"], correct: 0 },
    { question: "Какая редкость у Леона?", answers: ["Редкий", "Эпический", "Легендарный"], correct: 2 },
    { question: "Какой боец бросает чемоданы?", answers: ["Мистер П.", "Гейл", "Лу"], correct: 0 },
    { question: "Кто из них робот?", answers: ["Булл", "Рико", "Кольт"], correct: 1 },
    { question: "Какое оружие у Кольта?", answers: ["Револьверы", "Дробовик", "Лук"], correct: 0 }
];

// 3. МЕНЮ
function switchTab(showSec) {
    [quizSection, clickSection, brawlersSection, topSection].forEach(s => s.style.display = 'none');
    showSec.style.display = 'block';
}
quizBtn.addEventListener('click', () => switchTab(quizSection));
clickBtn.addEventListener('click', () => switchTab(clickSection));
brawlerBtn.addEventListener('click', () => { switchTab(brawlersSection); renderBrawlers(); });
topBtn.addEventListener('click', () => { switchTab(topSection); renderLeaderboard(); });

// 4. КЛИКЕР И АПГРЕЙДЫ
function getBonusPower() {
    return brawlers.reduce((sum, b) => sum + (b.level > 1 ? (b.level - 1) * b.bonus : 0), 0);
}

// Расчет общего пассивного дохода от всех купленных бойцов
function getPassiveIncome() {
    return brawlers.reduce((sum, b) => sum + (b.level > 1 ? (b.level - 1) * b.bonus_passive : 0), 0);
}

function updateClickPower() {
    clickPowerTxt.textContent = goldPerClick + getBonusPower();
    cpsDisplay.textContent = `В секунду: +${getPassiveIncome()} золота`;
}

clickActionBtn.addEventListener('click', () => {
    gold += (goldPerClick + getBonusPower());
    counter.textContent = gold;
    saveGame();
});

upgradeBtn.addEventListener('click', () => {
    if (gold >= upgradeCost) {
        gold -= upgradeCost; goldPerClick += 1; upgradeCost = Math.round(upgradeCost * 1.5);
        counter.textContent = gold; updateClickPower();
        upgradeBtn.textContent = 'Купить Шахту (Цена: ' + upgradeCost + ' золота)';
        saveGame();
    } else {
        const txt = upgradeBtn.textContent; upgradeBtn.textContent = "Недостаточно золота!";
        setTimeout(() => { upgradeBtn.textContent = txt; }, 1000);
    }
});

// 5. МАГАЗИН БОЙЦОВ
function renderBrawlers() {
    brawlersList.innerHTML = "";
    brawlers.forEach((b, i) => {
        let cost = Math.round(b.baseCost * Math.pow(1.6, b.level - 1));
        const card = document.createElement('div');
        card.className = "brawler-card";
        card.innerHTML = `
            <h3>${b.name}</h3><p>Уровень: <b>${b.level}</b></p>
            <p style="font-size:12px; margin: 2px 0;">+${(b.level - 1) * b.bonus} к клику</p>
            <p style="font-size:12px; color: #4ade80; margin: 2px 0;">+${(b.level - 1) * b.bonus_passive}/сек пассивно</p>
            <button id="up-brawler-${i}" style="width:90%; margin-top: 8px; background:${gold < cost ? '#4b5563':'#ffcc00'}">Прокачать: ${cost}</button>
        `;
        brawlersList.appendChild(card);
        document.getElementById(`up-brawler-${i}`).addEventListener('click', () => {
            if (gold >= cost) {
                gold -= cost; b.level += 1; counter.textContent = gold;
                saveGame(); updateClickPower(); renderBrawlers();
            }
        });
    });
}

// 6. ВИКТОРИНА
function loadQuestion() {
    if (currentQuestionIndex < activeQuestions.length) {
        let q = activeQuestions[currentQuestionIndex];
        questionText.textContent = `Вопрос ${currentQuestionIndex + 1} из 5: ${q.question}`;
        answersBlock.innerHTML = "";
        q.answers.forEach((ans, i) => {
            const btn = document.createElement('button'); btn.textContent = ans;
            btn.addEventListener('click', () => {
                if (i === q.correct) { gold += 10; counter.textContent = gold; saveGame(); }
                currentQuestionIndex++; loadQuestion();
            });
            answersBlock.appendChild(btn);
        });
    } else {
        questionText.innerHTML = "🎉 Викторина окончена!";
        answersBlock.innerHTML = "";
    }
}

// 7. ЛИДЕРБОРД
function renderLeaderboard() {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;
    let all = [...onlinePlayers, { name: "Вы (Игрок)", gold: gold, isPlayer: true }].sort((a, b) => b.gold - a.gold);
    tbody.innerHTML = "";
    all.forEach((p, i) => {
        const tr = document.createElement('tr');
        
        let place = i + 1;
        if (place === 1) place = "🥇 1";
        else if (place === 2) place = "🥈 2";
        else if (place === 3) place = "🥉 3";
        
        if (p.isPlayer) {
            tr.style.backgroundColor = "rgba(255, 204, 0, 0.15)";
            tr.style.outline = "2px dashed #ffcc00";
        }
        tr.innerHTML = `<td>${place}</td><td style="${p.isPlayer ? 'color: #ffcc00; font-weight: bold;':''}">${p.name}</td><td>${p.gold.toLocaleString()}</td>`;
        tbody.appendChild(tr);
    });
}

// ГЛАВНЫЙ ИГРОВОЙ ТАЙМЕР (Каждую секунду начисляет золото)
setInterval(() => {
    // 1. Начисляем золото игроку от пассивного дохода бойцов
    let passiveIncome = getPassiveIncome();
    if (passiveIncome > 0) {
        gold += passiveIncome;
        counter.textContent = gold;
        saveGame();
    }

    // 2. Начисляем случайное золото ботам-соперникам
    onlinePlayers.forEach(b => b.gold += Math.floor(Math.random() * 20) + 5);
    
    // 3. Перерисовываем топ на лету, если открыта вкладка рейтинга
    if (topSection.style.display === 'block') renderLeaderboard();
}, 1000);

// 8. СОХРАНЕНИЕ И ЗАГРУЗКА
function saveGame() {
    localStorage.setItem('gold', gold); localStorage.setItem('goldPerClick', goldPerClick);
    localStorage.setItem('upgradeCost', upgradeCost); localStorage.setItem('brawlers_data', JSON.stringify(brawlers));
}
function loadGame() {
    if(localStorage.getItem('gold')) {
        gold = parseInt(localStorage.getItem('gold')); goldPerClick = parseInt(localStorage.getItem('goldPerClick'));
        upgradeCost = parseInt(localStorage.getItem('upgradeCost')); brawlers = JSON.parse(localStorage.getItem('brawlers_data') || JSON.stringify(brawlers));
    }
    counter.textContent = gold; updateClickPower();
    upgradeBtn.textContent = 'Купить Шахту (Цена: ' + upgradeCost + ' золота)';
}
loadGame();
activeQuestions = [...allQuizQuestions].sort(() => 0.5 - Math.random()).slice(0, 5);
loadQuestion();
