import React from "react";
import { Box } from "lucide-react";

export function ProfileServices() {
  const services = [
    {
      id: "service-1",
      title: "Branding & UI/UX",
      description: "Build a distinctive brand and create intuitive digital experiences",
    },
    {
      id: "service-2",
      title: "Branding & UI/UX",
      description: "Build a distinctive brand and create intuitive digital experiences",
    },
    {
      id: "service-3",
      title: "Branding & UI/UX",
      description: "Build a distinctive brand and create intuitive digital experiences",
    },
  ];

  return (
    <section id="services" className="bg-[#f1f5f9]/60 py-16 md:py-24 px-4 sm:px-8 border-y border-slate-200/60">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block px-3.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-200/80">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything Your Business Needs to Grow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Flexible digital services designed around your business goals
          </p>
        </div>

        {/* 3 Services Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_35px_rgba(0,102,209,0.08)] hover:border-blue-200 transition-all space-y-5 group"
            >
              {/* Service Icon */}
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066d1] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#0066d1] group-hover:text-white transition-all shadow-xs">
                <Box className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0066d1] transition-colors">
                {srv.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {srv.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProfileServices;
