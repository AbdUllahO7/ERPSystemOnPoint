import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi } from "../api/reservations.api";
import { queryKeys } from "@/lib/query-keys";
import toast from "react-hot-toast";

export function useReservations(params = {}) {
  return useQuery({
    queryKey: queryKeys.reservations.list(params),
    queryFn: () => reservationsApi.getReservations(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useReservationDetails(id) {
  return useQuery({
    queryKey: queryKeys.reservations.detail(id),
    queryFn: () => reservationsApi.getReservationById(id),
    enabled: Boolean(id),
  });
}

export function useReservationLookups() {
  return useQuery({
    queryKey: queryKeys.reservations.lookups(),
    queryFn: () => reservationsApi.getLookups(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useReservationMutations() {
  const queryClient = useQueryClient();

  const createReservation = useMutation({
    mutationFn: (data) => reservationsApi.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.lists() });
      toast.success("تم إنشاء الحجز بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل إنشاء الحجز");
    },
  });

  const updateReservation = useMutation({
    mutationFn: ({ id, data }) => reservationsApi.updateReservation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.detail(variables.id) });
      toast.success("تم تحديث الحجز بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل تحديث الحجز");
    },
  });

  const deleteReservation = useMutation({
    mutationFn: (id) => reservationsApi.deleteReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.lists() });
      toast.success("تم حذف الحجز بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل حذف الحجز");
    },
  });

  return {
    createReservation,
    updateReservation,
    deleteReservation,
  };
}
