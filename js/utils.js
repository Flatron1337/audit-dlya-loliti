/**
 * Pure utility and parsing helper functions for charts, dates, and times.
 */

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}.${parts[1]}`;
  }
  return String(dateStr);
}

export function formatHour(hourVal) {
  if (typeof hourVal === 'number' || (typeof hourVal === 'string' && !hourVal.includes(':'))) {
    return String(hourVal).padStart(2, '0') + ':00';
  }
  return String(hourVal);
}

export function parseDailyChart(datesChart) {
  if (!Array.isArray(datesChart)) {
    return { labels: [], evg: [], lol: [], totals: [] };
  }
  const labels = datesChart.map(d => formatShortDate(d.date));
  const evg = datesChart.map(d => Number(d.evg ?? d['Женя'] ?? 0));
  const lol = datesChart.map(d => Number(d.lol ?? d['Лолита'] ?? 0));
  const totals = datesChart.map((d, i) => Number(d.total ?? (evg[i] + lol[i])));
  return { labels, evg, lol, totals };
}

export function parseHoursChart(hoursChart) {
  if (!Array.isArray(hoursChart)) {
    return { labels: [], total: [], evg: [], lol: [] };
  }
  const labels = hoursChart.map(h => formatHour(h.hour));
  const evg = hoursChart.map(h => Number(h.evg ?? h['Женя'] ?? 0));
  const lol = hoursChart.map(h => Number(h.lol ?? h['Лолита'] ?? 0));
  const total = hoursChart.map((h, i) => Number(h.total ?? (evg[i] + lol[i])));
  return { labels, total, evg, lol };
}

export function formatTime(sec) {
  if (isNaN(sec) || sec === 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const typeBorder = type === 'success'
    ? 'border-emerald-500/50'
    : type === 'warning'
    ? 'border-amber-500/50'
    : 'border-cyan-500/50';

  const typeIcon = type === 'success' ? '✨' : type === 'warning' ? '⚠️' : '📨';

  toast.className = `toast-item pointer-events-auto p-4 rounded-2xl glass-panel border ${typeBorder} shadow-2xl flex items-center gap-3 backdrop-blur-xl text-xs font-mono-code leading-relaxed`;

  const iconEl = document.createElement('span');
  iconEl.className = 'text-base flex-shrink-0';
  iconEl.textContent = typeIcon;

  const msgEl = document.createElement('span');
  msgEl.className = 'text-white flex-1';
  msgEl.textContent = message;

  toast.append(iconEl, msgEl);
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

