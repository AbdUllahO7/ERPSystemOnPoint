import { useMemo, useState } from "react";
import {
  User,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Shield,
  Trash2,
  RefreshCw,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DataView } from "@/components/data-view/DataView";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  toggleUserStatus,
  deleteUserPermanently,
} from "@/lib/api";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import toast from "react-hot-toast";

const STATUS_FILTERS = [
  { key: "all", label: "All Users" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

function StatusCell({ row, onToggle, isToggling }) {
  const isActive = Boolean(
    row.isActive ??
      (typeof row.status === "string"
        ? row.status.toLowerCase() === "active"
        : false)
  );

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={isActive}
        disabled={isToggling}
        onCheckedChange={() => onToggle(row.id)}
      />
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

export default function Users() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState(null);

  const queryParams = useMemo(() => {
    const p = {
      PageNumber: page,
      PageSize: 10,
    };
    if (search.trim()) {
      p.Search = search.trim();
    }
    if (statusFilter === "active") {
      p.IsActive = true;
    } else if (statusFilter === "inactive") {
      p.IsActive = false;
    }
    return p;
  }, [page, search, statusFilter]);

  const {
    data: usersResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["getAllUsers", queryParams],
    queryFn: () => getAllUsers(queryParams),
  });

  const toggleMutation = useMutation({
    mutationFn: (userId) => toggleUserStatus(userId),
    onSuccess: () => {
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

  const displayRows = useMemo(() => {
    return rawUsers.filter((u) => {
      const isActive = Boolean(
        u.isActive ??
          (typeof u.status === "string"
            ? u.status.toLowerCase() === "active"
            : false)
      );

      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;

      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const name = (u.user_Name || u.userName || u.name || u.fullName || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const phone = (u.phoneNumber || u.phone || "").toLowerCase();
        const role = (u.role_Name || u.roleName || u.role || "").toLowerCase();
        return (
          name.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          role.includes(query)
        );
      }
      return true;
    });
  }, [rawUsers, statusFilter, search]);

  const activeCount = useMemo(() => {
    return rawUsers.filter((u) =>
      Boolean(
        u.isActive ??
          (typeof u.status === "string"
            ? u.status.toLowerCase() === "active"
            : false)
      )
    ).length;
  }, [rawUsers]);

  const inactiveCount = rawUsers.length - activeCount;

  const statsCards = useMemo(
    () => [
      {
        id: "total",
        title: "Total Users",
        value: totalCount,
        icon: UsersIcon,
        color: "blue",
      },
      {
        id: "active",
        title: "Active Users",
        value: activeCount,
        icon: UserCheck,
        color: "green",
      },
      {
        id: "inactive",
        title: "Inactive Users",
        value: inactiveCount,
        icon: UserX,
        color: "orange",
      },
      {
        id: "roles",
        title: "Unique Roles",
        value: new Set(
          rawUsers
            .map((u) => u.role_Name || u.roleName || u.role)
            .filter(Boolean)
        ).size || 1,
        icon: Shield,
        color: "indigo",
      },
    ],
    [totalCount, activeCount, inactiveCount, rawUsers]
  );

  const columns = [
    {
      key: "id",
      label: "User ID",
      sortable: true,
      render: (row) => (
        <span className="text-primary font-medium">
          #{typeof row.id === "string" ? row.id.slice(0, 8) : row.id}
        </span>
      ),
    },
    {
      key: "name",
      label: "User Name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
            {(row.user_Name || row.userName || row.name || row.fullName || "U")[0]}
          </div>
          <span className="font-medium text-foreground">
            {row.user_Name || row.userName || row.name || row.fullName || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (row) => (
        <span className="text-muted-foreground">{row.email || "-"}</span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
      render: (row) => row.phoneNumber || row.phone || "-",
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">
            {role}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusCell
          row={row}
          onToggle={(id) => toggleMutation.mutate(id)}
          isToggling={toggleMutation.isPending || toggleMutation.isLoading}
        />
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      sortable: true,
      render: (row) => {
        const date = row.created_At || row.createdAt || row.date;
        return date ? new Date(date).toLocaleDateString() : "-";
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Users Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users, view roles, toggle statuses, and permanently delete accounts.
          </p>
        </div>
      </div>

      <DataView
        stats={statsCards}
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search by username, email, phone, or role...",
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: "Filter Status",
          onClick: () => {
            const next =
              statusFilter === "all"
                ? "active"
                : statusFilter === "active"
                ? "inactive"
                : "all";
            setStatusFilter(next);
          },
        }}
        toolbarExtra={
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_FILTERS.map((f) => (
              <Button
                key={f.key}
                type="button"
                size="sm"
                variant={statusFilter === f.key ? "default" : "outline"}
                className="h-8 rounded-full text-xs font-medium"
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        }
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: User,
          title: (row) =>
            row.user_Name || row.userName || row.name || row.fullName || "User",
          subtitle: (row) =>
            `ID: #${typeof row.id === "string" ? row.id.slice(0, 8) : row.id}`,
          fields: [
            {
              icon: Mail,
              label: "Email:",
              value: (row) => row.email || "-",
            },
            {
              icon: Phone,
              label: "Phone:",
              value: (row) => row.phoneNumber || row.phone || "-",
            },
            {
              icon: Shield,
              label: "Role:",
              value: (row) =>
                row.role_Name || row.roleName || row.role || "User",
            },
          ],
          renderFooter: (row) => (
            <div className="border-t border-border pt-3">
              <StatusCell
                row={row}
                onToggle={(id) => toggleMutation.mutate(id)}
                isToggling={toggleMutation.isPending || toggleMutation.isLoading}
              />
            </div>
          ),
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
        emptyMessage="No users found"
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
