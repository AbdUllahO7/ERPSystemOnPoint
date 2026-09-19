import { useMemo, useState } from "react";
import {
  Pencil,
  Eye,
  FileText,
  Plus,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllVouchers } from "../../../../../lib/api";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function JournalEntryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState("all");

  const navigate = useNavigate();

  const params = useMemo(
    () => ({
      search: search,
      pageNumber: page,
      pageSize: 10,
      // If backend supports status filtering, we can pass it here. 
      // For now, keeping it basic as requested.
    }),
    [page, search, statusTab],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["getAllVouchers", params],
    queryFn: () => getAllVouchers(params),
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
              navigate(`/dashboard/accounting/bonds/journal-entry/${row.id}`),
          },
        ],
      },
      // {
      //   items: [
      //     {
      //       key: "edit",
      //       label: "Edit",
      //       icon: Pencil,
      //       onClick: (row) =>
      //         navigate(`/dashboard/accounting/bonds/journal-entry/edit/${row.id}`),
      //     },
      //   ],
      // },
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
      key: "date",
      label: "Date",
      render: (row) => new Date(row.date).toISOString().split("T")[0],
    },
    {
      key: "voucher_Type",
      label: "Type",
      render: (row) => {
        let typeLabel = row.voucher_Type;
        if (typeLabel === "Journal_Voucher") typeLabel = "General";
        if (typeLabel === "Opening_Entry") typeLabel = "Opening";
        if (typeLabel === "Adjustment_Entry") typeLabel = "Adjustment";
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
            {typeLabel}
          </span>
        );
      },
    },
    {
      key: "bond_Number",
      label: "Reference",
    },
    {
      key: "branch",
      label: "Branch",
      render: () => "HQ", // Fake branch for now as per mockup
    },
    {
      key: "status",
      label: "Status",
      render: () => (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
          Posted
        </span>
      ), // Fake status for now as per mockup
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs defaultValue="all" onValueChange={setStatusTab} className="w-full mb-6">
        <div>
          <TabsList className="bg-card text-card-foreground p-1.5 rounded-xl border shadow-sm flex gap-1 w-fit h-auto flex-wrap">
            {["all", "draft", "posted", "approved", "cancelled"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg transition-colors capitalize hover:bg-muted data-[state=active]:hover:bg-primary"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        // selectable
        search={{
          placeholder: "Search by id or reference...",
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
          onClick: () => navigate("/dashboard/accounting/bonds/journal-entry/add"),
          icon: <Plus className="w-4 h-4 mr-1" />
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: FileText,
          title: (row) => row.bond_Number,
          subtitle: (row) => row.voucher_Type,
          fields: [
            {
              icon: FileText,
              label: "Amount:",
              value: (row) => `$${row.total_Amount}`,
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
        emptyMessage="No journal entries found"
      />
    </div>
  );
}
