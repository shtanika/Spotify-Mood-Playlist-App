from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

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