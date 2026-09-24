import React from "react";
import { Globe } from "lucide-react";

export function ProfileAbout({ onContactClick }) {
  return (
    <section id="about" className="py-16 md:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Visual with Badge */}
        <div className="lg:col-span-6 relative">
          {/* Decorative Dot Grid */}
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-70 pointer-events-none" />

          {/* Main About Photo */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
              alt="On Point Team Discussion"
              className="w-full h-80 sm:h-96 md:h-[440px] object-cover"
            />

            {/* Floating Badge (100+ Successful Projects) */}
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-100 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                  100+
                </h4>
                <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">
                  Successful Projects
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: About Content */}
        <div className="lg:col-span-6 space-y-6">
          <span className="inline-block px-3.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-200/80">
            About On Point
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Ideas Made Clear <br />
            Solutions Built Right
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            <p>
              On Point is a digital solutions company dedicated to helping businesses build a stronger, smarter, and
              more effective presence. From strategy and branding to design, development, and digital growth, our
              team transforms business ideas into practical solutions that deliver measurable value.
            </p>
            <p>
              We believe every successful project begins with understanding. That's why we work closely with our
              clients to create solutions that match their goals, audience, and future ambitions.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onContactClick}
              className="px-8 py-3 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              Contact US
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfileAbout;
