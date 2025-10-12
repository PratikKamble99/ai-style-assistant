from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

from services.body_analyzer import BodyAnalyzer
from services.face_analyzer import FaceAnalyzer
from services.skin_analyzer import SkinAnalyzer
from services.style_generator import StyleGenerator
from services.virtual_tryon import VirtualTryOn

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize AI services
body_analyzer = BodyAnalyzer()
face_analyzer = FaceAnalyzer()
skin_analyzer = SkinAnalyzer()
style_generator = StyleGenerator()
virtual_tryon = VirtualTryOn()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'service': 'AI Services'})

@app.route('/analyze/body-type', methods=['POST'])
def analyze_body_type():
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({'error': 'Image URL is required'}), 400
        
        result = body_analyzer.analyze(image_url)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze/face-shape', methods=['POST'])
def analyze_face_shape():
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({'error': 'Image URL is required'}), 400
        
        result = face_analyzer.analyze(image_url)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze/skin-tone', methods=['POST'])
def analyze_skin_tone():
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        
        if not image_url:
            return jsonify({'error': 'Image URL is required'}), 400
        
        result = skin_analyzer.analyze(image_url)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate/style-suggestions', methods=['POST'])
def generate_style_suggestions():
    try:
        data = request.get_json()
        
        required_fields = ['occasion', 'body_type', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        result = style_generator.generate_suggestions(data)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate/virtual-tryon', methods=['POST'])
def generate_virtual_tryon():
    try:
        data = request.get_json()
        
        required_fields = ['user_image_url', 'outfit_description']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        result = virtual_tryon.generate(data)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze/color-palette', methods=['POST'])
def analyze_color_palette():
    try:
        data = request.get_json()
        skin_tone = data.get('skin_tone')
        hair_color = data.get('hair_color', 'unknown')
        eye_color = data.get('eye_color', 'unknown')
        
        if not skin_tone:
            return jsonify({'error': 'Skin tone is required'}), 400
        
        result = style_generator.generate_color_palette(skin_tone, hair_color, eye_color)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)