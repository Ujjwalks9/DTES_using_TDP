from flask import request, jsonify
from tasks import word_freq

def register_routes(app):
    
    @app.route('/api/word_freq', methods=['POST'])
    def handle_word_frequency():
        content = request.get_json()
        text = content.get('text', '')
        if not text.strip():
            return jsonify({"error": "Empty input"}), 400

        result = word_freq.process_text_with_workers(text)
        return jsonify({"word_frequencies": result})
