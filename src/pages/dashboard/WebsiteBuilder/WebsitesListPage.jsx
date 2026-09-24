import React from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  ShoppingCart,
  Plus,
  ExternalLink,
  Settings,
  Edit,
  CheckCircle2,
  Layers,
  Sparkles,
  Eye,
} from "lucide-react";

export function WebsitesListPage() {
  const websites = [
    {
      id: "site-1",
      name: "ONPOINT Corporate Profile",
      type: "Company Profile",
      domain: "onpoint.com/profile",
      url: "/profile",
      status: "Published",
      lastUpdated: "Today, 12:30 PM",
      sectionsCount: 9,
      icon: Globe,
      color: "from-blue-600 to-indigo-600",
      description: "Official corporate website showcasing services, about us, client stats, and contact form.",
    },
    {
      id: "site-2",
      name: "ONPOINT E-Commerce Store",
      type: "E-Commerce",
      domain: "onpoint.com/shop",
      url: "/",
      status: "Published",
      lastUpdated: "Yesterday, 04:15 PM",
      sectionsCount: 8,
      icon: ShoppingCart,
      color: "from-amber-500 to-orange-600",
      description: "Digital store for selling hardware, accessories, software licenses with shopping cart & checkout.",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 min-h-[calc(100vh-80px)] flex flex-col justify-between">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066d1] flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Web Service Management
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Manage your Corporate Profile & E-Commerce websites in one place
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/web-service/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Create New Website
          </Link>
        </div>

        {/* Website Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {websites.map((site) => {
            const Icon = site.icon;
            return (
              <div
                key={site.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-6 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Top Badge & Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${site.color} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0066d1] uppercase tracking-wider block">
                        {site.type}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900">
                        {site.name}
                      </h3>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 text-xs font-bold shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {site.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {site.description}
                </p>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block">Sections:</span>
                    <span className="font-bold text-slate-800">{site.sectionsCount} Active Sections</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Last Updated:</span>
                    <span className="font-bold text-slate-800">{site.lastUpdated}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to="/dashboard/web-service/create"
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-[#0066d1] hover:text-[#0066d1] bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-2xs transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Sections
                  </Link>

                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 pb-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/60 mt-8">
        <div>Copyright © ONPOINT</div>
        <div>Designed By <span className="font-bold text-[#0066d1]">ONPOINT</span></div>
      </footer>
    </div>
  );
}

export default WebsitesListPage;
