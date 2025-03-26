import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface FormData {
    N: string;
    P: string;
    K: string;
    temperature: string;
    humidity: string;
    ph: string;
    rainfall: string;
}

function CropRecommendation() {
    const [form, setForm] = useState<FormData>({
        N: '',
        P: '',
        K: '',
        temperature: '',
        humidity: '',
        ph: '',
        rainfall: ''
    });

    const [result, setResult] = useState<{ crop: string; explanation: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post('http://localhost:5001/predict', form);  // Change `/predict-crop` to `/predict`

            setResult(res.data);
        } catch (err) {
            setError('Failed to get recommendation. Please try again later.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formFields = [
        { key: 'N', label: 'Nitrogen (N)', placeholder: 'Enter nitrogen content' },
        { key: 'P', label: 'Phosphorus (P)', placeholder: 'Enter phosphorus content' },
        { key: 'K', label: 'Potassium (K)', placeholder: 'Enter potassium content' },
        { key: 'temperature', label: 'Temperature (°C)', placeholder: 'Enter temperature' },
        { key: 'humidity', label: 'Humidity (%)', placeholder: 'Enter humidity' },
        { key: 'ph', label: 'pH Level', placeholder: 'Enter pH value' },
        { key: 'rainfall', label: 'Rainfall (mm)', placeholder: 'Enter rainfall' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-green-600 mb-4">Crop Recommendation</h1>
                    <p className="text-xl text-gray-600">Get AI-powered crop suggestions based on your soil conditions</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow-xl p-8 mb-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formFields.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {field.label}
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        name={field.key}
                                        value={form[field.key as keyof FormData]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                  px-8 py-3 rounded-lg text-white font-semibold
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                  transition-colors duration-300
                `}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                        Analyzing...
                                    </div>
                                ) : (
                                    'Get Recommendation'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8"
                    >
                        <p className="text-red-700">{error}</p>
                    </motion.div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-xl p-8"
                    >
                        <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">
                            Recommended Crop
                        </h2>
                        <div className="text-center">
                            <div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-full text-xl font-semibold mb-6">
                                {result.crop.toUpperCase()}
                            </div>
                        </div>
                        <p className="text-gray-700 text-lg text-center italic">
                            "{result.explanation}"
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default CropRecommendation;