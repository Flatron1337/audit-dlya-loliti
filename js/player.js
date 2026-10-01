import { formatTime } from './utils.js';
import { isSoundMuted, toggleSoundMute, playClickSound } from './sfx.js';
import { unlockAchievement } from './achievements.js';

export const PLAYLIST = [
  {
    title: 'Не смотри наверх',
    artist: 'Главный саундтрек',
    src: 'dont_look_up.mp3'
  },
  {
    title: 'Аутоагрессия',
    artist: 'Три дня дождя х 13 карат',
    src: 'три_дня_дождя_х_тринадцать_карат_аутоагрессия.mp3'
  },
  {
    title: 'Насвай под губой',
    artist: 'West Coast Boy',
    src: 'West Coast Boy - Насвай под губой.mp3'
  }
];

let currentTrackIndex = 0;
let isPlaying = false;
let isSeeking = false;

function updatePlayerUI(isPlayingState) {
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const disc = document.getElementById('player-disc');
  const visualizer = document.getElementById('visualizer');

  if (isPlayingState) {
    if (playIcon) playIcon.classList.add('hidden');
    if (pauseIcon) pauseIcon.classList.remove('hidden');
    if (disc) disc.classList.add('animate-spin');
    if (visualizer) visualizer.classList.add('playing');
  } else {
    if (playIcon) playIcon.classList.remove('hidden');
    if (pauseIcon) pauseIcon.classList.add('hidden');
    if (disc) disc.classList.remove('animate-spin');
    if (visualizer) visualizer.classList.remove('playing');
  }
}

function loadTrack(audio, index, autoPlay = false) {
  currentTrackIndex = (index + PLAYLIST.length) % PLAYLIST.length;
  const track = PLAYLIST[currentTrackIndex];
  audio.src = track.src;

  const trackName = document.getElementById('track-name');
  const trackArtist = document.getElementById('track-artist');
  const scrubber = document.getElementById('audio-scrubber');

  if (trackName) trackName.textContent = track.title;
  if (trackArtist) trackArtist.textContent = track.artist;
  if (scrubber) scrubber.value = 0;

  if (autoPlay) {
    audio.play().then(() => {
      isPlaying = true;
      updatePlayerUI(true);
    }).catch((_err) => {
      isPlaying = false;
      updatePlayerUI(false);
    });
  } else {
    isPlaying = false;
    updatePlayerUI(false);
  }
}

function bindPlaybackButtons(audio) {
  const playPauseBtn = document.getElementById('play-pause-btn');
  const prevBtn = document.getElementById('player-prev-btn');
  const nextBtn = document.getElementById('player-next-btn');

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      playClickSound();
      if (audio.paused) {
        audio.play().then(() => {
          isPlaying = true;
          updatePlayerUI(true);
          unlockAchievement('audiophile');
        }).catch((_err) => {
          isPlaying = false;
          updatePlayerUI(false);
        });
      } else {
        audio.pause();
        isPlaying = false;
        updatePlayerUI(false);
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      playClickSound();
      loadTrack(audio, currentTrackIndex - 1, isPlaying);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playClickSound();
      loadTrack(audio, currentTrackIndex + 1, isPlaying);
    });
  }
}

function bindScrubberAndMute(audio) {
  const muteBtn = document.getElementById('player-mute-btn');
  const scrubber = document.getElementById('audio-scrubber');
  const trackTime = document.getElementById('track-time');

  if (muteBtn) {
    const syncMute = () => {
      const muted = isSoundMuted();
      muteBtn.textContent = muted ? '🔇' : '🔊';
      muteBtn.title = muted ? 'Включить звук' : 'Выключить звук';
      audio.muted = muted;
    };
    syncMute();
    muteBtn.addEventListener('click', () => {
      toggleSoundMute();
      syncMute();
    });
  }

  if (scrubber) {
    scrubber.addEventListener('input', () => {
      isSeeking = true;
      if (audio.duration && trackTime) {
        const seekTime = (scrubber.value / 100) * audio.duration;
        trackTime.textContent = `${formatTime(seekTime)} / ${formatTime(audio.duration)}`;
      }
    });

    scrubber.addEventListener('change', () => {
      if (audio.duration) {
        audio.currentTime = (scrubber.value / 100) * audio.duration;
      }
      isSeeking = false;
    });
  }
}

export function initAudioPlayer() {
  const audio = document.getElementById('audio-element');
  if (!audio) return;

  const trackTime = document.getElementById('track-time');
  const scrubber = document.getElementById('audio-scrubber');

  bindPlaybackButtons(audio);
  bindScrubberAndMute(audio);

  audio.addEventListener('timeupdate', () => {
    if (!isSeeking && audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      if (scrubber) scrubber.value = pct;
      if (trackTime) {
        trackTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
      }
    }
  });

  audio.addEventListener('ended', () => {
    loadTrack(audio, currentTrackIndex + 1, true);
  });

  loadTrack(audio, 0, false);
}
