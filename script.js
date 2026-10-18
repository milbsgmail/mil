// --- 1. Состояние игры ---
let gold = 0, gPerClick = 1, upCost = 15, curQIdx = 0, actQs = [], usedPromos = [], isUltRdy = false, isUltAct = false, ultMult = 1, lastBox = 0;
let onlinePlayers = [{ name: "Magician_BS", gold: 95400 }, { name: "CyberLeon", gold: 82100 }, { name: "BrawlMaster", gold: 74500 }];

const defBrawlers = [
    { name: "Шелли", level: 1, baseCost: 10, bonus: 1, bonus_passive: 2, icon: "🤠", rarity: "rare" },
    { name: "Кольт", level: 1, baseCost: 35, bonus: 2, bonus_passive: 5, icon: "🔫", rarity: "epic" },
    { name: "Нита", level: 1, baseCost: 80, bonus: 4, bonus_passive: 12, icon: "🐻", rarity: "epic" },
    { name: "Леон", level: 1, baseCost: 250, bonus: 10, bonus_passive: 35, icon: "🦎", rarity: "legendary" }
];
let brawlers = JSON.parse(JSON.stringify(defBrawlers));

const allQs = [
    { question: "Кто начальный боец в Brawl Stars?", answers: ["Шелли", "Кольт", "Нита"], correct: 0 },
    { question: "Какая rarity у Леона?", answers: ["Редкий", "Эпический", "Легендарный"], correct: 2 },
    { question: "Какая валюта используется для покупки Шахты?", answers: ["Кристаллы", "Золото", "Стар Поинты"], correct: 1 },
    { question: "Какое животное вызывает Нита своим Супером?", answers: ["Медведь", "Собака", "Хамелеон"], correct: 0 },
    { question: "Какое максимальное количество вопросов в викторине?", answers: ["3", "10", "5"], correct: 2 }
];

// --- 2. Получение DOM-элементов ---
const $ = id => document.getElementById(id);
const el = {
    gold: $('gold-count'), power: $('click-power'), cps: $('cps-display'), upgrade: $('upgrade-btn'),
    click: $('click-action-btn'), quizBtn: $('quiz-btn'), brawlerBtn: $('brawler-btn'), clickBtn: $('click-btn'),
    topBtn: $('top-btn'), quizSec: $('quiz-section'), clickSec: $('click-section'), brawlerSec: $('brawlers-section'),
    topSec: $('top-section'), list: $('brawlers-list'), qText: $('questionText'), ansBlock: $('answersBlock'),
    pInput: $('promo-input'), pBtn: $('promo-btn'), pMsg: $('promo-msg'), reset: $('reset-progress-btn'),
    box: $('megabox-btn'), ultBar: $('ult-timer'), alert: $('custom-alert-container')
};

// --- 3. Базовые функции ---
function saveGame() { localStorage.setItem('brawlClubSave', JSON.stringify({ gold, gPerClick, upCost, usedPromos, brawlers: brawlers.map(b => ({ name: b.name, level: b.level })), onlinePlayers, lastBox })); }
function getBClick() { return brawlers.reduce((s, b) => s + (b.level > 1 ? (b.level - 1) * b.bonus : 0), 0); }
function getBPass() { return brawlers.reduce((s, b) => s + (b.level > 1 ? (b.level - 1) * b.bonus_passive : 0), 0); }

function updateUI() {
    if (el.gold) el.gold.textContent = Math.floor(gold);
    if (el.power) el.power.textContent = (gPerClick + getBClick()) * ultMult;
    if (el.cps) el.cps.textContent = `В секунду: +${getBPass()} золота`;
    if (el.upgrade) el.upgrade.textContent = `Купить Шахту (Цена: ${upCost} золота)`;
}

function showBrawlAlert(m) {
    if (!el.alert) return; const b = document.createElement('div'); b.className = 'brawl-alert'; b.innerText = m; el.alert.appendChild(b);
    setTimeout(() => { b.style.opacity = '0'; b.style.transform = 'translateY(-20px)'; b.style.transition = 'all 0.4s'; setTimeout(() => b.remove(), 400); }, 3000);
}

function switchTab(s) { [el.quizSec, el.clickSec, el.brawlerSec, el.topSec].forEach(x => { if(x) x.style.display = 'none'; }); if(s) s.style.display = 'block'; }

// --- 4. Механика клика и вылетающих цифр ---
if (el.click) {
    el.click.addEventListener('click', (e) => {
        if (isUltRdy && !isUltAct) activateUlt();
        const p = (gPerClick + getBClick()) * ultMult; gold += p;
        if (el.gold) el.gold.textContent = Math.floor(gold);
        createFloatNum(e, p); saveGame();
    });
}

function createFloatNum(e, v) {
    const f = document.createElement('div'); f.className = isUltAct ? 'floating-number ult-float' : 'floating-number'; f.innerText = `+${v}`;
    f.style.left = `${e.pageX}px`; f.style.top = `${e.pageY}px`;
    const rx = Math.floor(Math.random() * 101) - 50, ry = Math.floor(Math.random() * 61) - 140;
    f.style.setProperty('--x-dir', `${rx}px`); f.style.setProperty('--y-dir', `${ry}px`);
    document.body.appendChild(f); setTimeout(() => f.remove(), 600);
}

// --- 5. Шахта и Прокачка бойцов ---
if (el.upgrade) {
    el.upgrade.addEventListener('click', () => {
        if (gold >= upCost) { gold -= upCost; gPerClick += 1; upCost = Math.round(upCost * 1.5); updateUI(); showBrawlAlert("⚒️ Шахта куплена!"); saveGame(); }
        else showBrawlAlert("❌ Недостаточно золота!");
    });
}

function renderBrawlers() {
    if (!el.list) return; el.list.innerHTML = '';
    brawlers.forEach((b, i) => {
        const cost = Math.round(b.baseCost * Math.pow(1.6, b.level - 1));
        const card = document.createElement('div'); card.className = `brawler-card brawler-${b.rarity || 'rare'}`;
        card.innerHTML = `<div class="avatar-fallback">${b.icon}</div><h3 style="margin:5px 0;color:#ffcc00;text-shadow:1px 1px 0 #000;">${b.name}</h3><p style="margin:2px 0;font-size:14px;font-weight:bold;">Уровень: ${b.level}</p><p style="margin:2px 0;font-size:12px;color:#4ade80;font-weight:bold;">Клик: +${(b.level - 1) * b.bonus}</p><p style="margin:2px 0;font-size:12px;color:#60a5fa;font-weight:bold;">Пассив: +${(b.level - 1) * b.bonus_passive}/с</p><button id="buy-brawler-${i}" style="padding:6px 12px;font-size:13px;width:100%;margin-top:10px;">Прокачать (${cost} З.)</button>`;
        el.list.appendChild(card);
        document.getElementById(`buy-brawler-${i}`).addEventListener('click', () => {
            const currentCost = Math.round(b.baseCost * Math.pow(1.6, b.level - 1));
            if (gold >= currentCost) { gold -= currentCost; b.level += 1; updateUI(); renderBrawlers(); showBrawlAlert(`⭐ ${b.name} прокачан!`); saveGame(); }
            else showBrawlAlert("❌ Недостаточно золота!");
        });
    });
}

// --- 6. Викторина ---
function initQuiz() { actQs = [...allQs].sort(() => 0.5 - Math.random()).slice(0, 5); curQIdx = 0; showQuestion(); }
function showQuestion() {
    if (!el.qText || !el.ansBlock) return; el.ansBlock.innerHTML = '';
    if (curQIdx >= actQs.length) { const b = 150; gold += b; el.qText.innerText = "🎉 Викторина пройдена!"; el.ansBlock.innerHTML = `<p style="color:#4ade80;font-weight:bold;">Бонус +${b} золота!</p>`; updateUI(); saveGame(); return; }
    const q = actQs[curQIdx]; el.qText.innerText = `Вопрос ${curQIdx + 1}/${actQs.length}: ${q.question}`;
    q.answers.forEach((ans, idx) => {
        const btn = document.createElement('button'); btn.innerText = ans; btn.className = 'quiz-answer-btn'; btn.style = 'display:block;width:100%;max-width:300px;margin:8px auto;padding:10px;font-weight:bold;cursor:pointer;';
        btn.addEventListener('click', () => {
            if (idx === q.correct) { gold += 30; showBrawlAlert("✅ Правильно! +30 Золота"); } else showBrawlAlert("❌ Неверно!");
            curQIdx++; updateUI(); showQuestion();
        });
        el.ansBlock.appendChild(btn);
    });
}

// --- 7. Супер-клик (Ульта) ---
setInterval(() => {
    if (!isUltAct && !isUltRdy && el.click) {
        isUltRdy = true; el.click.classList.add('ult-ready'); showBrawlAlert("⚡ СУПЕР-КЛИК ГОТОВ!");
        setTimeout(() => { if (isUltRdy && !isUltAct && el.click) { isUltRdy = false; el.click.classList.remove('ult-ready'); } }, 4000);
    }
}, 60000);

function activateUlt() {
    if (!el.click || !el.ultBar) return; isUltRdy = false; isUltAct = true; ultMult = 5; el.click.classList.remove('ult-ready'); el.click.classList.add('ult-active'); el.ultBar.style.display = 'block'; el.ultBar.style.width = '100%'; updateUI();
    let duration = 5000, start = null;
    requestAnimationFrame(function step(ts) {
        if (!start) start = ts; let progress = ts - start; el.ultBar.style.width = `${Math.max(0, 100 - (progress / duration) * 100)}%`;
        if (progress < duration) requestAnimationFrame(step);
        else { isUltAct = false; ultMult = 1; el.click.classList.remove('ult-active'); el.ultBar.style.display = 'none'; updateUI(); saveGame(); }
    });
}

// --- 8. Мегабокс, Топ, Промокоды, Сброс ---
if (el.box) {
    el.box.addEventListener('click', () => {
        const now = Date.now(), cd = 24 * 60 * 60 * 1000;
        if (now - lastBox < cd) { const t = cd - (now - lastBox), h = Math.floor(t / 3600000), m = Math.floor((t % 3600000) / 60000); showBrawlAlert(`⏳ Ждать: ${h}ч ${m}м`); return; }
        const r = Math.floor(Math.random() * 801) + 200; gold += r; lastBox = now; showBrawlAlert(`🎁 МЕГАБОКС! Вы выбили +${r} золота!`); updateUI(); saveGame();
    });
}

function renderLeaderboard() {
    const tbody = document.querySelector('#top-section table tbody'); if (!tbody) return; tbody.innerHTML = '';
    let list = [...onlinePlayers, { name: "Вы (Игрок Клуба)", gold: Math.floor(gold), isPlayer: true }].sort((a, b) => b.gold - a.gold);
    list.forEach((p, idx) => {
        const tr = document.createElement('tr'); if (p.isPlayer) tr.style.backgroundColor = 'rgba(255, 204, 0, 0.2)';
        tr.innerHTML = `<td>${idx + 1}</td><td style="${p.isPlayer ? 'font-weight:bold;color:#ffcc00;' : ''}">${p.name}</td><td>${p.gold}</td>`; tbody.appendChild(tr);
    });
}

const promoList = { "BRAWL": 100, "GOLD": 300, "DEV100": 100, "FREECOINS": 250, "SHELLYUP": 500, "COLTUP": 500, "SHAKHTA": 400 };
if (el.pBtn && el.pInput && el.pMsg) {
    el.pBtn.addEventListener('click', () => {
        const code = el.pInput.value.trim().toUpperCase();
        if (usedPromos.includes(code)) { el.pMsg.style.color = '#ef4444'; el.pMsg.innerText = "Уже активирован!"; return; }
        if (promoList[code] !== undefined) { gold += promoList[code]; usedPromos.push(code); el.pMsg.style.color = '#4ade80'; el.pMsg.innerText = `+${promoList[code]} золота!`; el.pInput.value = ''; updateUI(); saveGame(); }
        else { el.pMsg.style.color = '#ef4444'; el.pMsg.innerText = "Неверный код!"; }
    });
}

