import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function Predict() {
  const GEMINI_API_KEY = 'AIzaSyDRUX_Dy1rJiJwviR5psPc78k8eZKCfSo8'; // Replace with your API Key
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const [image, setImage] = useState(null);
  const [disease, setDisease] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to convert image to base64
  const fileToGenerativePart = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve({
          inlineData: {
            data: reader.result.split(',')[1], // Extract base64 data
            mimeType: file.type,
          },
        });
      };
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handlePredict = async () => {
    if (!image) {
      alert('Please upload an image first!');
      return;
    }

    setLoading(true);
    setDisease('');

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      const prompt =
        'Identify the disease in the plant and Just give the disease name and crop name as output';
      const imagePart = await fileToGenerativePart(image); // Convert image to base64

      const generatedContent = await model.generateContent([prompt, imagePart]);
      const responseText = generatedContent.response.text();

      setDisease(responseText);
    } catch (error) {
      console.error('Error detecting disease:', error);
      setDisease('Error detecting disease.');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center  min-h-screen p-4 bg-grey-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Plant Disease Detection
        </h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer p-2 mb-4"
        />
        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="Uploaded"
            className="w-full h-auto mb-4 rounded-lg"
          />
        )}
        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin border-t-2 border-white rounded-full w-5 h-5 inline-block"></span>
          ) : (
            'Detect Disease'
          )}
        </button>
        {disease && (
          <p className="mt-4 text-lg font-medium text-center">
            Result: {disease}
          </p>
        )}
      </div>
    </div>
  );
}

export default Predict;
