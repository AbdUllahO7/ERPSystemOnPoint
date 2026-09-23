import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi } from "../api/appointments.api";
import { queryKeys } from "@/lib/query-keys";
import toast from "react-hot-toast";

/**
 * خطاف جلب قائمة المواعيد
 */
export function useAppointments(params = {}) {
  return useQuery({
    queryKey: queryKeys.appointments.list(params),
    queryFn: () => appointmentsApi.getAppointments(params),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * خطاف جلب تفاصيل موعد محدد
 */
export function useAppointmentDetails(id) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id),
    queryFn: () => appointmentsApi.getAppointmentById(id),
    enabled: Boolean(id),
  });
}

/**
 * خطاف إحصائيات المواعيد
 */
export function useAppointmentStats() {
  return useQuery({
    queryKey: ['appointments', 'stats'],
    queryFn: () => appointmentsApi.getStats(),
    staleTime: 60 * 1000,
  });
}

/**
 * خطاف Lookups المواعيد
 */
export function useAppointmentLookups() {
  return useQuery({
    queryKey: ['appointments', 'lookups'],
    queryFn: () => appointmentsApi.getLookups(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * خطافات العمليات (إنشاء، تعديل، حذف، وتغيير حالة المواعيد)
 */
export function useAppointmentMutations() {
  const queryClient = useQueryClient();

  const createAppointment = useMutation({
    mutationFn: (data) => appointmentsApi.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.lists() });
      toast.success("تم حجز الموعد بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل إنشاء الموعد");
    },
  });

  const updateAppointment = useMutation({
    mutationFn: ({ id, data }) => appointmentsApi.updateAppointment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.detail(variables.id) });
      toast.success("تم تحديث الموعد بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل تحديث الموعد");
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: (id) => appointmentsApi.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.lists() });
      toast.success("تم حذف الموعد بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل حذف الموعد");
    },
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }) => appointmentsApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.lists() });
      toast.success("تم تغيير حالة الموعد بنجاح");
    },
    onError: (error) => {
      toast.error(error?.message || "فشل تغيير الحالة");
    },
  });

  return {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    changeStatus,
  };
}

/**
 * خطاف جلب الخدمات
 */
export function useServices(params = {}) {
  return useQuery({
    queryKey: queryKeys.appointments.services(),
    queryFn: () => appointmentsApi.services.getServices(params),
  });
}
