from flask import jsonify, request, current_app
from flask_restx import Api, Resource, fields
from src.models import User, Prompt, Playlist, PlaylistTrack
from src.extensions import db
from src.songs import songs
from dotenv import load_dotenv
from src.gemini import get_gemini_recommendation
from src.functions import extract_seeds, getRapidRecs, extractURI
import json
import re


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
    
    @api.route('/create_recs')
    class CreateRecs(Resource):
        @api.expect(recommendation_model, validate=True)
        @api.doc(description="Generate recommendations from user prompt")
        def post(self):
            data = request.get_json()
            seed_tracks = ""
            seed_artists = ""
            seed_genres = ""
            track_uris = []
            # Get Spotify user data (top tracks and top artists) JOSHUA

            # Send user data (JSON should incl genre for artists) and prompt to Gemini (should return seed_tracks, seed_artists, and seed_genres) AALEIA
            
            #mock: replace with real call to get top_tracks and top_artists from DB or spotify user data
            top_artists_json = json.dumps([
                {"name": "Tate McRae", "genres": ["dance pop", "pop"], "popularity": 94},
                {"name": "Bad Omens", "genres": ["metalcore"], "popularity": 75}
            ])
            top_tracks_json = json.dumps([
                {"title": "She's All I Wanna Be", "artist": "Tate McRae"},
                {"title": "Just Pretend", "artist": "Bad Omens"}
            ])

            gemini_raw = get_gemini_recommendation(data["prompt"], top_artists_json, top_tracks_json)

            current_app.logger.info(f"gemini response: {gemini_raw}")
            
            seeds = extract_seeds(gemini_raw)

            current_app.logger.info(f"final extracted seeds: '{seeds}")

            seed_tracks = seeds["seed_tracks"]
            seed_artists = seeds["seed_artists"]
            seed_genres = seeds["seed_genres"]

            # REDO or build upon previous Gemini call. Make it so that Gemini creates a playlist of 
            # 20 songs from the seeds or just from prompt + user data AALEIA
            
            # For each track Gemini gives, use Spotify search endpoint to get uri for the track JOSHUA

            # POST create playlist TANIKA

            # POST add tracks TANIKA

            #return {'playlist_id': ''}, 201
            return {'gemini': f'{gemini_raw}\n seeds: {seeds}\n track_uris: {track_uris}'}, 201
    
    return api
