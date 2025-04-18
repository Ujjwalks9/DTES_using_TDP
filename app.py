from flask import Flask
from routes import register_routes
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allows cross-origin access from React frontend
register_routes(app)

if __name__ == '__main__':
    app.run(port=5000)
