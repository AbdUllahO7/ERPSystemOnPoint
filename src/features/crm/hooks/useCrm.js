import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "../api/crm.api";
import { queryKeys } from "@/lib/query-keys";
import toast from "react-hot-toast";

// 🏢 خطافات العملاء
export function useCustomers(params = {}) {
  return useQuery({
    queryKey: queryKeys.crm.contacts(params),
    queryFn: () => crmApi.customers.getAll(params),
    placeholderData: (prev) => prev,
  });
}

// 🎯 خطافات العملاء المحتملين
export function useLeads(params = {}) {
  return useQuery({
    queryKey: queryKeys.crm.deals(params),
    queryFn: () => crmApi.leads.getAll(params),
    placeholderData: (prev) => prev,
  });
}

// 📁 خطافات المشاريع
export function useProjects(params = {}) {
  return useQuery({
    queryKey: ['crm', 'projects', params],
    queryFn: () => crmApi.projects.getAll(params),
    placeholderData: (prev) => prev,
  });
}

// 🚚 خطافات الموردين
export function useSuppliers(params = {}) {
  return useQuery({
    queryKey: ['crm', 'suppliers', params],
    queryFn: () => crmApi.suppliers.getAll(params),
    placeholderData: (prev) => prev,
  });
}
