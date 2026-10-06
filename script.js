// 6. ВИКТОРИНА (ПРОДОЛЖЕНИЕ)
function loadQuestion() {
    // Если ответили на все 5 вопросов из пула activeQuestions
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
        btn.className = 'quiz-answer-btn'; // Твой красивый класс из CSS
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

// 7. ТОП ИГРОКОВ (Сортировка и рендер)
function renderLeaderboard() {
    leaderboardBody.innerHTML = '';
    
    // Создаем копию списка онлайн-игроков, чтобы не портить исходный массив
    let fullLeaderboard = [...onlinePlayers];
    
    // Добавляем реального игрока
    fullLeaderboard.push({ name: "Ты (Текущая сессия)", gold: Math.floor(gold), isPlayer: true });
    
    // Сортируем по убыванию золота
    fullLeaderboard.sort((a, b) => b.gold - a.gold);

    fullLeaderboard.forEach((player, idx) => {
        const row = document.createElement('tr');
        
        // Подсвечиваем игрока с помощью твоего класса .player-row
        if (player.isPlayer) {
            row.className = 'player-row';
        }

        row.innerHTML = `
            <td>${idx + 1}</td>
            <td>${player.name}</td>
            <td>${player.gold}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

// 8. ПАССИВНЫЙ ДОХОД (ТАЙМЕР)
setInterval(() => {
    let income = getPassiveIncome();
    if (income > 0) {
        gold += income;
        counter.textContent = Math.floor(gold);
    }
}, 1000);

// Автосохранение каждые 15 секунд на всякий случай
setInterval(() => {
    saveGame();
}, 15000);

// 9. СХЕМА СОХРАНЕНИЯ И ЗАГРУЗКИ (LocalStorage)
function saveGame() {
    const gameData = {
        gold: gold,
        goldPerClick: goldPerClick,
        upgradeCost: upgradeCost,
        usedPromocodes: usedPromocodes,
        brawlers: brawlers
    };
    localStorage.setItem('brawl_club_save', JSON.stringify(gameData));
}

function loadGame() {
    const savedData = localStorage.getItem('brawl_club_save');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            gold = data.gold || 0;
            goldPerClick = data.goldPerClick || 1;
            upgradeCost = data.upgradeCost || 15;
            usedPromocodes = data.usedPromocodes || [];
            
            // Проверяем, чтобы загруженные бойцы соответствовали структуре
            if (data.brawlers && data.brawlers.length === brawlers.length) {
                brawlers = data.brawlers;
            }
        } catch (e) {
            console.error("Ошибка загрузки сохранения:", e);
        }
    }
    
    // Обновляем текст на кнопке апгрейда шахты при старте
    upgradeBtn.textContent = 'Купить Шахту (Цена: ' + upgradeCost + ' золота)';
    counter.textContent = Math.floor(gold);
    updateClickPower();
}

// Инициализация при запуске страницы
loadGame();
switchTab(clickSection); // Сразу открываем кликер
