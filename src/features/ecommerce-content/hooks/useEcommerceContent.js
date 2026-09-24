import { useState, useCallback, useEffect } from "react";
import {
  DEFAULT_ECOMMERCE_HOME_SECTIONS,
  MOCK_STORE_BANNERS,
  MOCK_STORE_CATEGORIES_TABLE,
} from "../ecommerce-content.constants";
import { ecommerceContentApi } from "../api/ecommerce-content.api";
import toast from "react-hot-toast";

export function useEcommerceContent({ websiteId = "site-2" } = {}) {
  const [activeTab, setActiveTab] = useState("home");
  const [activeSubView, setActiveSubView] = useState(null); // 'banner', 'categories', 'product_lists'
  const [sections, setSections] = useState(DEFAULT_ECOMMERCE_HOME_SECTIONS);
  const [banners, setBanners] = useState(MOCK_STORE_BANNERS);
  const [categories, setCategories] = useState(MOCK_STORE_CATEGORIES_TABLE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch initial store configuration
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const data = await ecommerceContentApi.getStoreHomeConfig(websiteId);
        if (isMounted && data) {
          if (data.sections) setSections(data.sections);
          if (data.banners) setBanners(data.banners);
          if (data.categories) setCategories(data.categories);
        }
      } catch {
        toast.error("Failed to load e-commerce settings");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, [websiteId]);

  // Section Reordering
  const handleMoveSection = useCallback((index, direction) => {
    setSections((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const newSec = [...prev];
      const temp = newSec[index];
      newSec[index] = newSec[targetIndex];
      newSec[targetIndex] = temp;
      return newSec;
    });
  }, []);

  // Section Toggle Visibility
  const handleToggleSection = useCallback((id) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === "Apparent" ? "Hidden" : "Apparent" } : s
      )
    );
  }, []);

  // Add Product List
  const handleAddProductList = useCallback(() => {
    const newId = `product_lists_${Date.now()}`;
    const newItem = {
      id: newId,
      number: `3-${sections.length}`,
      title: `3-${sections.length}.Product lists`,
      status: "Apparent",
      canReorder: true,
      hasAddList: true,
    };
    setSections((prev) => [...prev, newItem]);
    toast.success("New product list section added!");
  }, [sections.length]);

  // Add Banner
  const handleAddBanner = useCallback(async (file) => {
    try {
      const url = await ecommerceContentApi.uploadBannerImage(file);
      const newBanner = {
        id: `ban-${Date.now()}`,
        imageUrl: url,
        title: "New Advertising Banner",
        tag: "PROMO",
      };
      setBanners((prev) => [...prev, newBanner]);
      toast.success("Banner added successfully!");
    } catch {
      toast.error("Failed to upload banner");
    }
  }, []);

  // Delete Banner
  const handleDeleteBanner = useCallback((bannerId) => {
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    toast.success("Banner removed");
  }, []);

  // Toggle Category Checkbox
  const handleToggleCategory = useCallback((catId) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, selected: !c.selected } : c))
    );
  }, []);

  // Save changes to API
  const handleSaveChanges = useCallback(async (onSuccess) => {
    setIsSaving(true);
    try {
      await ecommerceContentApi.updateBanners(websiteId, banners);
      await ecommerceContentApi.updateHomeCategories(websiteId, categories);
      toast.success("Changes saved successfully!");
      if (onSuccess) onSuccess();
      setActiveSubView(null);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }, [websiteId, banners, categories]);

  return {
    activeTab,
    setActiveTab,
    activeSubView,
    setActiveSubView,
    sections,
    banners,
    categories,
    isLoading,
    isSaving,
    handleMoveSection,
    handleToggleSection,
    handleAddProductList,
    handleAddBanner,
    handleDeleteBanner,
    handleToggleCategory,
    handleSaveChanges,
  };
}

export default useEcommerceContent;
