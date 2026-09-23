import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory.api";

export function useItems(params = {}) {
  return useQuery({
    queryKey: ['inventory', 'items', params],
    queryFn: () => inventoryApi.items.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useWarehouses(params = {}) {
  return useQuery({
    queryKey: ['inventory', 'warehouses', params],
    queryFn: () => inventoryApi.warehouses.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useTransfers(params = {}) {
  return useQuery({
    queryKey: ['inventory', 'transfers', params],
    queryFn: () => inventoryApi.transfers.getAll(params),
    placeholderData: (prev) => prev,
  });
}
