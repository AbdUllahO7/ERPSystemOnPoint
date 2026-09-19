import { useState } from "react";
import { FileText } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";

const MOCK_AUDIT_LOGS = Array(7).fill(null).map((_, i) => ({
  id: `log-${i}`,
  user: "Name",
  process: "INV-00245 invoice amend...",
  time: "Today 10:42",
  ip: "192.168.1.10"
}));

export default function AuditLogTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const columns = [
    { 
      key: "user", 
      label: "User",
      render: (row) => <span className="text-blue-500 font-medium cursor-pointer hover:underline">{row.user}</span> 
    },
    { key: "process", label: "Process" },
    { key: "time", label: "Time" },
    { key: "ip", label: "IP" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-blue-600 bg-white">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Audit Log</h3>
            <p className="text-sm text-muted-foreground mt-1">Track all operations on the system</p>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <DataView
          data={MOCK_AUDIT_LOGS}
          getRowId={(row) => row.id}
          selectable
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
            totalPages: 20,
            onPageChange: setPage,
            prevLabel: "Pre",
            nextLabel: "Next",
          }}
        />
      </div>
    </div>
  );
}
