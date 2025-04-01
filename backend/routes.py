from flask import jsonify, request
from flask_restx import Api, Resource, fields
from models import db, User

def init_routes(app):
    api = Api(app, title="User API", description="API for managing users")

    user_model = api.model('User', {
        'spotify_id': fields.String(required=True, description='Spotify ID of the user'),
        'email': fields.String(description='Email of the user'),
        'display_name': fields.String(description='Display name of the user'),
        'profile_image': fields.String(description='Profile image URL of the user')
    })

    @app.route('/')
    def hello():
        return "Hello, World!"

    @api.route('/get_user/<spotify_id>')
    class GetUser(Resource):
        @api.doc(description="Get a user by their Spotify ID.")
        @api.response(200, 'User found')
        @api.response(404, 'User not found')
        @api.response(500, 'Internal server error')
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
        @api.response(201, 'User created successfully')
        @api.response(400, 'Validation error')
        @api.response(500, 'Internal server error')
        def post(self):
            data = request.get_json()

            if not data or 'spotify_id' not in data:
                return jsonify({'error': 'spotify_id is required'}), 400

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

    return api