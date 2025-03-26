import { useState } from 'react';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import axios from 'axios';

interface Message {
    text: string;
    isUser: boolean;
}

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' }
];

function ChatSupport() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = inputMessage;
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/chat', {
                message: userMessage,
                language: selectedLanguage, // Send language code directly
            });

            setMessages(prev => [...prev, { text: response.data.response, isUser: false }]);
        } catch (error) {
            console.error('Error in ChatSupport:', error);
            setMessages(prev => [...prev, { text: 'Sorry, I encountered an error. Please try again.', isUser: false }]);
        }

        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <div className="bg-white rounded-lg shadow-xl w-80 md:w-96 h-[500px] flex flex-col">
                    <div className="bg-green-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">Farming Assistant</h3>
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="mt-2 bg-green-500 text-white rounded px-2 py-1 text-sm"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${message.isUser
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-lg p-3">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()} // Updated to onKeyDown
                                placeholder="Ask about farming or crop diseases..."
                                className="flex-1 text-gray-700 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
                >
                    <IoChatbubbleEllipsesOutline size={24} />
                </button>
            )}
        </div>
    );
}

export default ChatSupport;