import { playMessageSound, playClickSound } from './sfx.js';
import { unlockAchievement } from './achievements.js';

export const REPLAY_MESSAGES = [
  {
    sender: 'Женя',
    isEvg: true,
    time: '02:05',
    text: 'а ты чо уже спать ложишься?',
    delay: 1200
  },
  {
    sender: 'Лолита',
    isEvg: false,
    time: '02:06',
    text: 'у меня почему то комп молчит, когда я товары пикаю...',
    delay: 1800
  },
  {
    sender: 'Женя',
    isEvg: true,
    time: '02:25',
    text: 'мне нет подожди пж еще немного я все еще',
    delay: 1500
  },
  {
    sender: 'Женя',
    isEvg: true,
    time: '02:51',
    text: 'Ладно больше не буду тебе мозги заполнять сложной инфой',
    delay: 2000
  },
  {
    sender: 'Лолита',
    isEvg: false,
    time: '02:52',
    text: 'ммм пиздец',
    delay: 1300
  },
  {
    sender: 'Лолита',
    isEvg: false,
    time: '03:14',
    text: 'ладно, мне кажется спать пора',
    delay: 1900
  },
  {
    sender: 'Женя',
    isEvg: true,
    time: '03:15',
    text: 'все ладно я пойду, сполоснусь и спать нахуй',
    delay: 1600
  }
];

let currentIndex = 0;
let isPlaying = false;
let replayTimer = null;

function renderTypingIndicator(sender, isEvg) {
  const container = document.getElementById('chat-replay-messages');
  if (!container) return;

  const existing = document.getElementById('chat-typing-indicator');
  if (existing) existing.remove();

  const wrap = document.createElement('div');
  wrap.id = 'chat-typing-indicator';
  wrap.className = `flex items-center gap-2 text-xs font-mono-code ${
    isEvg ? 'justify-start text-cyan-400' : 'justify-end text-pink-400'
  } py-1 animate-pulse`;

  const textNode = document.createElement('span');
  textNode.textContent = `${sender} печатает`;

  const dots = document.createElement('span');
  dots.className = 'inline-flex gap-1 items-center';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'w-1.5 h-1.5 rounded-full bg-current';
    dots.appendChild(dot);
  }

  wrap.append(textNode, dots);
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const existing = document.getElementById('chat-typing-indicator');
  if (existing) existing.remove();
}

function appendMessageBubble(msg) {
  const container = document.getElementById('chat-replay-messages');
  if (!container) return;

  removeTypingIndicator();
  playMessageSound();

  const row = document.createElement('div');
  row.className = `flex ${msg.isEvg ? 'justify-start' : 'justify-end'} mb-2.5`;

  const bubble = document.createElement('div');
  const bubbleStyles = msg.isEvg
    ? 'bg-cyan-950/80 border-cyan-500/30 text-cyan-100 rounded-tl-sm'
    : 'bg-purple-950/80 border-pink-500/30 text-pink-100 rounded-tr-sm';

  bubble.className = `max-w-[85%] sm:max-w-md p-3.5 rounded-2xl border ${bubbleStyles} shadow-lg backdrop-blur-md text-sm leading-relaxed relative`;

  const header = document.createElement('div');
  header.className = 'flex items-center justify-between gap-4 text-[10px] font-mono-code mb-1';

  const authorSpan = document.createElement('span');
  authorSpan.className = msg.isEvg ? 'text-cyan-400 font-bold' : 'text-pink-400 font-bold';
  authorSpan.textContent = msg.sender;

  const timeSpan = document.createElement('span');
  timeSpan.className = 'text-slate-400 flex items-center gap-1';
  timeSpan.textContent = `${msg.time} ✓✓`;

  header.append(authorSpan, timeSpan);

  const textPara = document.createElement('div');
  textPara.className = 'text-slate-100 font-normal';
  textPara.textContent = msg.text;

  bubble.append(header, textPara);
  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function stepReplay() {
  if (!isPlaying) return;

  if (currentIndex >= REPLAY_MESSAGES.length) {
    isPlaying = false;
    updateSimulatorControls();
    unlockAchievement('night_owl');
    return;
  }

  const msg = REPLAY_MESSAGES[currentIndex];
  renderTypingIndicator(msg.sender, msg.isEvg);

  replayTimer = setTimeout(() => {
    if (!isPlaying) return;
    appendMessageBubble(msg);
    currentIndex++;
    replayTimer = setTimeout(stepReplay, msg.delay);
  }, 900);
}

function updateSimulatorControls() {
  const playBtn = document.getElementById('chat-replay-play');
  if (!playBtn) return;

  if (isPlaying) {
    playBtn.textContent = '⏸ Пауза';
    playBtn.className = 'px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono-code transition-all cursor-pointer shadow-md';
  } else {
    playBtn.textContent = currentIndex >= REPLAY_MESSAGES.length ? '↺ Повторить запись' : '▶ Воспроизвести запись';
    playBtn.className = 'px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono-code transition-all cursor-pointer shadow-md shadow-cyan-500/20';
  }
}

export function startChatReplay() {
  playClickSound();
  if (currentIndex >= REPLAY_MESSAGES.length) {
    resetChatReplay();
  }
  isPlaying = !isPlaying;
  updateSimulatorControls();
  if (isPlaying) {
    stepReplay();
  } else {
    clearTimeout(replayTimer);
    removeTypingIndicator();
  }
}

export function resetChatReplay() {
  playClickSound();
  isPlaying = false;
  clearTimeout(replayTimer);
  currentIndex = 0;

  const container = document.getElementById('chat-replay-messages');
  if (container) container.replaceChildren();

  updateSimulatorControls();
}

export function initChatSimulator() {
  const playBtn = document.getElementById('chat-replay-play');
  const resetBtn = document.getElementById('chat-replay-reset');

  if (playBtn) playBtn.addEventListener('click', startChatReplay);
  if (resetBtn) resetBtn.addEventListener('click', resetChatReplay);
}
