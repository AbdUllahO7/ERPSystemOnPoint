import { useState } from "react";
import { DataView } from "@/components/data-view/DataView";

export function ContractsTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const MOCK_CONTRACTS = Array.from({ length: 6 }).map((_, i) => ({
    contract: "Contract Name",
    project: "Project Name",
    value: "$3500",
    status: "Active",
    signature: "23/7/2025",
  }));

  const columns = [
    { key: "contract", label: "Contract" },
    { key: "project", label: "Project" },
    {
      key: "value",
      label: "Value",
      render: (row) => <span className="text-blue-500">{row.value}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
          {row.status}
        </span>
      ),
    },
    { key: "signature", label: "Signature" },
  ];

  return (
    <div>
      <DataView
        data={MOCK_CONTRACTS}
        getRowId={(row, index) => `contract-${index}`}
        selectable={false}
        search={{
          placeholder: "Search by id or employee name...",
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => console.log("Filter clicked"),
        }}
        columns={columns}
        pagination={{
          page: page,
          totalPages: 1,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
      />
    </div>
  );
}
