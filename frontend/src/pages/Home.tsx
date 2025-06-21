import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaMicrophone, FaUserMd, FaCloudSun, FaCamera, FaMicroscope, FaCheckCircle } from 'react-icons/fa';
import { IoMdAnalytics } from 'react-icons/io';

function Home() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up');
        }
      });
    }, observerOptions);

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (testimonialRef.current) observer.observe(testimonialRef.current);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: 'AI-Powered Detection',
      description: 'Advanced CNN model for accurate crop disease identification',
      icon: <FaMicroscope className="w-8 h-8 text-green-600" />,
      delay: 0
    },
    {
      title: 'Voice Support',
      description: 'Multi-language voice assistance for farmers',
      icon: <FaMicrophone className="w-8 h-8 text-green-600" />,
      delay: 100
    },
    {
      title: 'Expert Guidance',
      description: 'Access to agricultural expertise and best practices',
      icon: <FaUserMd className="w-8 h-8 text-green-600" />,
      delay: 200
    },
    {
      title: 'Weather Insights',
      description: 'Real-time weather data for better crop management',
      icon: <FaCloudSun className="w-8 h-8 text-green-600" />,
      delay: 300
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
      quote: "The voice support feature makes it easy to get farming advice in Gujarati.",
      image: "https://images.unsplash.com/photo-1594761051556-1ce99d0d8cff?auto=format&fit=crop&q=80&w=150"
    }
  ];

  return (
    <div className="font-poppins bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden bg-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1615829254885-d4bfd5ce700e?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Farming background"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Protect Your Crops with
              <span className="text-green-600"> AI Technology</span>
            </h1>
            <p className="text-2xl mb-8 text-gray-700">
              Early detection of crop diseases using advanced artificial intelligence to ensure better yields and healthier farms.
            </p>
            <div className="space-x-4">
              <Link
                to="/predict"
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center"
              >
                <FaCamera className="mr-2" />
                Start Disease Detection
              </Link>
              <Link
                to="/voice-chat"
                className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center"
              >
                <FaMicrophone className="mr-2" />
                Try Voice Support
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our <span className="text-green-600">Features</span>
              </h2>
              <div className="w-20 h-1 bg-green-600 mx-auto"></div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                How It <span className="text-green-600">Works</span>
              </h2>
              <div className="w-20 h-1 bg-green-600 mx-auto"></div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <FaCamera className="w-12 h-12 text-green-600" />,
                title: "Take a Photo",
                description: "Capture clear images of affected crop areas"
              },
              {
                icon: <IoMdAnalytics className="w-12 h-12 text-green-600" />,
                title: "AI Analysis",
                description: "Our AI model analyzes the image instantly"
              },
              {
                icon: <FaCheckCircle className="w-12 h-12 text-green-600" />,
                title: "Get Results",
                description: "Receive detailed analysis and treatment recommendations"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">{step.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div ref={testimonialRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Farmer <span className="text-green-600">Success Stories</span>
              </h2>
              <div className="w-20 h-1 bg-green-600 mx-auto"></div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900">{testimonial.name}</h3>
                    <p className="text-green-600">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-green-600 rounded-2xl p-12 text-center shadow-xl"
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Protect Your Crops?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Join thousands of farmers using CropGuard AI to ensure healthier crops and better yields.
            </p>
            <Link
              to="/predict"
              className="bg-white text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center"
            >
              <FaLeaf className="mr-2" />
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Home;