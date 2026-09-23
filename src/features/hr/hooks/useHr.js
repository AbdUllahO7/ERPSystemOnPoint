import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrApi } from "../api/hr.api";

export function useEmployees(params = {}) {
  return useQuery({
    queryKey: ['hr', 'employees', params],
    queryFn: () => hrApi.employees.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useDepartments(params = {}) {
  return useQuery({
    queryKey: ['hr', 'departments', params],
    queryFn: () => hrApi.departments.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useLeaves(params = {}) {
  return useQuery({
    queryKey: ['hr', 'leaves', params],
    queryFn: () => hrApi.leaves.getAll(params),
    placeholderData: (prev) => prev,
  });
}
