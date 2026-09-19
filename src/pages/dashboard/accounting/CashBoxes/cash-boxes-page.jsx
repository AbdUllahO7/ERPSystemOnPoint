import { useMemo, useState } from "react";
import {
  Eye,
  WalletCards,
  Plus,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllCashBoxes } from "../../../../lib/api";
import { useNavigate } from "react-router-dom";

export default function CashBoxesPage() {
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
    queryKey: ["getAllCashBoxes", params],
    queryFn: () => getAllCashBoxes(params),
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
              navigate(`/dashboard/accounting/cash-boxes/${row.id}`),
          },
        ],
      },
    ],
    [navigate],
  );

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (row) => row.code || "-",
    },
    {
      key: "name",
      label: "Cash Box Name",
    },
    {
      key: "branch",
      label: "Branch",
      render: (row) => row.branchId || "Main Branch",
    },
    {
      key: "currency",
      label: "Currency",
      render: (row) => row.currencyId || "-",
    },
    {
      key: "currentBalance",
      label: "Current Balance",
      render: (row) => `$${row.currentBalance?.toLocaleString() || "0"}`,
    },
  ];

  return (
    <div className="space-y-6">
      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        // selectable
        search={{
          placeholder: "Search by name or code...",
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
          onClick: () => navigate("/dashboard/accounting/cash-boxes/add"),
          icon: <Plus className="w-4 h-4 mr-1" />
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: WalletCards,
          title: (row) => row.name,
          subtitle: (row) => row.code,
          fields: [
            {
              icon: WalletCards,
              label: "Balance:",
              value: (row) => `$${row.currentBalance}`,
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
        emptyMessage="No cash boxes found"
      />
    </div>
  );
}
