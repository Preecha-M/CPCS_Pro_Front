import Topbar from "../components/Topbar";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div>
      <Topbar />

      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-hero-gradient"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_200px_at_50%_0%,rgba(37,99,235,0.12),transparent)]"></div>

        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur text-xs text-gray-700 dark:text-gray-200 shadow-pill ring-1 ring-gray-200/60 dark:ring-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-leaf"></span> AI for Rice Disease · LINE Chatbot
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              วิเคราะห์โรคข้าวจากภาพถ่าย <span className="text-brand">แม่นยำ</span> ใช้งานง่ายผ่าน LINE
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              วิเคราะห์โรคใบข้าวจากภาพถ่ายผ่าน LINE พร้อมค่าความมั่นใจ และบันทึกพิกัดเพื่อทำแผนที่และสถิติแบบเรียลไทม์
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-sm px-5 py-3 rounded-xl bg-gradient-to-r from-brand to-blue-500 text-white shadow-pill hover:brightness-110 transition"
              >
                เปิดแดชบอร์ด
                <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
                  <path fill="currentColor" d="M13 5l7 7-7 7v-4H4v-6h9V5z" />
                </svg>
              </Link>
              <Link
                to="/guide"
                className="inline-flex items-center gap-2 text-sm px-5 py-3 rounded-xl border border-gray-300/80 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur hover:bg-white transition"
              >
                คู่มือการใช้งาน
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-sm">
              <span className="px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 dark:bg-white/5 dark:border-white/10">⚡️ ผลลัพธ์รวดเร็ว</span>
              <span className="px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 dark:bg-white/5 dark:border-white/10">🗺️ แผนที่ความเสี่ยง</span>
              <span className="px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-700 dark:bg-white/5 dark:border-white/10">🔒 รักษาความเป็นส่วนตัว</span>
            </div>
          </div>

          <div className="mt-12">
            <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur ring-1 ring-gray-200/70 dark:ring-white/10 shadow-soft">
              <img
                src="https://qr-official.line.me/gs/M_317porib_BW.png?oat_content=qr"
                alt="LINE QR"
                loading="lazy"
                className="w-28 h-28 rounded-xl object-contain bg-white dark:bg-white/10 p-2 float"
              />
              <div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">สแกนเพื่อเริ่มใช้งาน</div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">เพิ่มเพื่อน LINE และส่งภาพใบข้าวเพื่อรับผลวินิจฉัย</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 pb-16">
        <section className="py-10 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
            ระบบของเรารับภาพใบข้าวจากผู้ใช้ผ่าน LINE จากนั้นโมเดล Deep Learning จะจำแนกโรคและให้ค่าความมั่นใจทันที ข้อมูลผลลัพธ์และพิกัดถูกจัดเก็บเพื่อนำไปสรุปบนแดชบอร์ด ทั้งกราฟสัดส่วน แนวโน้มตามเวลา และแผนที่ความเสี่ยง
          </p>
        </section>

        <section className="py-10 border-b border-gray-100 dark:border-white/10 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Features</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">🧠</div>
                <h3 className="font-semibold">วิเคราะห์จากภาพถ่าย</h3>
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">วิเคราะห์ภาพทันที: จำแนกโรคข้าว</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">📊</div>
                <h3 className="font-semibold">แดชบอร์ดภาพรวม</h3>
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                แผนที่ความเสี่ยง รวมผลพร้อมพิกัดเพื่อดูจุดระบาด สัดส่วนโรคและแนวโน้มตามช่วงเวลา
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 shadow-soft md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-leaf/10 text-leaf flex items-center justify-center">🔗</div>
                <h3 className="font-semibold">ใช้งานผ่าน LINE</h3>
              </div>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                ใช้งานง่ายผ่าน LINE ไม่ต้องติดตั้งแอปเพิ่ม คำนึงถึงความเป็นส่วนตัว จัดเก็บเฉพาะข้อมูลที่จำเป็น
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-2xl font-bold tracking-tight">System Components</h2>
          <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
            <li>• LINE Messaging API สำหรับรับภาพ/พิกัดจากผู้ใช้</li>
            <li>• FastAPI Backend และบริการโมเดล AI</li>
            <li>• MongoDB สำหรับจัดเก็บผลและเมทาดาทา</li>
            <li>• Admin Dashboard สำหรับวิเคราะห์ข้อมูลและติดตามสถานการณ์</li>
          </ul>
        </section>

        <section className="py-10 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-2xl font-bold tracking-tight">Links</h2>
          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <Link
              to="/admin"
              className="group inline-flex items-center justify-between gap-3 px-5 py-3 rounded-xl border bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 hover:bg-brand hover:text-white hover:ring-transparent shadow-soft transition"
            >
              Admin Dashboard
              <span className="opacity-70 group-hover:opacity-100 transition">↗</span>
            </Link>
            <Link
              to="/guide"
              className="group inline-flex items-center justify-between gap-3 px-5 py-3 rounded-xl border bg-white dark:bg-white/5 ring-1 ring-gray-100 dark:ring-white/10 hover:bg-gray-50 dark:hover:bg-white/10 shadow-soft transition"
            >
              User Guide
              <span className="opacity-70 group-hover:opacity-100 transition">→</span>
            </Link>
          </div>
        </section>

        <section id="contact" className="py-10">
          <h2 className="text-2xl font-bold tracking-tight">Contact</h2>
          <div className="mt-3 text-gray-700 dark:text-gray-300">
            <p>วิทยาลัยการคอมพิวเตอร์ สาขาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น</p>
            <p>
              อีเมล:{" "}
              <a href="mailto:computing.kku@kku.ac.th" className="text-brand hover:underline">
                computing.kku@kku.ac.th
              </a>
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Rice Disease Project — Computer Science, KKU
        </div>
      </footer>
    </div>
  );
}
