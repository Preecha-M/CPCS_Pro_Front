import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * แจ้ง backend เมื่อเปลี่ยนหน้า (SPA) เพื่อเก็บประวัติการเข้าชม
 */
export default function PageViewBeacon() {
  const loc = useLocation();

  useEffect(() => {
    void fetch("/api/activity/page-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ path: loc.pathname + loc.search }),
    }).catch(() => {});
  }, [loc.pathname, loc.search]);

  return null;
}
