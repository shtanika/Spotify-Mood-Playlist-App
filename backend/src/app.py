from flask import Flask
from src.extensions import db
from src.routes import init_routes
from logging.config import dictConfig
from src.logger import init_logger

def create_app():

    # Configure logger 
     
    init_logger()

    app = Flask(__name__)
    app.config.from_object('src.config.Config')

    # Initialize extensions
    db.init_app(app)
    
    # Initialize routes
    api = init_routes(app)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0')