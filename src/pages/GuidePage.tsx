import Topbar from "../components/Topbar";
import guideImg from "../guide_images/guide.png";

export default function GuidePage() {
  return (
    <div>
      <Topbar />

      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-hero-gradient"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_200px_at_50%_0%,rgba(37,99,235,0.12),transparent)]"></div>

        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            วิธีการใช้งาน LINE Chatbot
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            ทำตามขั้นตอนง่าย ๆ ในรูปภาพด้านล่าง เพื่อใช้งานระบบวิเคราะห์โรคข้าวผ่าน LINE
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 pb-16 space-y-10">
        <div className="rounded-2xl overflow-hidden shadow-soft ring-1 ring-gray-200 dark:ring-white/10">
          <img src={guideImg} alt="คู่มือการใช้งาน - ภาพที่ 1" className="w-full" />
        </div>
      </main>

      <footer className="border-t border-gray-100 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-500 dark:text-gray-400 text-center">
          © {new Date().getFullYear()} Rice Disease Project — Computer Science, KKU
        </div>
      </footer>
    </div>
  );
}
