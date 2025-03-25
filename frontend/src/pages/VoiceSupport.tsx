import { useState, useRef } from 'react';
import axios from 'axios';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' }
];

function VoiceSupport() {
    const [isRecording, setIsRecording] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recognitionRef = useRef<any>(null);

    const startRecording = () => {
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new (window as any).webkitSpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.lang = selectedLanguage;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map(result => result.transcript)
                    .join('');
                setTranscript(transcript);
            };

            recognitionRef.current.start();
            setIsRecording(true);
        } else {
            alert('Speech recognition is not supported in your browser.');
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (!transcript.trim()) return;

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/chat', {
                message: transcript,
                language: languages.find(l => l.code === selectedLanguage)?.name || 'English'
            });

            setResponse(response.data.response);

            // Text-to-speech
            const utterance = new SpeechSynthesisUtterance(response.data.response);
            utterance.lang = selectedLanguage;
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Error:', error);
            setResponse('Sorry, there was an error processing your request.');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12 animate-fade-up">
                    <h1 className="text-4xl font-bold text-green-600 mb-4">Voice Support</h1>
                    <p className="text-xl text-gray-600">Ask farming-related questions in your language</p>
                </div>

                <div className="bg-white rounded-lg shadow-xl p-6 mb-8 animate-slide-in-left">
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Select Language
                        </label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {languages.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-center mb-8">
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`${isRecording
                                    ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                                    : 'bg-green-600 hover:bg-green-700'
                                } text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105`}
                        >
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </button>
                    </div>

                    {transcript && (
                        <div className="mb-6 animate-fade-up">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Question:</h3>
                            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{transcript}</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    )}

                    {response && (
                        <div className="animate-fade-up">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Response:</h3>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-gray-700">{response}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-xl p-6 animate-slide-in-right">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Use Voice Support</h2>
                    <ol className="list-decimal list-inside space-y-3 text-gray-600">
                        <li>Select your preferred language from the dropdown menu</li>
                        <li>Click the "Start Recording" button and speak your question</li>
                        <li>Click "Stop Recording" when you're finished speaking</li>
                        <li>Wait for the AI to process your question and provide a response</li>
                        <li>The response will be read out loud in your selected language</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default VoiceSupport;