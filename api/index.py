import random
import httpx
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="TuneTragedy API",
    description="FastAPI Backend for TuneTragedy - Pick random Hindi & English music tracks",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════
# LANGUAGE-SPECIFIC SEARCH POOLS
# Every query INCLUDES the language keyword so iTunes can't return wrong results
# ═══════════════════════════════════════════

HINDI_QUERIES = [
    "arijit singh hindi song", "bollywood hits 2024", "hindi romantic songs",
    "shreya ghoshal hindi", "pritam bollywood", "jubin nautiyal hindi",
    "neha kakkar hindi song", "atif aslam hindi", "mohit chauhan hindi",
    "bollywood sad songs", "hindi pop hits", "bollywood new songs",
    "ar rahman hindi", "vishal shekhar hindi", "hindi unplugged",
    "KK hindi songs", "sonu nigam hindi", "kumar sanu hindi hits"
]

ENGLISH_QUERIES = [
    "pop hits 2024", "the weeknd hits", "dua lipa songs", "taylor swift best",
    "drake top songs", "billie eilish hits", "post malone songs",
    "ed sheeran best", "coldplay greatest hits", "bruno mars songs",
    "SZA top songs", "kendrick lamar best", "arctic monkeys hits",
    "linkin park best", "queen greatest hits", "rihanna top songs",
    "harry styles songs", "tame impala best", "gorillaz hits"
]

PUNJABI_QUERIES = [
    "punjabi songs 2024", "punjabi hits latest", "karan aujla punjabi",
    "diljit dosanjh punjabi", "ap dhillon punjabi", "sidhu moose wala punjabi song",
    "shubh punjabi", "harrdy sandhu punjabi", "guru randhawa punjabi",
    "ammy virk punjabi song", "b praak punjabi", "garry sandhu punjabi",
    "punjabi bhangra hits", "new punjabi song", "punjabi party song",
    "parmish verma punjabi", "jass manak punjabi", "babbu maan punjabi"
]

HARYANVI_QUERIES = [
    "haryanvi song 2024", "haryanvi dj song", "haryanvi hits",
    "gulzaar chhaniwala haryanvi", "sapna choudhary haryanvi dance",
    "renuka panwar haryanvi", "raju punjabi haryanvi", "md kd haryanvi",
    "haryanvi new song", "haryanvi mashup", "haryanvi folk song",
    "haryanvi ragni", "fazilpuria haryanvi", "haryanvi party song",
    "ajay hooda haryanvi", "haryanvi romantic song", "haryanvi top hits"
]

DESI_QUERIES = [
    "desi hip hop", "indian rap song", "divine rap hindi",
    "krsna rap song", "seedhe maut rap", "mc stan song",
    "emiway bantai rap", "raftaar rap hindi", "naezy rap mumbai",
    "talha anjum rap", "desi rap 2024", "indian hip hop new",
    "fotty seven rap", "indian underground rap", "gully rap hindi",
    "desi rap cypher", "indian trap song"
]

PHONK_QUERIES = [
    "phonk music", "phonk drift", "brazilian phonk", "phonk remix",
    "aggressive phonk", "cowbell phonk", "dark phonk", "phonk house",
    "phonk bass boosted", "russian phonk", "phonk 2024", "gym phonk",
    "drift phonk music", "phonk racing", "best phonk songs"
]

# ═══════════════════════════════════════════
# CHAOS MODE — BIGGEST BANGERS PER LANGUAGE
# ═══════════════════════════════════════════

CHAOS_QUERIES = {
    "hindi": [
        "bollywood party bangers", "bollywood best songs all time", "honey singh party",
        "badshah hit songs", "bollywood dance hits", "bollywood iconic songs",
        "bollywood club remix", "yo yo honey singh", "bollywood bass boosted"
    ],
    "english": [
        "greatest songs of all time", "best party songs ever", "top bangers all time",
        "epic rock anthems", "best rap songs ever", "legendary pop hits",
        "club bangers best", "hype songs playlist", "goosebump songs"
    ],
    "punjabi": [
        "punjabi banger songs", "sidhu moose wala legend", "ap dhillon banger",
        "punjabi party banger", "punjabi bass boosted", "karan aujla banger",
        "punjabi top hit all time", "punjabi club song", "diljit dosanjh banger"
    ],
    "haryanvi": [
        "haryanvi banger song", "haryanvi dj remix banger", "gulzaar chhaniwala banger",
        "haryanvi party dj", "haryanvi bass boosted remix", "haryanvi viral song",
        "haryanvi superhit song", "haryanvi dance song", "haryanvi top banger"
    ],
    "desi": [
        "indian rap banger", "desi hip hop banger", "divine banger rap",
        "mc stan viral", "seedhe maut banger", "krsna diss track",
        "emiway banger song", "indian rap cypher", "desi trap banger"
    ],
    "phonk": [
        "phonk banger", "phonk bass boosted hard", "best phonk songs ever",
        "aggressive phonk banger", "phonk gym motivation", "dark phonk hard"
    ]
}

# Mood / Vibe keyword mappings (with language baked in)
MOOD_QUERIES = {
    "hindi": {
        "chill": ["chill bollywood song", "soft hindi songs", "anuv jain chill", "prateek kuhad soft hindi"],
        "hype": ["bollywood party song", "badshah hype hindi", "honey singh party hindi"],
        "sad": ["sad bollywood song", "arijit singh sad hindi", "heartbreak hindi song", "dard bhare gaane hindi"],
        "romantic": ["romantic bollywood song", "arijit singh love hindi", "hindi love songs", "bollywood romance"],
        "party": ["bollywood party hits", "badshah party hindi", "hindi dance party song"]
    },
    "english": {
        "chill": ["chill vibes", "lo-fi chill", "relaxing music", "calm acoustic songs", "soft beats"],
        "hype": ["hype music", "energetic hits", "pump up songs", "adrenaline music"],
        "sad": ["sad songs english", "heartbreak music", "emotional ballads english"],
        "romantic": ["romantic songs english", "love songs best", "romance ballad"],
        "party": ["party hits english", "club bangers", "dance party songs", "party anthem"]
    },
    "punjabi": {
        "chill": ["punjabi soft song", "punjabi chill vibes", "punjabi sad slow"],
        "hype": ["punjabi party song", "punjabi bass boosted", "punjabi banger"],
        "sad": ["punjabi sad song", "punjabi heartbreak", "sidhu moose wala sad"],
        "romantic": ["punjabi love song", "punjabi romantic", "punjabi couple song"],
        "party": ["punjabi party hit", "punjabi dance song", "bhangra party"]
    },
    "haryanvi": {
        "chill": ["haryanvi slow song", "haryanvi romantic soft"],
        "hype": ["haryanvi dj party", "haryanvi bass boosted", "haryanvi banger"],
        "sad": ["haryanvi sad song", "haryanvi dard bhara"],
        "romantic": ["haryanvi romantic song", "haryanvi love song"],
        "party": ["haryanvi dance party", "haryanvi dj remix hit"]
    },
    "desi": {
        "chill": ["indian lofi rap", "divine chill rap", "desi hip hop soft"],
        "hype": ["desi rap banger", "indian rap hype", "krsna hype"],
        "sad": ["desi rap sad", "emiway sad rap", "indian rap emotional"],
        "romantic": ["indian rap love song", "desi hip hop romantic"],
        "party": ["desi rap party", "indian hip hop party banger"]
    },
    "phonk": {
        "chill": ["phonk chill", "lo-fi phonk", "slow phonk"],
        "hype": ["aggressive phonk", "gym phonk hard", "phonk banger"],
        "sad": ["dark phonk", "sad phonk", "melancholy phonk"],
        "romantic": ["phonk chill vibes"],
        "party": ["phonk party mix", "drift phonk party"]
    }
}

GENRE_QUERIES = {
    "hindi": {
        "pop": ["bollywood pop song", "hindi pop hits", "arijit singh pop hindi"],
        "rock": ["hindi rock song", "the local train hindi", "indian rock band song"],
        "hiphop": ["desi hip hop song", "divine gully hindi", "krsna rap hindi"],
        "dance": ["bollywood dance song", "hindi dance remix", "bollywood club hit"],
        "indie": ["indian indie song", "prateek kuhad hindi", "anuv jain hindi"],
        "rnb": ["hindi romantic song", "arijit unplugged hindi", "shreya ghoshal hindi"],
        "jazz": ["bollywood acoustic song", "hindi unplugged", "coke studio bharat"],
        "classical": ["sufi hindi song", "ar rahman classical hindi", "classical bollywood"]
    },
    "english": {
        "pop": ["pop hits", "dance pop song", "top pop song"],
        "rock": ["rock classic song", "alternative rock hits", "indie rock song"],
        "hiphop": ["hip hop classic song", "trap music hit", "rap song 2024"],
        "dance": ["edm party song", "house music hit", "electro dance song"],
        "indie": ["indie pop song", "indie folk song", "bedroom pop"],
        "rnb": ["rnb soul song", "neo soul hit", "contemporary rnb"],
        "jazz": ["jazz classic song", "smooth jazz", "blue note jazz"],
        "classical": ["piano classic", "orchestral masterwork", "symphony classic"]
    }
}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "TuneTragedy Backend v3.0"}

@app.get("/api/random-song")
async def get_random_song(
    genre: str = Query("all", description="Genre filter"),
    language: str = Query("all", description="Language filter"),
    mode: str = Query("chart", description="Discovery mode"),
    mood: str = Query("any", description="Mood/vibe filter")
):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    # 1. Determine Language
    target_lang = language.lower()
    if target_lang == "all":
        target_lang = random.choice(["hindi", "english", "punjabi"])

    # iTunes country
    itunes_country = "us" if target_lang in ["english", "phonk"] else "in"

    # 2. Build search query — language is ALWAYS part of the query
    if mode == "chaos":
        pool = CHAOS_QUERIES.get(target_lang, CHAOS_QUERIES["english"])
        query = random.choice(pool)
    elif mood != "any":
        lang_moods = MOOD_QUERIES.get(target_lang, MOOD_QUERIES["english"])
        if mood in lang_moods:
            query = random.choice(lang_moods[mood])
        else:
            query = random.choice(lang_moods.get("hype", ["top hits"]))
    elif mode == "wildcard":
        # Wildcard still uses general pool
        all_queries = HINDI_QUERIES + ENGLISH_QUERIES + PUNJABI_QUERIES + HARYANVI_QUERIES + DESI_QUERIES
        query = random.choice(all_queries)
    elif mode == "deepcuts":
        lang_pool = {
            "hindi": HINDI_QUERIES, "english": ENGLISH_QUERIES,
            "punjabi": PUNJABI_QUERIES, "haryanvi": HARYANVI_QUERIES,
            "desi": DESI_QUERIES, "phonk": PHONK_QUERIES
        }
        query = random.choice(lang_pool.get(target_lang, ENGLISH_QUERIES))
    else:
        # Chart mode — check genre first, then fallback to language pool
        lang_genres = GENRE_QUERIES.get(target_lang, {})
        if genre in lang_genres:
            query = random.choice(lang_genres[genre])
        else:
            lang_pool = {
                "hindi": HINDI_QUERIES, "english": ENGLISH_QUERIES,
                "punjabi": PUNJABI_QUERIES, "haryanvi": HARYANVI_QUERIES,
                "desi": DESI_QUERIES, "phonk": PHONK_QUERIES
            }
            query = random.choice(lang_pool.get(target_lang, ENGLISH_QUERIES))

    # Label map
    lang_map = {
        "hindi": "🇮🇳 HINDI", "english": "🇬🇧 ENGLISH",
        "punjabi": "🌾 PUNJABI", "haryanvi": "🚜 HARYANVI",
        "desi": "🔥 DESI HIP-HOP", "phonk": "💀 PHONK"
    }
    lang_label = lang_map.get(target_lang, "🎶")

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
                valid_tracks = [t for t in results if t.get("previewUrl")]

                if valid_tracks:
                    track = random.choice(valid_tracks)
                    cover_url = track.get("artworkUrl100", "").replace("100x100bb", "600x600bb")
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
                        "genre": f"{lang_label} • {genre.upper()}",
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

