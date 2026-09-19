import { useMemo, useState } from "react";
import {
  Landmark,
  Eye,
  Plus,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllBanks } from "../../../../lib/api";
import { useNavigate } from "react-router-dom";

export default function BanksPage() {
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
    queryKey: ["getAllBanks", params],
    queryFn: () => getAllBanks(params),
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
              navigate(`/dashboard/accounting/banks/${row.id}`),
          },
        ],
      },
    ],
    [navigate],
  );

  const columns = [
    {
      key: "accountNumber",
      label: "Account #",
      render: (row) => row.accountNumber || "-",
    },
    {
      key: "bankName",
      label: "Bank Name",
      render: (row) => row.bankName || "-",
      sortable: true,
      link: true,
      onLinkClick: (row) => navigate(`/dashboard/accounting/banks/${row.id}`),
    },
    {
      key: "iban",
      label: "IBAN",
      render: (row) => row.iban || "-",
    },
    {
      key: "swift",
      label: "SWIFT",
      render: (row) => row.swift || "-",
    },
    {
      key: "balance",
      label: "Balance",
      render: (row) => {
        return (
          <span className="font-medium text-foreground">
            ${row.balance?.toLocaleString() || "0"} {row.currency}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Banks</h2>
      </div>

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
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
          onClick: () => navigate("/dashboard/accounting/banks/add"),
          icon: <Plus className="w-4 h-4 mr-1" />
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: Landmark,
          title: (row) => row.bankName,
          subtitle: (row) => row.accountNumber,
          fields: [
            {
              label: "Balance:",
              value: (row) => `$${row.balance || 0} ${row.currency || ""}`,
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
        emptyMessage="No banks found"
      />
    </div>
  );
}
