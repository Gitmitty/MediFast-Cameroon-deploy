import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin, Clock, Phone } from "lucide-react";

// Fix missing marker icons in Vite/Vercel
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Custom icons from /public
const UserIcon = L.icon({
  iconUrl: "/markers/marker-icon-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const PharmacyIcon = L.icon({
  iconUrl: "/markers/marker-icon-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const NearestPharmacyIcon = L.icon({
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

//function to help reverse geocode time limit
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//function to find an address for pharmacy using the lat and lon found
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18&extratags=1&namedetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "PharmacyLocatorApp/1.0 (contact: your-email@example.com)",
        "Referer": "https://medi-fast-cameroon-n5m9h67u8-tables-projects-0784640d.vercel.app/"
      }
    });

    const data = await res.json();

    return {
      displayName: data.display_name || null,
      street: data.address?.road || null,
      city: data.address?.city || data.address?.town || data.address?.village || null,
      name:
        data.extratags?.official_name ||
        data.extratags?.operator ||
        null
    };
  } catch (err) {
    console.warn("Reverse geocoding failed:", err);
    return null;
  }
}


//function that tries to find name of Pharmacy
function inferName(h, reverseData) {
  const tags = h.tags || {};

  return (
    tags.name ||
    tags["name:en"] ||
    tags.official_name ||
    tags.alt_name ||
    reverseData?.name ||                     
    reverseData?.displayName?.split(",")[0] || 
    "Unnamed Pharmacy"
  );
}

export default function PharmacyMap() {
  const [position, setPosition] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [nearest, setNearest] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  // -------------------------------
  // 1. GET USER LOCATION WITH TIMEOUT + FALLBACK
  // -------------------------------
  useEffect(() => {
    let timeoutId;

    function success(pos) {
      clearTimeout(timeoutId);
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    }

    function error(err) {
      clearTimeout(timeoutId);
      console.warn("Geolocation failed:", err);
      setPosition([3.8480, 11.5021]); // Yaoundé
    }

    navigator.geolocation.getCurrentPosition(success, error);

    timeoutId = setTimeout(() => {
      console.warn("Geolocation timed out — using fallback");
      setPosition([3.8480, 11.5021]); // Yaoundé
    }, 5000);
  }, []);

// -------------------------------
// 2. FETCH PHARMACY + ROUTING
// -------------------------------
useEffect(() => {
  if (!position) return;

  async function loadPharmacies() {
    const [lat, lon] = position;

    // Build Overpass query
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="pharmacy"](around:25000, ${lat}, ${lon});
        way["amenity"="pharmacy"](around:25000, ${lat}, ${lon});
        relation["amenity"="pharmacy"](around:25000, ${lat}, ${lon});
      );
      out center;
    `;

    // -------------------------------
    // MULTI‑SERVER FALLBACK
    // -------------------------------
    const servers = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.nchc.org.tw/api/interpreter",
      "https://overpass.openstreetmap.fr/api/interpreter",
      "https://overpass.osm.ch/api/interpreter",
    ];

    async function fetchOverpass(query) {
      for (const server of servers) {
        try {
          console.log("Trying Overpass server:", server);

          const res = await fetch(server, {
            method: "POST",
            body: query,
          });

          const text = await res.text();

          // Overpass sometimes returns HTML error pages
          if (text.trim().startsWith("<")) {
            console.warn("Overpass returned HTML — trying next server");
            continue;
          }

          return JSON.parse(text);
        } catch (err) {
          console.warn("Overpass server failed:", server, err);
        }
      }

      throw new Error("All Overpass servers failed");
    }

    // Fetch using fallback logic
    const data = await fetchOverpass(query);

    // -------------------------------
    // NORMALIZE COORDINATES
    // -------------------------------
    const rawPharmacy = (data.elements || [])
      .map((p) => {
        const pLat = p.lat || p.center?.lat;
        const pLon = p.lon || p.center?.lon;
        if (!pLat || !pLon) return null;

        return {
          ...p,
          lat: pLat,
          lon: pLon,
        };
      })
      .filter(Boolean);

    // -------------------------------
    // DRIVING DISTANCE HELPER
    // -------------------------------
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

    // -------------------------------
    // ENRICHMENT LOOP
    // -------------------------------
    const enriched = [];

    for (const p of rawPharmacy) {
      const enrichedPharmacy = await getDrivingDistance(p);

      await sleep(1100);

      const reverseData = await reverseGeocode(
        enrichedPharmacy.lat,
        enrichedPharmacy.lon
      );

      enrichedPharmacy.address =
        reverseData?.displayName || "Address unavailable";

      enrichedPharmacy.city = reverseData?.city || null;
      enrichedPharmacy.street = reverseData?.street || null;

      enrichedPharmacy.name = inferName(enrichedPharmacy, reverseData);

      enriched.push(enrichedPharmacy);
    }

    enriched.sort((a, b) => a.drivingDistance - b.drivingDistance);

    setPharmacies(enriched);
    setNearest(enriched[0] || null);
  }

  loadPharmacies();
}, [position]);


// -------------------------------
  // 3. RENDER
  // -------------------------------
if (!position) return <p>Getting your location…</p>;

return (
  <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
    
    {/* SELECTED PHARMACY MODAL */}
    {selectedPharmacy && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="w-[90%] max-w-lg rounded-2xl shadow-lg overflow-hidden bg-white dark:bg-gray-900">
          
          <img
            src={selectedPharmacy.image_url || "/placeholder.jpg"}
            alt={selectedPharmacy.name}
            className="w-full h-48 object-cover"
          />

          <div className="p-4">
            <button
              onClick={() => setSelectedPharmacy(null)}
              className="text-green-600 mb-2"
            >
              ← Back
            </button>

            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {selectedPharmacy.name}
            </h3>

            <p className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-300">
              <MapPin size={16} /> {selectedPharmacy.address}
            </p>

            <p className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-300">
              <Clock size={16} /> {selectedPharmacy.working_hours || "Hours unavailable"}
            </p>

            <p className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-300">
              <Phone size={16} /> {selectedPharmacy.phone || "No phone available"}
            </p>

            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.lat},${selectedPharmacy.lon}`,
                  "_blank"
                )
              }
              className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold"
            >
              Navigate
            </button>
          </div>
        </div>
      </div>
    )}

    {/* LEFT: MAP */}
         <MapContainer
        center={position}
        zoom={14}
        style={{
          height: "450px",
          width: "65%",
          borderRadius: "12px"
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={UserIcon}>
          <Popup>You are here</Popup>
        </Marker>

        {pharmacies.map((p) => {
          const isNearest = nearest && p.id === nearest.id;
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lon]}
              icon={isNearest ? NearestPharmacyIcon : PharmacyIcon}
            >
              <Popup>
                <strong>{p.name || "Pharmacy"}</strong>
                <br />
                Distance: {p.drivingDistance
                  ? (p.drivingDistance / 1000).toFixed(2) + " km"
                  : "Unknown"}
                <br />
                {p.drivingDuration
                  ? `Drive time: ${(p.drivingDuration / 60).toFixed(0)} min`
                  : ""}
                <br />
                {isNearest && <strong>⭐ Nearest pharmacy</strong>}
                <br />
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`,
                      "_blank"
                    )
                  }
                  style={{
                    marginTop: "6px",
                    padding: "6px 10px",
                    background: "#1a73e8",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Navigate
                </button>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

    {/* RIGHT: PHARMACY LIST */}
    <div
      style={{
        width: "35%",
        maxHeight: "450px",
        overflowY: "auto",
        padding: "10px",
        borderRadius: "12px",
        background: "#f8f9fa",
        border: "1px solid #ddd"
      }}
    >
      <h3 className="text-lg font-semibold mb-4">Pharmacies near you</h3>

      <div className="space-y-3">
        {pharmacies.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-white">
                  {p.name || "Pharmacy"}
                </h4>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {p.address || "No address available"}
                </p>

                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <span className="text-red-500">📍</span>
                    {p.drivingDistance
                      ? (p.drivingDistance / 1000).toFixed(2) + " km"
                      : "Unknown"}
                  </span>

                  {p.drivingDuration && (
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <span className="text-green-500">⏱</span>
                      {(p.drivingDuration / 60).toFixed(0)} min
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`,
                    "_blank"
                  )
                }
                className="bg-red-100 text-red-600 p-3 rounded-full hover:bg-red-200 transition-colors"
              >
                📞
              </button>
            </div>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setSelectedPharmacy(p)}
                className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              >
                More details
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`,
                    "_blank"
                  )
                }
                className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 transition-colors"
              >
                Navigate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
