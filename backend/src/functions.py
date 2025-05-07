import requests
import os
from src.songs import songs
from flask import current_app

# parser
def extract_seeds(text):
    seeds = [
        "seed_tracks",
        "seed_artists",
        "seed_genres"
    ]

    ret = {}
    lines = text.split('\n')
    for seed, line in zip(seeds, lines):
        split_lines = [l.strip().strip('"') for l in line.replace(seed,"")[1:].strip().split(",")]
    
        ret[seed] = split_lines

    current_app.logger.info(f"ret: {ret}")
    return ret

def getRapidRecs(seed_tracks, seed_artists, seed_genres):
    RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
    url = "https://spotify23.p.rapidapi.com/recommendations/"
    querystring = {
        "limit": "20",
        "seed_tracks": seed_tracks,
        "seed_artists": seed_artists,
        "seed_genres": seed_genres
    }

    headers = {
        "x-rapidapi-host": "spotify23.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY
    }

    # Also add code for bad responses 
    response = requests.get(url, headers=headers, params=querystring)
    song_json = response.json()
    
    return song_json

def extractURI(track_uris, songs):
    for track in songs['tracks']:
        track_uris.append(track['uri'])
    return track_uris

