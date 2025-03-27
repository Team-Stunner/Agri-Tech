import React, { useState, useRef } from "react";

const VoiceChat = () => {
    const [question, setQuestion] = useState("");
    const [lang, setLang] = useState("en");
    const [translated, setTranslated] = useState("");
    const [fullAnswer, setFullAnswer] = useState("");
    const [audioFilename, setAudioFilename] = useState("");
    const [timestamp, setTimestamp] = useState(Date.now());
    const [loading, setLoading] = useState(false);
    const audioRef = useRef(null);
    let recognition;

    const startListening = () => {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-IN";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.start();

        setQuestion("🎤 Listening...");
        setTranslated("");
        setFullAnswer("");

        recognition.onresult = (event) => {
            const query = event.results[0][0].transcript;
            setQuestion("You asked: " + query);
            setLoading(true);

            fetch("http://localhost:5000/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, lang }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setTranslated(data.translated);
                    setFullAnswer(data.full);
                    setAudioFilename(data.filename);
                    setTimestamp(Date.now());
                    setLoading(false);
                    if (audioRef.current) {
                        audioRef.current.style.display = "block";
                        audioRef.current.load();
                    }
                })
                .catch((err) => {
                    console.error("❌ API error:", err);
                    setTranslated("Something went wrong. Please try again.");
                    setLoading(false);
                });
        };

        recognition.onerror = (event) => {
            alert("Speech recognition error: " + event.error);
        };
    };

    const playAnswer = () => {
        if (audioRef.current) {
            audioRef.current.play();
        }
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const audioUrl = audioFilename ? `http://localhost:5000/static/${audioFilename}?t=${timestamp}` : "";

    return (
        <div className="container py-5 text-gray-700">
            <h2 className="text-center text-success mb-4">🌱 Krushi Seva Assistant</h2>

            <div className="mb-3 text-center">
                <label htmlFor="langSelect" className="form-label">Select Language:</label>
                <select
                    id="langSelect"
                    className="form-select w-auto d-inline-block"
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                </select>
            </div>

            <div className="text-center mb-4">
                <button className="btn btn-primary mic-btn me-2" onClick={startListening}>🎤 Ask Question</button>
                <button className="btn btn-success mic-btn me-2" onClick={playAnswer}>🔊 Play Answer</button>
                <button className="btn btn-danger mic-btn" onClick={stopAudio}>⏹️ Stop Audio</button>
            </div>

            <div className="text-center">
                <p className="text-muted">{question}</p>
                {loading && <p className="text-info">⏳ Generating answer...</p>}
            </div>

            <div className="response-box mt-4">
                <h5>System Response:</h5>
                <div className="card">
                    <div className="card-body">
                        <p><strong>Full Answer:</strong> <span>{fullAnswer}</span></p>
                        <p><strong>Translated:</strong> <span>{translated}</span></p>
                    </div>
                </div>
            </div>

            <div className="text-center mt-4">
                {audioFilename && (
                    <>
                        <audio ref={audioRef} controls>
                            <source src={audioUrl} type="audio/mp3" />
                            Your browser does not support the audio element.
                        </audio>
                        <div className="download-link mt-2">
                            <a href={audioUrl} download className="btn btn-outline-secondary">
                                ⬇️ Download Audio
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VoiceChat;
