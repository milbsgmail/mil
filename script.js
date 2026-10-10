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
const leaderboardBody = document.getElementById('leaderboard-body');

// 2. ИГРОВЫЕ ДАННЫЕ
let gold = 0, goldPerClick = 1, upgradeCost = 15, currentQuestionIndex = 0;
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

// 3. НАВИГАЦИЯ МЕНЮ
function switchTab(showSec, activeBtn) {
    [quizSection, clickSection, brawlersSection, topSection].forEach(s => s.classList.add('hidden'));
    [clickBtn, brawlerBtn, quizBtn, topBtn].forEach(b => b.classList.remove('active'));
    showSec.classList.remove('hidden');
    activeBtn.classList.add('active');
}
clickBtn.addEventListener('click', () => switchTab(clickSection, clickBtn));
brawlerBtn.addEventListener('click', () => { switchTab(brawlersSection, brawlerBtn); renderBrawlers(); });
quizBtn.addEventListener('click', () => { switchTab(quizSection, quizBtn); initQuiz(); });
topBtn.addEventListener('click', () => { switchTab(topSection, topBtn); renderLeaderboard(); });

// 4. МЕХАНИКА И UI
function getBonusPower() { return brawlers.reduce((sum, b) => sum + (b.level > 1 ? (b.level - 1) * b.bonus : 0), 0); }
function getPassiveIncome() { return brawlers.reduce((sum, b) => sum + (b.level > 1 ? (b.level - 1) * b.bonus_passive : 0), 0); }
function updateUI() {
    counter.textContent = Math.floor(gold);
    clickPowerTxt.textContent = goldPerClick + getBonusPower();
    cpsDisplay.textContent = `В секунду: +${getPassiveIncome()} золота`;
    upgradeBtn.textContent = `Купить Шахту (Цена: ${upgradeCost} золота)`;
}

clickActionBtn.addEventListener('click', () => { gold += (goldPerClick + getBonusPower()); counter.textContent = Math.floor(gold); saveGame(); });
upgradeBtn.addEventListener('click', () => {
    if (gold >= upgradeCost) {
        gold -= upgradeCost; goldPerClick += 1; upgradeCost = Math.round(upgradeCost * 1.5); updateUI(); saveGame();
    } else {
        const old = upgradeBtn.textContent; upgradeBtn.textContent = "Недостаточно золота!"; setTimeout(() => { upgradeBtn.textContent = old; }, 1000);
    }
});

// 5. ПРОМОКОДЫ
promoBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (code === "") { promoMsg.style.color = "#ef4444"; promoMsg.textContent = "Введите код!"; return; }
    if (usedPromocodes.includes(code)) { promoMsg.style.color = "#ef4444"; promoMsg.textContent = "Вы уже активировали этот промокод!"; return; }
    if (code === "BRAWL") { gold += 5000; promoMsg.style.color = "#4ade80"; promoMsg.textContent = "Получено +5,000 золота!"; }
    else if (code === "GOLD") { gold += 50000; promoMsg.style.color = "#4ade80"; promoMsg.textContent = "Получено +50,000 золота!"; }
    else if (code === "DEV100") { gold += 1000000; promoMsg.style.color = "#a855f7"; promoMsg.textContent = "Режим Создателя! +1,000,000 золота! 👑"; }
    else if (code === "SHELLYUP") { brawlers[0].level += 5; promoMsg.style.color = "#3b82f6"; promoMsg.textContent = "Шелли +5 уровней! 🔥"; }
    else if (code === "COLTUP") { brawlers[1].level += 5; promoMsg.style.color = "#ec4899"; promoMsg.textContent = "Кольт +5 уровней! 🔫"; }
    else if (code === "SHAKHTA") { goldPerClick += 20; promoMsg.style.color = "#fb923c"; promoMsg.textContent = "Сила клика +20! ⛏️"; }
    else if (code === "FREECOINS") { gold += 1500; promoMsg.style.color = "#eab308"; promoMsg.textContent = "Получено +1,500 золота! 🪙"; }
    else { promoMsg.style.color = "#ef4444"; promoMsg.textContent = "Такого промокода не существует!"; return; }
    usedPromocodes.push(code); promoInput.value = ""; updateUI(); saveGame();
});
// 6. БОЙЦЫ
function renderBrawlers() {
    brawlersList.innerHTML = "";
    brawlers.forEach((b, i) => {
        let cost = Math.round(b.baseCost * Math.pow(1.6, b.level - 1));
        const card = document.createElement('div'); card.className = "brawler-card";
        card.innerHTML = `<h3 class="brawler-name">${b.name}</h3><div class="brawler-level">Уровень: <b>${b.level}</b></div><div class="brawler-stats"><div>💥 Клик: +${(b.level - 1) * b.bonus}</div><div>⏱️ Пассив: +${(b.level - 1) * b.bonus_passive}/с</div></div><button id="up-brawler-${i}" class="menu-btn brawler-up-btn">Прокачать: ${cost}</button>`;
        brawlersList.appendChild(card);
        const upBtn = document.getElementById(`up-brawler-${i}`);
        if (gold < cost) upBtn.style.opacity = "0.6";
        upBtn.addEventListener('click', () => {
            if (gold >= cost) { gold -= cost; b.level += 1; saveGame(); updateUI(); renderBrawlers(); }
            else { const o = upBtn.textContent; upBtn.textContent = "Недостаточно золота!"; setTimeout(() => { upBtn.textContent = `Прокачать: ${cost}`; }, 1000); }
        });
    });
}

// 7. ВИКТОРИНА
function initQuiz() { activeQuestions = [...allQuizQuestions].sort(() => 0.5 - Math.random()).slice(0, 5); currentQuestionIndex = 0; loadQuestion(); }
function loadQuestion() {
    if (currentQuestionIndex < activeQuestions.length) {
        let q = activeQuestions[currentQuestionIndex]; questionText.textContent = `Вопрос ${currentQuestionIndex + 1} из 5: ${q.question}`; answersBlock.innerHTML = "";
        const feedback = document.createElement('div'); feedback.style.fontSize = "16px"; feedback.style.fontWeight = "bold"; feedback.style.marginTop = "15px";
        q.answers.forEach((ans, i) => {
            const btn = document.createElement('button'); btn.className = "quiz-ans-btn"; btn.textContent = ans;
            btn.addEventListener('click', () => {
                answersBlock.querySelectorAll('.quiz-ans-btn').forEach(b => b.disabled = true);
                if (i === q.correct) { gold += 10; feedback.style.color = "#4ade80"; feedback.textContent = "Правильно! +10 золота! 🎉"; updateUI(); saveGame(); }
                else { feedback.style.color = "#ef4444"; feedback.textContent = `Неверно! Ответ: ${q.answers[q.correct]} ❌`; }
                setTimeout(() => { currentQuestionIndex++; loadQuestion(); }, 1500);
            });
            answersBlock.appendChild(btn);
        });
        answersBlock.appendChild(feedback);
    } else {
        questionText.innerHTML = "🎉 Викторина окончена!"; answersBlock.innerHTML = "";
        const rBtn = document.createElement('button'); rBtn.className = "action-btn"; rBtn.textContent = "Начать заново"; rBtn.addEventListener('click', initQuiz); answersBlock.appendChild(rBtn);
    }
}

// 8. ТОП ИГРОКОВ И ТАЙМЕРЫ
function renderLeaderboard() {
    leaderboardBody.innerHTML = "";
    let records = [{ name: "Вы", gold: Math.floor(gold), isPlayer: true }, ...onlinePlayers.map(p => ({ name: p.name, gold: Math.floor(p.gold), isPlayer: false }))];
    records.sort((a, b) => b.gold - a.gold);
    records.forEach((p, idx) => {
        const tr = document.createElement('tr'); if (p.isPlayer) tr.className = "current-player";
        tr.innerHTML = `<td>${idx + 1}</td><td>${p.name}</td><td>${p.gold} 🪙</td>`; leaderboardBody.appendChild(tr);
    });
}

setInterval(() => {
    gold += getPassiveIncome(); onlinePlayers.forEach(p => { p.gold += Math.floor(Math.random() * 300) + 50; }); counter.textContent = Math.floor(gold);
    if (topSection.style.display !== 'none' && !topSection.classList.contains('hidden')) renderLeaderboard();
}, 1000);

// 9. СИСТЕМА СОХРАНЕНИЙ
function saveGame() { 
    localStorage.setItem('brawl_club_save', JSON.stringify({ gold, goldPerClick, upgradeCost, usedPromocodes, brawlers, onlinePlayers })); 
}

function loadGame() {
    const saved = localStorage.getItem('brawl_club_save');
    if (saved) {
        try {
            const d = JSON.parse(saved); 
            gold = d.gold || 0; 
            goldPerClick = d.goldPerClick || 1; 
            upgradeCost = d.upgradeCost || 15; 
            usedPromocodes = d.usedPromocodes || [];
            if (d.brawlers) brawlers = d.brawlers; 
            if (d.onlinePlayers) onlinePlayers = d.onlinePlayers;
        } catch (e) { console.error(e); }
    }
    updateUI();
}

setInterval(saveGame, 15000);
loadGame();
