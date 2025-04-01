from src.extensions import db

class Playlist(db.Model):
    __tablename__ = 'playlists'

    id = db.Column(db.String, primary_key=True, default=db.text('gen_random_uuid()'))
    user_id = db.Column(db.String, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    prompt_id = db.Column(db.String, db.ForeignKey('prompts.id', ondelete='CASCADE'), unique=True, nullable=False)
    spotify_playlist_id = db.Column(db.String, unique=True, nullable=False)
    playlist_name = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    tracks = db.relationship('PlaylistTrack', backref='playlist', cascade="all, delete-orphan")