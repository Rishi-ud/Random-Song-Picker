// Backend API URL Configuration
// If hosting backend on Render & frontend on Vercel, set your Render service URL here:
const RENDER_BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '' 
  : 'https://tunetragedy-backend.onrender.com'; // <--- Set your Render Web Service URL here!

// State Management
const state = {
  currentSong: null,
  isPlaying: false,
  favorites: [],
  history: [],
  seenSongIds: [], // Now a queue (array) with max length 20
  isLoading: false,
  autoPlay: false,
  noRepeat: true,
  totalDiscovered: 0,
  theme: 'default'
};

const THEMES = ['default', 'cyberpunk', 'ocean', 'matcha', 'sunset'];

// Mood keyword mappings for the new Mood filter
const MOOD_KEYWORDS = {
  chill: ['chill vibes', 'lo-fi', 'relaxing music', 'calm acoustic', 'ambient chill', 'soft beats'],
  hype: ['hype music', 'energetic hits', 'pump up songs', 'adrenaline music', 'bass boost'],
  sad: ['sad songs', 'heartbreak music', 'emotional ballads', 'melancholy', 'crying songs'],
  romantic: ['romantic songs', 'love songs', 'romance ballad', 'couple songs', 'serenade'],
  party: ['party hits', 'club bangers', 'dance party', 'party anthem', 'friday night']
};

const MOOD_KEYWORDS_HINDI = {
  chill: ['chill bollywood', 'soft hindi songs', 'anuv jain chill', 'prateek kuhad soft'],
  hype: ['bollywood party', 'badshah hype', 'honey singh party', 'desi bass'],
  sad: ['sad bollywood', 'arijit singh sad', 'heartbreak hindi', 'dard bhare gaane'],
  romantic: ['romantic bollywood', 'arijit singh love', 'hindi love songs', 'bollywood romance'],
  party: ['bollywood party hits', 'badshah party', 'punjabi party', 'hindi dance hits']
};

// Fallback curated collection (for offline / instant fallback preview)
const MOCK_SONGS = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    genre: 'Pop Hits',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop',
    preview: 'https://cdns-preview-d.dzcdn.net/stream/c-d8f99e30a514d483864a784d193d5f30-6.mp3',
    duration: 200,
    deezerUrl: 'https://www.deezer.com/track/908604612'
  },
  {
    id: '2',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    genre: 'Dance / Electronic',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop',
    preview: 'https://cdns-preview-e.dzcdn.net/stream/c-e9a9b2b52ec146b9a8cfd6fbb33d6b05-4.mp3',
    duration: 203,
    deezerUrl: 'https://www.deezer.com/track/916424562'
  },
  {
    id: '3',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    genre: 'R&B / Soul',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
    preview: 'https://cdns-preview-a.dzcdn.net/stream/c-a5b6d910b8e6f1f3a2b10a56fbc82098-4.mp3',
    duration: 230,
    deezerUrl: 'https://www.deezer.com/track/132512684'
  },
  {
    id: '4',
    title: 'As It Was',
    artist: 'Harry Styles',
    album: "Harry's House",
    genre: 'Indie / Alternative',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop',
    preview: 'https://cdns-preview-b.dzcdn.net/stream/c-b715e2ef3c8d1bb43063f25c7569e25d-3.mp3',
    duration: 167,
    deezerUrl: 'https://www.deezer.com/track/1703487577'
  }
];

// Deezer Genre Mapping
const DEEZER_GENRES = {
  pop: 132,
  rock: 152,
  hiphop: 116,
  dance: 113,
  indie: 85,
  rnb: 165,
  jazz: 129,
  classical: 98
};

// DOM Elements
const DOM = {
  songCard: document.getElementById('song-card'),
  albumCover: document.getElementById('album-cover'),
  vinylDisc: document.getElementById('vinyl-disc'),
  vinylLabel: document.getElementById('vinyl-label'),
  loadingOverlay: document.getElementById('loading-overlay'),
  skeletonOverlay: document.getElementById('skeleton-overlay'),
  
  genreBadge: document.getElementById('genre-badge'),
  durationBadge: document.getElementById('duration-badge'),
  songTitle: document.getElementById('song-title'),
  artistName: document.getElementById('artist-name'),
  albumName: document.getElementById('album-name'),
  
  audioPlayer: document.getElementById('audio-player'),
  playPauseBtn: document.getElementById('play-pause-btn'),
  playIcon: document.getElementById('play-icon'),
  currentTime: document.getElementById('current-time'),
  totalTime: document.getElementById('total-time'),
  progressContainer: document.getElementById('progress-container'),
  progressBar: document.getElementById('progress-bar'),
  volumeSlider: document.getElementById('volume-slider'),
  
  deezerLink: document.getElementById('deezer-link'),
  spotifyLink: document.getElementById('spotify-link'),
  youtubeLink: document.getElementById('youtube-link'),
  
  pickBtn: document.getElementById('pick-btn'),
  wildcardBtn: document.getElementById('wildcard-btn'),
  favoriteBtn: document.getElementById('favorite-btn'),
  favIcon: document.getElementById('fav-icon'),
  favCount: document.getElementById('fav-count'),
  shareBtn: document.getElementById('share-btn'),
  
  languageSelect: document.getElementById('language-select'),
  modeSelect: document.getElementById('mode-select'),
  genreSelect: document.getElementById('genre-select'),  // hidden input
  moodSelect: document.getElementById('mood-select'),    // hidden input
  
  themeToggleBtn: document.getElementById('theme-toggle-btn'),

  favoritesToggleBtn: document.getElementById('favorites-toggle-btn'),
  favoritesDrawer: document.getElementById('favorites-drawer'),
  closeDrawerBtn: document.getElementById('close-drawer-btn'),
  drawerBackdrop: document.getElementById('drawer-backdrop'),
  favoritesList: document.getElementById('favorites-list'),
  
  // New DOM elements
  historyToggleBtn: document.getElementById('history-toggle-btn'),
  historyDrawer: document.getElementById('history-drawer'),
  closeHistoryBtn: document.getElementById('close-history-btn'),
  clearHistoryBtn: document.getElementById('clear-history-btn'),
  historyList: document.getElementById('history-list'),
  historyCount: document.getElementById('history-count'),
  
  autoPlayToggle: document.getElementById('auto-play-toggle'),
  autoPlayLabel: document.getElementById('auto-play-label'),
  noRepeatToggle: document.getElementById('no-repeat-toggle'),
  
  shortcutsBtn: document.getElementById('shortcuts-btn'),
  shortcutsOverlay: document.getElementById('shortcuts-overlay'),
  closeShortcutsBtn: document.getElementById('close-shortcuts-btn'),
  
  toastContainer: document.getElementById('toast-container'),
  confettiCanvas: document.getElementById('confetti-canvas'),
  
  statDiscovered: document.getElementById('stat-discovered'),
  statFavorites: document.getElementById('stat-favorites'),
  statSkipped: document.getElementById('stat-skipped')
};

// ═══════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════
function init() {
  loadFavoritesFromStorage();
  loadHistoryFromStorage();
  loadSettingsFromStorage();
  loadStatsFromStorage();
  loadThemeFromStorage();
  setupEventListeners();
  fetchRandomSong();
}

// ═══════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════
function setupEventListeners() {
  // Audio Controls
  DOM.playPauseBtn.addEventListener('click', togglePlay);
  DOM.audioPlayer.addEventListener('timeupdate', updateProgress);
  DOM.audioPlayer.addEventListener('ended', onAudioEnded);
  DOM.progressContainer.addEventListener('click', setProgress);
  DOM.volumeSlider.addEventListener('input', (e) => {
    DOM.audioPlayer.volume = e.target.value;
  });

  // Action Buttons
  DOM.pickBtn.addEventListener('click', () => fetchRandomSong(false));
  DOM.wildcardBtn.addEventListener('click', () => fetchRandomSong(true));
  DOM.favoriteBtn.addEventListener('click', toggleFavoriteCurrentSong);
  DOM.shareBtn.addEventListener('click', shareCurrentSong);

  // Favorites Drawer Controls
  DOM.favoritesToggleBtn.addEventListener('click', openFavoritesDrawer);
  DOM.closeDrawerBtn.addEventListener('click', closeFavoritesDrawer);
  DOM.drawerBackdrop.addEventListener('click', closeAllDrawers);
  
  DOM.themeToggleBtn.addEventListener('click', cycleTheme);

  // History Drawer Controls
  DOM.historyToggleBtn.addEventListener('click', openHistoryDrawer);
  DOM.closeHistoryBtn.addEventListener('click', closeHistoryDrawer);
  DOM.clearHistoryBtn.addEventListener('click', clearHistory);

  // Auto-play toggle
  DOM.autoPlayToggle.addEventListener('change', (e) => {
    state.autoPlay = e.target.checked;
    DOM.autoPlayLabel.textContent = state.autoPlay ? 'Auto ✓' : 'Auto';
    saveSettingsToStorage();
    showToast(state.autoPlay ? 'Auto-play enabled 🔄' : 'Auto-play disabled', 'info');
  });

  // No-repeat toggle
  DOM.noRepeatToggle.addEventListener('change', (e) => {
    state.noRepeat = e.target.checked;
    saveSettingsToStorage();
    showToast(state.noRepeat ? 'No repeats enabled ✓' : 'Repeats allowed', 'info');
  });

  // Keyboard Shortcuts panel
  DOM.shortcutsBtn.addEventListener('click', toggleShortcutsOverlay);
  DOM.closeShortcutsBtn.addEventListener('click', closeShortcutsOverlay);

  // Keyboard Navigation (extended shortcuts)
  document.addEventListener('keydown', handleKeyboard);

  // Genre / Mood Tab Switcher
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab; // 'genre' or 'mood'

      // Update tab active state
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show/hide panels
      document.getElementById('panel-genre').classList.toggle('hidden', targetTab !== 'genre');
      document.getElementById('panel-mood').classList.toggle('hidden', targetTab !== 'mood');

      // Reset the inactive filter to its default
      if (targetTab === 'genre') {
        DOM.moodSelect.value = 'any';
        document.querySelectorAll('#panel-mood .filter-pill').forEach((p, i) => p.classList.toggle('active', i === 0));
      } else {
        DOM.genreSelect.value = 'all';
        document.querySelectorAll('#panel-genre .filter-pill').forEach((p, i) => p.classList.toggle('active', i === 0));
      }
    });
  });

  // Filter Pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const type = pill.dataset.type;   // 'genre' or 'mood'
      const value = pill.dataset.value;

      // Update active pill in this panel
      document.querySelectorAll(`#panel-${type} .filter-pill`).forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      // Write value to the hidden input
      if (type === 'genre') DOM.genreSelect.value = value;
      if (type === 'mood') DOM.moodSelect.value = value;
    });
  });
}

function cycleTheme() {
  let currentIndex = THEMES.indexOf(state.theme);
  if (currentIndex === -1) currentIndex = 0;
  
  let nextIndex = (currentIndex + 1) % THEMES.length;
  let nextTheme = THEMES[nextIndex];
  
  state.theme = nextTheme;
  localStorage.setItem('rsp_theme', nextTheme);
  applyTheme(nextTheme);
  
  const themeNames = {
    'default': 'Midnight Purple 💜',
    'cyberpunk': 'Cyberpunk 💛',
    'ocean': 'Deep Ocean 🌊',
    'matcha': 'Matcha Green 🍵',
    'sunset': 'Sunset Glow 🌇'
  };
  
  showToast(`Theme: ${themeNames[nextTheme]}`, 'info');
}

function loadThemeFromStorage() {
  const savedTheme = localStorage.getItem('rsp_theme');
  if (savedTheme && THEMES.includes(savedTheme)) {
    state.theme = savedTheme;
  }
  applyTheme(state.theme);
}

function applyTheme(themeName) {
  if (themeName === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeName);
  }
}

function handleKeyboard(e) {
  // Don't trigger when typing in inputs/selects
  if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      fetchRandomSong(false);
      break;
    case 'KeyN':
      fetchRandomSong(true);
      break;
    case 'KeyP':
      togglePlay();
      break;
    case 'KeyF':
      toggleFavoriteCurrentSong();
      break;
    case 'KeyS':
      shareCurrentSong();
      break;
    case 'KeyH':
      toggleHistoryDrawer();
      break;
    case 'KeyA':
      DOM.autoPlayToggle.checked = !DOM.autoPlayToggle.checked;
      DOM.autoPlayToggle.dispatchEvent(new Event('change'));
      break;
    case 'Slash':
      if (e.shiftKey) { // '?' key
        e.preventDefault();
        toggleShortcutsOverlay();
      }
      break;
    case 'Escape':
      closeAllDrawers();
      closeShortcutsOverlay();
      break;
  }
}

// ═══════════════════════════════════════════
// FETCH RANDOM SONG
// ═══════════════════════════════════════════
let fetchDebounceTimer = null;

async function fetchRandomSong(isPureWildcard = false) {
  if (state.isLoading) return;

  // Debounce: prevent spam clicking
  if (fetchDebounceTimer) return;
  fetchDebounceTimer = setTimeout(() => { fetchDebounceTimer = null; }, 400);

  setLoading(true);
  stopAudio();

  const selectedLanguage = isPureWildcard ? 'all' : DOM.languageSelect.value;
  const selectedGenre = isPureWildcard ? 'all' : DOM.genreSelect.value;
  const selectedMode = isPureWildcard ? 'wildcard' : DOM.modeSelect.value;
  const selectedMood = isPureWildcard ? 'any' : DOM.moodSelect.value;

  try {
    // Attempt fetch from backend endpoint (Render Web Service or local)
    let url = `${RENDER_BACKEND_URL}/api/random-song?genre=${selectedGenre}&language=${selectedLanguage}&mode=${selectedMode}`;
    if (selectedMood !== 'any') {
      url += `&mood=${selectedMood}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Backend route not active yet');
    
    const songData = await response.json();

    // Check no-repeat
    if (state.noRepeat && state.seenSongIds.includes(songData.id)) {
      // Try once more
      const retryResp = await fetch(url);
      if (retryResp.ok) {
        const retrySong = await retryResp.json();
        if (!state.seenSongIds.includes(retrySong.id)) {
          onSongReceived(retrySong);
          return;
        }
      }
    }

    onSongReceived(songData);
  } catch (err) {
    // Client-side direct iTunes API fetch fallback or curated mock list
    await fetchDirectDeezerOrMock(selectedGenre, selectedLanguage, isPureWildcard, selectedMood);
  } finally {
    setLoading(false);
  }
}

function onSongReceived(song) {
  // Add to memory queue and limit to 20
  state.seenSongIds.push(song.id);
  if (state.seenSongIds.length > 20) {
    state.seenSongIds.shift(); // Remove oldest
  }
  
  state.totalDiscovered++;
  saveStatsToStorage();
  addToHistory(song);
  displaySong(song);
  updateStatsUI();
}

const HINDI_GENRE_NAMES = new Set([
  'bollywood', 'indian pop', 'filmi', 'sufi & ghazal', 'indian classical',
  'regional indian music', 'devotional & spiritual', 'ghazals', 'bhangra',
  'punjabi pop', 'folk', 'carnatic classical', 'hindustani classical'
]);

const PUNJABI_ARTISTS = [
  "Diljit Dosanjh", "Karan Aujla", "AP Dhillon", "Sidhu Moose Wala", "Shubh", 
  "Harrdy Sandhu", "Guru Randhawa", "Ammy Virk", "B Praak", "Garry Sandhu"
];
const HARYANVI_ARTISTS = [
  "Fazilpuria", "Renuka Panwar", "MD KD", "Sapna Choudhary", 
  "Gulzaar Chhaniwala", "Raju Punjabi", "Vikas Kumar"
];
const DESI_ARTISTS = [
  "Divine", "Naezy", "KRSNA", "Seedhe Maut", "MC Stan", "Talha Anjum",
  "Emiway Bantai", "Raftaar", "Fotty Seven", "Moksh"
];
const CHAOS_TERMS = [
  "skrillex", "hardstyle", "electronic bass boost", "phonk", "crazy frog",
  "dubstep banger", "heavy metal slipknot", "techno mix", "hardcore edm", "doom eternal soundtrack"
];

function isHindiTrack(track) {
  const g = (track.primaryGenreName || '').toLowerCase();
  return [...HINDI_GENRE_NAMES].some(h => g.includes(h));
}

// Direct iTunes Fetch or Mock Fallback for Standalone Frontend Preview
async function fetchDirectDeezerOrMock(genreKey, langKey, isPureWildcard, moodKey) {
  try {
    let query = 'top hits';
    const selectedMode = DOM.modeSelect.value;

    // If mood is selected, prioritize mood keywords
    if (selectedMode === 'chaos') {
      query = CHAOS_TERMS[Math.floor(Math.random() * CHAOS_TERMS.length)];
    } else if (moodKey && moodKey !== 'any') {
      const moodPool = ['hindi', 'punjabi', 'haryanvi', 'desi'].includes(langKey) ? MOOD_KEYWORDS_HINDI : MOOD_KEYWORDS;
      if (moodPool[moodKey]) {
        query = moodPool[moodKey][Math.floor(Math.random() * moodPool[moodKey].length)];
      }
    } else if (isPureWildcard) {
      const wildcardTerms = ['arijit singh', 'the weeknd', 'dua lipa', 'prateek kuhad', 'coldplay', 'bollywood', 'taylor swift', 'diljit dosanjh', 'drake', 'ar rahman'];
      query = wildcardTerms[Math.floor(Math.random() * wildcardTerms.length)];
    } else if (langKey === 'punjabi') {
      query = PUNJABI_ARTISTS[Math.floor(Math.random() * PUNJABI_ARTISTS.length)];
    } else if (langKey === 'haryanvi') {
      query = HARYANVI_ARTISTS[Math.floor(Math.random() * HARYANVI_ARTISTS.length)];
    } else if (langKey === 'desi') {
      query = DESI_ARTISTS[Math.floor(Math.random() * DESI_ARTISTS.length)];
    } else if (langKey === 'hindi') {
      const hindiTerms = ['bollywood hits', 'hindi pop', 'arijit singh', 'prateek kuhad', 'diljit dosanjh', 'indian indie', 'desi hip hop'];
      query = genreKey !== 'all' ? `hindi ${genreKey}` : hindiTerms[Math.floor(Math.random() * hindiTerms.length)];
    } else if (langKey === 'english') {
      query = genreKey !== 'all' ? `${genreKey} hits` : 'global top hits';
    } else {
      query = genreKey !== 'all' ? genreKey : 'top hits';
    }

    // Use country param to bias iTunes store (IN = more Bollywood, US = more English)
    const country = langKey === 'english' ? 'us' : 'in';
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=50&country=${country}`);
    if (res.ok) {
      const data = await res.json();
      let results = (data.results || []).filter(t => t.previewUrl);

      // Language filter by primaryGenreName
      if (['hindi', 'punjabi', 'haryanvi', 'desi'].includes(langKey)) {
        const langFiltered = results.filter(t => isHindiTrack(t));
        if (langFiltered.length > 0) results = langFiltered;
      } else if (langKey === 'english') {
        const langFiltered = results.filter(t => !isHindiTrack(t));
        if (langFiltered.length > 0) results = langFiltered;
      }

      // No-repeat filter
      if (state.noRepeat) {
        const fresh = results.filter(t => !state.seenSongIds.includes(String(t.trackId)));
        if (fresh.length > 0) results = fresh;
      }

      if (results.length > 0) {
        const track = results[Math.floor(Math.random() * results.length)];
        const langPrefix = langKey === 'hindi' ? '🇮🇳 HINDI' : (langKey === 'english' ? '🇬🇧 ENGLISH' : '🌐 MIXED');
        const song = {
          id: String(track.trackId),
          title: track.trackName,
          artist: track.artistName,
          album: track.collectionName || 'Single',
          genre: `${langPrefix} • ${track.primaryGenreName || 'POP'}`,
          language: langKey,
          cover: (track.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
          preview: track.previewUrl,
          duration: Math.floor((track.trackTimeMillis || 30000) / 1000),
          deezerUrl: track.trackViewUrl
        };
        onSongReceived(song);
        return;
      }
    }
  } catch (e) {
    console.log('Using curated mock track fallback:', e);
  }

  // Fallback to random item from curated list
  const randomMock = MOCK_SONGS[Math.floor(Math.random() * MOCK_SONGS.length)];
  onSongReceived(randomMock);
}

// ═══════════════════════════════════════════
// DISPLAY SONG
// ═══════════════════════════════════════════
function displaySong(song) {
  state.currentSong = song;

  DOM.songTitle.textContent = song.title;
  DOM.artistName.textContent = song.artist;
  DOM.albumName.innerHTML = `<i class="fa-solid fa-compact-disc"></i> ${song.album}`;
  DOM.genreBadge.textContent = song.genre || 'Top Hit';
  DOM.durationBadge.innerHTML = `<i class="fa-regular fa-clock"></i> ${formatTime(song.duration || 30)}`;

  DOM.albumCover.src = song.cover;
  DOM.vinylLabel.src = song.cover;

  // Set audio source and auto-play
  DOM.audioPlayer.src = song.preview || '';
  DOM.audioPlayer.load();

  // Auto-play as soon as the browser has enough data
  if (song.preview) {
    const onCanPlay = () => {
      DOM.audioPlayer.removeEventListener('canplay', onCanPlay);
      playAudio();
    };
    DOM.audioPlayer.addEventListener('canplay', onCanPlay);
  }

  // Set External Links
  DOM.deezerLink.href = song.deezerUrl || `https://www.deezer.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`;
  DOM.spotifyLink.href = `https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`;
  DOM.youtubeLink.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist)}`;

  // Sync Favorite state button
  updateFavoriteButtonState();
}

// ═══════════════════════════════════════════
// AUDIO CONTROLS
// ═══════════════════════════════════════════
function togglePlay() {
  if (!state.currentSong || !DOM.audioPlayer.src) return;

  if (state.isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function playAudio() {
  DOM.audioPlayer.play().then(() => {
    state.isPlaying = true;
    DOM.playIcon.className = 'fa-solid fa-pause';
    DOM.songCard.classList.add('playing');
  }).catch(e => console.log('Audio autoplay prevented:', e));
}

function pauseAudio() {
  DOM.audioPlayer.pause();
  state.isPlaying = false;
  DOM.playIcon.className = 'fa-solid fa-play';
  DOM.songCard.classList.remove('playing');
}

function stopAudio() {
  pauseAudio();
  DOM.audioPlayer.currentTime = 0;
  DOM.progressBar.style.width = '0%';
  DOM.currentTime.textContent = '0:00';
}

function onAudioEnded() {
  stopAudio();
  // Auto-play next song if enabled
  if (state.autoPlay) {
    showToast('Auto-playing next song... 🔄', 'info');
    setTimeout(() => fetchRandomSong(false), 800);
  }
}

function updateProgress() {
  const { currentTime, duration } = DOM.audioPlayer;
  if (isNaN(duration) || duration === 0) return;

  const progressPercent = (currentTime / duration) * 100;
  DOM.progressBar.style.width = `${progressPercent}%`;
  DOM.currentTime.textContent = formatTime(currentTime);
  DOM.totalTime.textContent = formatTime(duration);
}

function setProgress(e) {
  const width = DOM.progressContainer.clientWidth;
  const clickX = e.offsetX;
  const duration = DOM.audioPlayer.duration;

  if (duration) {
    DOM.audioPlayer.currentTime = (clickX / width) * duration;
  }
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function setLoading(loading) {
  state.isLoading = loading;
  if (loading) {
    DOM.loadingOverlay.classList.add('active');
    DOM.skeletonOverlay.classList.add('active');
  } else {
    DOM.loadingOverlay.classList.remove('active');
    DOM.skeletonOverlay.classList.remove('active');
  }
}

// ═══════════════════════════════════════════
// TOAST NOTIFICATION SYSTEM
// ═══════════════════════════════════════════
function showToast(message, type = 'info', duration = 3000) {
  const iconMap = {
    success: 'fa-solid fa-check-circle',
    info: 'fa-solid fa-info-circle',
    warning: 'fa-solid fa-exclamation-triangle',
    love: 'fa-solid fa-heart'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="${iconMap[type] || iconMap.info}"></i> <span>${message}</span>`;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ═══════════════════════════════════════════
// CONFETTI SYSTEM
// ═══════════════════════════════════════════
function launchConfetti() {
  const canvas = DOM.confettiCanvas;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444'];

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -14 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      gravity: 0.3,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'circle' : 'rect'
    });
  }

  let frame = 0;
  const maxFrames = 90;

  function animate() {
    if (frame >= maxFrames) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.opacity = Math.max(0, 1 - frame / maxFrames);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }

      ctx.restore();
    });

    frame++;
    requestAnimationFrame(animate);
  }

  animate();
}

// ═══════════════════════════════════════════
// FAVORITES MANAGEMENT
// ═══════════════════════════════════════════
function loadFavoritesFromStorage() {
  const saved = localStorage.getItem('rsp_favorites');
  if (saved) {
    try {
      state.favorites = JSON.parse(saved);
    } catch (e) {
      state.favorites = [];
    }
  }
  updateFavoritesUI();
}

function saveFavoritesToStorage() {
  localStorage.setItem('rsp_favorites', JSON.stringify(state.favorites));
  updateFavoritesUI();
  updateStatsUI();
}

function toggleFavoriteCurrentSong() {
  if (!state.currentSong) return;

  const index = state.favorites.findIndex(s => s.id === state.currentSong.id);
  if (index > -1) {
    state.favorites.splice(index, 1);
    showToast('Removed from favorites', 'info');
  } else {
    state.favorites.push(state.currentSong);
    showToast(`${state.currentSong.title} added to favorites! ❤️`, 'love');
    launchConfetti();
  }

  saveFavoritesToStorage();
  updateFavoriteButtonState();
}

function updateFavoriteButtonState() {
  if (!state.currentSong) return;
  const isFav = state.favorites.some(s => s.id === state.currentSong.id);

  if (isFav) {
    DOM.favoriteBtn.classList.add('saved-active');
    DOM.favIcon.className = 'fa-solid fa-heart text-danger';
  } else {
    DOM.favoriteBtn.classList.remove('saved-active');
    DOM.favIcon.className = 'fa-regular fa-heart';
  }
}

function updateFavoritesUI() {
  DOM.favCount.textContent = state.favorites.length;

  if (state.favorites.length === 0) {
    DOM.favoritesList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-music"></i>
        <p>No saved songs yet! Pick a song and click the heart icon to save your favorites.</p>
      </div>
    `;
    return;
  }

  DOM.favoritesList.innerHTML = state.favorites.map(song => `
    <div class="fav-item">
      <img src="${song.cover}" class="fav-img" alt="${escapeHtml(song.title)}">
      <div class="fav-info">
        <div class="fav-title">${escapeHtml(song.title)}</div>
        <div class="fav-artist">${escapeHtml(song.artist)}</div>
      </div>
      <button class="fav-remove-btn" onclick="removeFavorite('${song.id}')" title="Remove">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join('');
}

// Global removal helper for favorites list
window.removeFavorite = function(songId) {
  state.favorites = state.favorites.filter(s => s.id !== songId);
  saveFavoritesToStorage();
  updateFavoriteButtonState();
  showToast('Song removed from favorites', 'info');
};

// ═══════════════════════════════════════════
// HISTORY MANAGEMENT
// ═══════════════════════════════════════════
function loadHistoryFromStorage() {
  const saved = localStorage.getItem('rsp_history');
  if (saved) {
    try {
      state.history = JSON.parse(saved);
    } catch (e) {
      state.history = [];
    }
  }

  // Load seen song IDs as a queue (Array) instead of a Set
  const seenIds = localStorage.getItem('rsp_seen_ids');
  if (seenIds) {
    try {
      state.seenSongIds = JSON.parse(seenIds);
    } catch (e) {
      state.seenSongIds = [];
    }
  } else {
    state.seenSongIds = []; // Ensure it's an array
  }

  updateHistoryUI();
}

function saveHistoryToStorage() {
  localStorage.setItem('rsp_history', JSON.stringify(state.history));
  localStorage.setItem('rsp_seen_ids', JSON.stringify(state.seenSongIds));
  updateHistoryUI();
}

function addToHistory(song) {
  // Add timestamp
  const historyEntry = {
    ...song,
    timestamp: Date.now()
  };

  // Remove duplicate if exists
  state.history = state.history.filter(s => s.id !== song.id);

  // Add to front
  state.history.unshift(historyEntry);

  // Limit History to 20 songs
  if (state.history.length > 20) {
    state.history = state.history.slice(0, 20);
  }

  saveHistoryToStorage();
}

function clearHistory() {
  state.history = [];
  state.seenSongIds = [];
  saveHistoryToStorage();
  showToast('History cleared 🗑️', 'info');
}

function updateHistoryUI() {
  DOM.historyCount.textContent = state.history.length;

  if (state.history.length === 0) {
    DOM.historyList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-clock-rotate-left"></i>
        <p>No history yet. Start picking songs to build your discovery timeline!</p>
      </div>
    `;
    return;
  }

  DOM.historyList.innerHTML = state.history.map(song => {
    const timeAgo = getTimeAgo(song.timestamp);
    const isFav = state.favorites.some(f => f.id === song.id);
    return `
      <div class="history-item">
        <img src="${song.cover}" class="history-img" alt="${escapeHtml(song.title)}">
        <div class="history-info">
          <div class="history-title">${escapeHtml(song.title)}</div>
          <div class="history-artist">${escapeHtml(song.artist)}</div>
          <div class="history-time">${timeAgo}</div>
        </div>
        <div class="history-actions">
          <button class="history-save-btn" onclick="saveFromHistory('${song.id}')" title="${isFav ? 'Already saved' : 'Save to favorites'}">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart" style="${isFav ? 'color: var(--accent-pink)' : ''}"></i>
          </button>
          <button class="history-play-btn" onclick="playFromHistory('${song.id}')" title="Load this song">
            <i class="fa-solid fa-play"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Global helpers for history items
window.saveFromHistory = function(songId) {
  const song = state.history.find(s => s.id === songId);
  if (!song) return;

  const existsInFav = state.favorites.some(f => f.id === songId);
  if (existsInFav) {
    showToast('Already in favorites!', 'info');
    return;
  }

  state.favorites.push(song);
  saveFavoritesToStorage();
  updateHistoryUI();
  showToast(`${song.title} saved to favorites! ❤️`, 'love');
  launchConfetti();
};

window.playFromHistory = function(songId) {
  const song = state.history.find(s => s.id === songId);
  if (!song) return;

  stopAudio();
  displaySong(song);
  closeAllDrawers();
  showToast(`Now playing: ${song.title}`, 'success');
};

// ═══════════════════════════════════════════
// SHARE FEATURE
// ═══════════════════════════════════════════
async function shareCurrentSong() {
  if (!state.currentSong) return;

  const song = state.currentSong;
  const shareText = `🎵 ${song.title} by ${song.artist}\n💿 Album: ${song.album}\n\nDiscovered on TuneTragedy! 🎲✨`;
  const shareUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist)}`;

  // Try native Web Share API first (mobile-friendly)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${song.title} - ${song.artist}`,
        text: shareText,
        url: shareUrl
      });
      showToast('Shared successfully! 🎉', 'success');
      return;
    } catch (err) {
      // User cancelled or API not available — fall through to clipboard
      if (err.name === 'AbortError') return;
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(shareText + '\n' + shareUrl);
    showToast('Song info copied to clipboard! 📋', 'success');
  } catch (err) {
    // Final fallback
    const textarea = document.createElement('textarea');
    textarea.value = shareText + '\n' + shareUrl;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Song info copied to clipboard! 📋', 'success');
  }
}

// ═══════════════════════════════════════════
// SETTINGS PERSISTENCE
// ═══════════════════════════════════════════
function loadSettingsFromStorage() {
  const settings = localStorage.getItem('rsp_settings');
  if (settings) {
    try {
      const parsed = JSON.parse(settings);
      state.autoPlay = parsed.autoPlay || false;
      state.noRepeat = parsed.noRepeat !== undefined ? parsed.noRepeat : true;
    } catch (e) {}
  }

  DOM.autoPlayToggle.checked = state.autoPlay;
  DOM.autoPlayLabel.textContent = state.autoPlay ? 'Auto ✓' : 'Auto';
  DOM.noRepeatToggle.checked = state.noRepeat;
}

function saveSettingsToStorage() {
  localStorage.setItem('rsp_settings', JSON.stringify({
    autoPlay: state.autoPlay,
    noRepeat: state.noRepeat
  }));
}

// ═══════════════════════════════════════════
// STATS TRACKING
// ═══════════════════════════════════════════
function loadStatsFromStorage() {
  const stats = localStorage.getItem('rsp_stats');
  if (stats) {
    try {
      const parsed = JSON.parse(stats);
      state.totalDiscovered = parsed.totalDiscovered || 0;
    } catch (e) {}
  }
  updateStatsUI();
}

function saveStatsToStorage() {
  localStorage.setItem('rsp_stats', JSON.stringify({
    totalDiscovered: state.totalDiscovered
  }));
}

function updateStatsUI() {
  DOM.statDiscovered.textContent = state.totalDiscovered;
  DOM.statFavorites.textContent = state.favorites.length;
  DOM.statSkipped.textContent = state.seenSongIds.size;
}

// ═══════════════════════════════════════════
// DRAWER CONTROLS
// ═══════════════════════════════════════════
function openFavoritesDrawer() {
  closeHistoryDrawer();
  DOM.favoritesDrawer.classList.add('open');
  DOM.drawerBackdrop.classList.add('open');
}

function closeFavoritesDrawer() {
  DOM.favoritesDrawer.classList.remove('open');
  DOM.drawerBackdrop.classList.remove('open');
}

function openHistoryDrawer() {
  closeFavoritesDrawer();
  DOM.historyDrawer.classList.add('open');
  DOM.drawerBackdrop.classList.add('open');
}

function closeHistoryDrawer() {
  DOM.historyDrawer.classList.remove('open');
  DOM.drawerBackdrop.classList.remove('open');
}

function toggleHistoryDrawer() {
  if (DOM.historyDrawer.classList.contains('open')) {
    closeHistoryDrawer();
  } else {
    openHistoryDrawer();
  }
}

function closeAllDrawers() {
  closeFavoritesDrawer();
  closeHistoryDrawer();
}

// ═══════════════════════════════════════════
// KEYBOARD SHORTCUTS OVERLAY
// ═══════════════════════════════════════════
function toggleShortcutsOverlay() {
  DOM.shortcutsOverlay.classList.toggle('open');
}

function closeShortcutsOverlay() {
  DOM.shortcutsOverlay.classList.remove('open');
}

// ═══════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Launch application
document.addEventListener('DOMContentLoaded', init);
