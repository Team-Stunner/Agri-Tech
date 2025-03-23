import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-gray-900 text-white shadow-lg font-poppins border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-green-400 hover-scale">
              CropGuard AI
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link to="/" className="hover:text-green-400 transition-colors hover-scale text-gray-300">
              Home
            </Link>
            <Link to="/predict" className="hover:text-green-400 transition-colors hover-scale text-gray-300">
              Disease Detection
            </Link>
            <Link to="/weather" className="hover:text-green-400 transition-colors hover-scale text-gray-300">
              Weather
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;