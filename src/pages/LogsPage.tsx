import { useCallback, useEffect, useState } from "react";
import SiteLayout from "../components/layouts/SiteLayout";
import { fetchAuditLogs, type AuditLogItem, type AuditLogKind } from "../lib/api";

const KINDS: { value: AuditLogKind; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "system_error", label: "ข้อผิดพลาดระบบ" },
  { value: "access", label: "การเข้าถึง API/เว็บ" },
  { value: "page_view", label: "เปลี่ยนหน้า (SPA)" },
  { value: "security", label: "พฤติกรรมน่าสงสัย" },
  { value: "rejected_rice_image", label: "รูปที่ถูกปฏิเสธ (ไม่ใช่ใบข้าว)" },
];

function payloadSummary(item: AuditLogItem): string {
  const p = item.payload || {};
  switch (item.kind) {
    case "access":
      return `${String(p.method || "")} ${String(p.path || "")} → ${String(p.status_code ?? "")}`;
    case "security":
      return `${(p.flags as string[])?.join(", ") || "—"} · ${String(p.path || "")}`;
    case "system_error":
      return `${String(p.error_type || "")}: ${String(p.message || "").slice(0, 120)}`;
    case "page_view":
      return String(p.path || "");
    case "rejected_rice_image":
      return `LINE ${String(p.user_id || "").slice(0, 12)}… · ${String(p.model_reply || "").slice(0, 80)}`;
    default:
      return JSON.stringify(p).slice(0, 120);
  }
}

export default function LogsPage() {
  const [kind, setKind] = useState<AuditLogKind>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState<{
    items: AuditLogItem[];
    total: number;
    total_pages: number;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetchAuditLogs({ kind, page, limit: 40 });
      setData({
        items: res.items,
        total: res.total,
        total_pages: res.total_pages,
      });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "โหลดไม่สำเร็จ");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [kind, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [kind]);

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h1 className="text-2xl font-semibold">System logs</h1>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-white/15 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? "กำลังรีเฟรช..." : "รีเฟรช logs"}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          บันทึกข้อผิดพลาด การเข้าถึง พฤติกรรมที่น่าสงสัย และรูปที่โมเดลปฏิเสธว่าไม่ใช่ใบข้าว
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              className={
                "px-3 py-1.5 rounded-lg text-sm border transition " +
                (kind === k.value
                  ? "bg-brand text-white border-brand shadow-pill"
                  : "border-gray-200 dark:border-white/15 hover:bg-gray-50 dark:hover:bg-white/10")
              }
            >
              {k.label}
            </button>
          ))}
        </div>

        {err ? (
          <div className="text-red-600 text-sm mb-4">{err}</div>
        ) : null}

        {loading ? (
          <div className="text-sm opacity-70">กำลังโหลด…</div>
        ) : data ? (
          <>
            <div className="text-sm opacity-70 mb-3">
              ทั้งหมด {data.total} รายการ · หน้า {page}
              {data.total_pages ? ` / ${data.total_pages}` : ""}
            </div>

            <div className="space-y-3">
              {data.items.map((item) => (
                <article
                  key={item.id}
                  className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white/50 dark:bg-gray-950/40"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <span className="text-xs font-mono uppercase text-brand">{item.kind}</span>
                    <time className="text-xs opacity-70">{item.created_at}</time>
                  </div>
                  <p className="text-sm mb-2">{payloadSummary(item)}</p>

                  {item.kind === "rejected_rice_image" &&
                  typeof item.payload?.image_url === "string" &&
                  item.payload.image_url ? (
                    <div className="mt-2 flex flex-wrap gap-3 items-start">
                      <a
                        href={item.payload.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand hover:underline"
                      >
                        เปิดรูปเต็ม
                      </a>
                      <img
                        src={item.payload.image_url}
                        alt="rejected"
                        className="max-h-40 rounded-lg border border-gray-200 dark:border-white/10"
                      />
                    </div>
                  ) : null}

                  {item.kind === "rejected_rice_image" && item.payload?.upload_error ? (
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                      อัปโหลดรูปไม่สำเร็จ: {String(item.payload.upload_error)}
                    </p>
                  ) : null}

                  {item.kind === "system_error" && item.payload?.traceback ? (
                    <pre className="text-xs mt-2 p-2 rounded bg-gray-100 dark:bg-black/40 overflow-x-auto max-h-48">
                      {String(item.payload.traceback).slice(-4000)}
                    </pre>
                  ) : null}

                  {item.kind !== "rejected_rice_image" &&
                  item.kind !== "system_error" &&
                  Object.keys(item.payload || {}).length > 0 ? (
                    <details className="text-xs mt-2">
                      <summary className="cursor-pointer opacity-80">รายละเอียด JSON</summary>
                      <pre className="mt-2 p-2 rounded bg-gray-100 dark:bg-black/40 overflow-x-auto max-h-40">
                        {JSON.stringify(item.payload, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg border disabled:opacity-40"
              >
                ก่อนหน้า
              </button>
              <button
                type="button"
                disabled={page >= (data.total_pages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border disabled:opacity-40"
              >
                ถัดไป
              </button>
            </div>
          </>
        ) : null}
      </div>
    </SiteLayout>
  );
}
