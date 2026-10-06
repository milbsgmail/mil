// Продолжение секции викторины
function loadQuestion() {
    answersBlock.innerHTML = "";
    restartQuizBtn.style.display = "none";

    if (currentQuestionIndex >= activeQuestions.length) {
        questionText.textContent = "Викторина завершена! Вы ответили на все вопросы. 🎉";
        return;
    }

    const currentQ = activeQuestions[currentQuestionIndex];
    questionText.textContent = `Вопрос ${currentQuestionIndex + 1}: ${currentQ.question}`;

    currentQ.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.textContent = answer;
        btn.className = "quiz-answer-btn"; // можно настроить стили в CSS
        btn.addEventListener('click', () => checkAnswer(index));
        answersBlock.appendChild(btn);
    });
}

function checkAnswer(selectedIndex) {
    const currentQ = activeQuestions[currentQuestionIndex];
    if (selectedIndex === currentQ.correct) {
        gold += 100; // Награда за правильный ответ
        counter.textContent = Math.floor(gold);
        alert("Правильно! +100 золота! 🎉");
    } else {
        alert("Неправильно! Попробуйте в следующий раз. 😢");
    }
    currentQuestionIndex++;
    loadQuestion();
}

restartQuizBtn.addEventListener('click', () => {
    initQuiz();
});


// 7. ТАБЛИЦА ЛИДЕРОВ
function renderLeaderboard() {
    leaderboardBody.innerHTML = "";
    
    // Временно добавляем текущего игрока для отображения в топе
    let allPlayers = [...onlinePlayers, { name: "Вы (Игрок)", gold: Math.floor(gold) }];
    allPlayers.sort((a, b) => b.gold - a.gold);

    allPlayers.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.gold.toLocaleString()} 🪙</td>
        `;
        leaderboardBody.appendChild(row);
    });
}


// 8. СОХРАНЕНИЕ И ЗАГРУЗКА ИГРЫ (LocalStorage)
function saveGame() {
    const gameData = {
        gold: gold,
        goldPerClick: goldPerClick,
        upgradeCost: upgradeCost,
        brawlers: brawlers,
        usedPromocodes: usedPromocodes
    };
    localStorage.setItem('brawlClickerSave', JSON.stringify(gameData));
}

function loadGame() {
    const savedData = localStorage.getItem('brawlClickerSave');
    if (savedData) {
        const data = JSON.parse(savedData);
        gold = data.gold || 0;
        goldPerClick = data.goldPerClick || 1;
        upgradeCost = data.upgradeCost || 15;
        brawlers = data.brawlers || JSON.parse(JSON.stringify(defaultBrawlers));
        usedPromocodes = data.usedPromocodes || [];
    }
    
    // Обновляем интерфейс после загрузки
    counter.textContent = Math.floor(gold);
    upgradeBtn.textContent = 'Купить Шахту (Цена: ' + upgradeCost + ' золота)';
    updateClickPower();
}


// 9. ПАССИВНЫЙ ДОХОД И СТАРТ ИГРЫ
// Каждую секунду начисляем пассивное золото от бойцов
setInterval(() => {
    let passive = getPassiveIncome();
    if (passive > 0) {
        gold += passive;
        counter.textContent = Math.floor(gold);
        // Если открыта вкладка топ-игроков, обновляем её в реальном времени
        if (topSection.style.display === 'block') {
            renderLeaderboard();
        }
    }
}, 1000);

// Инициализация при старте страницы
loadGame();
