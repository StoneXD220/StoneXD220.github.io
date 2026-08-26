const SERVER_IP = 'Inv-2.aryncloud.in:25537';
const DISCORD_URL = 'https://discord.gg/HeAJQQHcJ';
const INVITE_TEXT = `🔥 سيرفر ماينكرافت جديد! 🔥\n\n🚀 السيرفر جاهز وناطرينكم!\n\n🛒 شوب مرتب وحلو\n💰 سيل وعروض قوية\n📊 سكور بورد فخم\n🏰 سبون جميل ومميز\n👑 رتب حلوة ومميزة\n🎁 كيتات متنوعة وحلوة\n⚡ رامات قوية ولاق خفيف\n🌐 دخول سريع واستقرار ممتاز\n\n📌 IP: ${SERVER_IP}\n\n@everyone 🔔 لا تفوتون الفرصة، ادخلوا وجربوا السيرفر! 🔥`;
const COOLDOWN_KEY = 'apexPlusWheelLastSpin';
const COOLDOWN_MS = 5 * 24 * 60 * 60 * 1000;
const GAME_BEST_KEY = 'apexPlusGameBest';

const prizes = [
  { label: 'دروع دايموند وأدوات كاملة', icon: '💎', win: true },
  { label: 'Apex+ Kit', icon: '🎁', win: true },
  { label: '20K', icon: '💰', win: true },
  { label: 'حظ أوفر', icon: '🍀', win: false },
  { label: 'بيكاكس خارق', icon: '⛏️', win: true },
];

const toast = document.getElementById('toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
  }
  showToast(successMessage);
}

async function copyIp() {
  await copyText(SERVER_IP, 'تم نسخ عنوان السيرفر بنجاح ✅');
  document.getElementById('statusMessage').textContent = 'تم النسخ · افتح Minecraft Java والصق العنوان 🎮';
}

async function shareInvite() {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Apex+ Minecraft', text: INVITE_TEXT });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  await copyText(INVITE_TEXT, 'تم نسخ الدعوة للمشاركة 📣');
}

document.getElementById('copyIp').addEventListener('click', copyIp);
document.getElementById('copyAndJoin').addEventListener('click', copyIp);
document.getElementById('shareInvite').addEventListener('click', shareInvite);
document.getElementById('shareTop').addEventListener('click', shareInvite);

const rulesDialog = document.getElementById('rulesDialog');
document.getElementById('showRules').addEventListener('click', () => rulesDialog.showModal());
document.getElementById('closeRules').addEventListener('click', () => rulesDialog.close());
document.getElementById('dialogCopy').addEventListener('click', async () => {
  await copyIp();
  rulesDialog.close();
});
rulesDialog.addEventListener('click', (event) => {
  if (event.target === rulesDialog) rulesDialog.close();
});

document.getElementById('resultDiscord').href = DISCORD_URL;

authorizeDiscordLink();
function authorizeDiscordLink() {
  document.querySelectorAll(`a[href*="discord.gg"]`).forEach((link) => {
    link.href = DISCORD_URL;
  });
}

const prizeWheel = document.getElementById('prizeWheel');
const spinButton = document.getElementById('spinButton');
const wheelNote = document.getElementById('wheelNote');
const cooldownPill = document.getElementById('cooldownPill');
const resultDialog = document.getElementById('wheelResultDialog');
const resultVisual = document.getElementById('resultVisual');
const resultEyebrow = document.getElementById('resultEyebrow');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const resultPrize = document.getElementById('resultPrize');
const resultDiscord = document.getElementById('resultDiscord');
let wheelRotation = 0;
let cooldownTimer;

function getLastSpin() {
  const value = Number(localStorage.getItem(COOLDOWN_KEY));
  return Number.isFinite(value) && value > 0 ? value : 0;
}
function getRemainingCooldown() {
  const lastSpin = getLastSpin();
  return Math.max(0, COOLDOWN_MS - (Date.now() - lastSpin));
}
function formatRemaining(ms) {
  const totalMinutes = Math.ceil(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} يوم و${hours} ساعة`;
  if (hours > 0) return `${hours} ساعة و${minutes} دقيقة`;
  return `${Math.max(1, minutes)} دقيقة`;
}
function updateCooldownUI() {
  const remaining = getRemainingCooldown();
  const locked = remaining > 0;
  spinButton.disabled = locked;
  cooldownPill.classList.toggle('locked', locked);
  wheelNote.classList.toggle('locked-note', locked);
  if (locked) {
    cooldownPill.textContent = `متاحة بعد ${formatRemaining(remaining)}`;
    wheelNote.textContent = `الكولدون شغال · ترجع تقدر تلف بعد ${formatRemaining(remaining)}`;
  } else {
    cooldownPill.textContent = 'متاحة الآن';
    wheelNote.textContent = 'تقدر تلف العجلة الآن';
  }
}
function showWheelResult(prize) {
  const isWin = prize.win;
  resultDialog.classList.toggle('is-loss', !isWin);
  resultVisual.textContent = prize.icon;
  resultEyebrow.textContent = isWin ? 'جائزة Apex+' : 'نتيجة العجلة';
  resultTitle.textContent = isWin ? 'مبروك ربحت!' : 'حظ أوفر';
  resultMessage.textContent = isWin
    ? 'صورتك الرابحة جاهزة — افتح تكت في الديسكورد لاستلام جائزتك.'
    : 'ما ربحت شي للأسف. جرب مرة ثانية بعد انتهاء الكولدون.';
  resultPrize.textContent = isWin ? prize.label : 'حظ أوفر · ما فيه جائزة هذه المرة';
  resultDiscord.textContent = isWin ? 'افتح تكت في Discord ↗' : 'ادخل Discord ↗';
  resultDiscord.href = DISCORD_URL;
  resultDialog.showModal();
}
function spinWheel() {
  if (getRemainingCooldown() > 0 || spinButton.disabled) return;
  spinButton.disabled = true;
  localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  updateCooldownUI();
  const prizeIndex = Math.floor(Math.random() * prizes.length);
  const prize = prizes[prizeIndex];
  const segmentCenter = prizeIndex * 72;
  const currentMod = ((wheelRotation % 360) + 360) % 360;
  const target = wheelRotation + 360 * 6 + (360 - currentMod) - segmentCenter;
  wheelRotation = target;
  prizeWheel.style.transform = `rotate(${target}deg)`;
  wheelNote.textContent = 'العجلة تلف... بالتوفيق!';
  wheelNote.classList.remove('locked-note');
  window.setTimeout(() => showWheelResult(prize), 5850);
}
spinButton.addEventListener('click', spinWheel);
document.getElementById('closeResult').addEventListener('click', () => resultDialog.close());
resultDialog.addEventListener('click', (event) => {
  if (event.target === resultDialog) resultDialog.close();
});
updateCooldownUI();
cooldownTimer = window.setInterval(updateCooldownUI, 30000);

const gameStart = document.getElementById('gameStart');
const gameTarget = document.getElementById('gameTarget');
const gameScore = document.getElementById('gameScore');
const gameTimer = document.getElementById('gameTimer');
const gameBest = document.getElementById('gameBest');
const gameResult = document.getElementById('gameResult');
const targetZone = document.getElementById('targetZone');
const gamePlaceholder = document.getElementById('gamePlaceholder');
const gameEmojis = ['💎', '⛏️', '🧱', '⚔️', '🔥', '🐲', '🪙'];
let gameRunning = false;
let gameScoreValue = 0;
let gameTime = 15;
let gameTimerId;
let targetMoveId;

gameBest.textContent = localStorage.getItem(GAME_BEST_KEY) || '0';
function moveGameTarget() {
  const padding = 33;
  const x = padding + Math.random() * Math.max(1, targetZone.clientWidth - padding * 2);
  const y = padding + Math.random() * Math.max(1, targetZone.clientHeight - padding * 2);
  gameTarget.textContent = gameEmojis[Math.floor(Math.random() * gameEmojis.length)];
  gameTarget.style.left = `${x}px`;
  gameTarget.style.top = `${y}px`;
}
function finishGame() {
  gameRunning = false;
  clearInterval(gameTimerId);
  clearTimeout(targetMoveId);
  gameTarget.style.display = 'none';
  gamePlaceholder.style.display = 'grid';
  gameStart.disabled = false;
  gameStart.textContent = 'العب مرة ثانية 🚀';
  const previousBest = Number(localStorage.getItem(GAME_BEST_KEY) || 0);
  if (gameScoreValue > previousBest) {
    localStorage.setItem(GAME_BEST_KEY, String(gameScoreValue));
    gameBest.textContent = String(gameScoreValue);
  }
  let rating = 'تحتاج تدريب 💪';
  if (gameScoreValue >= 15) rating = 'أسطوري 🔥';
  else if (gameScoreValue >= 10) rating = 'محترف 👑';
  else if (gameScoreValue >= 6) rating = 'ممتاز ⚡';
  else if (gameScoreValue >= 3) rating = 'جيد جدًا 🎮';
  gameResult.textContent = `نتيجتك ${gameScoreValue} نقطة · تقييمك: ${rating}`;
}
function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  gameScoreValue = 0;
  gameTime = 15;
  gameScore.textContent = '0';
  gameTimer.textContent = '15';
  gameResult.textContent = 'اضغط الإيموجي بسرعة!';
  gameStart.disabled = true;
  gameStart.textContent = 'اللعبة شغالة... ⚡';
  gamePlaceholder.style.display = 'none';
  gameTarget.style.display = 'grid';
  moveGameTarget();
  gameTimerId = window.setInterval(() => {
    gameTime -= 1;
    gameTimer.textContent = String(gameTime);
    if (gameTime <= 0) finishGame();
  }, 1000);
}
gameTarget.addEventListener('click', () => {
  if (!gameRunning) return;
  gameScoreValue += 1;
  gameScore.textContent = String(gameScoreValue);
  moveGameTarget();
});
gameStart.addEventListener('click', startGame);

const tips = [
  'اجمع مواردك قبل الليل وخلك جاهز لأي مفاجأة 🌙',
  'جرّب السباون الجديد وشارك رأيك في Discord 🏰',
  'الصبر والترتيب يخليك تتقدم أسرع في السيرفر ⚡',
  'كوّن فريقًا مع أصحابك وارفعوا التحدي سوا 🤝',
  'إذا ربحت من العجلة، افتح تكت مباشرة لاستلام جائزتك 🎁',
];
const tipButton = document.getElementById('tipButton');
const tipText = document.getElementById('tipText');
tipButton.addEventListener('click', () => {
  const current = tips.indexOf(tipText.textContent);
  tipText.textContent = tips[(current + 1) % tips.length];
  showToast('هذه فكرة Apex+ لك اليوم 💡');
});
const statusPulse = document.getElementById('statusPulse');
const pulseText = document.getElementById('pulseText');
statusPulse.addEventListener('click', () => {
  pulseText.textContent = 'السيرفر جاهز ويستقبلك الآن ✅';
  statusPulse.classList.add('is-checked');
  showToast('Apex شغال — حياك بالسيرفر 📡');
});
const questProgress = document.getElementById('questProgress');
const questItems = [...document.querySelectorAll('.quest-item')];
const savedQuests = JSON.parse(localStorage.getItem('apexPlusQuests') || '[]');
function updateQuestProgress() {
  const completed = questItems.filter((item) => item.classList.contains('done')).length;
  questProgress.textContent = `${completed}/3 مكتملة`;
  if (completed === questItems.length) showToast('كفو! خلصت مهامك اليومية 🏆');
}
questItems.forEach((item, index) => {
  if (savedQuests.includes(index)) {
    item.classList.add('done');
    item.querySelector('i').textContent = '✓';
  }
  item.addEventListener('click', () => {
    item.classList.toggle('done');
    item.querySelector('i').textContent = item.classList.contains('done') ? '✓' : '○';
    const completed = questItems.map((quest, questIndex) => quest.classList.contains('done') ? questIndex : null).filter((value) => value !== null);
    localStorage.setItem('apexPlusQuests', JSON.stringify(completed));
    updateQuestProgress();
  });
});
updateQuestProgress();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
