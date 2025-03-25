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
            // This is mock data - replace with actual API call
            const mockCenters: Center[] = [
                {
                    name: 'Krushi Seva Kendra - Pune',
                    distance: '2.5 km',
                    address: '123 Farming Road, Pune',
                    position: { lat: latitude + 0.01, lng: longitude + 0.01 }
                },
                {
                    name: 'Agricultural Center',
                    distance: '3.8 km',
                    address: '456 Rural Street, Pune',
                    position: { lat: latitude - 0.01, lng: longitude - 0.01 }
                },
                {
                    name: 'Farmers Support Center',
                    distance: '4.2 km',
                    address: '789 Green Avenue, Pune',
                    position: { lat: latitude + 0.02, lng: longitude - 0.02 }
                }
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

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={userLocation}
                                zoom={13}
                            >
                                {/* User location marker */}
                                <Marker
                                    position={userLocation}
                                    icon={{
                                        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                                    }}
                                />

                                {/* Center markers */}
                                {centers.map((center, index) => (
                                    <Marker
                                        key={index}
                                        position={center.position}
                                        title={center.name}
                                    />
                                ))}
                            </GoogleMap>
                        </LoadScript>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NearbyCenters;