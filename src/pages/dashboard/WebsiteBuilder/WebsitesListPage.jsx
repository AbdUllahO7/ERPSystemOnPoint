import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  Edit,
  PowerOff,
  ExternalLink,
  Plus,
  Loader2,
} from "lucide-react";
import { useWebsitesList, WEBSITE_TYPES } from "@/features/website-builder";

export function WebsitesListPage() {
  const { websites, isLoading, handleDeleteWebsite } = useWebsitesList();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="w-full py-16 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200/80">
            <Loader2 className="w-8 h-8 animate-spin text-[#0066d1]" />
            <span className="text-sm font-bold text-slate-500">
              Loading Website Control Panel...
            </span>
          </div>
        )}

        {/* Website Cards (1:1 with Figma Image 1) */}
        {!isLoading && (
          <div className="space-y-5">
            {websites.map((site, index) => {
              const isEcommerce =
                site.type === WEBSITE_TYPES.ECOMMERCE ||
                site.typeLabel === "E-Commerce" ||
                index === 0;

              const initials = isEcommerce ? "EN" : "WN";
              const typePrefix = isEcommerce ? "Ecommerce Name :" : "Website Name :";
              const siteName = site.name || (isEcommerce ? "EN" : "WN");
              const subdomain = site.subdomain || (isEcommerce ? "storex" : "websitename");
              const targetEditUrl = isEcommerce
                ? `/dashboard/web-service/ecommerce-content/${site.id}`
                : `/dashboard/web-service/content/${site.id}`;
              const previewUrl = isEcommerce ? "/" : "/profile";

              // Color scheme matching Figma: Card 1 is Rich Navy Blue, Card 2 is Dark Deep Blue/Black
              const cardBg = isEcommerce
                ? "bg-[#004e9a]"
                : "bg-[#091f36]";

              const iconBoxBg = isEcommerce
                ? "bg-[#0070df] text-white"
                : "bg-white text-[#091f36]";

              return (
                <div
                  key={site.id}
                  className={`${cardBg} rounded-2xl p-6 sm:p-7 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all`}
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-5">
                    {/* Initials Square Icon */}
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${iconBoxBg} font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-md`}
                    >
                      {initials}
                    </div>

                    {/* Site Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                          {typePrefix} {siteName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30">
                          {site.status || "Online"}
                        </span>
                      </div>

                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 hover:text-white font-medium transition-colors"
                      >
                        <span>www.{subdomain}.onpoint.com</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Right: Actions Buttons */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* 1. Website Preview */}
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Website preview</span>
                    </a>

                    {/* 2. Website management & design */}
                    <Link
                      to={targetEditUrl}
                      className="px-5 py-2.5 rounded-xl bg-[#28384d] hover:bg-[#33465e] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer border border-slate-600/40"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Website management & design</span>
                    </Link>

                    {/* 3. Stop publishing */}
                    <button
                      type="button"
                      onClick={() => handleDeleteWebsite(site.id)}
                      className="px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <PowerOff className="w-4 h-4" />
                      <span>Stop publishing</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="pt-8 pb-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/60 mt-8">
        <div>Copyright © ONPOINT</div>
        <div>
          Designed By <span className="font-bold text-[#0066d1]">ONPOINT</span>
        </div>
      </footer>
    </div>
  );
}

export default WebsitesListPage;
