from flask import Flask, request, jsonify
from flask_cors import CORS
from pieces.voice_handler import get_models
from pieces.tiktok_video_gen import TikTokVideoGenerator

app = Flask(__name__)

CORS(app)

@app.route('/api/voice-models', methods=['GET'])
def get_voice_models():
    data = get_models()
    return jsonify(data)


@app.route('/api/create-video', methods=['POST'])
def generate_tiktok_video():
    print(request.get_json())
    generator = TikTokVideoGenerator()
    return generator.generate(request.get_json())

@app.errorhandler(500)
def handle_internal_error(error):
    print(f"Internal Server Error: {error}")

    if "CORS" in str(error):  
        return jsonify({"error": {"message": "CORS error occurred"}}), 500

    return jsonify({"error": {"message":"Internal server error occurred"}}), 500

if __name__ == '__main__':
    app.run(debug=True)