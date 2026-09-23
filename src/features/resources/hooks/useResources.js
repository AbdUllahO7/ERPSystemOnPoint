import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourcesApi } from "../api/resources.api";
import { queryKeys } from "@/lib/query-keys";
import toast from "react-hot-toast";

export function useResources(params = {}) {
  return useQuery({
    queryKey: queryKeys.resources.list(params),
    queryFn: () => resourcesApi.getResources(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useResourceDetails(id) {
  return useQuery({
    queryKey: queryKeys.resources.detail(id),
    queryFn: () => resourcesApi.getResourceById(id),
    enabled: Boolean(id),
  });
}

export function useResourceMutations() {
  const queryClient = useQueryClient();

  const createResource = useMutation({
    mutationFn: (data) => resourcesApi.createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.lists() });
      toast.success("تم إضافة المورد بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل إضافة المورد");
    },
  });

  const updateResource = useMutation({
    mutationFn: ({ id, data }) => resourcesApi.updateResource(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.detail(variables.id) });
      toast.success("تم تحديث المورد بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل تحديث المورد");
    },
  });

  const deleteResource = useMutation({
    mutationFn: (id) => resourcesApi.deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.lists() });
      toast.success("تم حذف المورد بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل حذف المورد");
    },
  });

  return {
    createResource,
    updateResource,
    deleteResource,
  };
}
