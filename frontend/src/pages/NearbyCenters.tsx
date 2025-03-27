import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface Center {
    name: string;
    distance: string;
    address: string;
    position: {
        lat: number;
        lng: number;
    };
}

function NearbyCenters() {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your API key

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    fetchNearbyCenters(latitude, longitude);
                },
                (error) => {
                    setError('Error getting your location. Please enable location services.');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
        }
    }, []);

    const fetchNearbyCenters = async (latitude: number, longitude: number) => {
        try {
            // Mock Data: Replace with actual API call if needed
            const mockCenters: Center[] = [
                {
                    name: 'Kastakar Krushi Seva Kendra, Mumbai',
                    distance: '1.0 km',
                    address: 'Wellness center - Shop No 1',
                    position: { lat: latitude + 0.01, lng: longitude + 0.01 }
                },
                {
                    name: 'Gargi Krushi Seva Kendra, Mumbai',
                    distance: '2.0 km',
                    address: 'Agrochemicals Supplier - Hiba Apartment',
                    position: { lat: latitude - 0.01, lng: longitude - 0.01 }
                },
                {
                    name: 'Patil Krushi Seva Kendra, Thane',
                    distance: '5.0 km',
                    address: 'Agricultural Service - Near Station',
                    position: { lat: latitude + 0.02, lng: longitude - 0.02 }
                },
                
                // Add more centers as required
            ];

            setCenters(mockCenters);
            setLoading(false);
        } catch (error) {
            setError('Error fetching nearby centers');
            setLoading(false);
        }
    };

    const mapContainerStyle = {
        width: '100%',
        height: '400px'
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-green-600 mb-8 text-center">
                Nearby Krushi Seva Kendras
            </h1>

            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Finding nearby centers...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                    {error}
                </div>
            )}

            {!loading && !error && userLocation && (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* List of Centers */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Centers</h2>
                        <div className="space-y-4">
                            {centers.map((center, index) => (
                                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                                    <h3 className="font-semibold text-green-600">{center.name}</h3>
                                    <p className="text-gray-600">{center.address}</p>
                                    <p className="text-sm text-gray-500">Distance: {center.distance}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Google Map with Markers */}
                   

                    {/* Embedded Google Maps Iframe */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d241328.2662490231!2d72.75501784882336!3d19.074543513342565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1skrushi%20seva%20kendra%20near%20me!5e0!3m2!1sen!2sin!4v1743062476045!5m2!1sen!2sin"
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NearbyCenters;
