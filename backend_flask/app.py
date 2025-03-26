from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import os
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename
import google.generativeai as genai

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

# ✅ Start the server
if __name__ == "__main__":
    app.run(debug=True)