import React from "react";

export default function DiseaseLegend({
  items,
}: {
  items: Array<{ name: string; color: string; count?: number }>;
}) {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur ring-1 ring-gray-200/70 dark:ring-white/10 shadow-soft p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Legend</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">สีประจำโรค (คงที่ทั้งระบบ)</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((it) => (
          <div
            key={it.name}
            className="flex items-center gap-3 rounded-xl ring-1 ring-gray-100 dark:ring-white/10 bg-white dark:bg-white/5 px-3 py-2"
          >
            <span
              className="h-3.5 w-3.5 rounded-full ring-2 ring-white/60 dark:ring-black/30"
              style={{ backgroundColor: it.color }}
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                {it.name}
              </div>
              {typeof it.count === "number" ? (
                <div className="text-xs text-gray-500 dark:text-gray-400">{it.count} รายการ</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
