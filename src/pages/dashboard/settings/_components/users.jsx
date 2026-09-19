import { useState } from "react";
import { Users } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";

export default function UsersTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const usersData = [
    { id: 1, name: "Name", email: "user@test.com", role: "Role Name", branch: "branch", status: "Active" },
    { id: 2, name: "Name", email: "user@test.com", role: "Role Name", branch: "branch", status: "Inactive" },
    { id: 3, name: "Name", email: "user@test.com", role: "Role Name", branch: "branch", status: "Active" },
    { id: 4, name: "Name", email: "user@test.com", role: "Role Name", branch: "branch", status: "Inactive" },
    { id: 5, name: "Name", email: "user@test.com", role: "Role Name", branch: "branch", status: "Active" },
    { id: 6, name: "Name", email: "user@test.com", role: "Role Name", branch: "branch", status: "Active" },
    { id: 7, name: "Name", email: "user@test.com", role: "Role Name", branch: "branch", status: "Active" },
    { id: 8, name: "Name", email: "user@test.com", role: "Role Name", branch: "branch", status: "Active" },
  ];

  const columns = [
    { 
      key: "name", 
      label: "Name", 
      link: true, 
      sortable: true 
    },
    { 
      key: "email", 
      label: "E-mail", 
      sortable: true 
    },
    { 
      key: "role", 
      label: "Role", 
      sortable: true 
    },
    { 
      key: "branch", 
      label: "Branch", 
      sortable: true 
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (row) => (
        row.status === "Active" ? (
          <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-600 text-xs font-medium">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-500 text-xs font-medium">
            An Active
          </span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      
      {/* Top Card: Overview & Limits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-transparent shrink-0">
            <Users className="w-8 h-8 text-[#0070E0]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Users</h2>
            <p className="text-sm text-gray-500 mt-1">
              Adding and managing users and branches
            </p>
          </div>
        </div>
        
        <div className="w-full md:w-auto md:min-w-[400px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Number of accounts allowed to be created</span>
            <span className="text-sm font-bold text-gray-900">15</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3.5 relative overflow-hidden flex items-center">
            <div className="bg-[#0070E0] h-3.5 rounded-full absolute left-0 top-0" style={{ width: "15%" }}></div>
            <span className="absolute w-full text-center text-[10px] font-bold text-white z-10 leading-[14px]">15/100</span>
          </div>
        </div>
      </div>

      {/* Main Table using DataView */}
      <DataView
        data={usersData}
        columns={columns}
        getRowId={(row) => row.id}
        allowedViews={["table"]}
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search by id or employee name..."
        }}
        filter={{
          onClick: () => {}
        }}
        addButton={{
          onClick: () => {},
          label: "Add"
        }}
        pagination={{
          page: page,
          totalPages: 20,
          onPageChange: setPage
        }}
        onColumnSettings={() => {}}
        className="bg-transparent" // Outer spacing is handled, DataView handles card bg
      />
    </div>
  );
}
