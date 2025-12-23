import { useEffect, useMemo, useState } from "react";
import Topbar from "../components/Topbar";
import { fetchAdminDashboard, type AdminDashboardResponse } from "../lib/api";
import { Pie, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler
} from "chart.js";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LTooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler
);

function useThemeColors() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains("dark")));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return useMemo(() => {
    return {
      axis: dark ? "#cbd5e1" : "#475569",
      grid: dark ? "rgba(148,163,184,.2)" : "rgba(148,163,184,.25)",
      legend: dark ? "#e2e8f0" : "#334155"
    };
  }, [dark]);
}

export default function AdminPage() {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState<AdminDashboardResponse | null>(null);

  const [date, setDate] = useState<string>("");
  const [lat, setLat] = useState<string>("13.10");
  const [lon, setLon] = useState<string>("100.10");
  const [page, setPage] = useState<number>(1);

  async function load(p = page) {
    setErr("");
    setLoading(true);
    try {
      const res = await fetchAdminDashboard({ date: date || undefined, lat, lon, page: p });
      setData(res);
      setDate(res.selected_date);
      setLat(res.selected_lat);
      setLon(res.selected_lon);
      setPage(res.page);
    } catch (e: any) {
      setErr(e?.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pieData = useMemo(() => {
    const dc = data?.disease_counts || {};
    return { labels: Object.keys(dc), datasets: [{ data: Object.values(dc) }] };
  }, [data]);

  const lineData = useMemo(() => {
    return {
      labels: data?.time_series_labels || [],
      datasets:
        data?.time_series_datasets?.map((ds) => ({ label: ds.label, data: ds.data, tension: 0.25, fill: false })) || []
    };
  }, [data]);

  const barGroupedData = useMemo(() => {
    return {
      labels: data?.grouped_locations || [],
      datasets: data?.grouped_datasets?.map((ds) => ({ label: ds.label, data: ds.data })) || []
    };
  }, [data]);

  const histData = useMemo(() => {
    const confs = data?.confidence_values || [];
    const counts = new Array(10).fill(0);
    for (const v of confs) {
      if (typeof v === "number") {
        const idx = Math.min(9, Math.max(0, Math.floor(v * 10)));
        counts[idx] += 1;
      }
    }
    const labels = Array.from({ length: 10 }, (_, i) => `${(i / 10).toFixed(1)}–${((i + 1) / 10).toFixed(1)}`);
    return { labels, datasets: [{ label: "จำนวนรายการ", data: counts }] };
  }, [data]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" as const, labels: { color: colors.legend } } },
      scales: {
        x: { ticks: { color: colors.axis }, grid: { color: colors.grid } },
        y: { beginAtZero: true, ticks: { color: colors.axis }, grid: { color: colors.grid } }
      }
    };
  }, [colors]);

  const pieOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" as const, labels: { color: colors.legend } } }
    };
  }, [colors]);

  return (
    <div>
      <Topbar />

      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-hero-gradient"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_200px_at_50%_0%,rgba(37,99,235,0.12),transparent)]"></div>

        <div className="max-w-7xl mx-auto px-4 pt-10 pb-2">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Rice Disease Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">ภาพรวมการรายงานโรคข้าวจากระบบของคุณ</p>
            </div>

            <div className="rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur ring-1 ring-gray-200/70 dark:ring-white/10 shadow-soft px-4 py-3 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">วันที่ (Weather)</label>
                <input
                  type="date"
                  value={date}
                  max={data?.max_date || undefined}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Lat</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Lon</label>
                <input
                  type="text"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <button
                onClick={() => load(1)}
                className="h-[38px] px-4 rounded-lg bg-gradient-to-r from-brand to-blue-500 text-white text-sm shadow-pill hover:brightness-110 transition"
              >
                อัปเดต
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {err ? (
          <div className="rounded-2xl bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200 ring-1 ring-red-200/60 dark:ring-red-300/20 p-4">
            {err}
          </div>
        ) : null}

        {loading || !data ? (
          <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-6">
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <div className="text-sm text-gray-500 dark:text-gray-400">จำนวนผู้รายงานทั้งหมด</div>
                <div className="mt-1 text-3xl font-extrabold tracking-tight">{data.summary.total_users}</div>
                <div className="mt-4 h-1 w-12 rounded-full bg-brand/80"></div>
              </div>
              <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <div className="text-sm text-gray-500 dark:text-gray-400">พื้นที่ที่รายงานมากสุด</div>
                <div className="mt-1 text-lg font-semibold">{data.summary.most_common_location}</div>
                <div className="mt-4 h-1 w-12 rounded-full bg-amber/70"></div>
              </div>
              <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <div className="text-sm text-gray-500 dark:text-gray-400">ชนิดโรคทั้งหมด</div>
                <div className="mt-1 text-lg font-semibold">{Object.keys(data.summary.disease_summary || {}).length}</div>
                <div className="mt-4 h-1 w-12 rounded-full bg-leaf/80"></div>
              </div>
              <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <div className="text-sm text-gray-500 dark:text-gray-400">จำนวนรายการบันทึกรวม</div>
                <div className="mt-1 text-3xl font-extrabold tracking-tight">{data.total_records}</div>
                <div className="mt-4 h-1 w-12 rounded-full bg-gray-400/70"></div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <h3 className="text-lg font-semibold mb-2">1) สัดส่วนชนิดโรคที่ตรวจพบ</h3>
                <div className="h-[360px]">
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <h3 className="text-lg font-semibold mb-2">2) แนวโน้มจำนวนรายงานโรคตามเวลา</h3>
                <div className="h-[360px]">
                  <Line data={lineData} options={chartOptions} />
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <h3 className="text-lg font-semibold mb-2">3) Heatmap พื้นที่พบโรค</h3>
                <div className="h-[420px] rounded-xl overflow-hidden">
                  <MapContainer center={[16.4, 102.8]} zoom={9} className="h-full w-full">
                    <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {(data.heat_points || []).map((p, i) => (
                      <CircleMarker key={i} center={[p[0], p[1]]} radius={10} pathOptions={{ color: "#2563eb" }} />
                    ))}
                  </MapContainer>
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <h3 className="text-lg font-semibold mb-2">5) Bubble Map (ขนาดตามจำนวนรายงาน/จุด)</h3>
                <div className="h-[420px] rounded-xl overflow-hidden">
                  <MapContainer center={[16.4, 102.8]} zoom={9} className="h-full w-full">
                    <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {(data.bubble_points || []).map((p, i) => (
                      <CircleMarker
                        key={i}
                        center={[p.lat, p.lon]}
                        radius={Math.max(6, Math.min(32, (p.count || 1) * 4))}
                        pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.25 }}
                      >
                        <LTooltip direction="top" opacity={1}>
                          <div>
                            <div>{p.disease || "Unknown"}</div>
                            <div>count: {p.count}</div>
                          </div>
                        </LTooltip>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <h3 className="text-lg font-semibold mb-2">4) จำนวนโรคตามสถานที่ (Grouped Bar)</h3>
                <div className="h-[360px]">
                  <Bar data={barGroupedData} options={chartOptions} />
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <h3 className="text-lg font-semibold mb-2">6) การกระจายค่าความมั่นใจของโมเดล</h3>
                <div className="h-[360px]">
                  <Bar data={histData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
              <h3 className="text-lg font-semibold mb-3">ประวัติรายการล่าสุด</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.records.map((r, idx) => (
                  <div key={idx} className="rounded-xl ring-1 ring-gray-100 dark:ring-white/10 overflow-hidden bg-white dark:bg-white/5">
                    {r.image_url ? <img src={r.image_url} className="w-full h-40 object-cover" alt="uploaded image" /> : null}
                    <div className="p-3 space-y-1">
                      <div className="font-semibold text-gray-800 dark:text-gray-100">{r.display_name || "ไม่ระบุผู้ใช้"}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">โรค: {r.disease || "Unknown"}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        ความมั่นใจ: {typeof r.confidence === "number" ? r.confidence.toFixed(2) : "-"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">ที่อยู่: {r.address || "ไม่ระบุสถานที่"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{r.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 mt-4">
                {page > 1 ? (
                  <button
                    onClick={() => load(page - 1)}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-sm hover:bg-gray-50 dark:hover:bg-white/10"
                  >
                    ก่อนหน้า
                  </button>
                ) : null}
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  หน้า {page} / {data.total_pages}
                </span>
                {page < data.total_pages ? (
                  <button
                    onClick={() => load(page + 1)}
                    className="px-3 py-1 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-sm hover:bg-gray-50 dark:hover:bg-white/10"
                  >
                    ถัดไป
                  </button>
                ) : null}
              </div>
            </section>

            {data.weather_list?.length ? (
              <section className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <h3 className="text-lg font-semibold mb-3">สรุปพยากรณ์อากาศรายชั่วโมง (TMD)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data.weather_list.slice(0, 8).map((w, idx) => (
                    <div key={idx} className="rounded-xl ring-1 ring-gray-100 dark:ring-white/10 p-3 bg-white dark:bg-white/5">
                      <div className="text-sm text-gray-600 dark:text-gray-300">{w.time}</div>
                      <ul className="mt-2 space-y-1 text-sm">
                        {w.data.slice(0, 4).map((d, j) => (
                          <li key={j} className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">{d.label}</span>
                            <span className="font-medium">{d.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>

      <footer className="border-t border-gray-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Rice Disease Project — Computer Science, KKU
        </div>
      </footer>
    </div>
  );
}
