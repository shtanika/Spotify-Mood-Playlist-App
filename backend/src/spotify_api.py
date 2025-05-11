import requests 
from flask import request, jsonify
from flask_restx import Api, Resource, fields
from urllib.parse import quote



def init_spotify_api(api):
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
            access_token = request.args.get('access_token')
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
        
        # Route to get spotify current user
        @api.route('/api/spotify/me', methods=['GET'])
        class SpotifyGetCurrentUser(Resource):
            def get(self):
                access_token = request.args.get('access_token')
                if not access_token:
                    return {'error': 'Access token is missing'}, 400
                
                headers = {'Authorization': f'Bearer {access_token}'}
                spotify_user_url = 'https://api.spotify.com/v1/me'

                response = requests.get(spotify_user_url, headers=headers)

                if response.status_code == 200:
                    return response.json()
                else: return {'error': 'Failed to get spotify user'}, 500

        # Route to get a spotify track
        @api.route('/api/spotify/track/<track_id>', methods=['GET'])
        class SpotifyGetTrack(Resource):
            def get(self, track_id):
                access_token = request.args.get('access_token')
                if not access_token:
                    return {'error': 'Access token is missing'}, 400
                
                headers = {'Authorization': f'Bearer {access_token}'}
                get_track_url = f'https://api.spotify.com/v1/tracks/{track_id}'

                response = requests.get(get_track_url, headers=headers)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return {'error': 'Failed to get track'}, 500

        # Route to create a Spotify playlist
        @api.route('/api/spotify/create_playlist', methods=['POST'])
        class SpotifyCreatePlaylist(Resource):
            def post(self):
                access_token = request.args.get('access_token')
                if not access_token:
                    return {'error': 'Access token is missing'}, 400
                
                # get required parameters
                user_id = request.json.get('user_id')
                playlist_name = request.json.get('name', '')
                playlist_description = request.json.get('description', '')
                playlist_public = request.json.get('public', True)

                if not user_id or not playlist_name:
                    return {'error': 'Need user_id and playlist name to create Playlist'}, 400

                headers = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
                playlist_data = {
                    'name': playlist_name,
                    'description': playlist_description,
                    'public': playlist_public
                }

                create_playlist_url = f'https://api.spotify.com/v1/users/{user_id}/playlists'
                response = requests.post(create_playlist_url, json=playlist_data, headers=headers)

                if response.status_code != 201:
                    return {'error': 'Failed to create playlist'}, 500
                else:
                    return {'message': 'Playlist created successfully'}, 201
    
    
        # Route to add tracks to playlist
        @api.route('/api/spotify/add_tracks_playlist', methods=['POST'])
        class SpotifyAddTracksToPlaylist(Resource):
            def post(self):
                access_token = request.args.get('access_token')
                if not access_token:
                    return {'error': 'Access token is missing'}, 400
                
                # get required parameters
                playlist_id = request.json.get('playlist_id')
                track_uris = request.json.get('track_uris')

                if not playlist_id or not track_uris:
                    return {'error': 'Need playlist ID and track URIs to add tracks'}, 400
                
                headers = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
                tracks_data = {
                    'uris': track_uris
                }

                add_tracks_url = f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks'
                response = request.post(add_tracks_url, json=tracks_data, headers=headers)

                if response.status_code != 201:
                    return {'error': 'Failed to add tracks to playlist'}, 500
                else:
                    return {'message': 'Tracks added successfully'}, 201

    # Route to get current user's saved tracks
    @api.route('/api/spotify/saved_tracks', methods=['GET'])
    class SpotifyGetSavedTracks(Resource):
        def get(self):
            access_token = request.args.get('access_token')
            if not access_token:
                return {'error': 'Access token is missing'}, 400
            
            headers = {'Authorization': f'Bearer {access_token}'}
            saved_tracks_url = 'https://api.spotify.com/v1/me/tracks'

            response = requests.get(saved_tracks_url, headers=headers)

            if response.status_code != 200:
                return {'error': 'Failed to get saved tracks'}, 500
            
            saved_tracks_data = response.json()

            return jsonify(saved_tracks_data), 200

    # End of Spotify Web API endpoints, including fetching access token from frontend

    return api