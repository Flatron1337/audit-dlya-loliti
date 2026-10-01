import { DEFAULT_AUDIT_DATA, PHOTO_NOTES_FALLBACK } from './data.js';
import { initCharts } from './charts.js';
import { initGallery } from './gallery.js';
import { initQuotes } from './quotes.js';
import { renderEmojis } from './emojis.js';
import { initAudioPlayer } from './player.js';
import { initTrialInteractivity, initFeedbackForm, initShareButtons } from './interactive.js';
import { initFriendshipCalculator } from './calculator.js';
import { initAchievements } from './achievements.js';
import { initChatSimulator } from './simulator.js';
import { updateDashboardUI, startLiveUpdates } from './sync.js';

const appState = JSON.parse(JSON.stringify(DEFAULT_AUDIT_DATA));

async function fetchLatestData() {
  try {
    const res = await fetch('/api/data?t=' + Date.now()).catch(() => fetch('site_data.json?t=' + Date.now()));
    if (!res.ok) return;
    const freshData = await res.json();
    if (freshData && freshData.summary) {
      appState.summary = freshData.summary;
      if (freshData.users) appState.users = freshData.users;
      if (freshData.dates_chart) appState.dates_chart = freshData.dates_chart;
      if (freshData.hours_chart) appState.hours_chart = freshData.hours_chart;
      if (freshData.photos && freshData.photos.length) {
        appState.photos = freshData.photos.map((p, i) => ({
          ...p,
          note: p.note || appState.photos[i]?.note || PHOTO_NOTES_FALLBACK[i] || `Вещдок №${i + 1}`
        }));
      }
      if (freshData.emojis && Array.isArray(freshData.emojis)) {
        appState.emojis = freshData.emojis;
      }
    }
  } catch (_err) {
    appState.offlineFallback = true;
  }
}

async function bootstrap() {
  await fetchLatestData();

  initCharts(appState);
  initGallery(appState.photos, PHOTO_NOTES_FALLBACK);
  initQuotes(appState.quotes);
  renderEmojis(appState.emojis);
  initAudioPlayer();
  initTrialInteractivity();
  initFeedbackForm();
  initShareButtons();
  initFriendshipCalculator();
  initAchievements();
  initChatSimulator();
  updateDashboardUI(appState, appState);
  startLiveUpdates(appState);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
