
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {GoogleGenerativeAI} = require('@google/generative-ai');
const {translate} = require('google-translate-api-browser');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = 'AIzaSyDRUX_Dy1rJiJwviR5psPc78k8eZKCfSo8';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const languagePrompts = {
    'en': 'Respond in English',
    'hi': 'Respond in Hindi',
    'mr': 'Respond in Marathi',
    'gu': 'Respond in Gujarati',
    'pa': 'Respond in Punjabi'
};


const farmingContext = `
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
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, language } = req.body;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        // console.log(genAI.listModels)



        // Create a context-aware prompt
        const prompt = `
      ${farmingContext}
      ${languagePrompts[language] || 'Respond in English'}
      Question: ${message}
      
      Provide a clear, concise response that a farmer can easily understand and implement.
      Focus on practical solutions and local farming context and give me answer in the language you have been asked.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response.text();

        let finalResponse = response;
        if (language !== 'en' && !['hi', 'mr', 'gu', 'pa'].includes(language)) {
            try {
                const translated = await translate(response, { from: 'en', to: language });
                finalResponse = translated.text;
            } catch (translateError) {
                console.error('Translation error:', translateError);
                finalResponse = 'Translation failed; here is the original English response: ' + response;
            }
        }


        res.json({ response: finalResponse });
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            details: error.message
        });
    }
});

// Voice-specific endpoint for longer, more detailed responses
app.post('/api/voice-chat', async (req, res) => {
    try {
        const { message, language } = req.body;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Enhanced prompt for voice interactions
        const prompt = `
      ${farmingContext}
      ${languagePrompts[language] || 'Respond in English'}
      
      Question: ${message}
      
      Provide a detailed yet clear response that:
      1. Is easy to understand when spoken
      2. Uses simple language and short sentences
      3. Includes step-by-step instructions if applicable
      4. Avoids technical jargon unless necessary
      5. Summarizes key points at the end
      
      Format the response in a conversational style suitable for text-to-speech.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response.text();

        let finalResponse = response;
        if (language !== 'English') {
            try {
                const translated = await translate(response, {
                    from: 'en',
                    to: language.toLowerCase()
                });
                finalResponse = translated.text;
            } catch (translateError) {
                console.error('Translation error:', translateError);
            }
        }

        res.json({
            response: finalResponse,
            original: response // Include original response for debugging
        });
    } catch (error) {
        console.error('Error generating voice response:', error);
        res.status(500).json({
            error: 'Failed to generate voice response',
            details: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});