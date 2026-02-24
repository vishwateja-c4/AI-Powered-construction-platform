import React, { useState, useCallback, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, Search, Crosshair, Loader2, Copy, Check, LocateFixed } from "lucide-react";
import { useAppStore } from "../store";

// Custom yellow marker icon matching the primary color
const createMarkerIcon = () => {
    return L.divIcon({
        className: "custom-marker",
        html: `
      <div class="marker-pin">
        <div class="marker-pulse"></div>
        <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="#f2e31d"/>
          <circle cx="16" cy="16" r="7" fill="#0d0d0d"/>
        </svg>
      </div>
    `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
    });
};

const markerIcon = createMarkerIcon();

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Component to fly map to a position
function FlyToPosition({ position }: { position: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 16, { animate: true, duration: 1.5 });
        }
    }, [position, map]);
    return null;
}

// Reverse geocode using OSM Nominatim (free, no API key)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        if (data.display_name) {
            // Shorten the address to be more readable
            const parts = data.display_name.split(", ");
            return parts.slice(0, 4).join(", ");
        }
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
}

export default function SiteMap() {
    const { siteLocation, setSiteLocation, siteAddress, setSiteAddress, addToast } = useAppStore();
    const [isLocating, setIsLocating] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [copied, setCopied] = useState(false);
    const mapRef = useRef<any>(null);

    // Default center (India)
    const defaultCenter: [number, number] = [20.5937, 78.9629];
    const defaultZoom = 5;

    const handleMapClick = useCallback(
        async (lat: number, lng: number) => {
            setSiteLocation({ lat, lng });
            setIsGeocoding(true);
            const address = await reverseGeocode(lat, lng);
            setSiteAddress(address);
            setIsGeocoding(false);
        },
        [setSiteLocation, setSiteAddress]
    );

    const handleUseMyLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            addToast({ type: "error", title: "Not Supported", message: "Geolocation is not supported by your browser." });
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setSiteLocation({ lat: latitude, lng: longitude });
                setFlyTo([latitude, longitude]);
                setIsGeocoding(true);
                const address = await reverseGeocode(latitude, longitude);
                setSiteAddress(address);
                setIsGeocoding(false);
                setIsLocating(false);
                addToast({ type: "success", title: "Location Found", message: "Your live location has been set on the map." });
            },
            (err) => {
                setIsLocating(false);
                addToast({
                    type: "error",
                    title: "Location Error",
                    message: err.code === 1 ? "Location permission denied. Please enable it in browser settings." : "Could not get your location. Please try again.",
                });
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [setSiteLocation, setSiteAddress, addToast]);

    const handleSearch = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!searchQuery.trim()) return;
            setIsSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
                    { headers: { "Accept-Language": "en" } }
                );
                const data = await res.json();
                if (data.length > 0) {
                    const { lat, lon, display_name } = data[0];
                    const latNum = parseFloat(lat);
                    const lngNum = parseFloat(lon);
                    setSiteLocation({ lat: latNum, lng: lngNum });
                    setFlyTo([latNum, lngNum]);
                    const parts = display_name.split(", ");
                    setSiteAddress(parts.slice(0, 4).join(", "));
                    addToast({ type: "success", title: "Location Found", message: `Found: ${parts.slice(0, 2).join(", ")}` });
                } else {
                    addToast({ type: "warning", title: "Not Found", message: "No results found for that search. Try a different query." });
                }
            } catch {
                addToast({ type: "error", title: "Search Failed", message: "Could not search for location. Check your internet connection." });
            } finally {
                setIsSearching(false);
            }
        },
        [searchQuery, setSiteLocation, setSiteAddress, addToast]
    );

    const handleCopyCoords = useCallback(() => {
        if (!siteLocation) return;
        navigator.clipboard.writeText(`${siteLocation.lat.toFixed(6)}, ${siteLocation.lng.toFixed(6)}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [siteLocation]);

    const handleClearPin = useCallback(() => {
        setSiteLocation(null);
        setSiteAddress("");
        setFlyTo(null);
    }, [setSiteLocation, setSiteAddress]);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">
                    <MapPin className="inline w-8 h-8 text-primary mr-2 -mt-1" />
                    Site Map
                </h2>
                <p className="text-gray-400">
                    Pinpoint the exact construction site location. Click on the map, search, or use your live GPS.
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-grow flex gap-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a location... e.g. Mumbai, Maharashtra"
                            className="w-full bg-dark-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="bg-white/10 hover:bg-white/15 text-white px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 border border-white/10 whitespace-nowrap"
                    >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Search
                    </button>
                </form>

                {/* Use My Location Button */}
                <button
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap"
                >
                    {isLocating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <LocateFixed className="w-4 h-4" />
                    )}
                    Use My Location
                </button>
            </div>

            {/* Map + Info Panel Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Map Container */}
                <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-white/10 relative" style={{ height: "520px" }}>
                    <MapContainer
                        center={defaultCenter}
                        zoom={defaultZoom}
                        className="w-full h-full site-map-container"
                        zoomControl={false}
                        ref={mapRef}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        <MapClickHandler onMapClick={handleMapClick} />
                        <FlyToPosition position={flyTo} />
                        {siteLocation && (
                            <Marker position={[siteLocation.lat, siteLocation.lng]} icon={markerIcon} />
                        )}
                    </MapContainer>

                    {/* Map Overlay Hints */}
                    {!siteLocation && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
                            <div className="bg-dark-900/80 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 text-center">
                                <Crosshair className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
                                <p className="text-white font-medium">Click anywhere to place a pin</p>
                                <p className="text-gray-500 text-sm mt-1">or search / use live location above</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Panel */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Selected Location Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-primary" />
                            Selected Location
                        </h3>

                        {siteLocation ? (
                            <div className="space-y-4">
                                {/* Coordinates */}
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Coordinates</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm text-white bg-dark-800 px-3 py-1.5 rounded-lg flex-grow font-mono">
                                            {siteLocation.lat.toFixed(6)}, {siteLocation.lng.toFixed(6)}
                                        </code>
                                        <button
                                            onClick={handleCopyCoords}
                                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                            title="Copy coordinates"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Address</p>
                                    {isGeocoding ? (
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Resolving address...
                                        </div>
                                    ) : (
                                        <p className="text-sm text-white leading-relaxed">{siteAddress || "Unknown"}</p>
                                    )}
                                </div>

                                {/* Lat / Lng breakdown */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-dark-800 rounded-lg p-3">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Latitude</p>
                                        <p className="text-sm font-mono text-primary">{siteLocation.lat.toFixed(4)}</p>
                                    </div>
                                    <div className="bg-dark-800 rounded-lg p-3">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Longitude</p>
                                        <p className="text-sm font-mono text-primary">{siteLocation.lng.toFixed(4)}</p>
                                    </div>
                                </div>

                                {/* Clear Button */}
                                <button
                                    onClick={handleClearPin}
                                    className="w-full text-sm text-gray-400 hover:text-red-400 py-2 rounded-lg hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                                >
                                    Clear Pin
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <MapPin className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No location selected</p>
                                <p className="text-gray-600 text-xs mt-1">Click on the map to pin a site</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Tips Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Tips</h3>
                        <ul className="space-y-2 text-xs text-gray-500">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                Click anywhere on the map to place a marker
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                Use scroll wheel to zoom in/out
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                "Use My Location" requires GPS permission
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                The address auto-fills in Plan Generator
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
