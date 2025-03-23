# app.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask import request, jsonify
from flask_restx import Api, Resource, fields

app = Flask(__name__)
app.config.from_object('config.Config')

db = SQLAlchemy(app)
api = Api(app, title="User API", description="API for managing users")

user_model = api.model('User', {
    'spotify_id': fields.String(required=True, description='Spotify ID of the user'),
    'email': fields.String(description='Email of the user'),
    'display_name': fields.String(description='Display name of the user'),
    'profile_image': fields.String(description='Profile image URL of the user')
})


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String, primary_key=True, default=db.text('gen_random_uuid()'))
    spotify_id = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True)
    display_name = db.Column(db.String)
    profile_image = db.Column(db.String)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    prompts = db.relationship('Prompt', backref='user', cascade="all, delete-orphan")
    playlists = db.relationship('Playlist', backref='user', cascade="all, delete-orphan")


class Prompt(db.Model):
    __tablename__ = 'prompts'

    id = db.Column(db.String, primary_key=True, default=db.text('gen_random_uuid()'))
    user_id = db.Column(db.String, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    mood = db.Column(db.String, nullable=False)
    additional_notes = db.Column(db.String)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    playlist = db.relationship('Playlist', backref='prompt', uselist=False, cascade="all, delete-orphan")


class Playlist(db.Model):
    __tablename__ = 'playlists'

    id = db.Column(db.String, primary_key=True, default=db.text('gen_random_uuid()'))
    user_id = db.Column(db.String, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    prompt_id = db.Column(db.String, db.ForeignKey('prompts.id', ondelete='CASCADE'), unique=True, nullable=False)
    spotify_playlist_id = db.Column(db.String, unique=True, nullable=False)
    playlist_name = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    tracks = db.relationship('PlaylistTrack', backref='playlist', cascade="all, delete-orphan")


class PlaylistTrack(db.Model):
    __tablename__ = 'playlist_tracks'

    id = db.Column(db.String, primary_key=True, default=db.text('gen_random_uuid()'))
    playlist_id = db.Column(db.String, db.ForeignKey('playlists.id', ondelete='CASCADE'), nullable=False)
    spotify_track_id = db.Column(db.String, nullable=False)
    track_name = db.Column(db.String, nullable=False)
    artist_name = db.Column(db.String, nullable=False)


@app.route('/')
def hello():
    return "Hello, World!"

# get the user with the given the spotify_id
@app.route('/get_user/<spotify_id>')
def get_user_by_spotify_id(spotify_id):
    user = User.query.filter_by(spotify_id=spotify_id).first()
    return {
        'id': user.id,
        'spotify_id': user.spotify_id,
        'email': user.email,
        'display_name': user.display_name,
        'profile_image': user.profile_image,
        'created_at': user.created_at
    }

@api.route('/create_user', methods=['POST'])
class CreateUser(Resource):
    @api.expect(user_model)
    @api.doc(description="Create a new user with the provided details.")
    @api.response(201, 'User created successfully')
    @api.response(400, 'Validation error')
    @api.response(500, 'Internal server error')
    def post(self):
        data = request.get_json()

        # Validate required fields
        if not data or 'spotify_id' not in data:
            return jsonify({'error': 'spotify_id is required'}), 400

        # Create a new user
        new_user = User(
            spotify_id=data['spotify_id'],
            email=data.get('email'),
            display_name=data.get('display_name'),
            profile_image=data.get('profile_image')
        )

        try:
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')