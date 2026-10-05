// 1. НАХОДИМ ЭЛЕМЕНТЫ НА СТРАНИЦЕ
const counter = document.getElementById('gold-count');
const clickPowerTxt = document.getElementById('click-power');
const upgradeBtn = document.getElementById('upgrade-btn');
const clickActionBtn = document.getElementById('click-action-btn');

const quizBtn = document.getElementById('quiz-btn');
const quizSection = document.getElementById('quiz-section');
const clickSection = document.getElementById('click-section');

const questionText = document.getElementById('questionText');
const answersBlock = document.getElementById('answersBlock');

// 2. ИСХОДНЫЕ ДАННЫЕ ИГРЫ
let gold = 0;
let goldPerClick = 1;
let upgradeCost = 15;

let currentQuestionIndex = 0;
let activeQuestions = []; // Здесь будут храниться 15 случайных вопросов

// ОГРОМНАЯ БАЗА ВОПРОСОВ (26 штук — отсюда скрипт выберет 15)
const allQuizQuestions = [
    { question: "Кто является начальным бойцом в Brawl Stars?", answers: ["Шелли", "Кольт", "Нита", "Брок"], correct: 0 },
    { question: "Какая редкость у бойца Леон?", answers: ["Редкий", "Эпический", "Легендарный", "Мифический"], correct: 2 },
    { question: "Какой боец бросает чемоданы?", answers: ["Мистер П.", "Гейл", "Лу", "Поко"], correct: 0 },
    { question: "Кто из этих бойцов является роботом?", answers: ["Булл", "Рико", "Эль Примо", "Кольт"], correct: 1 },
    { question: "Какое животное вызывает Нита своей суперспособностью?", answers: ["Скример", "Медведь", "Собака", "Кот"], correct: 1 },
    { question: "Кто лечит своих союзников музыкой?", answers: ["Поко", "Брок", "Пайпер", "Спайк"], correct: 0 },
    { question: "Какое максимальное количество игроков в одной команде в 3v3?", answers: ["2", "3", "4", "5"], correct: 1 },
    { question: "Кто атакует картами?", answers: ["Тара", "Джин", "Макс", "Роза"], correct: 0 },
    { question: "Как зовут сестру Ниты по лору игры?", answers: ["У нее нет сестры", "Беа", "Джесси", "Шелли"], correct: 0 },
    { question: "Какой боец является кактусом?", answers: ["Спайк", "Ворон", "Леон", "Сэнди"], correct: 0 },
    { question: "Кто стреляет из снайперской винтовки и раскрывает зонтик?", answers: ["Пайпер", "Биби", "Коллет", "Эмз"], correct: 0 },
    { question: "Что нужно собирать в режиме 'Захват кристаллов' для победы?", answers: ["Звезды", "Кубки", "Кристаллы", "Мячи"], correct: 2 },
    { question: "Кто бегает с бейсбольной битой?", answers: ["Биби", "Джекки", "Динамайк", "Фрэнк"], correct: 0 },
    { question: "Какое оружие использует Кольт?", answers: ["Два револьвера", "Дробовик", "Молот", "Лук"], correct: 0 },
    { question: "Кто бросает динамитные шашки?", answers: ["Динамайк", "Барли", "Тик", "Спраут"], correct: 0 },
    { question: "Какой боец прыгает с помощью супера и кричит 'Эль Примооо'?", answers: ["Эль Примо", "Эдгар", "Кроу", "Булл"], correct: 0 },
    { question: "Кто является бывшим хроматическим бойцом?", answers: ["Гейл", "Шелли", "Эль Примо", "Барли"], correct: 0 },
    { question: "Какой титул или имя носит огромный робот из Ограбления?", answers: ["Сейф", "Робо-Босс", "Тараканище", "Скраппи"], correct: 1 },
    { question: "Кто атакует врагов ядовитыми кинжалами?", answers: ["Ворон", "Леон", "Спайк", "Сэнди"], correct: 0 },
    { question: "Какое оружие использует боец Брок?", answers: ["Ракетницу", "Лазер", "Пистолет", "Гитару"], correct: 0 },
    { question: "Какой боец постоянно спит на ходу и ходит в капюшоне?", answers: ["Сэнди", "Леон", "Эдгар", "Поко"], correct: 0 },
    { question: "Кто является пиратом и стреляет монетами из мушкетона?", answers: ["Дэррил", "Пенни", "Тик", "Булл"], correct: 1 },
    { question: "Какой боец может притянуть врага к себе волшебной рукой?", answers: ["Джин", "Тара", "Мортис", "Спайк"], correct: 0 },
    { question: "Кто орудует лопатой и быстро перемещается рывками?", answers: ["Мортис", "Фрэнк", "Поко", "Эль Примо"], correct: 0 },
    { question: "Как называется супер-способность бойца Джесси?", answers: ["Поставить турель", "Вызвать медведя", "Выстрелить ракетой", "Ускориться"], correct: 0 },
    { question: "Какая кнопка отвечает за использование особого гаджета бойца?", answers: ["Зеленая", "Желтая", "Красная", "Синяя"], correct: 0 }
];

// Функция для случайного перемешивания и выбора ровно 15 вопросов
function prepareQuestions() {
    let shuffled = [...allQuizQuestions].sort(() => 0.5 - Math.random());
    activeQuestions = shuffled.slice(0, 15);
    currentQuestionIndex = 0;
}

// 3. ЛОГИКА ГЛАВНОГО МЕНЮ
quizBtn.addEventListener('click', () => {
    quizSection.style.display = 'block';
    clickSection.style.display = 'none';
});

document.getElementById('click-btn').addEventListener('click', () => {
    quizSection.style.display = 'none';
    clickSection.style.display = 'block';
});

// 4. ЛОГИКА КЛИКЕРА
clickActionBtn.addEventListener('click', () => {
    gold += goldPerClick;
    counter.textContent = gold;
    saveGame();
});

upgradeBtn.addEventListener('click', () => {
    if (gold >= upgradeCost) {
        gold -= upgradeCost;
        goldPerClick += 1;
        upgradeCost = Math.round(upgradeCost * 1.5);
        counter.textContent = gold;
        clickPowerTxt.textContent = goldPerClick;
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

// 5. ЛОГИКА ВИКТОРИНЫ
function loadQuestion() {
    if (currentQuestionIndex < activeQuestions.length) {
        let currentQuestion = activeQuestions[currentQuestionIndex];
        questionText.textContent = `Вопрос ${currentQuestionIndex + 1} из 15: ${currentQuestion.question}`;
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
        answersBlock.innerHTML = "<p style='color: #4ade80; font-size: 18px; font-weight: bold;'>Вы ответили на все 15 вопросов! Обновите страницу, чтобы получить новые вопросы.</p>";
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

// 6. СОХРАНЕНИЕ ПРОГРЕССА
function saveGame() {
    localStorage.setItem('gold', gold);
    localStorage.setItem('goldPerClick', goldPerClick);
    localStorage.setItem('upgradeCost', upgradeCost);
}

function loadGame() {
    if(localStorage.getItem('gold')) {
        gold = parseInt(localStorage.getItem('gold'));
        goldPerClick = parseInt(localStorage.getItem('goldPerClick'));
        upgradeCost = parseInt(localStorage.getItem('upgradeCost'));
        counter.textContent = gold;
        clickPowerTxt.textContent = goldPerClick;
        upgradeBtn.textContent = 'Купить Шахту (Цена: ' + upgradeCost + ' золота)';
    }
}

// ЗАПУСК ИГРЫ
loadGame();
prepareQuestions(); // Случайный выбор 15 вопросов из 26 при старте
loadQuestion();
