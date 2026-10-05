// 1. НАХОДИМ ЭЛЕМЕНТЫ НА СТРАНИЦЕ
const counter = document.getElementById('gold-count');
const clickPowerTxt = document.getElementById('click-power');
const upgradeBtn = document.getElementById('upgrade-btn');
const clickActionBtn = document.getElementById('click-action-btn');

const questionText = document.getElementById('questionText');
const answersBlock = document.getElementById('answersBlock');

// 2. ИСХОДНЫЕ ДАННЫЕ ИГРЫ (ПЕРЕМЕННЫЕ)
let gold = 0;
let goldPerClick = 1;
let upgradeCost = 15;

let currentQuestionIndex = 0;

// База данных вопросов для викторины (можете изменить вопросы на свои)
const quizQuestions = [
    {
        question: "Кто является начальным бойцом в Brawl Stars?",
        answers: ["Шелли", "Кольт", "Нита", "Эль Примо"],
        correct: 0
    },
    {
        question: "Какая редкость у бойца Леон?",
        answers: ["Редкий", "Сверхредкий", "Эпический", "Легендарный"],
        correct: 3
    }
];

// 3. ЛОГИКА КЛИКЕРА
// Функция обычного клика по кнопке "Клик!"
clickActionBtn.addEventListener('click', () => {
    gold += goldPerClick;
    counter.textContent = gold;
    saveGame();
});

// Функция покупки улучшения (Шахты), которую вы открыли в Блокноте
upgradeBtn.addEventListener('click', () => {
    if (gold >= upgradeCost) {
        gold -= upgradeCost;
        goldPerClick += 1;
        upgradeCost = Math.round(upgradeCost * 1.5);

        counter.textContent = gold;
        clickPowerTxt.textContent = goldPerClick;
        upgradeBtn.textContent = 'Купить Шахту (Цена: ' + upgradeCost + ' золота)';
        saveGame();
    } else {
        alert('Недостаточно золота для покупки Шахты!');
    }
});

// 4. ЛОГИКА ВИКТОРИНЫ
function loadQuestion() {
    if (currentQuestionIndex < quizQuestions.length) {
        let currentQuestion = quizQuestions[currentQuestionIndex];
        questionText.textContent = `Вопрос ${currentQuestionIndex + 1}: ${currentQuestion.question}`;
        answersBlock.innerHTML = "";

        currentQuestion.answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.textContent = answer;
            btn.style.backgroundColor = "#3b82f6";
            btn.style.color = "white";
            btn.style.margin = "5px";
            btn.style.padding = "10px";
            btn.style.border = "none";
            btn.style.borderRadius = "6px";
            btn.style.cursor = "pointer";
            
            btn.addEventListener('click', () => checkAnswer(index));
            answersBlock.appendChild(btn);
        });
    } else {
        questionText.innerHTML = "🎉 Викторина окончена!";
        answersBlock.innerHTML = "<p style='color: #4ade80; font-size: 18px;'>Вы ответили правильно на все вопросы или дошли до конца!</p>";
    }
}

function checkAnswer(selectedIndex) {
    let currentQuestion = quizQuestions[currentQuestionIndex];
    if (selectedIndex === currentQuestion.correct) {
        alert("Правильно! +10 золота");
        gold += 10; // Бонус за правильный ответ
        counter.textContent = gold;
    } else {
        alert("Неправильно, попробуй еще раз!");
    }
    currentQuestionIndex++;
    loadQuestion();
}

// Вспомогательные функции (заглушки для сохранения, чтобы не было ошибок в консоли)
function saveGame() {
    localStorage.setItem('gold', gold);
    localStorage.setItem('goldPerClick', goldPerClick);
    localStorage.setItem('upgradeCost', upgradeCost);
}

// Загрузка сохраненной игры при старте страницы
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

// ЗАПУСК ИГРЫ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
loadGame();
loadQuestion();
