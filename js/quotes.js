import { playClickSound } from './sfx.js';
import { showToast } from './utils.js';
import { unlockAchievement } from './achievements.js';

let cachedQuotes = [];
let activeFilter = 'all';

function createQuoteCard(q, idx) {
  const card = document.createElement('div');
  card.id = `quote-card-${idx}`;
  card.className = 'quote-card glass-panel p-5 rounded-2xl border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between group';

  const isEvg = q.author === 'Женя';
  const userColor = isEvg
    ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
    : 'text-pink-400 border-pink-500/30 bg-pink-500/10';

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'space-y-3';

  const header = document.createElement('div');
  header.className = 'flex items-center justify-between text-xs';

  const authorBadge = document.createElement('span');
  authorBadge.className = `px-2 py-0.5 rounded-full font-mono-code text-[10px] ${userColor} border`;
  authorBadge.textContent = q.author;

  const tagMeta = document.createElement('span');
  tagMeta.className = 'text-slate-400 font-mono-code text-[11px] flex items-center gap-1';
  tagMeta.textContent = `${q.icon} ${q.tag}`;

  header.append(authorBadge, tagMeta);

  const mainBubble = document.createElement('div');
  mainBubble.className = 'p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-sm text-slate-100 font-medium leading-relaxed';
  mainBubble.textContent = `«${q.text}»`;

  contentWrapper.append(header, mainBubble);

  if (q.replyAuthor && q.replyText) {
    const isReplyEvg = q.replyAuthor === 'Женя';
    const replyColor = isReplyEvg
      ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
      : 'text-pink-400 border-pink-500/30 bg-pink-500/10';

    const replyWrapper = document.createElement('div');
    replyWrapper.className = 'pl-4 border-l-2 border-slate-700/60 ml-2 space-y-1.5';

    const replyBadge = document.createElement('div');
    replyBadge.className = `text-[10px] font-mono-code ${replyColor} inline-block px-1.5 py-0.5 rounded border`;
    replyBadge.textContent = q.replyAuthor;

    const replyBubble = document.createElement('div');
    replyBubble.className = 'p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-slate-300';
    replyBubble.textContent = `«${q.replyText}»`;

    replyWrapper.append(replyBadge, replyBubble);
    contentWrapper.appendChild(replyWrapper);
  }

  const contextFooter = document.createElement('div');
  contextFooter.className = 'mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-slate-400 italic';
  contextFooter.textContent = `📌 ${q.context}`;

  card.append(contentWrapper, contextFooter);
  return card;
}

export function renderQuotes(quotes) {
  if (quotes) cachedQuotes = quotes;
  const container = document.getElementById('quotes-container');
  if (!container || !Array.isArray(cachedQuotes)) return;
  container.replaceChildren();

  const filtered = cachedQuotes.filter((q) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'Женя') return q.author === 'Женя' || q.replyAuthor === 'Женя';
    if (activeFilter === 'Лолита') return q.author === 'Лолита' || q.replyAuthor === 'Лолита';
    if (activeFilter === 'wb') return q.tag.includes('WB');
    if (activeFilter === 'night') return q.tag.includes('Ночн') || q.tag.includes('сна');
    return true;
  });

  filtered.forEach((q, idx) => {
    container.appendChild(createQuoteCard(q, idx));
  });

  const countBadge = document.getElementById('quotes-filter-count');
  if (countBadge) {
    countBadge.textContent = `Показано: ${filtered.length} из ${cachedQuotes.length}`;
  }
}

export function highlightRandomQuote() {
  if (!cachedQuotes.length) return;
  playClickSound();

  const randomIdx = Math.floor(Math.random() * cachedQuotes.length);
  const randomQuote = cachedQuotes[randomIdx];

  // If filtered out, reset filter to 'all'
  if (activeFilter !== 'all') {
    activeFilter = 'all';
    updateFilterButtonsUI();
    renderQuotes();
  }

  const card = document.getElementById(`quote-card-${randomIdx}`);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('border-amber-400', 'shadow-2xl', 'shadow-amber-500/30', 'scale-[1.02]');
    setTimeout(() => {
      card.classList.remove('border-amber-400', 'shadow-2xl', 'shadow-amber-500/30', 'scale-[1.02]');
    }, 2500);
  }

  showToast(`🎲 Цитата дня (${randomQuote.author}): «${randomQuote.text.slice(0, 45)}...»`, 'info');
}

function updateFilterButtonsUI() {
  const buttons = document.querySelectorAll('.btn-quote-filter');
  buttons.forEach((btn) => {
    const f = btn.getAttribute('data-filter');
    if (f === activeFilter) {
      btn.className = 'btn-quote-filter px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono-code font-semibold transition-all shadow-md';
    } else {
      btn.className = 'btn-quote-filter px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10 text-xs font-mono-code transition-all';
    }
  });
}

export function initQuotes(quotes) {
  cachedQuotes = quotes || [];
  renderQuotes(cachedQuotes);

  const filterButtons = document.querySelectorAll('.btn-quote-filter');
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClickSound();
      activeFilter = btn.getAttribute('data-filter') || 'all';
      if (activeFilter === 'wb') {
        unlockAchievement('wb_specialist');
      }
      updateFilterButtonsUI();
      renderQuotes();
    });
  });

  const randomBtn = document.getElementById('btn-random-quote');
  if (randomBtn) {
    randomBtn.addEventListener('click', highlightRandomQuote);
  }
}
