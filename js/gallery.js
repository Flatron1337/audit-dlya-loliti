import { playClickSound } from './sfx.js';
import { unlockAchievement } from './achievements.js';

let photosList = [];
let activePhotoIndex = 0;
let activeAuthorFilter = 'all';

function createPhotoCard(photo, originalIdx, fallbackNotes) {
  const card = document.createElement('div');
  card.className = 'group relative rounded-2xl overflow-hidden glass-panel border-white/10 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer aspect-square';

  const noteText = photo.note || fallbackNotes[originalIdx] || `Вещдок №${originalIdx + 1}`;
  const displayDate = (typeof photo.date === 'string' && photo.date.includes('-'))
    ? photo.date.split('-').reverse().join('.')
    : (photo.date || '');

  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = noteText;
  img.loading = 'lazy';
  img.className = 'w-full h-full object-cover group-hover:scale-110 transition-transform duration-500';

  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5';

  const topRow = document.createElement('div');
  topRow.className = 'flex items-center justify-between text-[11px] font-mono-code text-cyan-300';

  const tagBadge = document.createElement('span');
  tagBadge.className = 'px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30';
  tagBadge.textContent = `#${originalIdx + 1} // ${photo.user}`;

  const dateSpan = document.createElement('span');
  dateSpan.className = 'text-slate-300';
  dateSpan.textContent = displayDate;

  topRow.append(tagBadge, dateSpan);

  const titlePara = document.createElement('p');
  titlePara.className = 'text-xs font-medium text-white mt-1 truncate';
  titlePara.textContent = noteText;

  overlay.append(topRow, titlePara);

  const zoomIcon = document.createElement('div');
  zoomIcon.className = 'absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity';
  zoomIcon.textContent = '🔍';

  card.append(img, overlay, zoomIcon);
  card.addEventListener('click', () => openLightbox(originalIdx, fallbackNotes));
  return card;
}

export function renderGallery(photos, fallbackNotes = []) {
  if (photos) photosList = photos;
  const container = document.getElementById('gallery-container');
  if (!container || !photosList.length) return;
  container.replaceChildren();

  let renderedCount = 0;
  photosList.forEach((photo, idx) => {
    if (activeAuthorFilter !== 'all' && photo.user !== activeAuthorFilter) {
      return;
    }
    renderedCount++;
    container.appendChild(createPhotoCard(photo, idx, fallbackNotes));
  });

  const countBadge = document.getElementById('gallery-count-badge');
  if (countBadge) {
    countBadge.textContent = `Показано: ${renderedCount} из ${photosList.length}`;
  }
}

export function openLightbox(index, fallbackNotes = []) {
  if (!photosList.length) return;
  activePhotoIndex = index;
  const photo = photosList[index];
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  if (!modal || !img || !caption || !photo) return;

  const noteText = photo.note || fallbackNotes[index] || `Вещдок №${index + 1}`;
  const displayDate = (typeof photo.date === 'string' && photo.date.includes('-'))
    ? photo.date.split('-').reverse().join('.')
    : (photo.date || '');

  img.src = photo.src;

  caption.replaceChildren();
  const title = document.createElement('span');
  title.className = 'text-cyan-400 font-bold';
  title.textContent = `Вещдок №${index + 1}`;

  const meta = document.createTextNode(' // Автор: ');
  const strong = document.createElement('strong');
  strong.className = 'text-white';
  strong.textContent = photo.user;

  const dateNode = document.createTextNode(` // Дата: ${displayDate} ${photo.time || ''}`);
  const desc = document.createElement('div');
  desc.className = 'text-slate-400 mt-1';
  desc.textContent = noteText;

  caption.append(title, meta, strong, dateNode, desc);

  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
  }, 10);

  unlockAchievement('detective');
}

export function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;
  modal.classList.add('opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

export function prevPhoto(fallbackNotes = []) {
  if (!photosList.length) return;
  activePhotoIndex = (activePhotoIndex - 1 + photosList.length) % photosList.length;
  openLightbox(activePhotoIndex, fallbackNotes);
}

export function nextPhoto(fallbackNotes = []) {
  if (!photosList.length) return;
  activePhotoIndex = (activePhotoIndex + 1) % photosList.length;
  openLightbox(activePhotoIndex, fallbackNotes);
}

function updatePhotoFilterButtonsUI() {
  const filterBtns = document.querySelectorAll('.btn-gallery-filter');
  filterBtns.forEach((btn) => {
    const author = btn.getAttribute('data-author');
    if (author === activeAuthorFilter) {
      btn.className = 'btn-gallery-filter px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono-code font-semibold transition-all shadow-md';
    } else {
      btn.className = 'btn-gallery-filter px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10 text-xs font-mono-code transition-all';
    }
  });
}

function bindLightboxEvents(modal, fallbackNotes) {
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevPhoto(fallbackNotes); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextPhoto(fallbackNotes); });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (modal && !modal.classList.contains('hidden')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPhoto(fallbackNotes);
      if (e.key === 'ArrowRight') nextPhoto(fallbackNotes);
    }
  });
}

export function initGallery(photos, fallbackNotes = []) {
  photosList = photos || [];
  renderGallery(photosList, fallbackNotes);

  const modal = document.getElementById('lightbox-modal');
  bindLightboxEvents(modal, fallbackNotes);

  const filterBtns = document.querySelectorAll('.btn-gallery-filter');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClickSound();
      activeAuthorFilter = btn.getAttribute('data-author') || 'all';
      updatePhotoFilterButtonsUI();
      renderGallery(photosList, fallbackNotes);
    });
  });
}
