import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingApi } from "../api/accounting.api";
import { queryKeys } from "@/lib/query-keys";
import toast from "react-hot-toast";

// 🧾 خطافات فواتير المحاسبة
export function useInvoices(params = {}) {
  return useQuery({
    queryKey: queryKeys.accounting.invoices(params),
    queryFn: () => accountingApi.invoices.getAll(params),
    placeholderData: (prev) => prev,
  });
}

// 💸 خطافات المصروفات
export function useExpenses(params = {}) {
  return useQuery({
    queryKey: queryKeys.accounting.expenses(params),
    queryFn: () => accountingApi.expenses.getAll(params),
    placeholderData: (prev) => prev,
  });
}

// 💵 خطافات الصناديق
export function useCashBoxes(params = {}) {
  return useQuery({
    queryKey: ['accounting', 'cash-boxes', params],
    queryFn: () => accountingApi.cashBoxes.getAll(params),
  });
}

// 🏦 خطافات البنوك
export function useBanks(params = {}) {
  return useQuery({
    queryKey: ['accounting', 'banks', params],
    queryFn: () => accountingApi.banks.getAll(params),
  });
}
