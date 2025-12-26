import React from "react";
import Topbar from "../Topbar";

type FooterVariant = "default" | "minimal" | "none";

type SiteLayoutProps = {
  children: React.ReactNode;
  showTopbar?: boolean;
  footerVariant?: FooterVariant;
  showDigitalOceanBadge?: boolean;
};

export default function SiteLayout({
  children,
  showTopbar = true,
  footerVariant = "default",
  showDigitalOceanBadge = false,
}: SiteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showTopbar && <Topbar />}

      <div className="flex-1">{children}</div>

      {footerVariant !== "none" && (
        <footer className="border-t border-gray-100 dark:border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              © {new Date().getFullYear()} Rice Disease Project — Computer Science
            </div>

            {footerVariant === "default" && showDigitalOceanBadge && (
              <a
                href="https://www.digitalocean.com/?refcode=81b1410fbada&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100 transition"
              >
                <img
                  src="https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%201.svg"
                  alt="DigitalOcean Referral Badge"
                  className="h-8 w-auto"
                />
              </a>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
