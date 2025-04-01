from flask import jsonify, request
from flask_restx import Resource, fields
from src.models import Playlist, PlaylistTrack
from src.extensions import db

def init_playlist_routes(api):
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

    @api.route('/get_playlist/<playlist_id>')
    class GetPlaylist(Resource):
        @api.doc(description="Get a playlist by ID with its tracks.")
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
        @api.response(400, 'Validation error')
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
