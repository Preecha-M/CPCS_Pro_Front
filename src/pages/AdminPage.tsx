import { useEffect, useMemo, useState } from "react";
import SiteLayout from "../components/layouts/SiteLayout";
import { fetchAdminDashboard, deleteHistoryRecord, type AdminDashboardResponse } from "../lib/api";
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
  Filler,
} from "chart.js";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip as LTooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DiseaseLegend from "../components/DiseaseLegend";

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
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  return useMemo(() => {
    return {
      axis: dark ? "#cbd5e1" : "#475569",
      grid: dark ? "rgba(148,163,184,.2)" : "rgba(148,163,184,.25)",
      legend: dark ? "#e2e8f0" : "#334155",
    };
  }, [dark]);
}

const CONFIDENCE_THRESHOLD = 0.45;

function shortPlaceName(addr: string, maxLen = 18) {
  const raw = (addr || "").trim();
  if (!raw) return "ไม่ระบุสถานที่";

  // ตัดส่วนที่ยาวเกิน/ซ้ำซ้อน (เช่น รายละเอียดหน้าบ้าน/หมู่บ้าน) โดยเอาส่วนท้ายที่สำคัญ
  // รูปแบบที่พบบ่อย: "ตำบล... อำเภอ... จังหวัด..." หรือมีคอมมา
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  let base = parts.length >= 2 ? parts.slice(-2).join(", ") : raw;

  base = base
    .replace(/จังหวัด/gi, "จ.")
    .replace(/อำเภอ/gi, "อ.")
    .replace(/ตำบล/gi, "ต.")
    .replace(/\s+/g, " ")
    .trim();

  if (base.length > maxLen) return base.slice(0, maxLen - 1) + "…";
  return base;
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

  // Card 4: Sort controls
  const [sortLocationsBy, setSortLocationsBy] = useState<string>("__total"); // __az | __total | <disease>
  const [sortDiseasesBy, setSortDiseasesBy] = useState<string>("__az"); // __az | __total | <location>
  const [selectedDisease, setSelectedDisease] = useState<string>("__all"); // __all | <disease>

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);


  const diseaseColor = useMemo(() => {
    const map = isDark
      ? data?.disease_colors?.dark
      : data?.disease_colors?.light;
    return (name?: string | null) => {
      const key = name || "Unknown";
      return map?.[key] || (isDark ? "#CBD5E1" : "#94A3B8");
    };
  }, [data, isDark]);

  async function load(p = page) {
    setErr("");
    if (!data) setLoading(true); // show full loading only on first load
    try {
      const res = await fetchAdminDashboard({
        date: date || undefined,
        lat,
        lon,
        page: p,
      });
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

  async function handleDelete(recordId: string, e: React.MouseEvent) {
    e.stopPropagation(); // prevent card click
    if (!window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    
    try {
      await deleteHistoryRecord(recordId);
      await load(page); // reload data
    } catch (err: any) {
      alert("ลบไม่สำเร็จ: " + err.message);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const legendItems = useMemo(() => {
    const dc = data?.disease_counts || {};
    return Object.entries(dc)
      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
      .map(([name, count]) => ({
        name,
        count,
        color: diseaseColor(name),
      }));
  }, [data, diseaseColor]);

  const pieData = useMemo(() => {
    const dc = data?.disease_counts || {};
    const labels = Object.keys(dc);
    return {
      labels,
      datasets: [
        {
          data: Object.values(dc),
          backgroundColor: labels.map((n) => diseaseColor(n)),
          borderColor: labels.map((n) => diseaseColor(n)),
          borderWidth: 1,
        },
      ],
    };
  }, [data, diseaseColor]);

  const lineData = useMemo(() => {
    return {
      labels: data?.time_series_labels || [],
      datasets:
        data?.time_series_datasets?.map((ds) => {
          const c = diseaseColor(ds.label);
          return {
            label: ds.label,
            data: ds.data,
            tension: 0.25,
            fill: true,
            borderColor: c,
            backgroundColor: c + "33",
            pointBackgroundColor: c,
          };
        }) || [],
    };
  }, [data, diseaseColor]);

  const barGroupedData = useMemo(() => {
    const locations = data?.grouped_locations || [];
    const datasetsRaw = data?.grouped_datasets || [];

    // Map: disease -> array(count per location index)
    const diseaseLabels = datasetsRaw.map((d) => d.label);
    const locIdx = new Map<string, number>();
    locations.forEach((l, i) => locIdx.set(l, i));

    // ---- sort locations (x-axis) ----
    const totalsByLoc = locations.map((_, i) =>
      datasetsRaw.reduce((sum, ds) => sum + (Number(ds.data?.[i] ?? 0) || 0), 0)
    );

    let locOrder = locations.map((l, i) => ({ l, i }));

    if (sortLocationsBy === "__az") {
      locOrder.sort((a, b) =>
        shortPlaceName(a.l).localeCompare(shortPlaceName(b.l), "th")
      );
    } else if (sortLocationsBy === "__total") {
      locOrder.sort(
        (a, b) => (totalsByLoc[b.i] ?? 0) - (totalsByLoc[a.i] ?? 0)
      );
    } else {
      // sort by selected disease count at each location
      const ds = datasetsRaw.find((x) => x.label === sortLocationsBy);
      if (ds) {
        locOrder.sort(
          (a, b) =>
            (Number(ds.data?.[b.i] ?? 0) || 0) -
            (Number(ds.data?.[a.i] ?? 0) || 0)
        );
      }
    }

    // ---- sort diseases (datasets) ----
    const totalsByDisease = datasetsRaw.map((ds) =>
      (ds.data || []).reduce((sum, v) => sum + (Number(v ?? 0) || 0), 0)
    );

    let dsOrder = datasetsRaw.map((ds, idx) => ({ ds, idx }));

    if (sortDiseasesBy === "__az") {
      dsOrder.sort((a, b) => a.ds.label.localeCompare(b.ds.label, "th"));
    } else if (sortDiseasesBy === "__total") {
      dsOrder.sort(
        (a, b) => (totalsByDisease[b.idx] ?? 0) - (totalsByDisease[a.idx] ?? 0)
      );
    } else {
      // sort by selected location (raw string) count per disease
      const locIndex = locIdx.get(sortDiseasesBy);
      if (typeof locIndex === "number") {
        dsOrder.sort(
          (a, b) =>
            (Number(b.ds.data?.[locIndex] ?? 0) || 0) -
            (Number(a.ds.data?.[locIndex] ?? 0) || 0)
        );
      }
    }

    const datasetsFinal =
      selectedDisease === "__all"
        ? dsOrder
        : dsOrder.filter(({ ds }) => ds.label === selectedDisease);

    return {
      labels: locOrder.map((x) => shortPlaceName(x.l)),
      datasets: datasetsFinal.map(({ ds }) => ({
        label: ds.label,
        data: locOrder.map((x) => Number(ds.data?.[x.i] ?? 0) || 0),
        backgroundColor: diseaseColor(ds.label),
      })),
    };
  }, [data, diseaseColor, sortLocationsBy, sortDiseasesBy, selectedDisease]);

  const histData = useMemo(() => {
    const confs = data?.confidence_values || [];
    const counts = new Array(10).fill(0);
    for (const v of confs) {
      if (typeof v === "number") {
        const idx = Math.min(9, Math.max(0, Math.floor(v * 10)));
        counts[idx] += 1;
      }
    }
    const labels = Array.from(
      { length: 10 },
      (_, i) => `${(i / 10).toFixed(1)}–${((i + 1) / 10).toFixed(1)}`
    );
    return {
      labels,
      datasets: [
        {
          label: "จำนวนรายการ",
          data: counts,
          backgroundColor: isDark ? "#A78BFA" : "#6366F1",
        },
      ],
    };
  }, [data, isDark]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { color: colors.legend },
        },
      },
      scales: {
        x: { ticks: { color: colors.axis }, grid: { color: colors.grid } },
        y: {
          beginAtZero: true,
          ticks: { color: colors.axis },
          grid: { color: colors.grid },
        },
      },
    };
  }, [colors]);

  const pieOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { color: colors.legend },
        },
      },
    };
  }, [colors]);

  return (
    <SiteLayout showDigitalOceanBadge>
      <div>
        <section className="relative">
          <div className="absolute inset-0 -z-10 bg-hero-gradient"></div>
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_200px_at_50%_0%,rgba(37,99,235,0.12),transparent)]"></div>

          <div className="max-w-7xl mx-auto px-4 pt-10 pb-2">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Rice Disease Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  ภาพรวมการรายงานโรคข้าวจากระบบของคุณ
                </p>
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
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    จำนวนผู้รายงานทั้งหมด
                  </div>
                  <div className="mt-1 text-3xl font-extrabold tracking-tight">
                    {data.summary.total_users}
                  </div>
                  <div className="mt-4 h-1 w-12 rounded-full bg-brand/80"></div>
                </div>
                <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    พื้นที่ที่รายงานมากสุด
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {data.summary.most_common_location}
                  </div>
                  <div className="mt-4 h-1 w-12 rounded-full bg-amber/70"></div>
                </div>
                <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ชนิดโรคทั้งหมด
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {Object.keys(data.summary.disease_summary || {}).length}
                  </div>
                  <div className="mt-4 h-1 w-12 rounded-full bg-leaf/80"></div>
                </div>
                <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    จำนวนรายการบันทึกรวม
                  </div>
                  <div className="mt-1 text-3xl font-extrabold tracking-tight">
                    {data.total_records}
                  </div>
                  <div className="mt-4 h-1 w-12 rounded-full bg-gray-400/70"></div>
                </div>
              </section>

              <DiseaseLegend items={legendItems} />

              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                  <h3 className="text-lg font-semibold mb-2">
                    1) สัดส่วนชนิดโรคที่ตรวจพบ
                  </h3>
                  <div className="h-[360px]">
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>

                <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                  <h3 className="text-lg font-semibold mb-2">
                    2) แนวโน้มจำนวนรายงานโรคตามเวลา
                  </h3>
                  <div className="h-[360px]">
                    <Line data={lineData} options={chartOptions} />
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                  <h3 className="text-lg font-semibold mb-2">
                    3) Heatmap พื้นที่พบโรค
                  </h3>
                  <div className="h-[420px] rounded-xl overflow-hidden">
                    <MapContainer
                      center={[16.4, 102.8]}
                      zoom={9}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {(() => {
                        const pts = data.heat_points || [];
                        const maxW = Math.max(
                          1,
                          ...pts.map((p) => Number(p?.[2] ?? 1) || 1)
                        );
                        return pts.map((p, i) => {
                          const w = Number(p?.[2] ?? 1) || 1;
                          const r = 6 + (w / maxW) * 18;
                          const opacity = Math.min(
                            0.85,
                            0.15 + (w / maxW) * 0.7
                          );
                          return (
                            <CircleMarker
                              key={i}
                              center={[p[0], p[1]]}
                              radius={r}
                              pathOptions={{
                                color: "#ef4444",
                                fillColor: "#ef4444",
                                fillOpacity: opacity,
                                weight: 0,
                              }}
                            />
                          );
                        });
                      })()}
                    </MapContainer>
                  </div>
                </div>

                <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                  <h3 className="text-lg font-semibold mb-2">
                    5) Bubble Map (ขนาดตามจำนวนรายงาน/จุด)
                  </h3>
                  <div className="h-[420px] rounded-xl overflow-hidden">
                    <MapContainer
                      center={[16.4, 102.8]}
                      zoom={9}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {(data.bubble_points || []).map((p, i) => (
                        <CircleMarker
                          key={i}
                          center={[p.lat, p.lon]}
                          radius={Math.max(6, Math.min(32, (p.count || 1) * 4))}
                          pathOptions={{
                            color: diseaseColor(p.disease),
                            fillColor: diseaseColor(p.disease),
                            fillOpacity: 0.25,
                          }}
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
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold">
                      4) จำนวนโรคตามสถานที่ (Grouped Bar)
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <select
                        className="h-8 max-w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 text-xs"
                        value={selectedDisease}
                        onChange={(e) => setSelectedDisease(e.target.value)}
                        title="แสดงเฉพาะโรค"
                      >
                        <option value="__all">แสดงทุกโรค</option>
                        {(data?.grouped_datasets || []).map((ds) => (
                          <option key={ds.label} value={ds.label}>
                            แสดงเฉพาะ: {ds.label}
                          </option>
                        ))}
                      </select>

                      <select
                        className="h-8 max-w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 text-xs"
                        value={sortLocationsBy}
                        onChange={(e) => setSortLocationsBy(e.target.value)}
                        title="เรียงสถานที่ตาม"
                      >
                        <option value="__az">เรียงสถานที่: A–Z</option>
                        <option value="__total">
                          เรียงสถานที่: รวมมาก→น้อย
                        </option>
                        {(data?.grouped_datasets || []).map((ds) => (
                          <option key={ds.label} value={ds.label}>
                            เรียงสถานที่: โรค {ds.label} มาก→น้อย
                          </option>
                        ))}
                      </select>

                      <select
                        className="h-8 max-w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 text-xs"
                        value={sortDiseasesBy}
                        onChange={(e) => setSortDiseasesBy(e.target.value)}
                        title="เรียงโรคตาม"
                      >
                        <option value="__az">เรียงโรค: A–Z</option>
                        <option value="__total">เรียงโรค: รวมมาก→น้อย</option>
                        {(data?.grouped_locations || []).map((loc) => (
                          <option key={loc} value={loc}>
                            เรียงโรค: สถานที่ {shortPlaceName(loc)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      แสดงผลเฉพาะรายการที่ confidence ≥ {CONFIDENCE_THRESHOLD}
                    </div>
                  </div>
                  <div className="h-[360px]">
                    <Bar data={barGroupedData} options={chartOptions} />
                  </div>
                </div>

                <div className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                  <h3 className="text-lg font-semibold mb-2">
                    6) การกระจายค่าความมั่นใจของโมเดล
                  </h3>
                  <div className="h-[360px]">
                    <Bar
                      data={histData}
                      options={{
                        ...chartOptions,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft p-5">
                <h3 className="text-lg font-semibold mb-3">
                  ประวัติรายการล่าสุด
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.records.map((r, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        // Use timestamp + user_id as a unique identifier, or _id if available
                        const recordId = (r as any)._id || `${r.user_id}_${r.timestamp}`;
                        window.location.href = `/admin/history/${recordId}`;
                      }}
                      className="rounded-xl ring-1 ring-gray-100 dark:ring-white/10 overflow-hidden bg-white dark:bg-white/5 cursor-pointer hover:ring-2 hover:ring-brand/50 transition-all"
                    >
                      {r.image_url ? (
                        <img
                          src={r.image_url}
                          className="w-full h-40 object-cover"
                          alt="uploaded image"
                        />
                      ) : null}
                      <div className="p-3 space-y-1">
                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                          {r.display_name || "ไม่ระบุผู้ใช้"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          โรค: {r.disease || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          ความมั่นใจ:{" "}
                          {typeof r.confidence === "number"
                            ? r.confidence.toFixed(2)
                            : "-"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          ที่อยู่: {r.address || "ไม่ระบุสถานที่"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {r.timestamp}
                        </div>
                        <div className="pt-2 flex justify-end">
                           <button 
                             onClick={(e) => handleDelete((r as any)._id || `${r.user_id}_${r.timestamp}`, e)}
                             className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 transition"
                           >
                             ลบรายการ
                           </button>
                        </div>
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
                  <h3 className="text-lg font-semibold mb-3">
                    สรุปพยากรณ์อากาศรายชั่วโมง (TMD)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {data.weather_list.slice(0, 8).map((w, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl ring-1 ring-gray-100 dark:ring-white/10 p-3 bg-white dark:bg-white/5"
                      >
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {w.time}
                        </div>
                        <ul className="mt-2 space-y-1 text-sm">
                          {w.data.slice(0, 4).map((d, j) => (
                            <li key={j} className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">
                                {d.label}
                              </span>
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
      </div>
    </SiteLayout>
  );
}
