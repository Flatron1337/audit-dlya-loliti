import { showToast } from './utils.js';
import { playSuccessFanfare, playClickSound } from './sfx.js';

export const ACHIEVEMENTS = [
  {
    id: 'night_owl',
    title: 'Ночной филин 80 lvl',
    desc: 'Ознакомился с зоной бессонницы с 01:00 до 04:00 ночи',
    icon: '🦉'
  },
  {
    id: 'wb_specialist',
    title: 'Почетный сотрудник WB',
    desc: 'Изучил рабочий юмор про склад и непикающий сканер',
    icon: '📦'
  },
  {
    id: 'dodge_master',
    title: 'Мастер уклонения',
    desc: 'Попытался нажать кнопку отписки от дружбы 3 раза',
    icon: '🏃‍♂️'
  },
  {
    id: 'audiophile',
    title: 'Аудиофил 209 голосовых',
    desc: 'Включил легендарный саундтрек в аудиоплеере',
    icon: '🎧'
  },
  {
    id: 'detective',
    title: 'Следователь по особо важным делам',
    desc: 'Открыл и детально исследовал секретные вещдоки',
    icon: '🕵️'
  },
  {
    id: 'architect_2027',
    title: 'Архитектор дружбы 2027',
    desc: 'Провел симуляцию в прогностическом калькуляторе',
    icon: '🤖'
  }
];

const STORAGE_KEY = 'audit_unlocked_achievements';

export function getUnlockedAchievements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_e) {
    return [];
  }
}

function saveUnlockedAchievements(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (_e) {
    // LocalStorage quota or access issue
  }
}

export function unlockAchievement(id) {
  const current = getUnlockedAchievements();
  if (current.includes(id)) return;

  const target = ACHIEVEMENTS.find((a) => a.id === id);
  if (!target) return;

  current.push(id);
  saveUnlockedAchievements(current);

  playSuccessFanfare();
  showToast(`🏆 ДОСТИЖЕНИЕ РАЗБЛОКИРОВАНО:\n«${target.title}»`, 'success', 5000);
  updateAchievementsBadge();
  renderAchievementsList();
}

export function updateAchievementsBadge() {
  const badge = document.getElementById('achievements-badge-count');
  if (!badge) return;
  const current = getUnlockedAchievements();
  badge.textContent = `${current.length}/${ACHIEVEMENTS.length}`;
}

export function renderAchievementsList() {
  const container = document.getElementById('achievements-list-container');
  if (!container) return;
  container.replaceChildren();

  const unlocked = getUnlockedAchievements();

  ACHIEVEMENTS.forEach((ach) => {
    const isUnlocked = unlocked.includes(ach.id);
    const card = document.createElement('div');
    const border = isUnlocked
      ? 'border-emerald-500/40 bg-emerald-500/10'
      : 'border-white/10 bg-white/[0.02] opacity-60';

    card.className = `p-3.5 rounded-2xl border ${border} flex items-center gap-3.5 transition-all`;

    const iconBox = document.createElement('div');
    iconBox.className = `w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
      isUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-slate-500'
    }`;
    iconBox.textContent = isUnlocked ? ach.icon : '🔒';

    const info = document.createElement('div');
    info.className = 'min-w-0 flex-1';

    const title = document.createElement('div');
    title.className = `text-xs font-bold font-display ${isUnlocked ? 'text-white' : 'text-slate-400'}`;
    title.textContent = ach.title;

    const desc = document.createElement('div');
    desc.className = 'text-[11px] text-slate-400 mt-0.5 leading-snug';
    desc.textContent = ach.desc;

    info.append(title, desc);

    const statusBadge = document.createElement('span');
    statusBadge.className = `text-[10px] font-mono-code px-2 py-0.5 rounded-full border ${
      isUnlocked
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        : 'bg-white/5 text-slate-500 border-white/10'
    }`;
    statusBadge.textContent = isUnlocked ? 'ОТКРЫТО' : 'ЗАБЛОКИРОВАНО';

    card.append(iconBox, info, statusBadge);
    container.appendChild(card);
  });
}

export function initAchievements() {
  updateAchievementsBadge();

  const modal = document.getElementById('achievements-modal');
  const triggerBtn = document.getElementById('achievements-trigger-btn');
  const closeBtn = document.getElementById('achievements-close-btn');

  if (triggerBtn && modal) {
    triggerBtn.addEventListener('click', () => {
      playClickSound();
      renderAchievementsList();
      modal.classList.remove('hidden');
      setTimeout(() => modal.classList.remove('opacity-0'), 10);
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      playClickSound();
      modal.classList.add('opacity-0');
      setTimeout(() => modal.classList.add('hidden'), 300);
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
      }
    });
  }
}
