from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
from deep_translator import GoogleTranslator

# ✅ Load .env vars
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDRUX_Dy1rJiJwviR5psPc78k8eZKCfSo8")

# ✅ Init Flask app
app = Flask(__name__)
CORS(app)

# ✅ Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# 🌐 Language prompts
language_prompts = {
    'en': 'Respond in English',
    'hi': 'Respond in Hindi',
    'mr': 'Respond in Marathi',
    'gu': 'Respond in Gujarati',
    'pa': 'Respond in Punjabi'
}

# 📌 Context for Farming Assistant
farming_context = """
You are an expert in agriculture and farming. Focus on:
1. Crop diseases and treatments
2. Best farming practices
3. Seasonal crop recommendations
4. Pest control methods
5. Soil health management
6. Water management
7. Organic farming techniques
8. Modern farming technologies
Provide practical, actionable advice that farmers can implement.
"""

# ✅ /api/chat — short response
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message')
        language = data.get('language', 'en')

        prompt = f"""
{farming_context}
{language_prompts.get(language, 'Respond in English')}
Question: {message}

Provide a clear, concise response that a farmer can easily understand and implement.
Focus on practical solutions and local farming context.
Answer in the requested language.
"""

        result = model.generate_content(prompt)
        response_text = result.text.strip()

        # Fallback translation if not in core 5 languages
        if language not in language_prompts and language != 'en':
            try:
                translated = GoogleTranslator(source='auto', target=language).translate(response_text)
                return jsonify({'response': translated})
            except Exception as te:
                print("Translation error:", te)
                return jsonify({'response': f"Translation failed. Original:\n{response_text}"})

        return jsonify({'response': response_text})
    except Exception as e:
        print("Error in /api/chat:", e)
        return jsonify({'error': 'Failed to generate response', 'details': str(e)}), 500

# ✅ /api/voice-chat — long, voice-friendly response
@app.route('/api/voice-chat', methods=['POST'])
def voice_chat():
    try:
        data = request.get_json()
        message = data.get('message')
        language = data.get('language', 'en')

        prompt = f"""
{farming_context}
{language_prompts.get(language, 'Respond in English')}

Question: {message}

Provide a detailed yet clear response that:
1. Is easy to understand when spoken
2. Uses simple language and short sentences
3. Includes step-by-step instructions if applicable
4. Avoids technical jargon unless necessary
5. Summarizes key points at the end

Format the response in a conversational style suitable for text-to-speech.
"""

        result = model.generate_content(prompt)
        response_text = result.text.strip()

        # Optional translation
        final_response = response_text
        if language not in language_prompts and language != 'en':
            try:
                final_response = GoogleTranslator(source='auto', target=language).translate(response_text)
            except Exception as te:
                print("Voice translation error:", te)

        return jsonify({'response': final_response, 'original': response_text})
    except Exception as e:
        print("Error in /api/voice-chat:", e)
        return jsonify({'error': 'Failed to generate voice response', 'details': str(e)}), 500

# ✅ Run the app
if __name__ == '__main__':
    app.run(debug=True, port=3000)
