import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { websiteBuilderApi } from "../api/website-builder.api";
import toast from "react-hot-toast";

export const WEBSITES_QUERY_KEY = ["websites"];

export function useWebsitesList() {
  const queryClient = useQueryClient();

  // Fetch websites list with TanStack React Query caching
  const {
    data: websites = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: WEBSITES_QUERY_KEY,
    queryFn: async () => {
      const data = await websiteBuilderApi.getWebsites();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60 * 1000, // 1 minute cache validity
  });

  // Delete Website Mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: (id) => websiteBuilderApi.deleteWebsite(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: WEBSITES_QUERY_KEY });
      const previousWebsites = queryClient.getQueryData(WEBSITES_QUERY_KEY);
      queryClient.setQueryData(WEBSITES_QUERY_KEY, (old = []) =>
        old.filter((w) => w.id !== id)
      );
      return { previousWebsites };
    },
    onError: (err, id, context) => {
      if (context?.previousWebsites) {
        queryClient.setQueryData(WEBSITES_QUERY_KEY, context.previousWebsites);
      }
      toast.error("Failed to delete website");
    },
    onSuccess: () => {
      toast.success("Website deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WEBSITES_QUERY_KEY });
    },
  });

  const handleDeleteWebsite = useCallback(
    (id) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  return {
    websites,
    isLoading,
    error: error?.message || null,
    refetch,
    handleDeleteWebsite,
  };
}

export default useWebsitesList;
