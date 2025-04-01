from src.extensions import db

class PlaylistTrack(db.Model):
    __tablename__ = 'playlist_tracks'

    playlist_id = db.Column(db.String, db.ForeignKey('playlists.id', ondelete='CASCADE'), primary_key=True)
    spotify_track_id = db.Column(db.String, primary_key=True)
    track_name = db.Column(db.String, nullable=False)
    artist_name = db.Column(db.String, nullable=False)
