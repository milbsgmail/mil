// 1. НАХОДИМ ЭЛЕМЕНТЫ НА СТРАНИЦЕ
const counter = document.getElementById('gold-count');
const clickPowerTxt = document.getElementById('click-power');
const upgradeBtn = document.getElementById('upgrade-btn');
const clickActionBtn = document.getElementById('click-action-btn');

const quizBtn = document.getElementById('quiz-btn');
const brawlerBtn = document.getElementById('brawler-btn');
const quizSection = document.getElementById('quiz-section');
const clickSection = document.getElementById('click-section');
const brawlersSection = document.getElementById('brawlers-section');
const brawlersList = document.getElementById('brawlers-list');

const questionText = document.getElementById('questionText');
const answersBlock = document.getElementById('answersBlock');

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

// Уменьшенная база вопросов (всего 5 штук, чтобы файл точно сохранился!)
const allQuizQuestions = [
    { question: "Кто является начальным бойцом в Brawl Stars?", answers: ["Шелли", "Кольт", "Нита", "Брок"], correct: 0 },
    { question: "Какая редкость у бойца Леон?", answers: ["Редкий", "Эпический", "Легендарный", "Мифический"], correct: 2 },
    { question: "Какой боец бросает чемоданы?", answers: ["Мистер П.", "Гейл", "Лу", "Поко"], correct: 0 },
    { question: "Кто из этих бойцов является роботом?", answers: ["Булл", "Рико", "Эль Примо", "Кольт"], correct: 1 },
    { question: "Какое оружие использует Кольт?", answers: ["Два револьвера", "Дробовик", "Молот", "Лук"], correct: 0 }
];

function prepareQuestions() {
    let shuffled = [...allQuizQuestions].sort(() => 0.5 - Math.random());
    activeQuestions = shuffled.slice(0, 5); // Выбираем все 5 вопросов
    currentQuestionIndex = 0;
}

// 3. ЛОГИКА ГЛАВНОГО МЕНЮ
quizBtn.addEventListener('click', () => {
    quizSection.style.display = 'block';
    clickSection.style.display = 'none';
    brawlersSection.style.display = 'none';
});

document.getElementById('click-btn').addEventListener('click', () => {
    quizSection.style.display = 'none';
    clickSection.style.display = 'block';
    brawlersSection.style.display = 'none';
});

brawlerBtn.addEventListener('click', () => {
    quizSection.style.display = 'none';
    clickSection.style.display = 'none';
    brawlersSection.style.display = 'block';
    renderBrawlers();
});

// 4. ЛОГИКА КЛИКЕРА
function getBonusPower() {
    let extraPower = 0;
    brawlers.forEach(b => {
        if (b.level > 1) { extraPower += (b.level - 1) * b.bonus; }
    });
    return extraPower;
}

function updateClickPower() {
    let totalPower = goldPerClick + getBonusPower();
    clickPowerTxt.textContent = totalPower;
}

clickActionBtn.addEventListener('click', () => {
    gold += (goldPerClick + getBonusPower());
    counter.textContent = gold;
    saveGame();
});

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
        card.style.border = "2px solid #4b5563";
        card.style.borderRadius = "8px";
        card.style.padding = "15px";
        card.style.textAlign = "center";
        card.style.backgroundColor = "#1f2937";
        card.style.color = "white";

        card.innerHTML = `
            <h3 style="margin: 0 0 5px 0; color: #3b82f6;">${brawler.name}</h3>
            <p style="margin: 5px 0;">Уровень: <span style="color: #4ade80; font-weight:bold;">${brawler.level}</span></p>
            <p style="margin: 5px 0; font-size:13px; opacity:0.9;">Даёт к клику: +${(brawler.level - 1) * brawler.bonus} золота</p>
            <button id="up-brawler-${index}" style="margin-top: 10px; padding: 6px 12px; cursor: pointer; border-radius: 4px; border: none; font-weight: bold;">
                Прокачать: ${cost} Золота
            </button>
        `;
        brawlersList.appendChild(card);

        const upBtn = document.getElementById(`up-brawler-${index}`);
        if (gold < cost) {
            upBtn.style.backgroundColor = "#4b5563";
            upBtn.style.color = "#9ca3af";
            upBtn.style.cursor = "not-allowed";
        } else {
            upBtn.style.backgroundColor = "#eab308";
            upBtn.style.color = "#000";
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
            btn.style.backgroundColor = "#3b82f6";
            btn.style.color = "white";
            btn.style.margin = "5px";
            btn.style.padding = "10px 20px";
            btn.style.border = "none";
            btn.style.borderRadius = "6px";
            btn.style.cursor = "pointer";
            btn.style.fontSize = "16px";
            
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
        let savedBrawlers = localStorage.getItem('brawlers_data');
        if(savedBrawlers) { brawlers = JSON.parse(savedBrawlers); }
        counter.textContent = gold;
        upgradeBtn.textContent = 'Купить Шахту (Цена: ' + upgradeCost + ' золота)';
    }
    updateClickPower();
}

// ЗАПУСК ИГРЫ
loadGame();
prepareQuestions();
loadQuestion();
