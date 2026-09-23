import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rentalsApi } from "../api/rentals.api";
import { queryKeys } from "@/lib/query-keys";
import toast from "react-hot-toast";

/**
 * خطاف جلب قائمة الإيجارات مع التخزين المؤقت الموحد
 */
export function useRentals(params = {}) {
  return useQuery({
    queryKey: queryKeys.rentals.list(params),
    queryFn: () => rentalsApi.getRentals(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * خطاف جلب تفاصيل إيجار محدد
 */
export function useRentalDetails(id) {
  return useQuery({
    queryKey: queryKeys.rentals.detail(id),
    queryFn: () => rentalsApi.getRentalById(id),
    enabled: Boolean(id),
  });
}

/**
 * خطاف جلب إحصائيات الإيجارات
 */
export function useRentalStats() {
  return useQuery({
    queryKey: ['rentals', 'stats'],
    queryFn: () => rentalsApi.getStats(),
    staleTime: 60 * 1000,
  });
}

/**
 * خطاف جلب بيانات Lookups الخاصة بالإيجارات
 */
export function useRentalLookups() {
  return useQuery({
    queryKey: ['rentals', 'lookups'],
    queryFn: () => rentalsApi.getLookups(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * خطافات العمليات (إنشاء، تعديل، حذف الإيجارات)
 */
export function useRentalMutations() {
  const queryClient = useQueryClient();

  const createRental = useMutation({
    mutationFn: (data) => rentalsApi.createRental(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.lists() });
      toast.success("تم إنشاء عقد الإيجار بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل إنشاء عقد الإيجار");
    },
  });

  const updateRental = useMutation({
    mutationFn: ({ id, data }) => rentalsApi.updateRental(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.detail(variables.id) });
      toast.success("تم تحديث عقد الإيجار بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل تحديث عقد الإيجار");
    },
  });

  const deleteRental = useMutation({
    mutationFn: (id) => rentalsApi.deleteRental(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rentals.lists() });
      toast.success("تم حذف عقد الإيجار بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل حذف عقد الإيجار");
    },
  });

  return {
    createRental,
    updateRental,
    deleteRental,
  };
}

/**
 * خطاف جلب فواتير الإيجار
 */
export function useRentalInvoices(params = {}) {
  return useQuery({
    queryKey: queryKeys.rentals.invoices(params?.rentalId),
    queryFn: () => rentalsApi.invoices.getInvoices(params),
    placeholderData: (previousData) => previousData,
  });
}
