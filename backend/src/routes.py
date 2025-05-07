from flask import jsonify, request, session
from flask_restx import Api, Resource, fields
from src.models import User, Prompt, Playlist, PlaylistTrack
from src.extensions import db
from src.songs import songs
import requests
import os
from dotenv import load_dotenv
from src.gemini import get_gemini_recommendation
import json
import re

# Spotify helper functions

# Get current user's top tracks and artists. Returns 20 tracks and 20 artists
def get_spotify_top_data():
    global access_token
    if not access_token:
        return None, {'error': 'Access token is not available'}, 400
    headers = {'Authorization': f'Bearer {access_token}'}

    top_tracks_response = requests.get('https://api.spotify.com/v1/me/top/tracks', headers=headers)
    if top_tracks_response.status_code != 200:
        return {'error': 'Failed to get top tracks'}, 500
            
    top_artists_response = requests.get('https://api.spotify.com/v1/me/top/artists', headers=headers)
    if top_artists_response.status_code != 200:
        return {'error': 'Failed to get top artists'}, 500
            
    top_tracks = top_tracks_response.json()
    top_artists = top_artists_response.json()

    return {
        'top_tracks': top_tracks,
        'top_artists': top_artists
    }, None

import requests
from urllib.parse import quote

# Get spotify ids for each track in a list
def get_spotify_ids_for_tracks(seed_tracks):
    track_id_list = []
    global access_token
    headers = {'Authorization': f'Bearer {access_token}'}

    for track in seed_tracks:
        track_id = None
        query = quote(track)
        track_response = requests.get(f'https://api.spotify.com/v1/search?q={query}&type=track', headers=headers)

        if track_response.status_code == 200 and 'tracks' in track_response.json():
            if track_response.json()['tracks']['items']:
                track_id = track_response.json()['tracks']['items'][0]['id']

        if track_id:
            track_id_list.append({'track': track, 'spotify_id': track_id})

    return track_id_list

# Get spotify ids for each artist in a list
def get_spotify_ids_for_artists(seed_artists):
    artists_id_list = []
    global access_token
    headers = {'Authorization': f'Bearer {access_token}'}

    for artist in seed_artists:
        artist_id = None
        query = quote(artist)
        artist_response = requests.get(f'https://api.spotify.com/v1/search?q={query}&type=artist', headers=headers)

        if artist_response.status_code == 200 and 'artists' in artist_response.json():
            if artist_response.json()['artists']['items']:
                artist_id = artist_response.json()['artists']['items'][0]['id']

        if artist_id:
            artists_id_list.append({'artist': artist, 'spotify_id': artist_id})

    return artists_id_list

# End of Spotify helper functions

def init_routes(app):
    api = Api(app, title="API", description="API documentation")

    # API models
    user_model = api.model('User', {
        'spotify_id': fields.String(required=True, description='Spotify ID of the user'),
        'email': fields.String(description='Email of the user'),
        'display_name': fields.String(description='Display name of the user'),
        'profile_image': fields.String(description='Profile image URL of the user')
    })

    prompt_model = api.model('Prompt', {
        'spotify_id': fields.String(required=True, description='Spotify ID of the user'),
        'mood': fields.String(required=True, description='Mood for the playlist'),
        'additional_notes': fields.String(description='Additional notes for playlist generation')
    })

    playlist_model = api.model('Playlist', {
        'user_id': fields.String(required=True, description='User ID'),
        'prompt_id': fields.String(required=True, description='Associated Prompt ID'),
        'spotify_playlist_id': fields.String(required=True, description='Spotify Playlist ID'),
        'playlist_name': fields.String(required=True, description='Name of the playlist')
    })

    playlist_track_model = api.model('PlaylistTrack', {
        'spotify_track_id': fields.String(required=True, description='Spotify Track ID'),
        'track_name': fields.String(required=True, description='Name of the track'),
        'artist_name': fields.String(required=True, description='Name of the artist')
    })

    recommendation_model = api.model('Recommendations', {
        'prompt': fields.String(required=True, description='Prompt'),
        'spotify_id': fields.String(required=True, description='Spotify ID of the user'),
    })

    # User routes
    @api.route('/get_user/<spotify_id>')
    class GetUser(Resource):
        @api.doc(description="Get a user by their Spotify ID.")
        @api.response(200, 'User found')
        @api.response(404, 'User not found')
        def get(self, spotify_id):
            user = User.query.filter_by(spotify_id=spotify_id).first()
            if not user:
                return {'error': 'User not found'}, 404
            return {
                'id': str(user.id),
                'spotify_id': user.spotify_id,
                'email': user.email,
                'display_name': user.display_name,
                'profile_image': user.profile_image,
                'created_at': user.created_at.isoformat()
            }

    @api.route('/create_user')
    class CreateUser(Resource):
        @api.expect(user_model)
        @api.doc(description="Create a new user with the provided details.")
        @api.response(200, 'User updated successfully')
        @api.response(201, 'User created successfully')
        @api.response(500, 'Internal server error')
        def post(self):
            data = request.get_json()

            try:
                # Check if user already exists
                existing_user = User.query.filter_by(spotify_id=data['spotify_id']).first()
                if existing_user:
                    # Update existing user's information
                    existing_user.email = data.get('email', existing_user.email)
                    existing_user.display_name = data.get('display_name', existing_user.display_name)
                    existing_user.profile_image = data.get('profile_image', existing_user.profile_image)
                    db.session.commit()
                    return {
                        'id': str(existing_user.id),
                        'spotify_id': existing_user.spotify_id,
                        'email': existing_user.email,
                        'display_name': existing_user.display_name,
                        'profile_image': existing_user.profile_image,
                        'created_at': existing_user.created_at.isoformat()
                    }, 200

                # Create new user if they don't exist
                new_user = User(
                    spotify_id=data['spotify_id'],
                    email=data.get('email'),
                    display_name=data.get('display_name'),
                    profile_image=data.get('profile_image')
                )
                db.session.add(new_user)
                db.session.commit()
                return {
                    'id': str(new_user.id),
                    'spotify_id': new_user.spotify_id,
                    'email': new_user.email,
                    'display_name': new_user.display_name,
                    'profile_image': new_user.profile_image,
                    'created_at': new_user.created_at.isoformat()
                }, 201
            
            except Exception as e:
                db.session.rollback()
                return {'error': str(e)}, 500


    # Prompt routes
    @api.route('/get_prompt/<prompt_id>')
    class GetPrompt(Resource):
        @api.doc(description="Get a specific prompt by ID.")
        @api.response(200, 'Prompt found')
        @api.response(404, 'Prompt not found')
        def get(self, prompt_id):
            prompt = Prompt.query.get(prompt_id)
            if not prompt:
                return {'error': 'Prompt not found'}, 404

            return {
                'id': str(prompt.id),
                'user_id': str(prompt.user_id),
                'mood': prompt.mood,
                'additional_notes': prompt.additional_notes,
                'created_at': prompt.created_at.isoformat(),
                'playlist': {
                    'id': str(prompt.playlist.id),
                    'spotify_playlist_id': prompt.playlist.spotify_playlist_id,
                    'playlist_name': prompt.playlist.playlist_name
                } if prompt.playlist else None
            }
        
    @api.route('/get_prompts/<user_id>')
    class GetUserPrompts(Resource):
        @api.doc(description="Get all prompts for a user.")
        @api.response(200, 'Prompts found')
        def get(self, user_id):
            prompts = Prompt.query.filter_by(user_id=user_id).all()
            return [{
                'id': str(prompt.id),
                'user_id': str(prompt.user_id),
                'mood': prompt.mood,
                'additional_notes': prompt.additional_notes,
                'created_at': prompt.created_at.isoformat(),
                'playlist': {
                    'id': str(prompt.playlist.id),
                    'spotify_playlist_id': prompt.playlist.spotify_playlist_id,
                    'playlist_name': prompt.playlist.playlist_name
                } if prompt.playlist else None
            } for prompt in prompts]
        
    @api.route('/create_prompt')
    class CreatePrompt(Resource):
        @api.expect(prompt_model)
        @api.doc(description="Create a new prompt.")
        @api.response(201, 'Prompt created successfully')
        @api.response(400, 'Validation error')
        @api.response(404, 'User not found')
        def post(self):
            data = request.get_json()
        
            # Get user by spotify_id
            user = User.query.filter_by(spotify_id=data['spotify_id']).first()
            if not user:
                return {'error': 'User not found'}, 404
            
            new_prompt = Prompt(
                user_id=user.id,  # Use the user's UUID
                mood=data['mood'],
                additional_notes=data.get('additional_notes')
            )
            
            db.session.add(new_prompt)
            db.session.commit()
            
            return {
                'id': str(new_prompt.id),
                'message': 'Prompt created successfully'
            }, 201
        
    # Playlist routes
    @api.route('/get_playlist/<playlist_id>')
    class GetPlaylist(Resource):
        @api.doc(description="Get a playlist by its ID with its tracks.")
        @api.response(200, 'Playlist found')
        @api.response(404, 'Playlist not found')
        def get(self, playlist_id):
            playlist = Playlist.query.get(playlist_id)
            if not playlist:
                return {'error': 'Playlist not found'}, 404

            return {
                'id': str(playlist.id),
                'user_id': str(playlist.user_id),
                'prompt_id': str(playlist.prompt_id),
                'spotify_playlist_id': playlist.spotify_playlist_id,
                'playlist_name': playlist.playlist_name,
                'created_at': playlist.created_at.isoformat(),
                'tracks': [{
                    'id': str(track.id),
                    'spotify_track_id': track.spotify_track_id,
                    'track_name': track.track_name,
                    'artist_name': track.artist_name
                } for track in playlist.tracks]
            }

    @api.route('/create_playlist')
    class CreatePlaylist(Resource):
        @api.expect(playlist_model)
        @api.doc(description="Create a new playlist.")
        @api.response(201, 'Playlist created successfully')
        def post(self):
            data = request.get_json()
            
            new_playlist = Playlist(
                user_id=data['user_id'],
                prompt_id=data['prompt_id'],
                spotify_playlist_id=data['spotify_playlist_id'],
                playlist_name=data['playlist_name']
            )
            
            db.session.add(new_playlist)
            db.session.commit()
            
            return {
                'id': str(new_playlist.id),
                'message': 'Playlist created successfully'
            }, 201

    @api.route('/add_track/<playlist_id>')
    class AddTrack(Resource):
        @api.expect(playlist_track_model)
        @api.doc(description="Add a track to a playlist.")
        @api.response(201, 'Track added successfully')
        @api.response(404, 'Playlist not found')
        def post(self, playlist_id):
            playlist = Playlist.query.get(playlist_id)
            if not playlist:
                return {'error': 'Playlist not found'}, 404

            data = request.get_json()
            
            # Check if track already exists in playlist
            existing_track = PlaylistTrack.query.filter_by(
                playlist_id=playlist_id,
                spotify_track_id=data['spotify_track_id']
            ).first()
            
            if existing_track:
                return {'message': 'Track already exists in playlist'}, 200

            new_track = PlaylistTrack(
                playlist_id=playlist_id,
                spotify_track_id=data['spotify_track_id'],
                track_name=data['track_name'],
                artist_name=data['artist_name']
            )
            
            db.session.add(new_track)
            db.session.commit()
            
            return {'message': 'Track added successfully'}, 201
    

    # Spotify Web API endpoints, including fetching access token from frontend
    # Route for the Spotify access token for Spotify functions in the backend
    @api.route('/api/spotify/access_token', methods=['POST', 'GET'])
    class SpotifyAccessToken(Resource):
        def post(self):
            # Saves access_token globally, when user signs in or token is refreshed.
            global access_token
            access_token = request.json.get('access_token')
            if not access_token:
                return {'error': 'Access token could not be stored'}, 400
            return {'message': 'Access token stored successfully'}, 200
        
        def get(self):
            # endpoint to get access token, may not need yet since access token is globally saved and frontend does not need it. 
            global access_token
            if access_token:
                return {'access_token': access_token}
            return {'error': 'Can not get access token'}, 400

    # Route for top artist and top tracks, can be used in frontend. May structure future spotify endpoints like this, and replace frontend spotify api with these.
    @api.route('/api/spotify/top')
    class SpotifyTop(Resource):
        def get(self):
            # get access token for authorization
            global access_token
            if not access_token:
                return {'error': 'Access token is missing'}, 400
            headers = {'Authorization': f'Bearer {access_token}'}

            # call spotify endpoints for top tracks and top artists
            top_tracks_response = requests.get('https://api.spotify.com/v1/me/top/tracks', headers=headers)
            if top_tracks_response.status_code != 200:
                return {'error': 'Failed to get top tracks'}, 500
            
            top_artists_response = requests.get('https://api.spotify.com/v1/me/top/artists', headers=headers)
            if top_artists_response.status_code != 200:
                return {'error': 'Failed to get top artists'}, 500
            
            top_tracks = top_tracks_response.json()
            top_artists = top_artists_response.json()

            return {
                'top_tracks': top_tracks,
                'top_artists': top_artists
            }
    # End of Spotify Web API endpoints, including fetching access token from frontend

    @api.route('/create_recs')
    class CreateRecs(Resource):
        @api.expect(recommendation_model, validate=True)
        @api.doc(description="Generate recommendations from user prompt")
        def post(self):
            data = request.get_json()
            prompt = request.json.get('prompt')
            spotify_id = request.json.get('spotify_id')

            if not prompt or not spotify_id:
                return {'error': 'Missing prompt or Spotify ID'}, 400 

            track_uris = []

            # Get Spotify user data (top tracks and top artists) JOSHUA
            top_data, error = get_spotify_top_data()
            print(f"TOP DATA: {top_data}")
            if error:
                return error, 500
            if top_data:
                top_tracks = top_data['top_tracks']
                top_artists = top_data['top_artists']
            
            # Send user data (JSON should incl genre for artists) and prompt to Gemini (should return seed_tracks, seed_artists, and seed_genres) AALEIA
            
            top_artists_formatted = [{
                "name": artist["name"],
                "genres": artist.get("genres", []),
                "popularity": artist.get("popularity", 0)
            } for artist in top_artists.get("items", [])]

            top_tracks_formatted = [{
                "title": track["name"],
                "artist": track["artists"][0]["name"] if track.get("artists") else ""
            } for track in top_tracks.get("items", [])]

            top_artists_json = json.dumps(top_artists_formatted)
            top_tracks_json = json.dumps(top_tracks_formatted)

            gemini_raw = get_gemini_recommendation(data["prompt"], top_artists_json, top_tracks_json)

            # parser
            def extract_seeds(text):
                seeds = {
                    "seed_tracks": [],
                    "seed_artists": [],
                    "seed_genres": []
                }

                for key, value_list in seeds.items():
                    pattern = rf'{key}:\s*(.*)'
                    match = re.search(pattern, text)
                    if match:
                        raw_values = match.group(1).strip()
                        #split by comma and remove quotes and whitespace
                        values = [v.strip().strip('"') for v in raw_values.split(',')]
                        #filter out empty strings that might be from extra commas
                        seeds[key] = [v for v in values if v]
                    else:
                        seeds[key] = []

                return seeds

            seeds = extract_seeds(gemini_raw)
            seed_tracks = seeds["seed_tracks"]
            seed_artists = seeds["seed_artists"]
            seed_genres = seeds["seed_genres"]

            #for now just return the raw Gemini response
            #return {'seeds': seeds, 'gemini_response': gemini_raw}, 200

            track_data = []
            artist_data = []

            # For each seed_track and seed_artist, get Spotify ID of respective artist/track (return JSON of each) JOSHUA
            if seed_tracks:
                track_data = get_spotify_ids_for_tracks(seed_tracks)
            seed_track_ids = [item['spotify_id'] for item in track_data if item.get('spotify_id')]
            seed_tracks_param = ",".join(seed_track_ids[:5]) # limit to 5

            if seed_artists:
                artist_data = get_spotify_ids_for_artists(seed_artists)
            seed_artist_ids = [item['spotify_id'] for item in artist_data if item.get('spotify_id')]
            seed_artists_param = ",".join(seed_artist_ids[:5]) #limit to 5

            seed_genres_param = ",".join(seed_genres[:5]) #limit to 5 genres


            # Get JSON of recommendation from RapidAPI using the LLM generated seeds DONE
            RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
            url = "https://spotify23.p.rapidapi.com/recommendations/"
            querystring = {
                "limit": "20",
                "seed_tracks": seed_tracks_param,
                "seed_artists": seed_artists_param,
                "seed_genres": seed_genres_param
            }

            headers = {
                "x-rapidapi-host": "spotify23.p.rapidapi.com",
                "x-rapidapi-key": RAPIDAPI_KEY
            }

            # Commented out to prevent running API; also add code for bad responses
            try:
                response = requests.get(url, headers=headers, params=querystring)
                #song_json = response.json()
                response.raise_for_status()
                recommended_tracks_data = response.json()
            except requests.exceptions.RequestException as e:
                return {'error': f'Error fetching recommendations from RapidAPI: {e}'}, 500
            
            return {
                'seeds': seeds,
                'gemini_response': gemini_raw,
                'track_spotify_ids': track_data,
                'artist_spotify_ids': artist_data,
                'recommendations': recommended_tracks_data
            }, 200

            # Extract URI of songs DONE
            ## Change songs to song_json when running with real / not mock data
            for track in songs['tracks']:
                track_uris.append(track['uri'])

            # POST create playlist TANIKA

            # POST add tracks TANIKA

            return {'playlist_id': ''}, 201
    
    return api
