import os
from flask import request, jsonify
from flask_restx import Namespace, Resource
import google.generativeai as genai
from src.extensions import db

gemini_ns = Namespace('gemini', description='Operations related to Gemini API')

@gemini_ns.route('/generate_playlist_description')
class GeneratePlaylistDescription(Resource):
    def post(self):
        data = request.get_json()
        mood = data.get('mood')

        if not mood:
            return {'error': 'Missing mood in request'}, 400

        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            return {'error': 'Missing GOOGLE_API_KEY in backend environment'}, 500

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = f"Briefly describe a playlist that fits the mood: {mood}."

        try:
            response = model.generate_content(prompt)
            playlist_description = response.text
            return jsonify({'playlistDescription': playlist_description})
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return {'error': 'Failed to generate playlist description'}, 500
