import { updateAllCharts } from './charts.js';
import { renderGallery } from './gallery.js';
import { renderEmojis } from './emojis.js';
import { PHOTO_NOTES_FALLBACK } from './data.js';

let lastSyncTimestamp = Date.now();

export function updateDashboardCounters(summary) {
  if (!summary) return;
  const elTotal = document.getElementById('counter-total');
  if (elTotal) elTotal.textContent = summary.total_messages.toLocaleString('ru-RU');

  const elChars = document.getElementById('counter-chars');
  if (elChars) elChars.textContent = summary.total_chars.toLocaleString('ru-RU');

  const elNight = document.getElementById('counter-night');
  if (elNight && summary.night_stats) {
    elNight.textContent = summary.night_stats.total.toLocaleString('ru-RU');
  }

  const elHeroCount = document.getElementById('hero-msg-count');
  if (elHeroCount) {
    elHeroCount.textContent = (summary.total_messages >= 6000 ? '6 000+' : '5 500+');
  }
}

export function updateUserCardEvgeniy(evg, summary) {
  if (!evg) return;
  const evgPct = document.getElementById('user-evg-percent');
  if (evgPct && evg.percent) evgPct.textContent = `${evg.percent}%`;

  const evgMsgs = document.getElementById('user-evg-msgs');
  if (evgMsgs && evg.messages) evgMsgs.textContent = `${evg.messages.toLocaleString('ru-RU')} шт.`;

  const evgChars = document.getElementById('user-evg-chars');
  if (evgChars && evg.chars && summary) {
    const charPct = evg.char_percent || (Math.round((evg.chars / summary.total_chars) * 1000) / 10);
    evgChars.textContent = `${evg.chars.toLocaleString('ru-RU')} знаков (${charPct}%)`;
  }

  const evgAvg = document.getElementById('user-evg-avg');
  if (evgAvg && evg.avg_chars) evgAvg.textContent = `${evg.avg_chars} знака (пишет эссе)`;

  const evgVideo = document.getElementById('user-evg-video');
  if (evgVideo && evg.video) evgVideo.textContent = `${evg.video} кружков 🎥`;

  const evgVoice = document.getElementById('user-evg-voice');
  if (evgVoice && evg.voice !== undefined) evgVoice.textContent = `${evg.voice} шт. (элитный слушатель)`;

  const evgNight = document.getElementById('user-evg-night');
  if (evgNight && summary && summary.night_stats?.evgeniy) {
    evgNight.textContent = `${summary.night_stats.evgeniy.toLocaleString('ru-RU')} сообщений`;
  }
}

export function updateUserCardLolita(lol, summary) {
  if (!lol) return;
  const lolPct = document.getElementById('user-lol-percent');
  if (lolPct && lol.percent) lolPct.textContent = `${lol.percent}%`;

  const lolMsgs = document.getElementById('user-lol-msgs');
  if (lolMsgs && lol.messages) lolMsgs.textContent = `${lol.messages.toLocaleString('ru-RU')} шт.`;

  const lolChars = document.getElementById('user-lol-chars');
  if (lolChars && lol.chars && summary) {
    const charPct = lol.char_percent || (Math.round((lol.chars / summary.total_chars) * 1000) / 10);
    lolChars.textContent = `${lol.chars.toLocaleString('ru-RU')} знаков (${charPct}%)`;
  }

  const lolAvg = document.getElementById('user-lol-avg');
  if (lolAvg && lol.avg_chars) lolAvg.textContent = `${lol.avg_chars} знака (скорострел)`;

  const lolVoice = document.getElementById('user-lol-voice');
  if (lolVoice && lol.voice) lolVoice.textContent = `${lol.voice} аудиозаписей! 🎙️`;

  const lolVideo = document.getElementById('user-lol-video');
  if (lolVideo && lol.video) lolVideo.textContent = `${lol.video} кружков`;

  const lolNight = document.getElementById('user-lol-night');
  if (lolNight && summary && summary.night_stats?.lolita) {
    lolNight.textContent = `${summary.night_stats.lolita.toLocaleString('ru-RU')} сообщений`;
  }
}

export function updateDashboardUsers(users, summary) {
  if (!users) return;
  updateUserCardEvgeniy(users.evgeniy, summary);
  updateUserCardLolita(users.lolita, summary);
}

export function updateDashboardUI(freshData, activeData) {
  if (!freshData || !freshData.summary) return;
  lastSyncTimestamp = Date.now();

  if (activeData) {
    activeData.summary = freshData.summary;
    if (freshData.users) activeData.users = freshData.users;
    if (freshData.dates_chart) activeData.dates_chart = freshData.dates_chart;
    if (freshData.hours_chart) activeData.hours_chart = freshData.hours_chart;
    if (freshData.photos && freshData.photos.length) {
      activeData.photos = freshData.photos.map((p, i) => ({
        ...p,
        note: p.note || activeData.photos[i]?.note || PHOTO_NOTES_FALLBACK[i] || `Вещдок №${i + 1}`
      }));
      renderGallery(activeData.photos, PHOTO_NOTES_FALLBACK);
    }
    if (freshData.emojis && Array.isArray(freshData.emojis)) {
      activeData.emojis = freshData.emojis;
      renderEmojis(activeData.emojis);
    }
  }

  updateDashboardCounters(freshData.summary);
  updateDashboardUsers(freshData.users, freshData.summary);
  updateAllCharts(freshData);
}

export function initSyncTicker() {
  const ticker = document.getElementById('sync-time-ticker');
  if (!ticker) return;

  setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - lastSyncTimestamp) / 1000);
    if (elapsedSec < 5) {
      ticker.textContent = 'только что';
    } else {
      ticker.textContent = `${elapsedSec}с назад`;
    }
  }, 1000);
}

export function startLiveUpdates(activeData, onUpdateCallback) {
  let lastSyncedTotal = activeData.summary?.total_messages || 0;
  initSyncTicker();

  setInterval(async () => {
    try {
      const res = await fetch('/api/data?t=' + Date.now()).catch(() => fetch('site_data.json?t=' + Date.now()));
      if (!res.ok) return;
      const freshData = await res.json();
      const newTotal = freshData.summary ? freshData.summary.total_messages : null;

      lastSyncTimestamp = Date.now();

      if (newTotal && newTotal !== lastSyncedTotal) {
        lastSyncedTotal = newTotal;
        updateDashboardUI(freshData, activeData);
        if (typeof onUpdateCallback === 'function') {
          onUpdateCallback(freshData);
        }
      }
    } catch (_err) {
      // Periodic background fetch failed quietly
    }
  }, 2500);
}
