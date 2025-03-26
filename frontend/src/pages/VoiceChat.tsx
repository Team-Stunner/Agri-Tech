import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { IoMic, IoMicOff, IoSend, IoVolumeHigh } from 'react-icons/io5';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' }
];

const VoiceChat = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [fullAnswer, setFullAnswer] = useState('');
    const [selectedLang, setSelectedLang] = useState('en');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState('');
    const [audioReady, setAudioReady] = useState(false);

    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize SpeechRecognition
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = selectedLang === 'en' ? 'en-US' : `${selectedLang}-IN`;
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const spokenText = event.results[0][0].transcript;
                setQuery(spokenText);
                handleAsk(spokenText); // Auto submit on voice input
            };

            recognition.onend = () => setIsListening(false);
            recognition.onerror = (e: any) => {
                console.error('Recognition error:', e);
                setError('Failed to recognize speech. Please try again.');
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        // Initialize audio element
        audioRef.current = new Audio();
        audioRef.current.oncanplay = () => setAudioReady(true);
        audioRef.current.onerror = () => {
            setAudioReady(false);
            setError('Failed to load audio response.');
        };

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.oncanplay = null;
                audioRef.current.onerror = null;
                audioRef.current = null;
            }
        };
    }, [selectedLang]);

    const handleStartListening = () => {
        if (recognitionRef.current) {
            setError('');
            setIsListening(true);
            recognitionRef.current.start();
        } else {
            setError('Speech recognition is not supported in your browser.');
        }
    };

    const handleStopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const playAudio = async () => {
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio();
                audioRef.current.oncanplay = () => setAudioReady(true);
                audioRef.current.onerror = () => {
                    setAudioReady(false);
                    setError('Failed to load audio response.');
                };
            }

            // Add timestamp to prevent caching
            const audioUrl = `http://localhost:5000/static/output.mp3?t=${Date.now()}`;

            // Set new source and load it
            audioRef.current.src = audioUrl;
            await audioRef.current.load();

            // Play when ready
            if (audioReady) {
                await audioRef.current.play();
            }
        } catch (err) {
            console.error('Audio playback error:', err);
            setError('Failed to play audio response. Please try again.');
        }
    };

    const handleAsk = async (incomingQuery = query) => {
        if (!incomingQuery.trim()) {
            setError('Please enter or speak a question.');
            return;
        }

        setLoading(true);
        setError('');
        setResponse('');
        setFullAnswer('');
        setAudioReady(false);

        try {
            const res = await axios.post('http://localhost:5000/ask', {
                query: incomingQuery,
                lang: selectedLang
            });

            setResponse(res.data.translated);
            setFullAnswer(res.data.full);

            // Wait a brief moment to ensure the audio file is generated
            await new Promise(resolve => setTimeout(resolve, 500));

            // Auto play the voice response
            await playAudio();
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to get a response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl p-6 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-green-700 mb-2">
                        🧑‍🌾 Krushi Seva Voice Assistant
                    </h2>
                    <p className="text-gray-600">Ask questions about farming in your language</p>
                </div>

                <div className="space-y-4">
                    <select
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-green-500"
                    >
                        {languages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.name}
                            </option>
                        ))}
                    </select>

                    <div className="relative">
                        <textarea
                            rows={3}
                            placeholder="Ask a crop-related question..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full p-4 text-gray-700 border rounded-lg resize-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleAsk()}
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <IoSend className="text-xl" />
                            <span>{loading ? 'Processing...' : 'Ask'}</span>
                        </button>

                        {isListening ? (
                            <button
                                onClick={handleStopListening}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2"
                            >
                                <IoMicOff className="text-xl" />
                                <span>Stop</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleStartListening}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2"
                            >
                                <IoMic className="text-xl" />
                                <span>Speak</span>
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {response && (
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">Response:</h3>
                                <button
                                    onClick={playAudio}
                                    disabled={!audioReady}
                                    className={`text-green-600 hover:text-green-700 p-2 ${!audioReady && 'opacity-50 cursor-not-allowed'}`}
                                    title={audioReady ? "Play audio" : "Audio loading..."}
                                >
                                    <IoVolumeHigh className="text-xl" />
                                </button>
                            </div>
                            <p className="text-gray-700">{response}</p>

                            {fullAnswer && (
                                <details className="mt-4">
                                    <summary className="text-green-600 hover:text-green-700 cursor-pointer">
                                        Show detailed explanation
                                    </summary>
                                    <p className="mt-2 text-gray-600 bg-white p-4 rounded-lg">
                                        {fullAnswer}
                                    </p>
                                </details>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceChat;