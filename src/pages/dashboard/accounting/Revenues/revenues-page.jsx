import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Eye,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllRevenues } from "../../../../lib/api";
import { useNavigate } from "react-router-dom";
import { CollapsibleFilterBar } from "@/components/common/collapsible-filter-bar";

export default function RevenuesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const navigate = useNavigate();

  const params = useMemo(
    () => ({
      Search: search,
      Status: selectedStatus || undefined,
      PageNumber: page,
      PageSize: 10,
    }),
    [page, search, selectedStatus],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["getAllRevenues", params],
    queryFn: () => getAllRevenues(params),
  });

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  const rowActionsMenu = useMemo(
    () => [
      {
        items: [
          {
            key: "details",
            label: "Details",
            icon: Eye,
            onClick: (row) =>
              navigate(`/dashboard/accounting/revenues/${row.id}`),
          },
        ],
      },
    ],
    [navigate],
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Collected":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Partial":
        return "bg-blue-100 text-blue-700";
      case "Overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const columns = [
    {
      key: "referenceNumber",
      label: "Ref Number",
      render: (row) => row.referenceNumber || "-",
      link: true,
      onLinkClick: (row) => navigate(`/dashboard/accounting/revenues/${row.id}`),
    },
    {
      key: "customerName",
      label: "Customer",
      render: (row) => row.customerName || "-",
    },
    {
      key: "revenue_Account_Name",
      label: "Account",
      render: (row) => row.revenue_Account_Name || "-",
    },
    {
      key: "projectName",
      label: "Project",
      render: (row) => row.projectName || "-",
    },
    {
      key: "totalAmount",
      label: "Amount",
      render: (row) => (
        <span className="font-medium text-foreground">
          ${row.totalAmount?.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status || "Unknown"}
        </span>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Revenues</h2>
      </div>

      {/* Filter Menu */}
      <CollapsibleFilterBar
        isOpen={isFilterOpen}
        configs={[
          {
            key: "status",
            label: "Filter by Status",
            placeholder: "All Statuses",
            options: [
              { value: "Pending", label: "Pending" },
              { value: "Partial", label: "Partial" },
              { value: "Collected", label: "Collected" },
              { value: "Overdue", label: "Overdue" },
            ],
          },
        ]}
        filters={{
          status: selectedStatus,
        }}
        onFilterChange={(key, val) => {
          setSelectedStatus(val);
          setPage(1);
        }}
        onClear={() => {
          setSelectedStatus("");
          setPage(1);
        }}
      />

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search revenues...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => {}}
        addButton={{
          label: "Add Revenue",
          onClick: () => navigate("/dashboard/accounting/revenues/add"),
          icon: <Plus className="w-4 h-4 mr-1" />
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: FileText,
          title: (row) => row.referenceNumber,
          subtitle: (row) => row.customerName,
          fields: [
            {
              label: "Amount:",
              value: (row) => `$${row.totalAmount?.toLocaleString()}`,
            },
            {
              label: "Status:",
              value: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                  {row.status || "Unknown"}
                </span>
              ),
            },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Prev",
          nextLabel: "Next",
        }}
        emptyMessage="No revenues found"
      />
    </div>
  );
}
