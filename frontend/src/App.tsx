import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Predict2 from './pages/Predict2';
import Weather from './pages/Weather';
import NearbyCenters from './pages/NearbyCenters';
import VoiceChat from './pages/VoiceChat';
import ChatSupport from './components/ChatSupport';
import CropRecommendation from './pages/CropRecommendation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/predict2" element={<Predict2 />} />
            <Route path="/crop-recommendation" element={<CropRecommendation />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/voice-chat" element={<VoiceChat />} />
            <Route path="/nearby-centers" element={<NearbyCenters />} />
          </Routes>
        </main>
        <ChatSupport />
        <Footer />
      </div>
    </Router>
  );
}

export default App;