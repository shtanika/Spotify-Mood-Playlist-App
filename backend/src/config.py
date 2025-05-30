import os
from dotenv import load_dotenv

# Below code AI Generated with ChatGPT for efficiency / having it split up the original app.py

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

class Config:
    # Access the DATABASE_URL environment variable
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False