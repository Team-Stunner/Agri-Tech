from flask import Flask, request, jsonify, send_from_directory, make_response
import google.generativeai as genai
from googletrans import Translator
import os
import datetime
import re
import asyncio
import edge_tts
import traceback
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])


# ✅ Configure Gemini API
genai.configure(api_key="AIzaSyDdxIKxdaAHvXj1NvFG3Of7a-6IVbf4XK4")

# ✅ Setup Flask App
app = Flask(__name__, static_folder='static')
os.makedirs("static", exist_ok=True)

# ✅ TTS Voice Mapping
VOICE_MAP = {
    "en": "en-US-JennyNeural",
    "hi": "hi-IN-SwaraNeural",
    "mr": "mr-IN-SapnaNeural"
}

# ✅ Clean TTS Text
def clean_text_for_tts(text):
    text = re.sub(r'[^\w\sऀ-ॿ.,!?]', '', text)
    return text.strip()

# ✅ Edge TTS Synthesis
async def speak(text, lang_code):
    voice = VOICE_MAP.get(lang_code, "en-US-JennyNeural")
    communicate = edge_tts.Communicate(text=text, voice=voice)
    await communicate.save("static/output.mp3")

# ✅ Chatbot API Route
@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    query = data.get("query", "").strip()
    lang = data.get("lang", "en")

    try:
        if len(query) < 3:
            return jsonify({"translated": "Please ask a more specific crop-related question.", "full": ""})

        print("🧑‍🌾 Q:", query)
        print("🌐 Language:", lang)

        # 🔍 Gemini Generation
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(f"Answer this crop-related question simply and briefly for farmers: {query}")
        full_answer = response.text.strip()
        short_answer = '.'.join(full_answer.split('.')[:3]) + '.'
        print("📘 Gemini Answer:", full_answer)

        # 🌐 Translate
        translator = Translator()
        translated = translator.translate(short_answer, dest=lang).text
        print("✅ Translated:", translated)

        # 🔊 Generate Speech
        cleaned_text = clean_text_for_tts(translated)

        try:
            asyncio.run(speak(cleaned_text, lang))
        except Exception as e:
            print("⚠️ TTS failed on full input, retrying...")
            try:
                fallback_text = cleaned_text.split('.')[0] + '.'
                asyncio.run(speak(fallback_text, lang))
            except Exception as final_err:
                print("❌ Final TTS error:", final_err)
                translated += " (Voice generation failed.)"

        # 📝 Log
        with open("conversation_log.txt", "a", encoding="utf-8") as log:
            timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            log.write(f"[{timestamp}] Q: {query}\nA: {translated}\n\n")

        return jsonify({
            "translated": translated,
            "full": full_answer
        })

    except Exception as e:
        print("❌ Error:", e)
        traceback.print_exc()
        return jsonify({"translated": "Something went wrong. Please try again.", "full": ""})

# ✅ Serve fresh audio with no caching
@app.route("/static/output.mp3")
def serve_audio():
    response = make_response(send_from_directory("static", "output.mp3"))
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# ✅ Run Flask server
if __name__ == "__main__":
    app.run(debug=True, port=5000)
