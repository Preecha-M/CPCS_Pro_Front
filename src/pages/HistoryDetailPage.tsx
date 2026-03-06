import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SiteLayout from "../components/layouts/SiteLayout";
import { fetchHistoryDetail, type HistoryDetailResponse } from "../lib/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
  const lat = record.latitude ?? null;
  const lon = record.longitude ?? null;
  const hasLocation = lat !== null && lon !== null;

  const closestWeather = weather_list?.[0];

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
                  {hasLocation ? `${lat!.toFixed(6)}, ${lon!.toFixed(6)}` : "ไม่มีตำแหน่ง"}
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

          {/* Right Column - Map */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
              <h3 className="text-lg font-semibold mb-3">
                {hasLocation ? "แผนที่" : "ไม่พบแผนที่"}
              </h3>
              {hasLocation ? (
                <div className="h-[500px] rounded-xl overflow-hidden">
                  <MapContainer
                    center={[lat!, lon!]}
                    zoom={12}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Location Marker */}
                    <Marker position={[lat!, lon!]}>
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">{record.disease || "Unknown"}</div>
                          <div>{record.address || "ไม่ระบุสถานที่"}</div>
                          <div className="text-xs text-gray-500">
                            {lat!.toFixed(6)}, {lon!.toFixed(6)}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10">
                  <span className="text-gray-400">ไม่พบตำแหน่งพิกัด (ละติจูด/ลองจิจูด) สำหรับแผนที่นี้</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
