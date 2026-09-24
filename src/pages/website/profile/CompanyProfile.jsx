import React from "react";
import {
  ProfileHeader,
  ProfileHero,
  ProfileStats,
  ProfileAbout,
  ProfileServices,
  ProfileCtaBanner,
  ProfileFaq,
  ProfileContact,
  ProfileFooter,
} from "@/components/profile";

export function CompanyProfile() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 overflow-x-hidden font-sans">
      {/* 1. Standalone Header */}
      <ProfileHeader onNavigate={scrollToSection} />

      {/* 2. Hero Section */}
      <ProfileHero onContactClick={() => scrollToSection("contact")} />

      {/* 3. Stats Section */}
      <ProfileStats />

      {/* 4. About Section */}
      <ProfileAbout onContactClick={() => scrollToSection("contact")} />

      {/* 5. Our Services Section */}
      <ProfileServices />

      {/* 6. CTA Banner */}
      <ProfileCtaBanner onContactClick={() => scrollToSection("contact")} />

      {/* 7. FAQ Section */}
      <ProfileFaq />

      {/* 8. Contact Section */}
      <ProfileContact />

      {/* 9. Standalone Footer */}
      <ProfileFooter onNavigate={scrollToSection} />
    </div>
  );
}

export default CompanyProfile;
