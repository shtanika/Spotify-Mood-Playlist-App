import os
# TODO: google.generativeai is now deprecated; try to use google.genai instead
import google.generativeai as genai
import json
import re

GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GOOGLE_API_KEY environment variable not set.")

prompt_template = """
Generate a 20-song music playlist based on the following theme/mood/style: "{theme}".

The user's top artists and top tracks are provided below in JSON format.

User's Top Artists:
{artists_json}

User's Top Tracks:
{tracks_json}

- The playlist should only include relevant songs from the user's top artists and tracks ONLY if they match the theme. Prioritize using the user's top artists and artists which are related to them. To determine song/artist relevance, consider genre and thematic content of the song or the artist's discography.
- Keep all song choices cohesive to the mood. Must be as accurate as possible both in sound and in theme. Choices must be defendable - consider reasoning for each (but don't output your explanation).
- Ensure all songs are real and exist in the artist's discography.
- Output only a list of 20 songs in this JSON format:

[
    {{ "track": "Track Title", "artist": "Artist Name" }},
    ...
]

Do not include any explanation or other text, only the list of 20 songs.
"""

def get_gemini_recommendation(prompt_input, top_artists, top_tracks):

    model = genai.GenerativeModel("gemini-2.0-flash") #Remember to update later if there's a new model

    filled_prompt = prompt_template.format(
        theme=prompt_input,
        artists_json=top_artists,
        tracks_json=top_tracks
    )

    try:
        response = model.generate_content(filled_prompt, stream=True) #turn off streaming if chunk extraction isn't done properly
        raw_response_parts = []
        for chunk in response:
            if chunk.parts:
                for part in chunk.parts:
                    raw_response_parts.append(part)
        return raw_response_parts  # Return the raw list of resp parts (parsing done in create_playlist route)

    except Exception as e:
        #print(f"Error generating content from Gemini: {e}")
        return {"error": f"Gemini API error: {e}"}
