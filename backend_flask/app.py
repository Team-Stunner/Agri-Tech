import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import os
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename
import google.generativeai as genai
from dotenv import load_dotenv
import joblib
from deep_translator import GoogleTranslator
import asyncio
import edge_tts
import traceback
from googletrans import Translator


app = Flask(__name__)
CORS(app)

# 🔧 Upload folder setup
UPLOAD_FOLDER = 'static/uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ✅ Load trained model
MODEL_PATH = r"D:\Github Things\final_agritech\Agri-Tech\backend_flask\model\Plant_Village_Detection_Model.h5"
model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model loaded!")

# ✅ Gemini SDK config
genai.configure(api_key="AIzaSyDdxIKxdaAHvXj1NvFG3Of7a-6IVbf4XK4")

# ✅ PlantVillage class names
class_names = sorted([
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight',
    'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy',
    'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
])

# ✅ Return only top-1 prediction
def model_prediction(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    preds = model.predict(img_array)[0]
    top_idx = np.argmax(preds)
    return [(class_names[top_idx], float(preds[top_idx]) * 100)]

# ✅ Prediction route
@app.route("/", methods=["POST"])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    prediction = model_prediction(filepath)
    return jsonify({"filename": filename, "predictions": prediction})

# ✅ Serve uploaded image
@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ✅ Gemini-powered pesticide recommendation
@app.route("/more-info", methods=["POST"])
def more_info():
    data = request.get_json()
    disease = data.get("disease")
    lang = data.get("lang", "en")
    preference = data.get("preference", "best").lower()  # best / organic / inorganic

    if not disease:
        return jsonify({"error": "No disease provided"}), 400

    # 🌐 Multilingual + preference prompt
    if lang == "hi":
        if preference == "organic":
            treatment = "- सुझाव दें: 2–3 सर्वोत्तम जैविक कीटनाशक, मात्रा और छिड़काव के साथ।"
        elif preference == "inorganic":
            treatment = "- सुझाव दें: 2–3 सर्वोत्तम अजैविक कीटनाशक, मात्रा और छिड़काव के साथ।"
        else:
            treatment = "- सुझाव दें: 2–3 सर्वोत्तम कीटनाशक (जैविक/अजैविक), नाम, मात्रा और उपयोग शामिल करें।"

        prompt = f"""आप एक कृषि रोग विशेषज्ञ हैं। फसल पर {disease} रोग है।

- रोग का प्रकार बताएं (फफूंद, जीवाणु, विषाणु)
{treatment}
- प्रत्येक के लिए:
  - नाम
  - प्रकार (जैविक/अजैविक)
  - मात्रा (ml/g प्रति लीटर)
  - छिड़काव की आवृत्ति (जैसे हर 7 दिन)
  - सुरक्षा सुझाव (1 पंक्ति)

अंत में, सबसे उपयुक्त एक कीटनाशक सुझाएं और कारण बताएं।

Format:
Disease: ...
Type: ...
Pesticides:
1. ...
2. ...
3. ...
Recommended: ...
"""

    elif lang == "mr":
        if preference == "organic":
            treatment = "- 2–3 सर्वोत्तम सेंद्रिय कीटकनाशक सुचवा, डोस आणि फवारणी कालावधीसह."
        elif preference == "inorganic":
            treatment = "- 2–3 सर्वोत्तम अजैविक कीटकनाशक सुचवा, डोस आणि फवारणी कालावधीसह."
        else:
            treatment = "- 2–3 सर्वोत्तम कीटकनाशक (सेंद्रिय/अजैविक) सुचवा, नाव, डोस, फवारणी."

        prompt = f"""तुम्ही एक पिक रोगतज्ज्ञ आहात. पिकावर {disease} रोग आहे.

- रोगाचा प्रकार सांगा (बुरशीजन्य, जिवाणूजन्य, विषाणूजन्य)
{treatment}
- प्रत्येकसाठी:
  - नाव
  - प्रकार (सेंद्रिय/अजैविक)
  - मात्रा (ml/g प्रति लिटर)
  - फवारणी वारंवारता
  - सुरक्षा सूचना

शेवटी, सर्वोत्कृष्ट कीटकनाशक निवडा आणि कारण सांगा.

रूपरेषा:
Disease: ...
Type: ...
Pesticides:
1. ...
2. ...
3. ...
Recommended: ...
"""

    else:  # English default
        if preference == "organic":
            treatment = "- Suggest 2–3 best organic pesticides with dosage and frequency."
        elif preference == "inorganic":
            treatment = "- Suggest 2–3 best inorganic pesticides with dosage and frequency."
        else:
            treatment = "- Suggest 2–3 best pesticides (organic/inorganic), include name, dosage, frequency."

        prompt = f"""You are a crop disease expert. The crop is affected by: {disease}

- Mention the disease type (e.g., fungal, bacterial, viral)
{treatment}
- For each pesticide, provide:
  - Name
  - Type (Organic/Inorganic)
  - Dosage (ml or g per liter)
  - Frequency (e.g., every 7 days)
  - Safety Tip (1 line)

✅ Finally, recommend ONE best pesticide and explain why.

Format:
Disease: ...
Type: ...
Pesticides:
1. ...
2. ...
3. ...
Recommended: ...
"""

    try:
        print("🔎 Gemini prompt:\n", prompt)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        output = response.text.strip().replace("*", "")
        return jsonify({"info": output})
    except Exception as e:
        print("❌ Gemini SDK error:", str(e))
        return jsonify({"error": "Gemini SDK error", "details": str(e)}), 500

# crop recommendation part
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)
gemini = genai.GenerativeModel("gemini-1.5-flash")

model1 = joblib.load("./model/crop_recommendation_model.pkl")


@app.route("/predict1", methods=["POST"])
def predict_crop():
    try:
        data = request.get_json()

        # 🔢 Extract inputs
        N = float(data['N'])
        P = float(data['P'])
        K = float(data['K'])
        temp = float(data['temperature'])
        humidity = float(data['humidity'])
        ph = float(data['ph'])
        rainfall = float(data['rainfall'])
        
        print(N, P, K, temp, humidity, ph, rainfall)

        crop = None
        explanation = None

        # 🔍 Try ML model prediction
        try:
            features = np.array([[N, P, K, temp, humidity, ph, rainfall]])
            crop = model1.predict(features)[0]
        except Exception:
            crop = None  # Fall back to GenAI

        # 🧠 Prepare prompt for Gemini
        if crop:
            prompt = f"""
            Given the following values:
            Nitrogen: {N}, Phosphorus: {P}, Potassium: {K}, Temperature: {temp}°C,
            Humidity: {humidity}%, pH: {ph}, Rainfall: {rainfall} mm,
            the recommended crop is {crop}.

            Explain in 2-3 lines why {crop} is suitable for these conditions.
            """
        else:
            prompt = f"""
            Based on the following soil and climate parameters:
            - Nitrogen: {N}
            - Phosphorus: {P}
            - Potassium: {K}
            - Temperature: {temp}°C
            - Humidity: {humidity}%
            - pH: {ph}
            - Rainfall: {rainfall} mm

            Predict the best crop to grow and explain the reasoning in 2-3 lines.
            Return only the crop name first, then the explanation.
            """

        # 💬 Gemini Prediction + Explanation
        gemini_response = gemini.generate_content(prompt)
        output = gemini_response.text.strip()

        if crop is None:
            # If Gemini gave both crop + explanation
            lines = output.split("\n", 1)
            crop = lines[0].strip() if crop is None else crop
            explanation = lines[1].strip() if len(lines) > 1 else "Explanation not available."

        else:
            explanation = output

        return jsonify({
            "crop": crop,
            "explanation": explanation
        })

    except Exception as e:
        return jsonify({"error": "Something went wrong. Please try again later."}), 500


# Chatbot part


model2 = genai.GenerativeModel('gemini-2.0-flash')

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

        result = model2.generate_content(prompt)
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


VOICE_MAP = {
    "en": "en-US-JennyNeural",
    "hi": "hi-IN-SwaraNeural",
    "mr": "mr-IN-SapnaNeural"
}


def clean_text_for_tts(text):
    text = re.sub(r'[^\w\sऀ-ॿ.,!?]', '', text)
    return text.strip()

async def speak(text, lang_code):
    voice = VOICE_MAP.get(lang_code, "en-US-JennyNeural")
    communicate = edge_tts.Communicate(text=text, voice=voice)
    await communicate.save("static/output.mp3")

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

        # Generate Gemini response
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(f"Answer this crop-related question simply and briefly for farmers: {query}")
        full_answer = response.text.strip()
        short_answer = '.'.join(full_answer.split('.')[:3]) + '.'
        print("📘 Gemini Answer:", full_answer)

        # Translate
        translator = Translator()
        translated = translator.translate(short_answer, dest=lang).text
        print("✅ Translated:", translated)

        # Clean & Speak with retry
        cleaned_text = clean_text_for_tts(translated)
        try:
            asyncio.run(speak(cleaned_text, lang))
        except Exception as e:
            print("⚠️ TTS failed on full input, retrying with fallback...")
            fallback_text = cleaned_text.split('.')[0] + '.'
            try:
                asyncio.run(speak(fallback_text, lang))
            except Exception as final_err:
                print("❌ Final TTS failure:", final_err)
                translated += " (But voice could not be generated.)"

        # Log
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

# ✅ Start the server
if __name__ == "__main__":
    app.run(debug=True , port=5000)