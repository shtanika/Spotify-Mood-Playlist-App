import os
# TODO: google.generativeai is now deprecated; try to use google.genai instead
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

prompt_template = """
Generate parameters for a music playlist based on the following mood/theme/style: "{theme}".

The user's top artists and top tracks are provided below in JSON format.

User's Top Artists:
{artists_json}

User's Top Tracks:
{tracks_json}

Please return only the following fields, formatted as comma-separated values inside quotation marks, using the format shown below:

seed_tracks: "Track1", "Track2", "Track3"
seed_artists: "Artist1", "Artist2"
seed_genres: "Genre1", "Genre2"

Instructions:
- You must choose only one of the following combinations:
  - 3 tracks + 2 artists
  - 2 tracks + 2 artists + 1 genre
  - 1 track + 2 artists + 2 genres
  - 5 genres
- Prioritize selections from the user's top artists and tracks if they match the desired mood/theme/style.
- Avoid generic or unrelated results. Do NOT use Spotify IDs—just names and genres.
- Use genres listed under the top artists.

Only return the output in this format. Do not include extra commentary or explanation.
"""

def get_gemini_recommendation(prompt_input, top_artists, top_tracks):
    model = genai.GenerativeModel("gemini-2.0-flash")

    filled_prompt = prompt_template.format(
        theme=prompt_input,
        artists_json=top_artists,
        tracks_json=top_tracks
    )

    response = model.generate_content(filled_prompt)
    if response and response.text:
        return response.text
    else:
        return None
