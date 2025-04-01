from flask import jsonify, request
from flask_restx import Resource, fields
from src.models import Prompt, User
from src.extensions import db

def init_prompt_routes(api):
    prompt_model = api.model('Prompt', {
        'spotify_id': fields.String(required=True, description='Spotify ID of the user'),
        'mood': fields.String(required=True, description='Mood for the playlist'),
        'additional_notes': fields.String(description='Additional notes for playlist generation')
    })

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

    @api.route('/create_prompt')
    class CreatePrompt(Resource):
        @api.expect(prompt_model)
        @api.doc(description="Create a new prompt.")
        @api.response(201, 'Prompt created successfully')
        @api.response(400, 'Validation error')
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
