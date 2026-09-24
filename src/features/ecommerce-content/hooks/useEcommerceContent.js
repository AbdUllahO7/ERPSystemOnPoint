import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DEFAULT_ECOMMERCE_HOME_SECTIONS,
  MOCK_STORE_BANNERS,
  MOCK_STORE_CATEGORIES_TABLE,
  MOCK_CATEGORY_PRODUCTS_ITEMS,
  DEFAULT_ECOMMERCE_PAYMENT_METHODS,
} from "../ecommerce-content.constants";
import { ecommerceContentApi } from "../api/ecommerce-content.api";
import toast from "react-hot-toast";

export const ECOMMERCE_HOME_CONFIG_QUERY_KEY = (siteId) => ["ecommerce-home-config", siteId];

export function useEcommerceContent({ websiteId = "site-2" } = {}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("home"); // 'home', 'products', 'settings'
  const [activeSubView, setActiveSubView] = useState(null); // 'banner', 'categories', 'product_lists', 'category_products'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sections, setSections] = useState(DEFAULT_ECOMMERCE_HOME_SECTIONS);
  const [banners, setBanners] = useState(MOCK_STORE_BANNERS);
  const [categories, setCategories] = useState(MOCK_STORE_CATEGORIES_TABLE);
  const [products, setProducts] = useState(MOCK_CATEGORY_PRODUCTS_ITEMS);
  const [paymentMethods] = useState(DEFAULT_ECOMMERCE_PAYMENT_METHODS);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);

  // Fetch initial store configuration with React Query caching
  const { data: serverConfig, isLoading } = useQuery({
    queryKey: ECOMMERCE_HOME_CONFIG_QUERY_KEY(websiteId),
    queryFn: () => ecommerceContentApi.getStoreHomeConfig(websiteId),
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (serverConfig) {
      if (serverConfig.sections) setSections(serverConfig.sections);
      if (serverConfig.banners) setBanners(serverConfig.banners);
      if (serverConfig.categories) setCategories(serverConfig.categories);
    }
  }, [serverConfig]);

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

  // Toggle Category Checkbox in Categories Table
  const handleToggleCategory = useCallback((catId) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, selected: !c.selected } : c))
    );
  }, []);

  // Toggle "Add All Product To E-Commerce" Checkbox
  const handleToggleCategoryAddAll = useCallback((catId) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, addAllProducts: !c.addAllProducts } : c
      )
    );
  }, []);

  // Toggle Single Product Selection
  const handleToggleProductItem = useCallback((prodId) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === prodId ? { ...p, selected: !p.selected } : p))
    );
  }, []);

  // Toggle All Products Selection
  const handleToggleAllProducts = useCallback(() => {
    setProducts((prev) => {
      const allSelected = prev.every((p) => p.selected);
      return prev.map((p) => ({ ...p, selected: !allSelected }));
    });
  }, []);

  // Toggle Payment Method Selection
  const handleTogglePaymentMethod = useCallback((pmId) => {
    setSelectedPaymentMethods((prev) =>
      prev.includes(pmId) ? prev.filter((id) => id !== pmId) : [...prev, pmId]
    );
  }, []);

  // Mutation for saving changes
  const saveMutation = useMutation({
    mutationFn: async () => {
      await ecommerceContentApi.updateBanners(websiteId, banners);
      await ecommerceContentApi.updateHomeCategories(websiteId, categories);
    },
    onSuccess: (_, variables, context) => {
      queryClient.setQueryData(ECOMMERCE_HOME_CONFIG_QUERY_KEY(websiteId), {
        sections,
        banners,
        categories,
      });
      toast.success("Changes saved successfully!");
      if (typeof context?.onSuccess === "function") context.onSuccess();
      if (selectedCategory) {
        setSelectedCategory(null);
      } else {
        setActiveSubView(null);
      }
    },
    onError: () => {
      toast.error("Failed to save changes");
    },
  });

  // Save changes to API
  const handleSaveChanges = useCallback(
    (onSuccess) => {
      saveMutation.mutate(undefined, {
        context: { onSuccess },
      });
    },
    [saveMutation]
  );

  return {
    activeTab,
    setActiveTab,
    activeSubView,
    setActiveSubView,
    selectedCategory,
    setSelectedCategory,
    sections,
    banners,
    categories,
    products,
    paymentMethods,
    selectedPaymentMethods,
    isLoading,
    isSaving: saveMutation.isPending,
    handleMoveSection,
    handleToggleSection,
    handleAddProductList,
    handleAddBanner,
    handleDeleteBanner,
    handleToggleCategory,
    handleToggleCategoryAddAll,
    handleToggleProductItem,
    handleToggleAllProducts,
    handleTogglePaymentMethod,
    handleSaveChanges,
  };
}

export default useEcommerceContent;
