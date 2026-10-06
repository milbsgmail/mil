// 1. НАХОДИМ ЭЛЕМЕНТЫ НА СТРАНИЦЕ
const counter = document.getElementById('gold-count');
const clickPowerTxt = document.getElementById('click-power');
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
const playerGoldTxt = document.getElementById('player-gold');

// 2. ИСХОДНЫЕ ДАННЫЕ ИГРЫ
let gold = 0;
let goldPerClick = 1;
let upgradeCost = 15;

let currentQuestionIndex = 0;
let activeQuestions = [];

// Список 10 бойцов для развития
let brawlers = [
    { name: "Шелли", level: 1, baseCost: 10, bonus: 1 },
    { name: "Кольт", level: 1, baseCost: 25, bonus: 2 },
    { name: "Нита", level: 1, baseCost: 50, bonus: 4 },
    { name: "Эль Примо", level: 1, baseCost: 100, bonus: 8 },
    { name: "Поко", level: 1, baseCost: 200, bonus: 15 },
    { name: "Рико", level: 1, baseCost: 400, bonus: 30 },
    { name: "Джесси", level: 1, baseCost: 800, bonus: 60 },
    { name: "Пайпер", level: 1, baseCost: 1600, bonus: 120 },
    { name: "Мортис", level: 1, baseCost: 3200, bonus: 250 },
    { name: "Леон", level: 1, baseCost: 6400, bonus: 600 }
];

// Уменьшенная база вопросов
const allQuizQuestions = [
    { question: "Кто является начальным бойцом в Brawl Stars?", answers: ["Шелли", "Кольт", "Нита", "Брок"], correct: 0 },
    { question: "Какая редкость у бойца Леон?", answers: ["Редкий", "Эпический", "Легендарный", "Мифический"], correct: 2 },
    { question: "Какой боец бросает чемоданы?", answers: ["Мистер П.", "Гейл", "Лу", "Поко"], correct: 0 },
    { question: "Кто из этих бойцов является роботом?", answers: ["Булл", "Рико", "Эль Примо", "Кольт"], correct: 1 },
    { question: "Какое оружие использует Кольт?", answers: ["Два револьвера", "Дробовик", "Молот", "Лук"], correct: 0 }
];

function prepareQuestions() {
    let shuffled = [...allQuizQuestions].sort(() => 0.5 - Math.random());
    activeQuestions = shuffled.slice(0, 5);
    currentQuestionIndex = 0;
}

// 3. ЛОГИКА ГЛАВНОГО МЕНЮ (ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК)
quizBtn.addEventListener('click', () => {
    quizSection.style.display = 'block';
    clickSection.style.display = 'none';
    brawlersSection.style.display = 'none';
    topSection.style.display = 'none';
});

clickBtn.addEventListener('click', () => {
    quizSection.style.display = 'none';
    clickSection.style.display = 'block';
    brawlersSection.style.display = 'none';
    topSection.style.display = 'none';
});

brawlerBtn.addEventListener('click', () => {
    quizSection.style.display = 'none';
    clickSection.style.display = 'none';
    brawlersSection.style.display = 'block';
    topSection.style.display = 'none';
    renderBrawlers();
});

topBtn.addEventListener('click', () => {
    quizSection.style.display = 'none';
    clickSection.style.display = 'none';
    brawlersSection.style.display = 'none';
    topSection.style.display = 'block'; // Показываем секцию топа
    
    // Обновляем золото игрока в таблице лидеров при переходе на вкладку
    if (playerGoldTxt) {
        playerGoldTxt.textContent = gold.toLocaleString();
    }
});

// 4. ЛОГИКА КЛИКЕРА
function getBonusPower() {
    let extraPower = 0;
    brawlers.forEach(b => {
        if (b.level > 1) { extraPower += (b.level - 1) * b.bonus; }
    });
    return extraPower;
}

// Обновление общего показателя силы клика в UI
function updateClickPower() {
    let totalPower = goldPerClick + getBonusPower();
    clickPowerTxt.textContent = totalPower;
}

// Само действие клика по кнопке "Клик!"
clickActionBtn.addEventListener('click', () => {
    gold += (goldPerClick + getBonusPower());
    counter.textContent = gold;
    saveGame();
});

// Покупка апгрейда "Шахты"
upgradeBtn.addEventListener('click', () => {
    if (gold >= upgradeCost) {
        gold -= upgradeCost;
        goldPerClick += 1;
        upgradeCost = Math.round(upgradeCost * 1.5);
        counter.textContent = gold;
        updateClickPower();
        upgradeBtn.textContent = 'Купить Шахту (Цена: ' + upgradeCost + ' золота)';
        upgradeBtn.style.backgroundColor = "";
        saveGame();
    } else {
        const originalText = upgradeBtn.textContent;
        upgradeBtn.style.backgroundColor = "#ef4444";
        upgradeBtn.style.color = "white";
        upgradeBtn.textContent = "Недостаточно золота!";
        setTimeout(() => {
            upgradeBtn.style.backgroundColor = "";
            upgradeBtn.style.color = "";
            upgradeBtn.textContent = originalText;
        }, 1000);
    }
});

// 5. ИНТЕРФЕЙС БОЙЦОВ
function renderBrawlers() {
    brawlersList.innerHTML = "";
    brawlers.forEach((brawler, index) => {
        let cost = Math.round(brawler.baseCost * Math.pow(1.6, brawler.level - 1));
        const card = document.createElement('div');
        card.className = "brawler-card";

        card.innerHTML = `
            <h3 style="margin: 0 0 5px 0; color: #ffcc00;">${brawler.name}</h3>
            <p style="margin: 5px 0;">Уровень: <span style="color: #4ade80; font-weight:bold;">${brawler.level}</span></p>
            <p style="margin: 5px 0; font-size:13px; opacity:0.9;">Даёт к клику: +${(brawler.level - 1) * brawler.bonus} золота</p>
            <button id="up-brawler-${index}" style="margin-top: 10px; width: 90%;">
                Прокачать: ${cost}
            </button>
        `;
        brawlersList.appendChild(card);

        const upBtn = document.getElementById(`up-brawler-${index}`);
        if (gold < cost) {
            upBtn.style.backgroundColor = "#4b5563";
            upBtn.style.color = "#9ca3af";
            upBtn.style.boxShadow = "none";
            upBtn.style.cursor = "not-allowed";
        } else {
            upBtn.style.backgroundColor = "#ffcc00";
            upBtn.style.color = "#000000";
        }

        upBtn.addEventListener('click', () => {
            if (gold >= cost) {
                gold -= cost;
                brawler.level += 1;
                counter.textContent = gold;
                saveGame();
                updateClickPower();
                renderBrawlers();
            }
        });
    });
}

// 6. ЛОГИКА ВИКТОРИНЫ
function loadQuestion() {
    if (currentQuestionIndex < activeQuestions.length) {
        let currentQuestion = activeQuestions[currentQuestionIndex];
        questionText.textContent = `Вопрос ${currentQuestionIndex + 1} из 5: ${currentQuestion.question}`;
        answersBlock.innerHTML = "";

        currentQuestion.answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.textContent = answer;
            btn.addEventListener('click', () => checkAnswer(index));
            answersBlock.appendChild(btn);
        });
    } else {
        questionText.innerHTML = "🎉 Викторина окончена!";
        answersBlock.innerHTML = "<p style='color: #4ade80; font-size: 18px; font-weight: bold;'>Вы ответили на все вопросы! Обновите страницу, чтобы начать заново.</p>";
    }
}

function checkAnswer(selectedIndex) {
    let currentQuestion = activeQuestions[currentQuestionIndex];
    if (selectedIndex === currentQuestion.correct) {
        gold += 10;
        counter.textContent = gold;
        saveGame();
    }
    currentQuestionIndex++;
    loadQuestion();
}

// 7. СОХРАНЕНИЕ ПРОГРЕССА
function saveGame() {
    localStorage.setItem('gold', gold);
    localStorage.setItem('goldPerClick', goldPerClick);
    localStorage.setItem('upgradeCost', upgradeCost);
    localStorage.setItem('brawlers_data', JSON.stringify(brawlers));
}

function loadGame() {
    if(localStorage.getItem('gold')) {
        gold = parseInt(localStorage.getItem('gold'));
        goldPerClick = parseInt(localStorage.getItem('goldPerClick'));
        upgradeCost = parseInt(localStorage.getItem('upgradeCost'));
        const savedBrawlers = localStorage.getItem('brawlers_data');
        if (savedBrawlers) {
            brawlers = JSON.parse(savedBrawlers);
        }
    }
    counter.textContent = gold;
    updateClickPower();
    upgradeBtn.textContent = 'Купить Шахту (Цена: ' + upgradeCost + ' золота)';
}

// 8. ЗАПУСК ИГРЫ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
loadGame();
prepareQuestions();
loadQuestion();
