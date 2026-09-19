import { useState } from "react";
import { DataView } from "@/components/data-view/DataView";

export function InvoicesTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const MOCK_INVOICES = Array.from({ length: 6 }).map((_, i) => ({
    id: "1",
    amount: "$350.000",
    dueDate: "23/7/2025",
    status: "New",
  }));

  const columns = [
    { key: "id", label: "ID", render: (row) => <span className="text-blue-500 font-medium">{row.id}</span> },
    { key: "amount", label: "Amount", render: (row) => <span className="text-blue-500">{row.amount}</span> },
    { key: "dueDate", label: "Due Date" },
    { 
      key: "status", 
      label: "Status",
      render: (row) => <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">{row.status}</span>
    },
  ];

  return (
    <div>
      <DataView
        data={MOCK_INVOICES}
        getRowId={(row, index) => `invoice-${index}`}
        // selectable
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
