import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "../api/events.api";
import { queryKeys } from "@/lib/query-keys";
import toast from "react-hot-toast";

export function useEvents(params = {}) {
  return useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => eventsApi.getEvents(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useEventDetails(id) {
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => eventsApi.getEventById(id),
    enabled: Boolean(id),
  });
}

export function useEventMutations() {
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: (data) => eventsApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
      toast.success("تم إنشاء الفعالية بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل إنشاء الفعالية");
    },
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, data }) => eventsApi.updateEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.id) });
      toast.success("تم تحديث الفعالية بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل تحديث الفعالية");
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (id) => eventsApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
      toast.success("تم حذف الفعالية بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل حذف الفعالية");
    },
  });

  return {
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
