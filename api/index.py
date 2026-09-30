import random
import httpx
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="TuneTragedy API",
    description="FastAPI Backend for TuneTragedy - Pick random Hindi & English music tracks",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HINDI_KEYWORDS = {
    "pop": ["bollywood pop", "hindi pop hits", "arijit singh pop", "diljit dosanjh", "badshah hits"],
    "rock": ["hindi rock", "indian rock bands", "the local train", "euphoria hindi", "rockstar movie songs"],
    "hiphop": ["desi hip hop", "divine gully gang", "krsna rap", "seedhe maut", "raftaar rap", "mc stan"],
    "dance": ["bollywood party hits", "hindi dance remix", "punjabi party beats", "bollywood club"],
    "indie": ["indian indie", "prateek kuhad", "anuv jain", "zaeden", "twin strings", "when chai met toast"],
    "rnb": ["hindi romantic hits", "arijit singh unplugged", "jubin nautiyal soul", "shreya ghoshal classics"],
    "jazz": ["bollywood acoustic", "hindi unplugged guitar", "coke studio bharat"],
    "classical": ["sufi hindi songs", "ar rahman classics", "coke studio pakistan hindi", "classical bollywood"]
}

ENGLISH_KEYWORDS = {
    "pop": ["pop hits", "dance pop", "synthpop", "top pop classics"],
    "rock": ["rock classics", "alternative rock", "hard rock", "indie rock"],
    "hiphop": ["hip hop classics", "trap music", "rap hits 2024", "90s hip hop"],
    "dance": ["edm party", "house music", "electro dance", "techno classics"],
    "indie": ["indie pop", "indie folk", "bedroom pop", "alt indie"],
    "rnb": ["r&b soul", "neo soul", "contemporary rnb", "90s rnb"],
    "jazz": ["jazz classics", "smooth jazz", "bebop classics", "blue note jazz"],
    "classical": ["piano masterworks", "orchestral classics", "symphony classics"]
}

HINDI_ARTISTS = [
    "Arijit Singh", "Shreya Ghoshal", "A.R. Rahman", "Pritam", "Diljit Dosanjh",
    "Jubin Nautiyal", "Divine", "Prateek Kuhad", "Anuv Jain", "Neha Kakkar",
    "KK", "Mohit Chauhan", "Atif Aslam", "Badshah", "Vishal-Shekhar", "KRSNA"
]

ENGLISH_ARTISTS = [
    "The Weeknd", "Dua Lipa", "Taylor Swift", "Harry Styles", "Daft Punk",
    "Bruno Mars", "Billie Eilish", "Coldplay", "Kendrick Lamar", "Drake",
    "Post Malone", "Ed Sheeran", "Rihanna", "Queen", "Arctic Monkeys",
    "Fleetwood Mac", "Gorillaz", "Tame Impala", "SZA", "Linkin Park"
]

WILDCARD_TERMS = HINDI_ARTISTS + ENGLISH_ARTISTS + [
    "love", "night", "summer", "dream", "fire", "light", "sky", "dil", "pyar", 
    "yaari", "zindagi", "safar", "roshni", "wild", "shadow", "gold", "electric"
]

# Mood / Vibe keyword mappings
MOOD_KEYWORDS = {
    "chill": ["chill vibes", "lo-fi", "relaxing music", "calm acoustic", "ambient chill", "soft beats"],
    "hype": ["hype music", "energetic hits", "pump up songs", "adrenaline music", "bass boost"],
    "sad": ["sad songs", "heartbreak music", "emotional ballads", "melancholy", "crying songs"],
    "romantic": ["romantic songs", "love songs", "romance ballad", "couple songs", "serenade"],
    "party": ["party hits", "club bangers", "dance party", "party anthem", "friday night"]
}

MOOD_KEYWORDS_HINDI = {
    "chill": ["chill bollywood", "soft hindi songs", "anuv jain chill", "prateek kuhad soft"],
    "hype": ["bollywood party", "badshah hype", "honey singh party", "desi bass"],
    "sad": ["sad bollywood", "arijit singh sad", "heartbreak hindi", "dard bhare gaane"],
    "romantic": ["romantic bollywood", "arijit singh love", "hindi love songs", "bollywood romance"],
    "party": ["bollywood party hits", "badshah party", "punjabi party", "hindi dance hits"]
}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "TuneTragedy Backend v2.1"}

@app.get("/api/random-song")
async def get_random_song(
    genre: str = Query("all", description="Genre filter"),
    language: str = Query("all", description="Language filter: hindi, english, or all"),
    mode: str = Query("chart", description="Discovery mode: chart, deepcuts, or wildcard"),
    mood: str = Query("any", description="Mood/vibe filter: chill, hype, sad, romantic, workout, study, party")
):
    """
    Fetch a random song with audio preview, supporting Hindi & English languages and mood filters.
    """
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    # iTunes genre names that indicate Hindi / Indian music
    HINDI_GENRES = {
        "bollywood", "indian pop", "filmi", "sufi & ghazal", "indian classical",
        "regional indian music", "devotional & spiritual", "ghazals", "bhangra",
        "punjabi pop", "folk", "carnatic classical", "hindustani classical"
    }

    def is_hindi_track(track: dict) -> bool:
        g = (track.get("primaryGenreName") or "").lower()
        return any(h in g for h in HINDI_GENRES)

    def is_english_track(track: dict) -> bool:
        return not is_hindi_track(track)

    # 1. Determine Language pool
    target_lang = language.lower()
    if target_lang == "all":
        target_lang = random.choice(["hindi", "english"])

    # iTunes country bias: IN store has more Bollywood, US store has more English
    itunes_country = "in" if target_lang == "hindi" else "us"

    # 2. Select Search Query — mood takes priority when specified
    if mood != "any" and mood in MOOD_KEYWORDS:
        mood_pool = MOOD_KEYWORDS_HINDI if target_lang == "hindi" else MOOD_KEYWORDS
        query = random.choice(mood_pool[mood])
    elif mode == "wildcard":
        query = random.choice(WILDCARD_TERMS)
    elif mode == "deepcuts":
        query = random.choice(HINDI_ARTISTS if target_lang == "hindi" else ENGLISH_ARTISTS)
    else:
        # Chart / Popular mode
        keywords_dict = HINDI_KEYWORDS if target_lang == "hindi" else ENGLISH_KEYWORDS
        if genre in keywords_dict:
            query = random.choice(keywords_dict[genre])
        else:
            query = random.choice(HINDI_ARTISTS if target_lang == "hindi" else ENGLISH_ARTISTS)

    async with httpx.AsyncClient(headers=headers, timeout=8.0) as client:
        # Try iTunes Search API
        try:
            url = (
                f"https://itunes.apple.com/search"
                f"?term={query}&entity=song&limit=50&country={itunes_country}"
            )
            resp = await client.get(url)
            if resp.status_code == 200:
                results = resp.json().get("results", [])

                # Step 1: must have a preview URL
                valid_tracks = [t for t in results if t.get("previewUrl")]

                # Step 2: filter by language using primaryGenreName
                if target_lang == "hindi":
                    lang_filtered = [t for t in valid_tracks if is_hindi_track(t)]
                elif target_lang == "english":
                    lang_filtered = [t for t in valid_tracks if is_english_track(t)]
                else:
                    lang_filtered = valid_tracks

                # Fall back to unfiltered if filter was too strict
                final_tracks = lang_filtered if lang_filtered else valid_tracks

                if final_tracks:
                    track = random.choice(final_tracks)
                    cover_url = track.get("artworkUrl100", "").replace("100x100bb", "600x600bb")
                    lang_label = "🇮🇳 HINDI" if target_lang == "hindi" else "🇬🇧 ENGLISH"
                    return {
                        "id": str(track.get("trackId")),
                        "title": track.get("trackName"),
                        "artist": track.get("artistName"),
                        "album": track.get("collectionName", "Single"),
                        "genre": f"{lang_label} • {track.get('primaryGenreName', genre.upper())}",
                        "language": target_lang,
                        "cover": cover_url,
                        "preview": track.get("previewUrl"),
                        "duration": int(track.get("trackTimeMillis", 30000) / 1000),
                        "deezerUrl": track.get("trackViewUrl")
                    }
        except Exception as e:
            print("iTunes API Exception:", e)

        # Deezer fallback
        try:
            deezer_resp = await client.get("https://api.deezer.com/playlist/3155776842/tracks")
            if deezer_resp.status_code == 200:
                tracks = deezer_resp.json().get("data", [])
                if tracks:
                    track = random.choice(tracks)
                    return {
                        "id": str(track["id"]),
                        "title": track.get("title"),
                        "artist": track.get("artist", {}).get("name", "Unknown Artist"),
                        "album": track.get("album", {}).get("title", "Single"),
                        "genre": f"{target_lang.upper()} • {genre.upper()}",
                        "language": target_lang,
                        "cover": track.get("album", {}).get("cover_xl") or track.get("album", {}).get("cover_medium"),
                        "preview": track.get("preview"),
                        "duration": track.get("duration", 30),
                        "deezerUrl": track.get("link")
                    }
        except Exception as e:
            print("Deezer API Exception:", e)

    # Last fallback
    return {
        "id": "100",
        "title": "Kesariya",
        "artist": "Arijit Singh, Pritam",
        "album": "Brahmastra",
        "genre": "🇮🇳 HINDI • POP",
        "language": "hindi",
        "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9c/61/89/9c6189b2-3868-b80a-9d62-a58d63a8e998/196589249688.jpg/600x600bb.jpg",
        "preview": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/bf/1a/05/bf1a0528-98e3-0570-5b56-7fa44bcf61e1/mzaf_16480112984407873523.plus.aac.p.m4a",
        "duration": 268,
        "deezerUrl": "https://music.apple.com/us/album/kesariya/1634898160?i=1634898161"
    }

# Mount static frontend for Render / single-container deployment
import os
from fastapi.staticfiles import StaticFiles

if os.path.exists("public"):
    app.mount("/", StaticFiles(directory="public", html=True), name="public")

