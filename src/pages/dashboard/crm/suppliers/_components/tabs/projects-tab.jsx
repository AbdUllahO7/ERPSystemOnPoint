import { useState } from "react";
import { DataView } from "@/components/data-view/DataView";

export function ProjectsTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const MOCK_PROJECTS = Array.from({ length: 6 }).map((_, i) => ({
    id: "1",
    projectName: "Project Name",
    status: "New",
    progress: "62%",
    value: "$350.000",
    endedAt: "23/7/2025",
  }));

  const columns = [
    { key: "id", label: "ID", render: (row) => <span className="text-blue-500 font-medium">{row.id}</span> },
    { key: "projectName", label: "Project Name" },
    { 
      key: "status", 
      label: "Status",
      render: (row) => <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">{row.status}</span>
    },
    { key: "progress", label: "Progress", render: (row) => <span className="text-blue-500">{row.progress}</span> },
    { key: "value", label: "Value", render: (row) => <span className="text-blue-500">{row.value}</span> },
    { key: "endedAt", label: "Ended At" },
  ];

  return (
    <div>
      <DataView
        data={MOCK_PROJECTS}
        getRowId={(row, index) => `${row.id}-${index}`}
        selectable
        search={{
          placeholder: "Search by id or project name...",
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => console.log("Filter clicked"),
        }}
        export={{
          label: "Export",
          onClick: () => console.log("Export clicked"),
        }}
        addButton={{
          label: "Add",
          onClick: () => console.log("Add Project"),
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
