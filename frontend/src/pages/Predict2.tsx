import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaLeaf, FaLanguage, FaFlask, FaClipboardList } from 'react-icons/fa';

interface Prediction {
    disease: string;
    confidence: number;
}

function Predict2() {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [additionalInfo, setAdditionalInfo] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [treatmentPreference, setTreatmentPreference] = useState('best');
    const [showOptions, setShowOptions] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setPredictions([]);
            setAdditionalInfo('');
            setError('');
            setShowOptions(false);

            await handlePredict(file);
        }
    });

    const handlePredict = async (uploadedImage = image) => {
        if (!uploadedImage) {
            setError('Please upload an image first');
            return;
        }

        setLoading(true);
        setError('');
        setPredictions([]);
        setAdditionalInfo('');

        const formData = new FormData();
        formData.append('file', uploadedImage);

        try {
            const response = await axios.post('http://localhost:5000/', formData);
            const prediction = response.data.predictions[0];
            setPredictions([{
                disease: prediction[0].replace(/_/g, ' '),
                confidence: prediction[1]
            }]);
            setShowOptions(true);
        } catch (err) {
            console.error('Error:', err);
            setError('Error processing image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGetTreatment = async () => {
        if (!predictions.length) return;

        setLoading(true);
        try {
            const infoResponse = await axios.post('http://localhost:5000/more-info', {
                disease: predictions[0].disease.replace(/ /g, '_'),
                lang: selectedLanguage,
                preference: treatmentPreference
            });
            setAdditionalInfo(infoResponse.data.info);
        } catch (err) {
            console.error('Error:', err);
            setError('Error fetching treatment information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
            <div className="max-w-7xl mx-auto"> {/* Increased max-width */}
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-green-800 mb-8 text-center"
                >
                    Smart Plant Disease Detection
                </motion.h1>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden h-fit"
                    >
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-green-700 mb-6 flex items-center">
                                <FaLeaf className="mr-2" /> Upload Plant Image
                            </h2>
                            <div
                                {...getRootProps()}
                                className={`border-3 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 min-h-[300px] flex flex-col justify-center ${isDragActive
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <FaCloudUploadAlt className="w-16 h-16 mx-auto text-green-500 mb-4" />
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="max-h-80 mx-auto rounded-lg shadow-md object-contain"
                                    />
                                ) : (
                                    <div className="text-gray-600">
                                        <p className="text-lg font-medium">Drag and drop your image here</p>
                                        <p className="text-sm mt-2">or click to select a file</p>
                                        <p className="text-xs mt-4 text-gray-500">Supported formats: JPEG, PNG</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Results Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
                                >
                                    <p className="text-red-700">{error}</p>
                                </motion.div>
                            )}

                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white p-8 rounded-2xl shadow-xl text-center"
                                >
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
                                    <p className="text-gray-600">Processing your image...</p>
                                </motion.div>
                            )}

                            {predictions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-6 rounded-2xl shadow-xl"
                                >
                                    <h2 className="text-2xl font-semibold text-green-700 mb-6">Detection Results</h2>
                                    {predictions.map((pred, index) => (
                                        <div key={index} className="mb-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-medium text-gray-800">
                                                    {pred.disease}
                                                </h3>
                                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                    {pred.confidence.toFixed(1)}% confident
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {showOptions && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 space-y-4"
                                        >
                                            <div>
                                                <label className="flex items-center text-gray-700 mb-2">
                                                    <FaLanguage className="mr-2" /> Select Language
                                                </label>
                                                <select
                                                    value={selectedLanguage}
                                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                                    className="w-full p-3 border text-gray-700 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                >
                                                    <option value="en">English</option>
                                                    <option value="hi">हिंदी (Hindi)</option>
                                                    <option value="mr">मराठी (Marathi)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="flex items-center text-gray-700 mb-2">
                                                    <FaFlask className="mr-2" /> Treatment Preference
                                                </label>
                                                <select
                                                    value={treatmentPreference}
                                                    onChange={(e) => setTreatmentPreference(e.target.value)}
                                                    className="w-full p-3 border text-gray-700 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                >
                                                    <option value="best">Best Available Treatment</option>
                                                    <option value="organic">Organic Treatment Only</option>
                                                    <option value="inorganic">Chemical Treatment Only</option>
                                                </select>
                                            </div>

                                            <button
                                                onClick={handleGetTreatment}
                                                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                                            >
                                                <FaClipboardList className="mr-2" />
                                                <span>Get Treatment Plan</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {additionalInfo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-8 rounded-2xl shadow-xl"
                                >
                                    <h2 className="text-2xl font-semibold text-green-700 mb-6 flex items-center">
                                        <FaClipboardList className="mr-3" /> Treatment Plan
                                    </h2>
                                    <div className="prose prose-lg prose-green max-w-none">
                                        <div className="bg-gray-50 p-6 rounded-xl text-gray-800 whitespace-pre-wrap min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar">
                                            {additionalInfo.split('\n').map((line, index) => (
                                                <p key={index} className="mb-4 last:mb-0">
                                                    {line}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Predict2;