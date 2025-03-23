import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-black text-white shadow-lg font-poppins">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold hover-scale">
              CropGuard AI
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-green-400 transition-colors">
              Home
            </Link>
            <Link to="/predict" className="hover:text-green-400 transition-colors">
              Disease Detection
            </Link>
            <Link to="/weather" className="hover:text-green-400 transition-colors">
              Weather
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;