from flask import Flask, request, jsonify
import google.generativeai as genai
from googletrans import Translator
import os
import re
import asyncio
import edge_tts
import traceback
import uuid
from flask_cors import CORS

# 🌐 Gemini API Key
genai.configure(api_key="AIzaSyDdxIKxdaAHvXj1NvFG3Of7a-6IVbf4XK4")

# Flask App
app = Flask(__name__)
CORS(app)

# Static directory for audio
os.makedirs("static", exist_ok=True)

# Language-to-voice map
VOICE_MAP = {
    "en": "en-US-JennyNeural",
    "hi": "hi-IN-SwaraNeural",
    "mr": "mr-IN-SapnaNeural"
}

# Text cleaner for TTS
def clean_text_for_tts(text):
    return re.sub(r'[^\w\sऀ-ॿ.,!?]', '', text).strip()

# 🔊 Process everything async (TTS + Translation + Gemini)
async def process_query(query, lang):
    try:
        model12 = genai.GenerativeModel("gemini-1.5-flash")
        response = model12.generate_content(f"Answer this crop-related question simply and briefly for farmers: {query}")
        full_answer = response.text.strip()
        short_answer = '.'.join(full_answer.split('.')[:3]) + '.'

        # Translate
        translator = Translator()
        translated_text = await translator.translate(short_answer, dest=lang)
        translated = translated_text.text

        # Unique filename
        filename = f"output_{uuid.uuid4().hex[:8]}.mp3"
        filepath = os.path.join("static", filename)

        # TTS
        cleaned_text = clean_text_for_tts(translated)
        try:
            communicate = edge_tts.Communicate(text=cleaned_text, voice=VOICE_MAP.get(lang, "en-US-JennyNeural"))
            await communicate.save(filepath)
        except Exception:
            fallback = cleaned_text.split('.')[0] + '.'
            communicate = edge_tts.Communicate(text=fallback, voice=VOICE_MAP.get(lang, "en-US-JennyNeural"))
            await communicate.save(filepath)
            translated += " (Partial audio generated.)"

        return {
            "translated": translated,
            "full": full_answer,
            "filename": filename
        }

    except Exception as e:
        print("❌ Error:", e)
        traceback.print_exc()
        return {
            "translated": "Something went wrong. Please try again.",
            "full": "",
            "filename": ""
        }

# 🎯 Flask route
@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.get_json()
        query = data.get("query", "").strip()
        lang = data.get("lang", "en")

        if len(query) < 3:
            return jsonify({"translated": "Please ask a more specific crop-related question.", "full": "", "filename": ""})

        result = asyncio.run(process_query(query, lang))
        return jsonify(result)

    except Exception as e:
        print("❌ Flask error:", e)
        traceback.print_exc()
        return jsonify({"translated": "Internal server error.", "full": "", "filename": ""})

if __name__ == "__main__":
    app.run(debug=True)
