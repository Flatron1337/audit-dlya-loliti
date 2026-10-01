import { playClickSound } from './sfx.js';
import { unlockAchievement } from './achievements.js';

export function calculateProjection(sleepHours, videoCount, dailyMsgs) {
  // Days remaining in 2026 and all of 2027 (approx 456 days from Oct 2026 to end 2027)
  const remainingDays = 456;

  const totalMsgs = Math.round(dailyMsgs * remainingDays);
  // ~3.7 meters per 100 messages based on 14-day stats
  const metersOfText = ((totalMsgs * 3.7) / 1000).toFixed(1);
  // Coffee / energy drinks based on night sleep deficit (deficit below 8 hrs)
  const sleepDeficit = Math.max(0, 8 - sleepHours);
  const coffeeLiters = Math.round(remainingDays * (0.3 + sleepDeficit * 0.15));
  // Screen wear risk percentage
  const screenWearRisk = Math.min(99.9, ((dailyMsgs / 1200) * 60 + (videoCount / 80) * 35)).toFixed(1);

  let verdict = 'Стабильный уровень дружеского общения без критических аномалий.';
  if (dailyMsgs >= 700 || sleepHours <= 3.5) {
    verdict = '🚨 ВЫСОКАЯ ОПАСНОСТЬ: Индустриальная перегрузка серверов Telegram. Сон признан пережитком прошлого.';
  } else if (dailyMsgs >= 400) {
    verdict = '⚡ Критическая стадия дружбы. Ночные кружочки и мемы с WB окончательно вытеснили нормальный режим сна.';
  } else if (videoCount >= 40) {
    verdict = '🎥 Режим реалити-шоу: кружочки записываются быстрее, чем собеседник успевает их посмотреть.';
  }

  return {
    totalMsgs,
    metersOfText,
    coffeeLiters,
    screenWearRisk,
    verdict
  };
}

export function updateCalculatorUI() {
  const sleepInput = document.getElementById('calc-sleep');
  const videoInput = document.getElementById('calc-video');
  const intensityInput = document.getElementById('calc-intensity');

  if (!sleepInput || !videoInput || !intensityInput) return;

  const sleepVal = parseFloat(sleepInput.value);
  const videoVal = parseInt(videoInput.value, 10);
  const intensityVal = parseInt(intensityInput.value, 10);

  const valSleep = document.getElementById('val-sleep');
  const valVideo = document.getElementById('val-video');
  const valIntensity = document.getElementById('val-intensity');

  if (valSleep) valSleep.textContent = `${sleepVal} ч`;
  if (valVideo) valVideo.textContent = `${videoVal} шт`;
  if (valIntensity) valIntensity.textContent = `${intensityVal} сообщ/день`;

  const results = calculateProjection(sleepVal, videoVal, intensityVal);

  const elMsgs = document.getElementById('res-total-msgs');
  const elMeters = document.getElementById('res-meters');
  const elCoffee = document.getElementById('res-coffee');
  const elWear = document.getElementById('res-wear');
  const elVerdict = document.getElementById('res-verdict');

  if (elMsgs) elMsgs.textContent = results.totalMsgs.toLocaleString('ru-RU');
  if (elMeters) elMeters.textContent = `${results.metersOfText} км`;
  if (elCoffee) elCoffee.textContent = `${results.coffeeLiters} литров`;
  if (elWear) elWear.textContent = `${results.screenWearRisk}%`;
  if (elVerdict) elVerdict.textContent = results.verdict;
}

export function initFriendshipCalculator() {
  const sleepInput = document.getElementById('calc-sleep');
  const videoInput = document.getElementById('calc-video');
  const intensityInput = document.getElementById('calc-intensity');

  if (!sleepInput || !videoInput || !intensityInput) return;

  const onSliderChange = () => {
    updateCalculatorUI();
  };

  sleepInput.addEventListener('input', onSliderChange);
  videoInput.addEventListener('input', onSliderChange);
  intensityInput.addEventListener('input', onSliderChange);

  const triggerChange = () => {
    playClickSound();
    unlockAchievement('architect_2027');
  };

  sleepInput.addEventListener('change', triggerChange);
  videoInput.addEventListener('change', triggerChange);
  intensityInput.addEventListener('change', triggerChange);

  updateCalculatorUI();
}
