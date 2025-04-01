from flask_restx import Api
from src.routes.user_routes import init_user_routes
from src.routes.playlist_routes import init_playlist_routes
from src.routes.prompt_routes import init_prompt_routes

def init_routes(app):
    api = Api(app, title="API", description="API documentation")
    
    # Initialize all routes
    init_user_routes(api)
    init_playlist_routes(api)
    init_prompt_routes(api)
    
    return api