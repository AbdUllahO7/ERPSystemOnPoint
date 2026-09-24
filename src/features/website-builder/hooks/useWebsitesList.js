import { useState, useEffect, useCallback } from "react";
import { websiteBuilderApi } from "../api/website-builder.api";
import toast from "react-hot-toast";

export function useWebsitesList() {
  const [websites, setWebsites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWebsites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await websiteBuilderApi.getWebsites();
      setWebsites(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load websites");
      toast.error("Failed to load websites list");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const handleDeleteWebsite = useCallback(async (id) => {
    try {
      await websiteBuilderApi.deleteWebsite(id);
      setWebsites((prev) => prev.filter((w) => w.id !== id));
      toast.success("Website deleted successfully");
    } catch (err) {
      toast.error("Failed to delete website");
    }
  }, []);

  return {
    websites,
    isLoading,
    error,
    refetch: fetchWebsites,
    handleDeleteWebsite,
  };
}

export default useWebsitesList;
