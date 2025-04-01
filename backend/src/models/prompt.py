from src.extensions import db

class Prompt(db.Model):
    __tablename__ = 'prompts'

    id = db.Column(db.String, primary_key=True, default=db.text('gen_random_uuid()'))
    user_id = db.Column(db.String, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    mood = db.Column(db.String, nullable=False)
    additional_notes = db.Column(db.String)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    playlist = db.relationship('Playlist', backref='prompt', uselist=False, cascade="all, delete-orphan")