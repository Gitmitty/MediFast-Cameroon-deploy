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

//sort departments depending on name and type
function inferDepartment(h) {
  const name = h.tags?.name?.toLowerCase() || "";

  if (name.includes("matern") || name.includes("obst")) return "Maternity";
  if (name.includes("pediatr")) return "Pediatrics";
  if (name.includes("urgence") || name.includes("emerg")) return "Emergency";
  if (name.includes("denta")) return "Dental";
  if (name.includes("cardio")) return "Cardiology";

  return "General";
}

//function to help reverse geocode time limit
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//function to find an address for hospitals using the lat and lon found
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18&extratags=1&namedetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "HospitalLocatorApp/1.0 (contact: your-email@example.com)",
        "Referer": "https://medi-fast-cameroon-n5m9h67u8-tables-projects-0784640d.vercel.app/"
      }
    });

    const data = await res.json();

    return {
      displayName: data.display_name || null,
      street: data.address?.road || null,
      city: data.address?.city || data.address?.town || data.address?.village || null,
      name:
        data.namedetails?.name ||
        data.namedetails?.["name:en"] ||
        data.extratags?.official_name ||
        data.extratags?.operator ||
        null
    };
  } catch (err) {
    console.warn("Reverse geocoding failed:", err);
    return null;
  }
}


//function that tries to find name of hospital
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



//styles for buttons depending on department
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
  const [position, setPosition] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [nearest, setNearest] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedDept, setSelectedDept] = useState("All");
  const [departments, setDepartments] = useState([]);

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
// 2. FETCH HOSPITALS + ROUTING
// -------------------------------
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
    "https://overpass.openstreetmap.fr/api/interpreter",
    "https://overpass.osm.ch/api/interpreter",
  ];

  function fetchWithTimeout(url, options, timeout = 8000) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeout)
      ),
    ]);
  }

  async function fetchWithFallback(query, retries = 2) {
    for (let server of servers) {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Fetching from ${server} (attempt ${attempt})`);

          const res = await fetchWithTimeout(server, {
            method: "POST",
            body: query,
          });

          const text = await res.text();

          if (text.trim().startsWith("<")) {
            throw new Error("Received HTML instead of JSON");
          }

          return JSON.parse(text);
        } catch (err) {
          console.warn(`Error from ${server} attempt ${attempt}:`, err);
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }
    }
    throw new Error("All Overpass servers failed");
  }

  // Small helper to respect Nominatim rate limits
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  fetchWithFallback(query)
    .then(async (data) => {
      const rawHospitals = (data.elements || [])
        .map((h) => {
          const hLat = h.lat || h.center?.lat;
          const hLon = h.lon || h.center?.lon;
          if (!hLat || !hLon) return null;

          return {
            ...h,
            lat: hLat,
            lon: hLon,
          };
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

      // ⭐ ENRICHMENT LOOP (with delay + reverse geocode + name)
      const enriched = [];

      for (const h of rawHospitals) {
        const enrichedHospital = await getDrivingDistance(h);

        // ⭐ Respect Nominatim rate limit (1 request/sec)
        await sleep(1100);

        // ⭐ Reverse geocode
        const reverseData = await reverseGeocode(
          enrichedHospital.lat,
          enrichedHospital.lon
        );

        // ⭐ Add address fields
        enrichedHospital.address =
          reverseData?.displayName || "Address unavailable";

        enrichedHospital.city = reverseData?.city || null;
        enrichedHospital.street = reverseData?.street || null;

        // ⭐ Add name detection
        enrichedHospital.name = inferName(enrichedHospital, reverseData);

        // ⭐ Department inference
        enrichedHospital.department = inferDepartment(enrichedHospital);

        console.log("FINAL HOSPITAL:", enrichedHospital);

        enriched.push(enrichedHospital);
      }

      // Extract unique departments
      const departmentsList = Array.from(
        new Set(enriched.map((h) => h.department))
      );

      setDepartments(departmentsList);

      // Sort by distance
      enriched.sort((a, b) => a.drivingDistance - b.drivingDistance);

      setHospitals(enriched);
      setNearest(enriched[0] || null);
    })
    .catch((err) => {
      console.error("Overpass failed completely:", err);
      alert("Unable to load hospitals right now. Please try again later.");
    });
}, [position]);

  //filter logic for hospitals
const filteredHospitals =
  selectedDept === "All"
    ? hospitals
    : hospitals.filter(h => h.department === selectedDept);

  // -------------------------------
  // 3. RENDER
  // -------------------------------
if (!position) return <p>Getting your location…</p>;

return (
  <div>
    {/* Department filter bar */}
    <div className="sticky top-0 z-50 bg-white py-2 shadow-sm overflow-x-auto flex gap-2 mb-4">
      {["All", ...departments].map((dept) => {
        const style = departmentStyles[dept] || departmentStyles["General"];
        const isActive = selectedDept === dept;
    
        return (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors
              ${isActive ? style.active : style.color}
              active:opacity-70
            `}
          >
            <span>{style.icon}</span>
            <span>{dept}</span>
          </button>
        );
      })}
    </div>

    <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
      {/*hospital seletected render*/}
          {selectedHospital && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="w-[90%] max-w-lg rounded-2xl shadow-lg overflow-hidden bg-white">
          
          <img
            src={selectedHospital.image_url}
            alt={selectedHospital.name}
            className="w-full h-48 object-cover"
          />
    
          <div className="p-4">
            <button
              onClick={() => setSelectedHospital(null)}
              className="text-green-600 mb-2"
            >
              ← Back
            </button>
    
            <h3 className="text-xl font-bold text-gray-800">
              {selectedHospital.name}
            </h3>
    
            <p className="flex items-center gap-2 mt-2 text-gray-600">
              <MapPin size={16} /> {selectedHospital.address}
            </p>
    
            <p className="flex items-center gap-2 mt-1 text-gray-600">
              <Clock size={16} /> {selectedHospital.working_hours || "Hours unavailable"}
            </p>
    
            <p className="flex items-center gap-2 mt-1 text-gray-600">
              <Phone size={16} /> {selectedHospital.phone || "No phone available"}
            </p>
    
            <div className="mt-4">
              <p className="font-semibold mb-2 text-gray-800">Departments:</p>
              <div className="flex flex-wrap gap-2">
                {selectedHospital.departments?.map((d, i) => (
                  <span
                    key={i}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
    
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lon}`,
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

      {/* LEFT: Map */}
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

        {filteredHospitals.map((h) => {
          const isNearest = nearest && h.id === nearest.id;
          return (
            <Marker
              key={h.id}
              position={[h.lat, h.lon]}
              icon={isNearest ? NearestHospitalIcon : HospitalIcon}
            >
              <Popup>
                <strong>{h.name || "Hospital"}</strong>
                <br />
                Distance: {h.drivingDistance
                  ? (h.drivingDistance / 1000).toFixed(2) + " km"
                  : "Unknown"}
                <br />
                {h.drivingDuration
                  ? `Drive time: ${(h.drivingDuration / 60).toFixed(0)} min`
                  : ""}
                <br />
                {isNearest && <strong>⭐ Nearest hospital</strong>}
                <br />
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`,
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

      {/* RIGHT: Hospital list */}
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
        <h3 className="text-lg font-semibold mb-4">Hospitals near you</h3>

        <div className="space-y-3">
          {filteredHospitals.map((h, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">
                    {h.name || "Hospital"}
                  </h4>

                  <p className="text-xs text-gray-500">
                    {h.address || "No address available"}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <span className="text-red-500">📍</span>
                      {h.drivingDistance
                        ? (h.drivingDistance / 1000).toFixed(2) + " km"
                        : "Unknown"}
                    </span>

                    {h.drivingDuration && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <span className="text-green-500">⏱</span>
                        {(h.drivingDuration / 60).toFixed(0)} min
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`,
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
                onClick={() => setSelectedHospital(h)}
                className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              >
                More details
              </button>

                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`,
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
  </div>
);
}
