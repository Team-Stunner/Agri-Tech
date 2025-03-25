import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Weather from './pages/Weather';
import NearbyCenters from './pages/NearbyCenters';
import VoiceSupport from './pages/VoiceSupport';
import ChatSupport from './components/ChatSupport';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/voice-support" element={<VoiceSupport />} />
            <Route path="/nearby-centers" element={<NearbyCenters />} />
          </Routes>
        </main>
        <ChatSupport />
        <Footer />
      </div>
    </Router>
  );
}

export default App