import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin, Clock, Phone, Stethoscope, Navigation, List, Map as MapIcon } from "lucide-react";
import { useApp } from "./contexts/AppContext";

// Fix missing marker icons in Vite/Vercel
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Custom icons from /public
const UserIcon = L.icon({
  iconUrl: "/markers/marker-icon-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const HospitalIcon = L.icon({
  iconUrl: "/markers/marker-icon-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const NearestHospitalIcon = L.icon({
  iconUrl: "/markers/marker-icon-gold.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Distance calculator (Haversine)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function inferDepartment(h) {
  const name = h.tags?.name?.toLowerCase() || "";
  if (name.includes("matern") || name.includes("obst")) return "Maternity";
  if (name.includes("pediatr")) return "Pediatrics";
  if (name.includes("urgence") || name.includes("emerg")) return "Emergency";
  if (name.includes("denta")) return "Dental";
  if (name.includes("cardio")) return "Cardiology";
  return "General";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18&extratags=1&namedetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "HospitalLocatorApp/1.0",
        "Referer": "https://medi-fast-cameroon.vercel.app/"
      }
    });
    const data = await res.json();
    return {
      displayName: data.display_name || null,
      street: data.address?.road || null,
      city: data.address?.city || data.address?.town || data.address?.village || null,
      name: data.namedetails?.name || data.extratags?.official_name || null
    };
  } catch (err) {
    console.warn("Reverse geocoding failed:", err);
    return null;
  }
}

function inferName(h, reverseData) {
  const tags = h.tags || {};
  return (
    tags.name ||
    tags["name:en"] ||
    tags.official_name ||
    tags.alt_name ||
    reverseData?.name ||
    reverseData?.displayName?.split(",")[0] ||
    "Unnamed Hospital"
  );
}

const departmentStyles = {
  All: { icon: "🌍", color: "bg-gray-200 text-gray-800", active: "bg-gray-700 text-white" },
  Maternity: { icon: "🤱", color: "bg-pink-200 text-pink-800", active: "bg-pink-600 text-white" },
  Pediatrics: { icon: "🧒", color: "bg-green-200 text-green-800", active: "bg-green-600 text-white" },
  Emergency: { icon: "🚑", color: "bg-red-200 text-red-800", active: "bg-red-600 text-white" },
  Dental: { icon: "🦷", color: "bg-yellow-200 text-yellow-800", active: "bg-yellow-600 text-white" },
  Cardiology: { icon: "❤️", color: "bg-purple-200 text-purple-800", active: "bg-purple-600 text-white" },
  General: { icon: "🏥", color: "bg-blue-200 text-blue-800", active: "bg-blue-600 text-white" }
};

export default function HospitalMap() {
  const { darkMode, language } = useApp();
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [nearest, setNearest] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDept, setSelectedDept] = useState("All");
  const [departments, setDepartments] = useState([]);
  const [viewMode, setViewMode] = useState("split"); // "map", "list", "split"
  const [loading, setLoading] = useState(true);

  // GET USER LOCATION
  useEffect(() => {
    let timeoutId;

    function success(pos) {
      clearTimeout(timeoutId);
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    }

    function error(err) {
      clearTimeout(timeoutId);
      console.warn("Geolocation failed:", err);
      setPosition([3.8480, 11.5021]); // Yaoundé fallback
    }

    navigator.geolocation.getCurrentPosition(success, error);

    timeoutId = setTimeout(() => {
      console.warn("Geolocation timed out — using fallback");
      setPosition([3.8480, 11.5021]);
    }, 5000);
  }, []);

  // FETCH HOSPITALS
  useEffect(() => {
    if (!position) return;

    const [lat, lon] = position;

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:45000, ${lat}, ${lon});
        way["amenity"="hospital"](around:45000, ${lat}, ${lon});
        relation["amenity"="hospital"](around:45000, ${lat}, ${lon});
      );
      out center;
    `;

    const servers = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.nchc.org.tw/api/interpreter",
    ];

    async function fetchOverpass(query) {
      for (const server of servers) {
        try {
          const res = await fetch(server, { method: "POST", body: query });
          const text = await res.text();
          if (text.trim().startsWith("<")) continue;
          return JSON.parse(text);
        } catch (err) {
          console.warn("Overpass server failed:", server);
        }
      }
      throw new Error("All Overpass servers failed");
    }

    fetchOverpass(query)
      .then(async (data) => {
        const rawHospitals = (data.elements || [])
          .map((h) => {
            const hLat = h.lat || h.center?.lat;
            const hLon = h.lon || h.center?.lon;
            if (!hLat || !hLon) return null;
            return { ...h, lat: hLat, lon: hLon };
          })
          .filter(Boolean);

        async function getDrivingDistance(h) {
          try {
            const url = `https://router.project-osrm.org/route/v1/driving/${lon},${lat};${h.lon},${h.lat}?overview=false`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.routes?.length > 0) {
              return {
                ...h,
                drivingDistance: json.routes[0].distance,
                drivingDuration: json.routes[0].duration,
              };
            }
          } catch (err) {
            console.warn("OSRM routing failed:", err);
          }
          return {
            ...h,
            drivingDistance: getDistanceKm(lat, lon, h.lat, h.lon) * 1000,
            drivingDuration: null,
          };
        }

        const enriched = [];
        for (const h of rawHospitals.slice(0, 20)) { // Limit to 20 for performance
          const enrichedHospital = await getDrivingDistance(h);
          await sleep(500);
          const reverseData = await reverseGeocode(enrichedHospital.lat, enrichedHospital.lon);
          enrichedHospital.address = reverseData?.displayName || "Address unavailable";
          enrichedHospital.city = reverseData?.city || null;
          enrichedHospital.name = inferName(enrichedHospital, reverseData);
          enrichedHospital.department = inferDepartment(enrichedHospital);
          enriched.push(enrichedHospital);
        }

        const departmentsList = Array.from(new Set(enriched.map((h) => h.department)));
        setDepartments(departmentsList);
        enriched.sort((a, b) => a.drivingDistance - b.drivingDistance);
        setHospitals(enriched);
        setNearest(enriched[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Overpass failed:", err);
        setLoading(false);
      });
  }, [position]);

  const filteredHospitals = selectedDept === "All"
    ? hospitals
    : hospitals.filter(h => h.department === selectedDept);

  const handleViewDetails = (h) => {
    setSelectedHospital(h);
  };

  const handleBookAppointment = (h) => {
    navigate('/book', { state: { hospitalName: h.name, hospitalLat: h.lat, hospitalLon: h.lon } });
  };

  const handleNavigate = (h) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`, "_blank");
  };

  if (!position) {
    return (
      <div className={`flex items-center justify-center h-64 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>{language === 'fr' ? 'Obtention de votre position...' : 'Getting your location...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="hospital-map">
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {["All", ...departments].map((dept) => {
            const style = departmentStyles[dept] || departmentStyles["General"];
            const isActive = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                data-testid={`dept-${dept}-btn`}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors
                  ${isActive ? style.active : style.color}`}
              >
                <span>{style.icon}</span>
                <span className="hidden sm:inline">{dept}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg ${viewMode === "list" ? "bg-green-600 text-white" : darkMode ? "bg-gray-700 text-white" : "bg-gray-200"}`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={`p-2 rounded-lg ${viewMode === "split" ? "bg-green-600 text-white" : darkMode ? "bg-gray-700 text-white" : "bg-gray-200"}`}
          >
            <MapIcon size={18} />
          </button>
        </div>
      </div>

      {/* Selected Hospital Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-2xl shadow-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
              <button
                onClick={() => setSelectedHospital(null)}
                className="text-white/80 hover:text-white mb-2"
              >
                ← {language === 'fr' ? 'Retour' : 'Back'}
              </button>
              <h3 className="text-xl font-bold text-white">{selectedHospital.name}</h3>
            </div>

            <div className="p-4 space-y-3">
              <p className={`flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <MapPin size={16} className="text-green-600" /> {selectedHospital.address}
              </p>
              
              {selectedHospital.drivingDistance && (
                <p className={`flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Clock size={16} className="text-green-600" />
                  {(selectedHospital.drivingDistance / 1000).toFixed(1)} km
                  {selectedHospital.drivingDuration && ` • ~${Math.round(selectedHospital.drivingDuration / 60)} min`}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  {selectedHospital.department}
                </span>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleBookAppointment(selectedHospital)}
                  data-testid="modal-book-btn"
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition"
                >
                  <Stethoscope size={18} />
                  {language === 'fr' ? 'Réserver' : 'Book'}
                </button>
                <button
                  onClick={() => handleNavigate(selectedHospital)}
                  data-testid="modal-navigate-btn"
                  className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
                    darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <Navigation size={18} />
                  {language === 'fr' ? 'Naviguer' : 'Navigate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex gap-4 ${viewMode === "list" ? "flex-col" : ""}`}>
        {/* Map */}
        {viewMode !== "list" && (
          <MapContainer
            center={position}
            zoom={13}
            style={{
              height: "400px",
              width: viewMode === "split" ? "60%" : "100%",
              borderRadius: "12px"
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position} icon={UserIcon}>
              <Popup>{language === 'fr' ? 'Vous êtes ici' : 'You are here'}</Popup>
            </Marker>

            {filteredHospitals.map((h) => {
              const isNearest = nearest && h.id === nearest.id;
              return (
                <Marker
                  key={h.id}
                  position={[h.lat, h.lon]}
                  icon={isNearest ? NearestHospitalIcon : HospitalIcon}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <strong>{h.name}</strong>
                      <br />
                      {h.drivingDistance && `${(h.drivingDistance / 1000).toFixed(1)} km`}
                      {h.drivingDuration && ` • ${Math.round(h.drivingDuration / 60)} min`}
                      <br />
                      {isNearest && <span className="text-yellow-600 font-semibold">⭐ Plus proche</span>}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleBookAppointment(h)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          {language === 'fr' ? 'Réserver' : 'Book'}
                        </button>
                        <button
                          onClick={() => handleNavigate(h)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          {language === 'fr' ? 'Y aller' : 'Go'}
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {/* Hospital List */}
        <div
          className={`${viewMode === "split" ? "w-[40%]" : "w-full"} max-h-[400px] overflow-y-auto space-y-3 ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          } rounded-xl p-3`}
        >
          <h3 className={`font-semibold sticky top-0 py-2 ${darkMode ? 'text-white bg-gray-800' : 'text-gray-800 bg-gray-50'}`}>
            {language === 'fr' ? 'Hôpitaux à proximité' : 'Nearby Hospitals'} 
            {loading && <span className="text-sm font-normal ml-2">({language === 'fr' ? 'Chargement...' : 'Loading...'})</span>}
          </h3>

          {filteredHospitals.length === 0 && !loading && (
            <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'fr' ? 'Aucun hôpital trouvé' : 'No hospitals found'}
            </p>
          )}

          {filteredHospitals.map((h, i) => {
            const isNearest = nearest && h.id === nearest.id;
            return (
              <div
                key={h.id || i}
                className={`${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow ${
                  isNearest ? 'ring-2 ring-yellow-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {h.name}
                      </h4>
                      {isNearest && <span className="text-yellow-500 text-sm">⭐</span>}
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>
                      {h.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3 text-sm">
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <MapPin size={14} className="text-red-500" />
                    {h.drivingDistance ? `${(h.drivingDistance / 1000).toFixed(1)} km` : "N/A"}
                  </span>
                  {h.drivingDuration && (
                    <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Clock size={14} className="text-green-500" />
                      {Math.round(h.drivingDuration / 60)} min
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(h)}
                    data-testid={`details-${i}-btn`}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                      darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {language === 'fr' ? 'Détails' : 'Details'}
                  </button>
                  <button
                    onClick={() => handleBookAppointment(h)}
                    data-testid={`book-${i}-btn`}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    {language === 'fr' ? 'Réserver' : 'Book'}
                  </button>
                  <button
                    onClick={() => handleNavigate(h)}
                    data-testid={`nav-${i}-btn`}
                    className={`px-3 py-2 rounded-lg transition ${
                      darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <Navigation size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
