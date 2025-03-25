import { useState, useRef, useEffect } from 'react';
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
    const [error, setError] = useState('');
    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        // Initialize speech synthesis
        synthesisRef.current = new SpeechSynthesisUtterance();

        // Clean up on component unmount
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const startRecording = () => {
        setError('');
        if (!('webkitSpeechRecognition' in window)) {
            setError('Speech recognition is not supported in your browser. Please use Chrome.');
            return;
        }

        try {
            recognitionRef.current = new (window as any).webkitSpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = selectedLanguage;

            recognitionRef.current.onstart = () => {
                setIsRecording(true);
                setTranscript('');
            };

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setTranscript(finalTranscript || interimTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setError(`Error: ${event.error}. Please try again.`);
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current.start();
        } catch (error) {
            console.error('Speech recognition error:', error);
            setError('Failed to start speech recognition. Please try again.');
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            handleSubmit();
        }
    };

    const speakResponse = (text: string) => {
        if (!window.speechSynthesis) {
            setError('Text-to-speech is not supported in your browser');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Configure speech synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLanguage;
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1;

        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(selectedLanguage));
        if (voice) {
            utterance.voice = voice;
        }

        // Speak the response
        window.speechSynthesis.speak(utterance);
    };

    const handleSubmit = async () => {
        if (!transcript.trim()) return;

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/voice-chat', {
                message: transcript,
                language: selectedLanguage
            });

            setResponse(response.data.response);
            speakResponse(response.data.response);
        } catch (error) {
            console.error('Error:', error);
            setError('Sorry, there was an error processing your request.');
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
                            className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                } text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto`}
                        >
                            <span className="mr-2">
                                {isRecording ? '⚪' : '🎤'}
                            </span>
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            {error}
                        </div>
                    )}

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
                            <button
                                onClick={() => speakResponse(response)}
                                className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center mx-auto"
                            >
                                <span className="mr-2">🔊</span>
                                Play Response Again
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-xl p-6 animate-slide-in-right">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">How to Use Voice Support</h2>
                    <ol className="list-decimal list-inside space-y-3 text-gray-600">
                        <li>Select your preferred language from the dropdown menu</li>
                        <li>Click the microphone button and start speaking your question</li>
                        <li>Click the button again when you're finished speaking</li>
                        <li>Wait for the AI to process your question</li>
                        <li>The response will be automatically read out loud</li>
                        <li>Click "Play Response Again" to hear the response again</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default VoiceSupport;