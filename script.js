// 1. НАХОДИМ ЭЛЕМЕНТЫ НА СТРАНИЦЕ
const counter = document.getElementById('gold-count');
const clickPowerTxt = document.getElementById('click-power');
const upgradeBtn = document.getElementById('upgrade-btn');
const clickActionBtn = document.getElementById('click-action-btn');

// Кнопка меню и блок викторины
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

// База вопросов викторины
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

// 3. ЛОГИКА ГЛАВНОГО МЕНЮ
// При клике на "Викторина" показываем её блок и прячем кликер
quizBtn.addEventListener('click', () => {
    quizSection.style.display = 'block';
    clickSection.style.display = 'none';
});

// При клике на "Кликер" возвращаем всё обратно
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
        upgradeBtn.style.backgroundColor = ""; // Сброс цвета, если до этого была ошибка
        saveGame();
    } else {
        // Вместо alert кнопка просто кратковременно мигает красным
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
        answersBlock.innerHTML = "<p style='color: #4ade80; font-size: 18px; font-weight: bold;'>Вы дошли до конца викторины!</p>";
    }
}

function checkAnswer(selectedIndex) {
    let currentQuestion = quizQuestions[currentQuestionIndex];
    
    // Если ответ правильный — просто без окон добавляем золото
    if (selectedIndex === currentQuestion.correct) {
        gold += 10;
        counter.textContent = gold;
        saveGame();
    }
    
    // Сразу же переходим к следующему вопросу без пауз
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

// Запуск при старте страницы
loadGame();
loadQuestion();
