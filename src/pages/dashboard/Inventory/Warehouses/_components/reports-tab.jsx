import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInventoryRecords } from "@/lib/api";
import DataView from "@/components/data-view/DataView";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Calendar, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export default function ReportsTab({ id }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      Search: search,
      PageNumber: page,
      PageSize: 10,
      WarehouseId: id,
    }),
    [page, search, id],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-records-warehouse", params],
    queryFn: () => getInventoryRecords(params),
    enabled: !!id,
  });

  const columns = [
    {
      label: "Record Number",
      key: "record_Number",
    },
    {
      label: "Start Date",
      key: "start_Date",
      render: (row) => <span>{formatDate(row.start_Date)}</span>,
    },
    {
      label: "End Date",
      key: "end_Date",
      render: (row) => <span>{formatDate(row.end_Date)}</span>,
    },
    {
      label: "Status",
      key: "status",
      render: (row) => {
        const status = row.status;
        return (
          <Badge variant={status === "Completed" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      label: "Is Settled",
      key: "is_Settled",
      render: (row) => (
        <Badge variant={row.is_Settled ? "success" : "outline"}>
          {row.is_Settled ? "Settled" : "Not Settled"}
        </Badge>
      ),
    },
  ];

  const rowActionsMenu = [
    {
      items: [
        {
          label: "View Details",
          icon: Eye,
          onClick: (row) => navigate(`/dashboard/inventory/material-reports/${row.id}`),
        }
      ]
    }
  ];

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="space-y-6 mt-4">
      <DataView
        data={data?.data?.items || []}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        isLoading={isLoading}
        search={{
          placeholder: "Search reports...",
          value: search,
          onChange: handleSearch,
        }}
        card={{
          icon: FileText,
          title: (row) => row.record_Number,
          subtitle: (row) => `Status: ${row.status}`,
          fields: [
            {
              icon: Calendar,
              label: "Start:",
              value: (row) => formatDate(row.start_Date),
            },
            {
              icon: Calendar,
              label: "End:",
              value: (row) => formatDate(row.end_Date),
            },
          ],
        }}
        pagination={{
          page: data?.data?.pageNumber || page,
          totalPages: data?.data?.totalPages || 1,
          onPageChange: (newPage) => setPage(newPage),
          prevLabel: "Prev",
          nextLabel: "Next",
        }}
        emptyMessage="No reports found for this warehouse"
      />
    </div>
  );
}
