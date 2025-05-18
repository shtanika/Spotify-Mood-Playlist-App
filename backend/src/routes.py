from flask import jsonify, request, session, current_app
from flask_restx import Api, Resource, fields
from src.models import User, Prompt, Playlist, PlaylistTrack
from src.extensions import db
from dotenv import load_dotenv
from src.gemini import get_gemini_recommendation
from src.spotify_helpers import (
    get_spotify_top_data, 
    get_spotify_ids_for_tracks, 
    get_spotify_ids_for_artists,
    create_spotify_playlist,
    add_tracks_spotify_playlist,
    get_user_id,
    get_track_uri,
    get_spotify_saved_tracks
    )
from src.spotify_api import init_spotify_api
import json
import re


def init_routes(app):

    api = Api(app, title="API", description="API documentation")

    # include Spotify Web API routes
    api = init_spotify_api(api)

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

    @api.route('/change_username/<spotify_id>')
    class ChangeUsername(Resource):
        @api.doc(description="Change a user's display name.")
        @api.param('display_name', 'The new display name for the user', required=True)
        @api.response(200, 'Username updated successfully')
        @api.response(404, 'User not found')
        @api.response(500, 'Internal server error')
        def put(self, spotify_id):
            display_name = request.args.get('display_name')
            if not display_name:
                return {'error': 'New display name is required'}, 400
                
            try:
                user = User.query.filter_by(spotify_id=spotify_id).first()
                if not user:
                    return {'error': 'User not found'}, 404
                    
                user.display_name = display_name
                db.session.commit()
                
                return {
                    'id': str(user.id),
                    'spotify_id': user.spotify_id,
                    'display_name': user.display_name,
                    'message': 'Username updated successfully'
                }, 200
                
            except Exception as e:
                db.session.rollback()
                return {'error': str(e)}, 500
    
    @api.route('/change_email/<spotify_id>')
    class ChangeEmail(Resource):
        @api.doc(description="Change a user's email address.")
        @api.param('email', 'The new email address for the user', required=True)
        @api.response(200, 'Email updated successfully')
        @api.response(404, 'User not found')
        @api.response(500, 'Internal server error')
        def put(self, spotify_id):
            email = request.args.get('email')
            if not email:
                return {'error': 'New email address is required'}, 400
                
            try:
                user = User.query.filter_by(spotify_id=spotify_id).first()
                if not user:
                    return {'error': 'User not found'}, 404
                    
                user.email = email
                db.session.commit()
                
                return {
                    'id': str(user.id),
                    'spotify_id': user.spotify_id,
                    'email': user.email,
                    'message': 'Email updated successfully'
                }, 200
                
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
            prompt = request.json.get('prompt')
            spotify_id = request.json.get('spotify_id')
            access_token = request.json.get('access_token')

            if not prompt or not spotify_id:
                return {'error': 'Missing prompt or Spotify ID'}, 400 

            track_uris = []

            # Get user from database
            user = User.query.filter_by(spotify_id=spotify_id).first()
            if not user:
                return {'error': 'User not found'}, 404
            
            # Create prompt in database
            new_prompt = Prompt(
                user_id=user.id,
                mood=prompt,
                additional_notes=None
            )
            db.session.add(new_prompt)
            db.session.flush()
            prompt_id = new_prompt.id

            # Get Spotify user data (top tracks and top artists) JOSHUA
            top_data, error = get_spotify_top_data(access_token)
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

            gemini_response_parts = get_gemini_recommendation(prompt, top_artists_json, top_tracks_json)

            if isinstance(gemini_response_parts, dict) and "error" in gemini_response_parts:
                return gemini_response_parts, 500

            # 1. extract text from Gemini parts
            full_text = ""
            for part in gemini_response_parts:
                if hasattr(part, 'text'):
                    full_text += part.text

            # 2. extract JSON string from the full text
            json_match = re.search(r"```(?:json)?\n?([\s\S]*?)\n?```", full_text, re.DOTALL)
            if json_match:
                json_string = json_match.group(1).strip()
            else:
                json_string = full_text.strip()

            current_app.logger.info(f"Gemini JSON Response: {json_string}")

            # 3. parse the JSON string
            try:
                recommendations = json.loads(json_string)
            except json.JSONDecodeError as e:
                current_app.logger.error(f"JSONDecodeError: {e} - Raw response: {json_string}")
                return {'error': 'Invalid JSON from Gemini', 'raw': json_string}, 500

            if not recommendations:
                return {'error': 'No songs extracted from Gemini response', 'raw': full_text}, 500
            current_app.logger.info(f"Extracted recommendations: {recommendations}")

            # 4. search for track URIs on Spotify
            track_uris, not_found = get_track_uris_from_spotify(access_token, recommendations)  #combine track search
            if not track_uris and not not_found:
                return {'error': 'No tracks found on Spotify', 'recommendations': recommendations}, 500

            # 5. get user ID from Spotify
            user_id, error = get_user_id(access_token)
            if error:
                return {'error': 'Could not get user ID', 'details': error}, 500

            # 6. create playlist
            playlist_name = f"{prompt} Vibes"
            playlist_description = f"Playlist generated from your prompt: {prompt}"
            playlist_data, error = create_spotify_playlist(access_token, user_id, playlist_name, track_uris)
            if error:
                return {'error': 'Failed to create Spotify playlist', 'details': error}, 500

            playlist_id = playlist_data['id']

            # 6.5 create playlist in database
            new_playlist = Playlist(
                user_id=user.id,
                prompt_id=prompt_id,
                spotify_playlist_id=playlist_id,
                playlist_name=playlist_name
            )
            db.session.add(new_playlist)
            db.session.commit()

            # 7. add tracks to the playlist
            result = add_tracks_spotify_playlist(access_token, playlist_id, track_uris)
            if isinstance(result, tuple):
                response_data, error = result[:2]  #take first two elements
            else:
                response_data = result
                error = None
            if error:
                return {'error': 'Failed to add tracks to playlist', 'details': error}, 500

            return {
                'message': 'Playlist created successfully!',
                'playlist_id': playlist_id,
                'playlist_name': playlist_name,
                'track_count': len(track_uris),
                'not_found': not_found,
                'recommendations': recommendations  # inc the parsed recommendations
            }, 201


        # Route to test creating playlist, and adding user's saved tracks
        @api.route('/api/spotify/create_playlist_test', methods=['POST'])
        class SpotifyCreatePlaylistTest(Resource):
            def post(self):
                # Request access token 
                access_token = request.args.get('access_token')
                if not access_token:
                    return {'error': 'Access token is missing'}, 400
                
                # get user id
                user_id, error = get_user_id(access_token)
                if error:
                    return error, 400

                # get saved tracks and their track ids
                saved_tracks_data, error = get_spotify_saved_tracks(access_token, limit=10)
                if error:
                    return error, 400
                track_ids = [track['track']['id'] for track in saved_tracks_data['items']]

                # convert track ids to track_uris
                track_uris = []
                for track_id in track_ids:
                    track_uri, error = get_track_uri(access_token, track_id)
                    if error:
                        return error, 400
                    track_uris.append(track_uri)
                
                # create playlist
                playlist_name = 'Create Playlist Test'
                playlist_description = 'Testing creating a playlist and adding saved tracks'
                playlist_data, error = create_spotify_playlist(access_token, user_id, playlist_name, track_uris)
                if error:
                    return error, 400
                playlist_id = playlist_data['id']

                # add tracks to playlist
                _, error = add_tracks_spotify_playlist(access_token, playlist_id, track_uris)
                if error:
                    return error, 400

                return {'message': 'Test playlist created and saved tracks added successfully', 'playlist_id': playlist_id}, 201
    
    return api


from urllib.parse import quote
import requests

def get_track_uris_from_spotify(access_token, recommendations):
    """
    Searches for track URIs on Spotify and returns a list of URIs and a list of not found tracks.
    Uses the get_track_uri helper function.
    """
    track_uris = []
    not_found = []
    for rec in recommendations:
        track_name = rec.get('track')
        artist_name = rec.get('artist')

        if not track_name or not artist_name:
            print(f"Skipping invalid recommendation: {rec}")
            not_found.append(rec)
            continue

        # strict search query, might need something looser for inaccurate gemini track recommendations.    
        query = f'track:"{track_name}" artist:"{artist_name}"'
        
        #search for the track
        headers = {'Authorization': f'Bearer {access_token}'}
        params = {'q': query, 'type': 'track', 'limit': 1}
        response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)

        if response.status_code == 200:
            items = response.json().get("tracks", {}).get("items", [])
            if items:
                track_id = items[0]["id"]
                track_uri, uri_error = get_track_uri(access_token, track_id)  #use the helper
                if uri_error:
                    current_app.logger.error(f"Error getting URI for track {query}: {uri_error}")
                    not_found.append(rec)
                else:
                    track_uris.append(track_uri)
            else:
                # if strict search fails, do loose search (not accurate).
                loose_query = f"{quote(track_name)} {quote(artist_name)}"
                params['q'] = loose_query
                response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)

                if response.status_code == 200:
                    items = response.json().get("tracks", {}).get("items", [])
                    if items:
                        track_id = items[0]["id"]
                        track_uri, uri_error = get_track_uri(access_token, track_id)  #use the helper
                        if uri_error:
                            current_app.logger.error(f"Error getting URI for track {query}: {uri_error}")
                            not_found.append(rec)
                        else:
                            track_uris.append(track_uri)
                    else:
                        not_found.append(rec) 
        else:
            print(f"Spotify search failed for {query}: {response.json()}")
            not_found.append(rec)  #add to not found, and continue
    return track_uris, not_found
