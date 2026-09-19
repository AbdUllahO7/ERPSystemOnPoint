import { useMemo, useState } from "react";
import {
  Pencil,
  Eye,
  FileText,
  Plus,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllFixedExpenses } from "../../../../lib/api";
import { useNavigate } from "react-router-dom";

export default function FixedExpensesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const params = useMemo(
    () => ({
      Search: search,
      PageNumber: page,
      PageSize: 10,
    }),
    [page, search],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["getAllFixedExpenses", params],
    queryFn: () => getAllFixedExpenses(params),
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
              navigate(`/dashboard/accounting/fixed-expenses/${row.id}`),
          },
        ],
      },
      {
        items: [
          // {
          //   key: "edit",
          //   label: "Edit",
          //   icon: Pencil,
          //   onClick: (row) =>
          //     navigate(`/dashboard/accounting/fixed-expenses/edit/${row.id}`),
          // },
        ],
      },
    ],
    [navigate],
  );

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => `#${row.id.substring(0, 4)}`,
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => `$${row.totalAmount?.toLocaleString()}`,
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
    },
    {
      key: "cycle",
      label: "Cycle",
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (row) => new Date(row.startDate).toISOString().split("T")[0],
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${row.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "autoGen",
      label: "Auto JE",
      render: (row) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${row.autoGenerateJournal ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
          {row.autoGenerateJournal ? "Enabled" : "Disabled"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search by description...",
          value: search,
          onChange: handleSearch,
        }}
        onRefresh={() => {}}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/accounting/fixed-expenses/add"),
          icon: <Plus className="w-4 h-4 mr-1" />
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: FileText,
          title: (row) => row.description,
          subtitle: (row) => row.categoryName,
          fields: [
            {
              icon: FileText,
              label: "Amount:",
              value: (row) => `$${row.totalAmount}`,
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
        emptyMessage="No fixed expenses found"
      />
    </div>
  );
}
