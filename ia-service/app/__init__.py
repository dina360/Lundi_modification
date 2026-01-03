# ia-service/app/__init__.py
from flask import Flask
from flask_cors import CORS
from .routes import bp as prediction_bp

def create_app():
    app = Flask(__name__)
    CORS(app)  # pour accepter les appels depuis localhost:5000/3000
    app.register_blueprint(prediction_bp, url_prefix="/api/prediction")
    return app
