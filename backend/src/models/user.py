from src.extensions import db

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