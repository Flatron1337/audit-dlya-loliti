import { EMOJI_METADATA_MAP } from './data.js';

export function renderEmojis(emojis, metadataMap = EMOJI_METADATA_MAP) {
  const container = document.getElementById('emojis-container');
  if (!container || !Array.isArray(emojis)) return;
  container.replaceChildren();

  emojis.forEach((em) => {
    const meta = metadataMap[em.emoji] || { tag: em.tag || 'Реакция', desc: em.desc || '' };
    const card = document.createElement('div');
    card.className = 'glass-panel p-4 rounded-2xl border-white/10 text-center hover:border-violet-500/40 transition-all hover:scale-105 cursor-pointer';

    const emojiIcon = document.createElement('div');
    emojiIcon.className = 'text-3xl mb-1';
    emojiIcon.textContent = em.emoji;

    const countLabel = document.createElement('div');
    countLabel.className = 'font-display font-bold text-lg text-white';
    countLabel.textContent = `${em.count} шт.`;

    const tagBadge = document.createElement('div');
    tagBadge.className = 'text-[10px] font-mono-code text-violet-300 mt-1';
    tagBadge.textContent = em.tag || meta.tag;

    const descPara = document.createElement('p');
    descPara.className = 'text-[11px] text-slate-400 mt-1.5 line-clamp-2';
    descPara.textContent = em.desc || meta.desc;

    card.append(emojiIcon, countLabel, tagBadge, descPara);
    container.appendChild(card);
  });
}
