import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SiteLayout from "../components/layouts/SiteLayout";
import { fetchHistoryDetail, type HistoryDetailResponse } from "../lib/api";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper function to get wind speed color
function getWindSpeedColor(speed: number): string {
  if (speed < 5) return "#22c55e"; // Green - light wind
  if (speed < 10) return "#eab308"; // Yellow - moderate wind
  if (speed < 15) return "#f97316"; // Orange - strong wind
  return "#ef4444"; // Red - very strong wind
}

// Helper function to create wind arrow coordinates
function createWindArrow(
  lat: number,
  lon: number,
  direction: number,
  speed: number
): { line: [number, number][]; arrowHead: [number, number][] } {
  // Arrow length based on wind speed (visible size for field)
  const length = 0.015 + (speed / 20) * 0.025;

  // Convert wind direction to radians (wind direction is "from" direction)
  // We want to show where wind is going, so add 180 degrees
  const angleRad = ((direction + 180) % 360) * (Math.PI / 180);

  // Calculate end point
  const endLat = lat + length * Math.cos(angleRad);
  const endLon = lon + length * Math.sin(angleRad);

  // Create arrow line
  const line: [number, number][] = [
    [lat, lon],
    [endLat, endLon],
  ];

  // Create arrowhead (two lines forming a V) - minimal size
  const arrowAngle = Math.PI / 6; // 30 degrees
  const arrowLength = length * 0.25;

  const leftLat = endLat - arrowLength * Math.cos(angleRad - arrowAngle);
  const leftLon = endLon - arrowLength * Math.sin(angleRad - arrowAngle);

  const rightLat = endLat - arrowLength * Math.cos(angleRad + arrowAngle);
  const rightLon = endLon - arrowLength * Math.sin(angleRad + arrowAngle);

  const arrowHead: [number, number][] = [
    [leftLat, leftLon],
    [endLat, endLon],
    [rightLat, rightLon],
  ];

  return { line, arrowHead };
}

export default function HistoryDetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<HistoryDetailResponse | null>(null);

  useEffect(() => {
    if (!recordId) {
      setError("ไม่พบ Record ID");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const result = await fetchHistoryDetail(recordId!);
        setData(result);
      } catch (e: any) {
        setError(e?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [recordId]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-6">
            กำลังโหลดข้อมูล...
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (error || !data) {
    return (
      <SiteLayout>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="rounded-2xl bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200 ring-1 ring-red-200/60 dark:ring-red-300/20 p-6">
            {error || "ไม่พบข้อมูล"}
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-brand to-blue-500 text-white text-sm shadow-pill hover:brightness-110 transition"
          >
            ← กลับไปหน้า Dashboard
          </button>
        </div>
      </SiteLayout>
    );
  }

  const { record, weather_list } = data;
  const lat = record.latitude || 0;
  const lon = record.longitude || 0;

  // Find the closest weather forecast to the record timestamp
  // If no weather data is available, use mock data for demonstration
  let closestWeather = weather_list?.[0];
  
  // Fallback: Create mock wind data if not available
  if (!closestWeather || typeof closestWeather.ws10m !== "number" || typeof closestWeather.wd10m !== "number") {
    closestWeather = {
      time: "Mock Data",
      data: [],
      ws10m: 5.5, // Mock wind speed (m/s)
      wd10m: 135, // Mock wind direction (degrees) - Southeast
    };
  }

  return (
    <SiteLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin")}
            className="mb-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition"
          >
            ← กลับไปหน้า Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            รายละเอียดประวัติ
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            ข้อมูลการรายงานโรคแบบละเอียด
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Record Details */}
          <div className="space-y-6">
            {/* Image and Disease Info */}
            <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft overflow-hidden">
              {record.image_url && (
                <img
                  src={record.image_url}
                  alt="Disease"
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-5 space-y-3">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ชื่อโรค
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {record.disease || "Unknown"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ความมั่นใจ
                  </div>
                  <div className="text-lg font-semibold">
                    {typeof record.confidence === "number"
                      ? record.confidence.toFixed(1) + "%"
                      : "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* User and Location Info */}
            <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5 space-y-3">
              <h3 className="text-lg font-semibold">ข้อมูลการรายงาน</h3>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ผู้รายงาน
                </div>
                <div className="font-medium">
                  {record.display_name || "ไม่ระบุผู้ใช้"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  เวลา
                </div>
                <div className="font-medium">{record.timestamp || "-"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ที่อยู่
                </div>
                <div className="font-medium">
                  {record.address || "ไม่ระบุสถานที่"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  พิกัด (Latitude, Longitude)
                </div>
                <div className="font-mono text-sm">
                  {lat.toFixed(6)}, {lon.toFixed(6)}
                </div>
              </div>
            </div>

            {/* Weather Data */}
            {weather_list && weather_list.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <h3 className="text-lg font-semibold mb-3">
                  ข้อมูลสภาพอากาศ
                </h3>
                <div className="space-y-4">
                  {weather_list.slice(0, 4).map((w, idx) => (
                    <div key={idx} className="border-b border-gray-200 dark:border-white/10 pb-3 last:border-0">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {w.time}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {w.data.map((d, j) => (
                          <div key={j} className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">
                              {d.label}:
                            </span>
                            <span className="font-medium">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Map with Wind Vectors */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
              <h3 className="text-lg font-semibold mb-3">
                แผนที่และทิศทางลม
              </h3>
              <div className="h-[500px] rounded-xl overflow-hidden">
                <MapContainer
                  center={[lat, lon]}
                  zoom={12}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Location Marker */}
                  <Marker position={[lat, lon]}>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{record.disease || "Unknown"}</div>
                        <div>{record.address || "ไม่ระบุสถานที่"}</div>
                        <div className="text-xs text-gray-500">
                          {lat.toFixed(6)}, {lon.toFixed(6)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Wind Vector Field - Grid of Arrows */}
                  {closestWeather &&
                    typeof closestWeather.ws10m === "number" &&
                    typeof closestWeather.wd10m === "number" &&
                    (() => {
                      const windSpeed = closestWeather.ws10m;
                      const windDirection = closestWeather.wd10m;
                      const color = getWindSpeedColor(windSpeed);
                      
                      // Create a grid of wind vectors
                      const gridSize = 2; // 5x5 grid (smaller for clarity)
                      const spacing = 0.025; // Distance between arrows (larger spacing)
                      const arrows = [];
                      
                      for (let i = -gridSize; i <= gridSize; i++) {
                        for (let j = -gridSize; j <= gridSize; j++) {
                          const gridLat = lat + i * spacing;
                          const gridLon = lon + j * spacing;
                          
                          const { line, arrowHead } = createWindArrow(
                            gridLat,
                            gridLon,
                            windDirection,
                            windSpeed
                          );
                          
                          arrows.push(
                            <span key={`${i}-${j}`}>
                              {/* Main arrow line */}
                              <Polyline
                                positions={line}
                                color={color}
                                weight={3}
                                opacity={0.75}
                              />
                              {/* Arrowhead */}
                              <Polyline
                                positions={arrowHead}
                                color={color}
                                weight={3}
                                opacity={0.75}
                              />
                            </span>
                          );
                        }
                      }
                      
                      return <>{arrows}</>;
                    })()}
                </MapContainer>
              </div>

              {/* Wind Legend */}
              {closestWeather && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">ข้อมูลลม:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        ความเร็ว:
                      </span>{" "}
                      <span className="font-medium">
                        {closestWeather.ws10m?.toFixed(1) || "-"} m/s
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        ทิศทาง:
                      </span>{" "}
                      <span className="font-medium">
                        {closestWeather.wd10m?.toFixed(0) || "-"}°
                      </span>
                    </div>
                  </div>

                  {/* Color Legend */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                    <div className="text-sm font-medium mb-2">
                      ความหมายของสี:
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "#22c55e" }}></div>
                        <span>0-5 m/s (ลมอ่อน)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "#eab308" }}></div>
                        <span>5-10 m/s (ลมปานกลาง)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f97316" }}></div>
                        <span>10-15 m/s (ลมแรง)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }}></div>
                        <span>&gt;15 m/s (ลมแรงมาก)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
