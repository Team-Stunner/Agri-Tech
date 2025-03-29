import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaSpinner } from 'react-icons/fa';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';

const cld = new Cloudinary({
    cloud: { cloudName: 'dqd3ann1x' } // Replace with your Cloudinary cloud name
});

interface DetectedAnimal {
    publicId: string;
    timestamp: string;
    confidence: number;
    animalType: string;
}

function AnimalDetection() {
    const [detectedAnimals, setDetectedAnimals] = useState<DetectedAnimal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDetectedAnimals();
    }, []);

    const fetchDetectedAnimals = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/detected-animals');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch detected animals');
            }

            setDetectedAnimals(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-green-800 mb-4">
                        CCTV Animal & Fire Detection
                    </h1>
                    <p className="text-xl text-gray-600">
                        Monitor and track animals and fire detected by our CCTV system
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <FaSpinner className="animate-spin text-4xl text-green-600" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <p className="text-red-700">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {detectedAnimals.map((animal, index) => (
                            <motion.div
                                key={animal.publicId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="relative">
                                    <img
                                        src={cld.image(animal.publicId).resize(fill().width(400).height(300)).toURL()}
                                        alt={`Detected ${animal.animalType}`}
                                        className="w-full h-64 object-cover"
                                    />
                                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                                        {Math.round(animal.confidence * 100)}% confidence
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {animal.animalType}
                                    </h3>
                                    <p className="text-gray-600">
                                        Detected at: {new Date(animal.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && !error && detectedAnimals.length === 0 && (
                    <div className="text-center py-12">
                        <FaCamera className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No animals detected yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AnimalDetection;
