import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { AlertTriangle, Pencil, Info, User, Clock } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { getMonthErrors } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ManualUpdateModal } from "./components/ManualUpdateModal";

export default function AttendanceErrors() {
  const { year, month } = useParams();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const params = useMemo(
    () => ({
      search: search,
      pageNumber: page,
      pageSize: 10,
    }),
    [page, search]
  );

  const { data: queryData, isLoading, refetch } = useQuery({
    queryKey: ["getMonthErrors", year, month, params],
    queryFn: () => getMonthErrors(year, month), // Adjust if endpoint supports params in the future
  });

  const rawData = queryData?.data;
  let displayRows = [];
  let totalPages = 1;
  let currentPage = page;

  if (rawData) {
    if (Array.isArray(rawData)) {
      displayRows = rawData;
    } else if (rawData.items) {
      displayRows = rawData.items;
      totalPages = rawData.totalPages || 1;
      currentPage = rawData.pageNumber || page;
    } else {
      // Mock Data if API doesn't return items yet
      displayRows = [
        { recordId: "f2354424", employeeName: "hum sassa", date: "08:00 AM", problemType: "Early Leave", description: "Exit early before the end of working hours" },
        { recordId: "f2354425", employeeName: "hum sassa", date: "08:00 AM", problemType: "Early Leave", description: "Exit early before the end of working hours" },
      ];
    }
  }

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  const handleEditClick = (row) => {
    setSelectedRecordId(row.recordId || row.attendanceId || row.id);
    setModalOpen(true);
  };

  const columns = [
    {
      key: "recordId",
      label: "Record ID",
      render: (row) => <Link to="#" className="text-blue-500 hover:underline">{row.recordId || row.attendanceId || row.id}</Link>,
    },
    {
      key: "employeeName",
      label: "Employee Name",
      render: (row) => <span className="text-blue-500">{row.employeeName || "hum sassa"}</span>,
    },
    {
      key: "date",
      label: "Date",
      render: (row) => row.date || "08:00 AM",
    },
    {
      key: "problemType",
      label: "Type of problem",
      render: (row) => (
        <span className="inline-flex h-6 items-center rounded bg-red-100 px-2 text-xs text-red-600 font-medium">
          {row.problemType || "Early Leave"}
        </span>
      ),
    },
    {
      key: "description",
      label: "Problem description",
      render: (row) => row.description || "Exit early before the end of working hours",
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button onClick={() => handleEditClick(row)} className="text-neutral-500 hover:text-neutral-700 p-1">
          <Pencil className="w-4 h-4" />
        </button>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-bold text-neutral-900">Detected attendance errors</h2>
        <Info className="w-4 h-4 text-neutral-400" />
      </div>
      <div className="text-sm text-neutral-500 flex gap-1">
        <Link to={`/dashboard/hr/attendance/${year}/${month}`} className="hover:underline">Processing log</Link> / 
        <span className="text-neutral-900">Detected attendance errors</span>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex items-start gap-4">
        <div className="bg-orange-500 rounded-full p-2 mt-1 shrink-0">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-lg text-neutral-900">Note: Attendance sheets cannot be used</h4>
          <p className="text-sm text-neutral-500">Illogical or incomplete records have been detected. Please review the table below and correct the data manually</p>
        </div>
      </div>

      <div className="mt-8">
        <DataView
          data={displayRows}
          isLoading={isLoading}
          getRowId={(row) => row.recordId || row.id || Math.random().toString()}
          selectable
          search={{
            placeholder: "Search by id or employee name...",
            value: search,
            onChange: handleSearch,
          }}
          filter={{
            label: "Filter",
            onClick: () => console.log("filter"),
          }}
          onRefresh={() => refetch()}
          onPrint={() => window.print()}
          export={{
            label: "Export",
            onClick: () => console.log("export"),
          }}
          card={{
            icon: User,
            title: (row) => row.employeeName || "hum sassa",
            subtitle: (row) => `ID: ${row.recordId || row.attendanceId || row.id}`,
            fields: [
              {
                icon: AlertTriangle,
                label: "Problem:",
                value: (row) => row.problemType || "Early Leave",
              },
              {
                icon: Clock,
                label: "Date:",
                value: (row) => row.date || "08:00 AM",
              }
            ],
          }}
          columns={columns}
          pagination={{
            page: currentPage,
            totalPages,
            onPageChange: setPage,
            prevLabel: "Pre",
            nextLabel: "Next",
          }}
          emptyMessage="No errors found"
        />
      </div>

      <ManualUpdateModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        recordId={selectedRecordId}
      />
    </div>
  );
}
