import { showToast } from './utils.js';
import {
  playSuccessFanfare,
  playDodgeSound,
  playShredderSound,
  playClickSound
} from './sfx.js';
import { unlockAchievement } from './achievements.js';

function triggerConfettiBlast() {
  if (typeof window.confetti !== 'function') return;
  window.confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
  });

  setTimeout(() => {
    window.confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 } });
    window.confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 } });
  }, 250);
}

function setupExtendTrialModal(extendBtn, modalClose, successModal) {
  if (extendBtn && successModal) {
    extendBtn.addEventListener('click', () => {
      playSuccessFanfare();
      triggerConfettiBlast();
      successModal.classList.remove('hidden');
      setTimeout(() => successModal.classList.remove('opacity-0'), 10);
    });
  }

  if (modalClose && successModal) {
    modalClose.addEventListener('click', () => {
      playClickSound();
      successModal.classList.add('opacity-0');
      setTimeout(() => successModal.classList.add('hidden'), 300);
    });
  }
}

function setupRunawayButton(runawayBtn) {
  if (!runawayBtn) return;
  let runawayCount = 0;
  const sarcasticTexts = [
    '🚫 Ошибка 403: Дружба не подлежит отмене',
    '🏃‍♂️ Кнопка совершила тактическое отступление',
    '🔒 Доступ заблокирован квантовой дружбой',
    '😏 Даже не пытайся, продление неизбежно!',
    '🚨 Внимание: побег наказуем 50 кружочками!'
  ];

  function dodge() {
    runawayCount++;
    playDodgeSound();

    if (runawayCount >= 3) {
      unlockAchievement('dodge_master');
    }

    const maxX = 160;
    const maxY = 70;
    const randX = (Math.random() - 0.5) * 2 * maxX;
    const randY = (Math.random() - 0.5) * 2 * maxY;

    runawayBtn.style.transform = `translate(${randX}px, ${randY}px)`;

    const textIdx = runawayCount % sarcasticTexts.length;
    runawayBtn.replaceChildren();
    const textSpan = document.createElement('span');
    textSpan.textContent = sarcasticTexts[textIdx];
    runawayBtn.appendChild(textSpan);
  }

  runawayBtn.addEventListener('mouseenter', dodge);
  runawayBtn.addEventListener('mousemove', dodge);
  runawayBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dodge();
  });
}

export function initTrialInteractivity() {
  const extendBtn = document.getElementById('extend-btn');
  const runawayBtn = document.getElementById('runaway-btn');
  const successModal = document.getElementById('success-modal');
  const modalClose = document.getElementById('success-modal-close');

  setupExtendTrialModal(extendBtn, modalClose, successModal);
  setupRunawayButton(runawayBtn);
}

export function initFeedbackForm() {
  const form = document.getElementById('feedback-form');
  const ratingGroups = document.querySelectorAll('.star-rating');
  if (!form) return;

  ratingGroups.forEach((grp) => {
    const stars = grp.querySelectorAll('span');
    stars.forEach((s) => {
      s.addEventListener('click', () => {
        playClickSound();
        const val = parseInt(s.getAttribute('data-val'), 10);
        stars.forEach((other, idx) => {
          if (idx < val) {
            other.textContent = '★';
            other.classList.add('text-amber-400');
            other.classList.remove('text-slate-600');
          } else {
            other.textContent = '☆';
            other.classList.remove('text-amber-400');
            other.classList.add('text-slate-600');
          }
        });
      });
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-complaint');
    if (!btn) return;

    playShredderSound();
    const originalSpans = Array.from(btn.querySelectorAll('span')).map((el) => el.cloneNode(true));

    btn.disabled = true;
    btn.replaceChildren();

    const hourGlassSpan = document.createElement('span');
    hourGlassSpan.textContent = '⏳';
    const shredTextSpan = document.createElement('span');
    shredTextSpan.textContent = 'Шредирование жалобы...';
    btn.append(hourGlassSpan, shredTextSpan);

    setTimeout(() => {
      btn.disabled = false;
      btn.replaceChildren(...originalSpans);
      showToast('🗑️ Ваша жалоба успешно принята, детально проигнорирована и отправлена в шредер!', 'warning', 4500);
      form.reset();
    }, 1200);
  });
}

export function initShareButtons() {
  const shareButtons = document.querySelectorAll('.btn-share-link');
  shareButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      playClickSound();
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('🔗 Ссылка на аудит успешно скопирована в буфер обмена!', 'success');
      } catch (_err) {
        showToast('📋 Ссылка: ' + window.location.href, 'info', 5000);
      }
    });
  });
}
