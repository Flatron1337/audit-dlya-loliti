import { parseDailyChart, parseHoursChart } from './utils.js';

let ratioChartInstance = null;
let dailyChartInstance = null;
let hoursChartInstance = null;
let currentRatioMode = 'msgs';

export function getRatioMode() {
  return currentRatioMode;
}

export function initRatioChart(data) {
  const ratioCanvas = document.getElementById('ratioChart');
  if (!ratioCanvas) return;
  const ratioCtx = ratioCanvas.getContext('2d');

  ratioChartInstance = new Chart(ratioCtx, {
    type: 'doughnut',
    data: {
      labels: ['Женя', 'Лолита'],
      datasets: [{
        data: [data.users.evgeniy.messages, data.users.lolita.messages],
        backgroundColor: ['#06b6d4', '#ec4899'],
        borderColor: ['#08090d', '#08090d'],
        borderWidth: 4,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: "'Space Grotesk', sans-serif", weight: 'bold' },
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label(ctx) {
              const val = ctx.raw;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((val / total) * 100).toFixed(1);
              return ` ${ctx.label}: ${val.toLocaleString()} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

export function setupRatioModeControls(data) {
  const btnMsgs = document.getElementById('donut-mode-msgs');
  const btnChars = document.getElementById('donut-mode-chars');
  const donutDesc = document.getElementById('donut-description');
  const centerLabel = document.getElementById('donut-center-label');

  if (!btnMsgs || !btnChars) return;

  btnMsgs.addEventListener('click', () => {
    currentRatioMode = 'msgs';
    btnMsgs.className = 'px-2.5 py-1 rounded-md bg-violet-600 text-white font-medium transition-all';
    btnChars.className = 'px-2.5 py-1 rounded-md text-slate-400 hover:text-white transition-all';
    if (donutDesc) {
      donutDesc.textContent = `По числу реплик соотношение почти равное (${data.users.evgeniy.percent}% на ${data.users.lolita.percent}%), но по объему знаков Женя безоговорочно доминирует.`;
    }
    if (centerLabel) {
      centerLabel.textContent = data.summary.total_messages.toLocaleString('ru-RU');
    }
    if (ratioChartInstance) {
      ratioChartInstance.data.datasets[0].data = [
        data.users.evgeniy.messages,
        data.users.lolita.messages
      ];
      ratioChartInstance.update();
    }
  });

  btnChars.addEventListener('click', () => {
    currentRatioMode = 'chars';
    btnChars.className = 'px-2.5 py-1 rounded-md bg-violet-600 text-white font-medium transition-all';
    btnMsgs.className = 'px-2.5 py-1 rounded-md text-slate-400 hover:text-white transition-all';
    if (donutDesc) {
      donutDesc.textContent = `По объему символов: Женя написал ${data.users.evgeniy.chars.toLocaleString('ru-RU')} знаков (диссертации), Лолита — ${data.users.lolita.chars.toLocaleString('ru-RU')} знаков (краткие пулеметные реплики).`;
    }
    if (centerLabel) {
      centerLabel.textContent = Math.round(data.summary.total_chars / 1000) + 'k';
    }
    if (ratioChartInstance) {
      ratioChartInstance.data.datasets[0].data = [
        data.users.evgeniy.chars,
        data.users.lolita.chars
      ];
      ratioChartInstance.update();
    }
  });
}

export function initHoursChart(data) {
  const hoursCanvas = document.getElementById('hoursChart');
  if (!hoursCanvas) return;
  const hoursCtx = hoursCanvas.getContext('2d');

  const hoursGradient = hoursCtx.createLinearGradient(0, 0, 0, 300);
  hoursGradient.addColorStop(0, 'rgba(236, 72, 153, 0.45)');
  hoursGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.25)');
  hoursGradient.addColorStop(1, 'rgba(6, 182, 212, 0.02)');

  const hoursData = parseHoursChart(data.hours_chart);
  hoursChartInstance = new Chart(hoursCtx, {
    type: 'line',
    data: {
      labels: hoursData.labels,
      datasets: [
        {
          label: 'Всего сообщений',
          data: hoursData.total,
          borderColor: '#ec4899',
          borderWidth: 3,
          backgroundColor: hoursGradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: hoursData.labels.map((_, i) => (i >= 1 && i <= 3) ? '#f43f5e' : '#ec4899'),
          pointBorderColor: '#fff',
          pointRadius: hoursData.labels.map((_, i) => (i >= 1 && i <= 3) ? 6 : 3),
          pointHoverRadius: 8
        },
        {
          label: 'Женя',
          data: hoursData.evg,
          borderColor: '#06b6d4',
          borderWidth: 2,
          borderDash: [4, 4],
          fill: false,
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: 'Лолита',
          data: hoursData.lol,
          borderColor: '#a855f7',
          borderWidth: 2,
          borderDash: [2, 2],
          fill: false,
          tension: 0.3,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { font: { size: 10 } }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 } }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          padding: 12,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1
        }
      }
    }
  });
}

export function initDailyChart(data) {
  const dailyCanvas = document.getElementById('dailyChart');
  if (!dailyCanvas) return;
  const dailyCtx = dailyCanvas.getContext('2d');

  const dailyData = parseDailyChart(data.dates_chart);
  dailyChartInstance = new Chart(dailyCtx, {
    type: 'bar',
    data: {
      labels: dailyData.labels,
      datasets: [
        {
          label: 'Женя',
          data: dailyData.evg,
          backgroundColor: 'rgba(6, 182, 212, 0.85)',
          borderRadius: 6
        },
        {
          label: 'Лолита',
          data: dailyData.lol,
          backgroundColor: 'rgba(236, 72, 153, 0.85)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          stacked: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { boxWidth: 12, font: { size: 11 } }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          padding: 12,
          callbacks: {
            footer(items) {
              const total = items.reduce((a, b) => a + (b.raw || 0), 0);
              return `Суммарно за день: ${total} сообщений`;
            }
          }
        }
      }
    }
  });
}

export function initCharts(data) {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

  initRatioChart(data);
  setupRatioModeControls(data);
  initHoursChart(data);
  initDailyChart(data);
}

export function updateRatioChart(freshData) {
  if (!ratioChartInstance || !freshData.users) return;
  const isMsgs = currentRatioMode === 'msgs';
  ratioChartInstance.data.datasets[0].data = isMsgs
    ? [freshData.users.evgeniy.messages, freshData.users.lolita.messages]
    : [freshData.users.evgeniy.chars, freshData.users.lolita.chars];

  const cl = document.getElementById('donut-center-label');
  if (cl && freshData.summary) {
    cl.textContent = isMsgs
      ? freshData.summary.total_messages.toLocaleString('ru-RU')
      : Math.round(freshData.summary.total_chars / 1000) + 'k';
  }
  ratioChartInstance.update();
}

export function updateDailyChart(freshData) {
  if (!dailyChartInstance || !freshData.dates_chart) return;
  const dailyData = parseDailyChart(freshData.dates_chart);
  dailyChartInstance.data.labels = dailyData.labels;
  dailyChartInstance.data.datasets[0].data = dailyData.evg;
  dailyChartInstance.data.datasets[1].data = dailyData.lol;
  dailyChartInstance.update();
}

export function updateHoursChart(freshData) {
  if (!hoursChartInstance || !freshData.hours_chart) return;
  const hoursData = parseHoursChart(freshData.hours_chart);
  hoursChartInstance.data.labels = hoursData.labels;
  hoursChartInstance.data.datasets[0].data = hoursData.total;
  hoursChartInstance.data.datasets[1].data = hoursData.evg;
  hoursChartInstance.data.datasets[2].data = hoursData.lol;
  hoursChartInstance.update();
}

export function updateAllCharts(freshData) {
  updateRatioChart(freshData);
  updateDailyChart(freshData);
  updateHoursChart(freshData);
}
