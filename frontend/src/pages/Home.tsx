import { Link } from 'react-router-dom';

function Home() {
  const features = [
    {
      title: 'AI-Powered Detection',
      description: 'Advanced CNN model for accurate crop disease identification',
      icon: '🔍'
    },
    {
      title: 'Instant Diagnosis',
      description: 'Get immediate results and treatment recommendations',
      icon: '⚡'
    },
    {
      title: 'Expert Guidance',
      description: 'Access to agricultural expertise and best practices',
      icon: '👨‍🌾'
    },
    {
      title: 'Weather Insights',
      description: 'Real-time weather data for better crop management',
      icon: '🌤️'
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Punjab",
      quote: "CropGuard AI helped me save my wheat crop from yellow rust disease.",
      image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b1b?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Anita Patel",
      location: "Gujarat",
      quote: "The instant disease detection has made a huge difference in my cotton farming.",
      image: "https://images.unsplash.com/photo-1594761051556-1ce99d0d8cff?auto=format&fit=crop&q=80&w=150"
    }
  ];

  return (
    <div className="font-poppins">
      {/* Hero Section */}
      <div className="relative h-[600px] overflow-hidden">
        <img 
          src="https://plus.unsplash.com/premium_photo-1674624682232-c9ced5360a2e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
          alt="Sunset farming" 
          className="absolute w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white animate-fade-in">
              <h1 className="text-5xl font-bold mb-6">
                Protect Your Crops with AI Technology
              </h1>
              <p className="text-xl mb-8">
                Early detection of crop diseases using advanced artificial intelligence to ensure better yields and healthier farms.
              </p>
              <Link
                to="/predict"
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-block"
              >
                Start Disease Detection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-12">
          Our Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg card-shadow hover-scale"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-4 animate-bounce-slow">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-black mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1555815947-880cc64d6edd?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Take photo" 
                className="w-full h-48 object-cover rounded-lg mb-4 card-shadow"
              />
              <h3 className="text-xl text-black font-semibold mb-2">1. Take a Photo</h3>
              <p className="text-gray-600">Capture clear images of affected crop areas</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400" 
                alt="AI Analysis" 
                className="w-full h-48 object-cover rounded-lg mb-4 card-shadow"
              />
              <h3 className="text-xl text-black font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-gray-600">Our AI model analyzes the image instantly</p>
            </div>
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=400" 
                alt="Get Results" 
                className="w-full h-48 object-cover rounded-lg mb-4 card-shadow"
              />
              <h3 className="text-xl text-black font-semibold mb-2">3. Get Results</h3>
              <p className="text-gray-600">Receive detailed analysis and treatment recommendations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-12">
          Farmer Success Stories
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-lg card-shadow hover-scale flex items-center space-x-4"
            >
              <img 
                src={testimonial.image} 
                alt={testimonial.name} 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="text-gray-600 italic mb-2">"{testimonial.quote}"</p>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1472157592780-9e5265f17f8f?auto=format&fit=crop&q=80&w=1920" 
          alt="Farming sunset" 
          className="absolute w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40">
          <div className="container mx-auto px-4 h-full flex items-center justify-center text-center">
            <div className="max-w-2xl text-white">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Protect Your Crops?
              </h2>
              <p className="text-xl mb-8">
                Join thousands of farmers using CropGuard AI to ensure healthier crops and better yields.
              </p>
              <Link
                to="/predict"
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-block"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;