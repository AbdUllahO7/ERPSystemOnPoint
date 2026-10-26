import { useState, useMemo } from "react";
import { Users, Trash2, Power } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  toggleUserStatus,
  deleteUserPermanently,
} from "@/lib/api";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import toast from "react-hot-toast";

export default function UsersTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState(null);

  const queryParams = useMemo(() => {
    const p = {
      PageNumber: page,
      PageSize: 10,
    };
    if (search.trim()) {
      p.Search = search.trim();
    }
    return p;
  }, [page, search]);

  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["getAllUsersSettings", queryParams],
    queryFn: () => getAllUsers(queryParams),
  });

  const toggleMutation = useMutation({
    mutationFn: (userId) => toggleUserStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllUsersSettings"]);
      queryClient.invalidateQueries(["getAllUsers"]);
      toast.success("User status toggled successfully!");
    },
    onError: (error) => {
      console.error("Failed to toggle user status:", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to toggle user status!"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => deleteUserPermanently(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllUsersSettings"]);
      queryClient.invalidateQueries(["getAllUsers"]);
      toast.success("User deleted permanently!");
      setDeleteUserId(null);
    },
    onError: (error) => {
      console.error("Failed to delete user permanently:", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to delete user permanently!"
      );
      setDeleteUserId(null);
    },
  });

  const rawUsers = useMemo(() => {
    const raw =
      usersResponse?.data?.items ||
      usersResponse?.data ||
      usersResponse?.items ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [usersResponse]);

  const totalPages = usersResponse?.data?.totalPages || 1;
  const currentPage = usersResponse?.data?.pageNumber || page;
  const totalCount =
    usersResponse?.data?.totalCount ??
    usersResponse?.data?.totalRecords ??
    rawUsers.length;

  const columns = [
    {
      key: "name",
      label: "Name",
      link: true,
      sortable: true,
      render: (row) => (
        <span className="font-medium text-foreground">
          {row.user_Name || row.userName || row.name || row.fullName || "-"}
        </span>
      ),
    },
    {
      key: "email",
      label: "E-mail",
      sortable: true,
      render: (row) => row.email || "-",
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (row) => {
        const role =
          row.role_Name ||
          row.roleName ||
          row.role ||
          (Array.isArray(row.roles) ? row.roles.join(", ") : "User");
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
            {role}
          </span>
        );
      },
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
      render: (row) => row.phoneNumber || row.phone || "-",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => {
        const isActive = Boolean(
          row.isActive ??
            (typeof row.status === "string"
              ? row.status.toLowerCase() === "active"
              : false)
        );
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              disabled={toggleMutation.isPending || toggleMutation.isLoading}
              onCheckedChange={() => toggleMutation.mutate(row.id)}
            />
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                isActive
                  ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
    },
  ];

  const rowActionsMenu = useMemo(
    () => [
      {
        items: [
          {
            key: "toggle",
            label: "Toggle Status",
            icon: Power,
            onClick: (row) => toggleMutation.mutate(row.id),
          },
          {
            key: "delete",
            label: "Delete Permanently",
            icon: Trash2,
            destructive: true,
            onClick: (row) => setDeleteUserId(row.id),
          },
        ],
      },
    ],
    [toggleMutation]
  );

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Top Card: Overview & Limits */}
      <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-transparent shrink-0">
            <Users className="w-8 h-8 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Users Management</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Adding and managing users, roles, and status
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto md:min-w-[360px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-muted-foreground">
              Active Accounts
            </span>
            <span className="text-sm font-bold text-foreground">{totalCount}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3.5 relative overflow-hidden flex items-center">
            <div
              className="bg-primary h-3.5 rounded-full absolute left-0 top-0 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(10, totalCount * 5))}%` }}
            ></div>
            <span className="absolute w-full text-center text-[10px] font-bold text-white z-10 leading-[14px]">
              {totalCount} Users
            </span>
          </div>
        </div>
      </div>

      {/* Main Table using DataView */}
      <DataView
        data={rawUsers}
        columns={columns}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        allowedViews={["table"]}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        rowActionsMenu={rowActionsMenu}
        onRefresh={() => refetch()}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search by username, email, or role...",
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
        }}
        emptyMessage="No users found"
        className="bg-transparent"
      />

      {/* Delete User Permanently Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={() => {
          if (deleteUserId) {
            deleteMutation.mutate(deleteUserId);
          }
        }}
        isLoading={deleteMutation.isPending || deleteMutation.isLoading}
        title="Delete User Permanently"
        description="Are you sure you want to permanently delete this user? This action cannot be undone and all data associated with this user will be removed."
      />
    </div>
  );
}
