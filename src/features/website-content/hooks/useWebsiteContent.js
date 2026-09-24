import { useState, useCallback, useEffect } from "react";
import {
  CONTENT_SECTION_TABS,
  INITIAL_HERO_CONTENT,
  INITIAL_STATISTICS_CONTENT,
  INITIAL_ABOUT_CONTENT,
  INITIAL_SERVICES_CONTENT,
  INITIAL_CTA_CONTENT,
  INITIAL_FAQ_CONTENT,
  INITIAL_CONTACT_CONTENT,
  INITIAL_FOOTER_CONTENT,
} from "../website-content.constants";
import { websiteContentApi } from "../api/website-content.api";
import toast from "react-hot-toast";

export function useWebsiteContent({ websiteId = "site-1" } = {}) {
  const [activeTab, setActiveTab] = useState("hero");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Section states
  const [hero, setHero] = useState(INITIAL_HERO_CONTENT);
  const [statistics, setStatistics] = useState(INITIAL_STATISTICS_CONTENT);
  const [about, setAbout] = useState(INITIAL_ABOUT_CONTENT);
  const [services, setServices] = useState(INITIAL_SERVICES_CONTENT);
  const [cta, setCta] = useState(INITIAL_CTA_CONTENT);
  const [faq, setFaq] = useState(INITIAL_FAQ_CONTENT);
  const [contact, setContact] = useState(INITIAL_CONTACT_CONTENT);
  const [footer, setFooter] = useState(INITIAL_FOOTER_CONTENT);

  // Fetch initial content
  useEffect(() => {
    let isMounted = true;
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const data = await websiteContentApi.getAllContent(websiteId);
        if (isMounted && data) {
          if (data.hero) setHero(data.hero);
          if (data.statistics) setStatistics(data.statistics);
          if (data.about) setAbout(data.about);
          if (data.services) setServices(data.services);
          if (data.cta) setCta(data.cta);
          if (data.faq) setFaq(data.faq);
          if (data.contact) setContact(data.contact);
          if (data.footer) setFooter(data.footer);
        }
      } catch {
        toast.error("Failed to load section content");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchContent();
    return () => {
      isMounted = false;
    };
  }, [websiteId]);

  // Tab navigation
  const currentTabIndex = CONTENT_SECTION_TABS.findIndex((t) => t.id === activeTab);
  const hasPrevious = currentTabIndex > 0;
  const hasNext = currentTabIndex < CONTENT_SECTION_TABS.length - 1;

  const goToPreviousTab = useCallback(() => {
    if (hasPrevious) {
      setActiveTab(CONTENT_SECTION_TABS[currentTabIndex - 1].id);
    }
  }, [currentTabIndex, hasPrevious]);

  const goToNextTab = useCallback(() => {
    if (hasNext) {
      setActiveTab(CONTENT_SECTION_TABS[currentTabIndex + 1].id);
    }
  }, [currentTabIndex, hasNext]);

  // Update Hero photo slot
  const updateHeroPhoto = useCallback(async (placeNumber, file) => {
    try {
      const url = await websiteContentApi.uploadSectionMedia(file);
      setHero((prev) => ({
        ...prev,
        photos: prev.photos.map((p) =>
          p.place === placeNumber ? { ...p, url } : p
        ),
      }));
      toast.success(`Photo for Place ${placeNumber} updated!`);
    } catch {
      toast.error("Failed to upload photo");
    }
  }, []);

  // Save current section content to API
  const saveSection = useCallback(
    async (sectionKey = activeTab, customPayload = null) => {
      setIsSaving(true);
      let payload = customPayload;
      if (!payload) {
        switch (sectionKey) {
          case "hero":
            payload = hero;
            break;
          case "statistics":
            payload = statistics;
            break;
          case "about":
            payload = about;
            break;
          case "services":
            payload = services;
            break;
          case "cta":
            payload = cta;
            break;
          case "faq":
            payload = faq;
            break;
          case "contact":
            payload = contact;
            break;
          case "footer":
            payload = footer;
            break;
          default:
            payload = {};
        }
      }

      try {
        await websiteContentApi.updateSectionContent(websiteId, sectionKey, payload);
        toast.success("Changes saved successfully!");
      } catch {
        toast.error("Failed to save changes");
      } finally {
        setIsSaving(false);
      }
    },
    [activeTab, hero, statistics, about, services, cta, faq, contact, footer, websiteId]
  );

  return {
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
  };
}

export default useWebsiteContent;
