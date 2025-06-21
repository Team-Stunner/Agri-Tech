Agri-Tech is an AI-driven platform that empowers farmers with instant multilingual chat support, crop and animal management tools, and smart image-based animal detection. It leverages modern AI and cloud technologies to make farming advice accessible, practical, and locally relevant.

# Agri-Tech: Smart Farming Assistant

Agri-Tech is an AI-powered platform designed to assist farmers with crop management, disease diagnosis, and animal detection using modern technologies. The project leverages AI chat support in multiple Indian languages and integrates with Cloudinary for image management.

## Features

- **AI Chat Support:**
  - Multilingual farming assistant chatbot (English, Hindi, Marathi, Gujarati, Punjabi).
  - Provides advice on crop diseases, farming techniques, and best practices.
- **Animal Detection:**
  - Fetches and displays detected animal images from Cloudinary.
  - Shows detection confidence and animal type.
- **Modern UI:**
  - Responsive and user-friendly frontend built with React and Tailwind CSS.
- **Backend API:**
  - Node.js/Express backend for chat and image endpoints.
  - Integrates with Google Gemini AI and Cloudinary.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express
- **AI:** Google Gemini API
- **Image Storage:** Cloudinary

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Cloudinary account
- Google Gemini API key

### Setup

#### 1. Clone the repository
```bash
git clone https://github.com/Team-Stunner/Agri-Tech.git
cd Agri-Tech
```

#### 2. Install dependencies
```bash
cd backend
npm install
cd ../frontend
npm install
```

#### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory with the following:
```env
PORT=3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

#### 4. Start the Backend
```bash
cd backend
npm start
```

#### 5. Start the Frontend
```bash
cd ../frontend
npm start
```

The frontend will run on `http://localhost:5173` (or similar), and the backend on `http://localhost:3000`.

## Usage
- Open the frontend in your browser.
- Use the chat widget (bottom-right) to ask farming questions in your preferred language.
- View detected animal images and details.

## Folder Structure
```
Agri-Tech/
├── backend/
│   ├── index.js
│   └── ...
├── frontend/
│   ├── src/
│   │   └── components/
│   │       └── ChatSupport.tsx
│   └── ...
└── readme.md
```

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

## Acknowledgements
- Google Gemini AI
- Cloudinary
- React & Tailwind CSS
