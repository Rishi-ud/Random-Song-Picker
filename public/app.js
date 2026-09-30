// State Management
const state = {
  currentSong: null,
  isPlaying: false,
  favorites: [],
  isLoading: false
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
  
  languageSelect: document.getElementById('language-select'),
  genreSelect: document.getElementById('genre-select'),
  modeSelect: document.getElementById('mode-select'),
  
  favoritesToggleBtn: document.getElementById('favorites-toggle-btn'),
  favoritesDrawer: document.getElementById('favorites-drawer'),
  closeDrawerBtn: document.getElementById('close-drawer-btn'),
  drawerBackdrop: document.getElementById('drawer-backdrop'),
  favoritesList: document.getElementById('favorites-list')
};

// Initialize Application
function init() {
  loadFavoritesFromStorage();
  setupEventListeners();

  // Load backend or fallback initial song
  fetchRandomSong();
}

// Event Listeners Setup
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

  // Favorites Drawer Controls
  DOM.favoritesToggleBtn.addEventListener('click', openDrawer);
  DOM.closeDrawerBtn.addEventListener('click', closeDrawer);
  DOM.drawerBackdrop.addEventListener('click', closeDrawer);

  // Keyboard Navigation ([Space] to pick song)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      fetchRandomSong(false);
    }
  });
}

// Fetch Random Song (First tries FastAPI backend endpoint, falls back gracefully)
async function fetchRandomSong(isPureWildcard = false) {
  if (state.isLoading) return;

  setLoading(true);
  stopAudio();

  const selectedLanguage = isPureWildcard ? 'all' : DOM.languageSelect.value;
  const selectedGenre = isPureWildcard ? 'all' : DOM.genreSelect.value;
  const selectedMode = isPureWildcard ? 'wildcard' : DOM.modeSelect.value;

  try {
    // Attempt fetch from backend endpoint
    const response = await fetch(`/api/random-song?genre=${selectedGenre}&language=${selectedLanguage}&mode=${selectedMode}`);
    if (!response.ok) throw new Error('Backend route not active yet');
    
    const songData = await response.json();
    displaySong(songData);
  } catch (err) {
    // Client-side direct iTunes API fetch fallback or curated mock list
    await fetchDirectDeezerOrMock(selectedGenre, selectedLanguage, isPureWildcard);
  } finally {
    setLoading(false);
  }
}

// Direct iTunes Fetch or Mock Fallback for Standalone Frontend Preview
async function fetchDirectDeezerOrMock(genreKey, langKey, isPureWildcard) {
  try {
    let query = 'top hits';

    if (isPureWildcard) {
      const wildcardTerms = ['arijit singh', 'the weeknd', 'dua lipa', 'prateek kuhad', 'coldplay', 'bollywood', 'taylor swift', 'diljit dosanjh', 'drake', 'ar rahman'];
      query = wildcardTerms[Math.floor(Math.random() * wildcardTerms.length)];
    } else if (langKey === 'hindi') {
      const hindiTerms = ['bollywood hits', 'hindi pop', 'arijit singh', 'prateek kuhad', 'diljit dosanjh', 'indian indie', 'desi hip hop'];
      query = genreKey !== 'all' ? `hindi ${genreKey}` : hindiTerms[Math.floor(Math.random() * hindiTerms.length)];
    } else if (langKey === 'english') {
      query = genreKey !== 'all' ? `${genreKey} hits` : 'global top hits';
    } else {
      query = genreKey !== 'all' ? genreKey : 'top hits';
    }

    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=40`);
    if (res.ok) {
      const data = await res.json();
      const results = (data.results || []).filter(t => t.previewUrl);
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
        displaySong(song);
        return;
      }
    }
  } catch (e) {
    console.log('Using curated mock track fallback:', e);
  }

  // Fallback to random item from curated list
  const randomMock = MOCK_SONGS[Math.floor(Math.random() * MOCK_SONGS.length)];
  displaySong(randomMock);
}

// Display Song Details in UI
function displaySong(song) {
  state.currentSong = song;

  DOM.songTitle.textContent = song.title;
  DOM.artistName.textContent = song.artist;
  DOM.albumName.innerHTML = `<i class="fa-solid fa-compact-disc"></i> ${song.album}`;
  DOM.genreBadge.textContent = song.genre || 'Top Hit';
  DOM.durationBadge.innerHTML = `<i class="fa-regular fa-clock"></i> ${formatTime(song.duration || 30)}`;

  DOM.albumCover.src = song.cover;
  DOM.vinylLabel.src = song.cover;

  // Set audio source
  DOM.audioPlayer.src = song.preview || '';
  DOM.audioPlayer.load();

  // Set External Links
  DOM.deezerLink.href = song.deezerUrl || `https://www.deezer.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`;
  DOM.spotifyLink.href = `https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`;
  DOM.youtubeLink.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist)}`;

  // Sync Favorite state button
  updateFavoriteButtonState();
}

// Audio Control Functions
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

// Helpers
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function setLoading(loading) {
  state.isLoading = loading;
  if (loading) {
    DOM.loadingOverlay.classList.add('active');
  } else {
    DOM.loadingOverlay.classList.remove('active');
  }
}

// Favorites Management
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
}

function toggleFavoriteCurrentSong() {
  if (!state.currentSong) return;

  const index = state.favorites.findIndex(s => s.id === state.currentSong.id);
  if (index > -1) {
    state.favorites.splice(index, 1);
  } else {
    state.favorites.push(state.currentSong);
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
      <img src="${song.cover}" class="fav-img" alt="${song.title}">
      <div class="fav-info">
        <div class="fav-title">${song.title}</div>
        <div class="fav-artist">${song.artist}</div>
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
};

// Drawer controls
function openDrawer() {
  DOM.favoritesDrawer.classList.add('open');
  DOM.drawerBackdrop.classList.add('open');
}

function closeDrawer() {
  DOM.favoritesDrawer.classList.remove('open');
  DOM.drawerBackdrop.classList.remove('open');
}

// Launch application
document.addEventListener('DOMContentLoaded', init);
