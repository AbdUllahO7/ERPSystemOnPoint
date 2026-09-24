import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ContentEditorTabs,
  ContentEditorActions,
  HeroContentEditor,
  StatsContentEditor,
  AboutContentEditor,
  ServicesContentEditor,
  CtaContentEditor,
  FaqContentEditor,
  ContactContentEditor,
  FooterContentEditor,
} from "@/components/dashboard/content-editor";
import { useWebsiteContent } from "@/features/website-content";

export function WebsiteContentEditorPage() {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const {
    activeTab,
    setActiveTab,
    isLoading,
    isSaving,
    hasPrevious,
    hasNext,
    goToPreviousTab,
    goToNextTab,
    hero,
    setHero,
    updateHeroPhoto,
    statistics,
    setStatistics,
    about,
    setAbout,
    services,
    setServices,
    cta,
    setCta,
    faq,
    setFaq,
    contact,
    setContact,
    footer,
    setFooter,
    saveSection,
  } = useWebsiteContent({ websiteId });

  const handleFieldUpdate = (section, field, value) => {
    switch (section) {
      case "hero":
        setHero((prev) => ({ ...prev, [field]: value }));
        break;
      case "statistics":
        setStatistics((prev) => ({ ...prev, [field]: value }));
        break;
      case "about":
        setAbout((prev) => ({ ...prev, [field]: value }));
        break;
      case "services":
        setServices((prev) => ({ ...prev, [field]: value }));
        break;
      case "cta":
        setCta((prev) => ({ ...prev, [field]: value }));
        break;
      case "faq":
        setFaq((prev) => ({ ...prev, [field]: value }));
        break;
      case "contact":
        setContact((prev) => ({ ...prev, [field]: value }));
        break;
      case "footer":
        setFooter((prev) => ({ ...prev, [field]: value }));
        break;
      default:
        break;
    }
  };

  const handleNextWithSave = async () => {
    await saveSection(activeTab);
    goToNextTab();
  };

  const handleSaveAll = async () => {
    await saveSection(activeTab);
    navigate("/profile");
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-6">
        {/* Top 2 Cards: Section Tabs (Left) & Actions (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* Tabs Navigation Card */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            <ContentEditorTabs
              activeTab={activeTab}
              onTabClick={(tabId) => setActiveTab(tabId)}
            />
          </div>

          {/* Action Card */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <ContentEditorActions
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPrevious={goToPreviousTab}
              onNext={handleNextWithSave}
              onSave={handleSaveAll}
              isSaving={isSaving}
            />
          </div>
        </div>

        {/* Section Dynamic Content Editor */}
        <div className="w-full">
          {activeTab === "hero" && (
            <HeroContentEditor
              data={hero}
              onChange={(field, val) => handleFieldUpdate("hero", field, val)}
              onUploadPhoto={updateHeroPhoto}
            />
          )}

          {activeTab === "statistics" && (
            <StatsContentEditor
              data={statistics}
              onChange={(field, val) => handleFieldUpdate("statistics", field, val)}
            />
          )}

          {activeTab === "about" && (
            <AboutContentEditor
              data={about}
              onChange={(field, val) => handleFieldUpdate("about", field, val)}
            />
          )}

          {activeTab === "services" && (
            <ServicesContentEditor
              data={services}
              onChange={(field, val) => handleFieldUpdate("services", field, val)}
            />
          )}

          {activeTab === "cta" && (
            <CtaContentEditor
              data={cta}
              onChange={(field, val) => handleFieldUpdate("cta", field, val)}
            />
          )}

          {activeTab === "faq" && (
            <FaqContentEditor
              data={faq}
              onChange={(field, val) => handleFieldUpdate("faq", field, val)}
            />
          )}

          {activeTab === "contact" && (
            <ContactContentEditor
              data={contact}
              onChange={(field, val) => handleFieldUpdate("contact", field, val)}
            />
          )}

          {activeTab === "footer" && (
            <FooterContentEditor
              data={footer}
              onChange={(field, val) => handleFieldUpdate("footer", field, val)}
            />
          )}
        </div>
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

export default WebsiteContentEditorPage;
