import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const WEBSITE_CONTENT_QUERY_KEY = (siteId) => ["website-content", siteId];

export function useWebsiteContent({ websiteId = "site-1" } = {}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("hero");

  // Section states
  const [hero, setHero] = useState(INITIAL_HERO_CONTENT);
  const [statistics, setStatistics] = useState(INITIAL_STATISTICS_CONTENT);
  const [about, setAbout] = useState(INITIAL_ABOUT_CONTENT);
  const [services, setServices] = useState(INITIAL_SERVICES_CONTENT);
  const [cta, setCta] = useState(INITIAL_CTA_CONTENT);
  const [faq, setFaq] = useState(INITIAL_FAQ_CONTENT);
  const [contact, setContact] = useState(INITIAL_CONTACT_CONTENT);
  const [footer, setFooter] = useState(INITIAL_FOOTER_CONTENT);

  // Fetch initial content with React Query
  const { data: serverContent, isLoading } = useQuery({
    queryKey: WEBSITE_CONTENT_QUERY_KEY(websiteId),
    queryFn: () => websiteContentApi.getAllContent(websiteId),
    staleTime: 60 * 1000,
  });

  // Sync server data into editable local section states
  useEffect(() => {
    if (serverContent) {
      if (serverContent.hero) setHero(serverContent.hero);
      if (serverContent.statistics) setStatistics(serverContent.statistics);
      if (serverContent.about) setAbout(serverContent.about);
      if (serverContent.services) setServices(serverContent.services);
      if (serverContent.cta) setCta(serverContent.cta);
      if (serverContent.faq) setFaq(serverContent.faq);
      if (serverContent.contact) setContact(serverContent.contact);
      if (serverContent.footer) setFooter(serverContent.footer);
    }
  }, [serverContent]);

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

  // Save Section Mutation
  const saveMutation = useMutation({
    mutationFn: ({ sectionKey, payload }) =>
      websiteContentApi.updateSectionContent(websiteId, sectionKey, payload),
    onSuccess: (data, { sectionKey, payload }) => {
      // Update cache
      queryClient.setQueryData(WEBSITE_CONTENT_QUERY_KEY(websiteId), (old = {}) => ({
        ...old,
        [sectionKey]: payload,
      }));
      toast.success("Changes saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save changes");
    },
  });

  // Save current section content
  const saveSection = useCallback(
    async (sectionKey = activeTab, customPayload = null) => {
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

      saveMutation.mutate({ sectionKey, payload });
    },
    [activeTab, hero, statistics, about, services, cta, faq, contact, footer, saveMutation]
  );

  return {
    activeTab,
    setActiveTab,
    isLoading,
    isSaving: saveMutation.isPending,
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
