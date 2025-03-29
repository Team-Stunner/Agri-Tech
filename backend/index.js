const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v2: cloudinary } = require('cloudinary');

dotenv.config(); // Load environment variables from .env file

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Endpoint to fetch images from the "animals_detected" folder
app.get('/api/detected-animals', async (req, res) => {
    try {
        const resources = await cloudinary.api.resources({
            type: 'upload', 
            prefix: '',
            max_results: 30, // Limit results as needed
        });

        const detectedAnimals = resources.resources.map((resource) => ({
            publicId: resource.public_id,
            timestamp: resource.created_at,
            confidence: Math.random(), // Mock confidence value (can be replaced with actual detection data)
            animalType: resource.public_id.split('/').pop().split('.')[0], // Extract animal type from file name
        }));

        res.json(detectedAnimals);
    } catch (error) {
        console.error('Error fetching images from Cloudinary:', error);
        res.status(500).json({ message: 'Failed to fetch detected animals' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
