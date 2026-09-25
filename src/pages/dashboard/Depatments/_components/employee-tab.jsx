import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataView } from "@/components/data-view/DataView";
import {
  Eye,
  Fingerprint,
  Calendar,
  DollarSign,
  FileText,
  FileSignature,
  TrendingUp,
  Plus,
  Minus,
  Pencil,
  Trash2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDepartmentEmployees } from '../../../../lib/api';
// import { getDepartmentEmployees } from "../../../lib/api";

export default function EmployeeTab({ id }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const params = useMemo(() => ({
    // employeeName: search,
    // name: search,
    search: search,
    pageNumber: page,
    pageSize: 10,
  }), [page, search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getDepartmentEmployees", id, params],
    queryFn: () => getDepartmentEmployees(id, params),
    enabled: !!id,
  });

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "View",
        items: [
          {
            key: "basic-info",
            label: "Basic Info",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=basic-info`),
          },
          {
            key: "attendance",
            label: "Attendance",
            icon: Fingerprint,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=attendance`),
          },
          {
            key: "leaves",
            label: "Leaves",
            icon: Calendar,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=leaves`),
          },
          {
            key: "salary",
            label: "Salary",
            icon: DollarSign,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=salary`),
          },
          {
            key: "documents",
            label: "Documents",
            icon: FileText,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=documents`),
          },
          {
            key: "contracts",
            label: "Contracts",
            icon: FileSignature,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=contracts`),
          },
          {
            key: "performance",
            label: "Performance",
            icon: TrendingUp,
            onClick: (row) => navigate(`/dashboard/hr/employees/${row.id}?tab=performance`),
          },
        ],
      },
      {
        label: "Add",
        items: [
          {
            key: "add-leaves",
            label: "Leaves",
            icon: Calendar,
            onClick: (row) => console.log("Add Leaves", row),
          },
          {
            key: "add-bounses",
            label: "Bounses",
            icon: Plus,
            onClick: (row) => console.log("Add Bounses", row),
          },
          {
            key: "add-deductions",
            label: "Deductions",
            icon: Minus,
            onClick: (row) => console.log("Add Deductions", row),
          },
        ],
      },
      {
        items: [
          {
            key: "edit",
            label: "Edit",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/hr/employees/edit/${row.id}`),
          },
        ],
      },
      {
        items: [
          {
            key: "delete",
            label: "Delete",
            icon: Trash2,
            destructive: true,
            onClick: (row) => console.log("Delete", row.id),
          },
        ],
      },
    ],
    [navigate]
  );

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="text-primary">#{row.id ? row.id.substring(0, 8) : ''}</span>
    },
    {
      key: "employeeName",
      label: "Employee Name",
      render: (row) => <span className="text-primary">{row.employeeName || row.name || row.employee_Name || row.employee_name || "N/A"}</span>
    },
    {
      key: "role",
      label: "Role",
      render: (row) => <span>{row.role || row.jobTitle || "N/A"}</span>
    },
    {
      key: "jobNumber",
      label: "Job Number",
      render: (row) => <span className="text-primary">{row.jobNumber || row.job_Number || "N/A"}</span>
    }
  ];

  return (
    <div className="pt-4">
      <DataView
        data={displayRows}
        isLoading={isLoading}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search by id or employee name...",
          value: search,
          onChange: setSearch
        }}
        // filter={{
        //   label: "Filter",
        //   onClick: () => {}
        // }}
        onRefresh={() => {}}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => {}
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/hr/employees/add")
        }}
        card={{
          icon: () => <span className="text-primary">👤</span>,
          title: (row) => row.employeeName || row.name || row.employee_Name || row.employee_name || "N/A",
          subtitle: (row) => `Role: ${row.role || row.jobTitle || "N/A"}`,
          fields: [
            {
              label: "Job Number:",
              value: (row) => row.jobNumber || row.job_Number || "N/A",
            },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next"
        }}
        emptyMessage="No employees found"
      />
    </div>
  );
}
