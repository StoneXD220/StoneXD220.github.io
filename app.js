const DISCORD_URL = 'https://discord.gg/j2Q6sb6rG';
const INVITE_TEXT = `@everyone\n\n🚧 Apex SMP قيد الإنشاء! 🚧\n\nنبني لكم عالم Minecraft مختلف: فعاليات، تحديات، جوائز يومية، ومجتمع حماسي.\n\n🔥 كن من أوائل اللاعبين\n🎁 لف عجلة الجائزة اليومية\n🎮 جهّز فريقك للانطلاق\n📣 تابع Discord لمعرفة موعد الافتتاح والفعاليات\n\n💬 Discord: ${DISCORD_URL}`;
const COOLDOWN_KEY = 'apexPlusWheelLastSpin';
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const GAME_BEST_KEY = 'apexPlusGameBest';

const prizes = [
  { label: 'خبز وحديد', detail: '16 خبز + 8 حديد', icon: '🥖', chance: 32, win: true },
  { label: 'ذهب وفحم', detail: '8 ذهب + 16 فحم', icon: '🪙', chance: 25, win: true },
  { label: 'قوس وسهام', detail: 'قوس + 16 سهم', icon: '🏹', chance: 18, win: true },
  { label: 'زمردات', detail: '4 زمردات', icon: '💚', chance: 15, win: true },
  { label: 'حظ أوفر', detail: 'ارجع بكرة وجرب من جديد', icon: '🍀', chance: 10, win: false },
];
// Visual order around the wheel, clockwise from the top pointer:
// bread/iron, gold/coal, lose, bow/arrows, emeralds.
const wheelPrizeOrder = [0, 1, 4, 2, 3];

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

async function shareInvite() {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Apex SMP Minecraft', text: INVITE_TEXT });
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  await copyText(INVITE_TEXT, 'تم نسخ الدعوة للمشاركة 📣');
}

document.getElementById('shareInvite').addEventListener('click', shareInvite);
document.getElementById('shareTop').addEventListener('click', shareInvite);

const rulesDialog = document.getElementById('rulesDialog');
document.getElementById('showRules').addEventListener('click', () => rulesDialog.showModal());
document.getElementById('closeRules').addEventListener('click', () => rulesDialog.close());
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
const wheelSelection = document.getElementById('wheelSelection');
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
  resultEyebrow.textContent = isWin ? 'جائزة Apex SMP' : 'نتيجة العجلة';
  resultTitle.textContent = isWin ? 'مبروك ربحت!' : 'حظ أوفر';
  resultMessage.textContent = isWin
    ? 'صورتك الرابحة جاهزة — افتح تكت في الديسكورد لاستلام جائزتك.'
    : 'ما ربحت شي للأسف. جرب مرة ثانية بعد انتهاء الكولدون.';
  resultPrize.textContent = isWin ? `${prize.label} · ${prize.detail}` : 'حظ أوفر · ما فيه جائزة هذه المرة';
  resultDiscord.textContent = isWin ? 'افتح تكت في Discord ↗' : 'ادخل Discord ↗';
  resultDiscord.href = DISCORD_URL;
  wheelSelection.classList.add('is-result');
  wheelSelection.innerHTML = `<span>${prize.icon}</span><strong>${isWin ? `وقفت على: ${prize.label}` : 'وقفت على: حظ أوفر'}</strong><small>السهم حدد النتيجة 🎯</small>`;
  resultDialog.showModal();
}
function spinWheel() {
  if (getRemainingCooldown() > 0 || spinButton.disabled) return;
  spinButton.disabled = true;
  localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  updateCooldownUI();
  const roll = Math.random() * prizes.reduce((sum, prizeItem) => sum + prizeItem.chance, 0);
  let cursor = 0;
  let prizeIndex = prizes.length - 1;
  for (let index = 0; index < prizes.length; index += 1) {
    cursor += prizes[index].chance;
    if (roll < cursor) { prizeIndex = index; break; }
  }
  const segmentIndex = wheelPrizeOrder.indexOf(prizeIndex);
  const prize = prizes[prizeIndex];
  const segmentCenter = segmentIndex * 72;
  const currentMod = ((wheelRotation % 360) + 360) % 360;
  const target = wheelRotation + 360 * 6 + (360 - currentMod) - segmentCenter;
  wheelRotation = target;
  prizeWheel.style.transform = `rotate(${target}deg)`;
  wheelSelection.classList.remove('is-result');
  wheelSelection.innerHTML = '<span>🎯</span><strong>العجلة تلف...</strong><small>استنى وين يوقف السهم</small>';
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
tipButton?.addEventListener('click', () => {
  const current = tips.indexOf(tipText.textContent);
  tipText.textContent = tips[(current + 1) % tips.length];
  showToast('هذه فكرة Apex SMP لك اليوم 💡');
});
const statusPulse = document.getElementById('statusPulse');
const pulseText = document.getElementById('pulseText');
statusPulse?.addEventListener('click', () => {
  pulseText.textContent = 'السيرفر قيد الإنشاء — تابع Discord 🚧';
  statusPulse.classList.add('is-checked');
  showToast('تابع Discord لمعرفة موعد افتتاح Apex SMP 🚧');
});
const questProgress = document.getElementById('questProgress');
const questItems = [...document.querySelectorAll('.quest-item')];
const savedQuests = JSON.parse(localStorage.getItem('apexPlusQuests') || '[]');
function updateQuestProgress() {
  const completed = questItems.filter((item) => item.classList.contains('done')).length;
  if (questProgress) questProgress.textContent = `${completed}/3 مكتملة`;
  if (questItems.length && completed === questItems.length) showToast('كفو! خلصت مهامك اليومية 🏆');
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


// Community comments: local device storage fallback for the static site.
const COMMENTS_KEY = 'apexPlusComments';
const commentForm = document.getElementById('commentForm');
const commentsList = document.getElementById('commentsList');
function escapeComment(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}
function readComments() {
  try {
    const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
    return Array.isArray(comments) ? comments.slice(0, 12) : [];
  } catch { return []; }
}
function renderComments() {
  const comments = readComments();
  if (!comments.length) {
    commentsList.innerHTML = '<div class="comments-empty">كن أول واحد يكتب رأيه في Apex SMP ✨</div>';
    return;
  }
  commentsList.innerHTML = comments.map((comment) => `<article class="comment-item"><div class="comment-meta"><strong>💬 ${escapeComment(comment.name)}</strong><time>${escapeComment(comment.date)}</time></div><p>${escapeComment(comment.text)}</p></article>`).join('');
}
commentForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('commentName').value.trim();
  const text = document.getElementById('commentText').value.trim();
  if (!name || !text) return;
  const comments = readComments();
  comments.unshift({ name: name.slice(0, 24), text: text.slice(0, 240), date: new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'short' }).format(new Date()) });
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments.slice(0, 12)));
  commentForm.reset();
  renderComments();
  showToast('تم حفظ رأيك على هذا الجهاز ✅');
});
renderComments();

// Daily return loop: keeps a lightweight streak on the visitor's device.
const DAILY_KEY = 'apexSmpDailyCheckin';
const dailyStreak = document.getElementById('dailyStreak');
const dailyClaim = document.getElementById('dailyClaim');
const dailyClaimStatus = document.getElementById('dailyClaimStatus');
const dailyShare = document.getElementById('dailyShare');
function localDay(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function previousDay(key) {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return localDay(date);
}
function readDailyCheckin() {
  try { return JSON.parse(localStorage.getItem(DAILY_KEY) || '{}'); } catch { return {}; }
}
function renderDailyCheckin() {
  const saved = readDailyCheckin();
  const today = localDay();
  const streak = Number(saved.streak) > 0 ? Number(saved.streak) : 0;
  if (!dailyStreak || !dailyClaim || !dailyClaimStatus) return;
  dailyStreak.textContent = `${streak} ${streak === 1 ? 'يوم متتالٍ' : 'أيام متتالية'}`;
  const claimed = saved.lastDate === today;
  dailyClaim.disabled = claimed;
  dailyClaim.textContent = claimed ? 'تم تسجيل اليوم ✓' : 'استلم دخول اليوم';
  dailyClaimStatus.textContent = claimed ? 'كفو! ارجع بكرة وحافظ على السلسلة 🔥' : 'اضغط لتسجيل حضورك اليومي';
}
dailyClaim?.addEventListener('click', () => {
  const today = localDay();
  const saved = readDailyCheckin();
  if (saved.lastDate === today) return;
  const nextStreak = saved.lastDate === previousDay(today) ? Number(saved.streak || 0) + 1 : 1;
  localStorage.setItem(DAILY_KEY, JSON.stringify({ lastDate: today, streak: nextStreak }));
  renderDailyCheckin();
  showToast(nextStreak >= 7 ? 'أسبوع كامل! أنت من أساطير Apex SMP 🏆' : `تم تسجيل دخولك اليومي · السلسلة ${nextStreak} 🔥`);
});
dailyShare?.addEventListener('click', shareInvite);
renderDailyCheckin();

const dailyHero = document.getElementById('dailyHero');
dailyHero?.addEventListener('click', () => {
  document.getElementById('dailyClaim')?.click();
  document.getElementById('daily')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
