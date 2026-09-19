import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getPositionEmployees, getDepartments, getSections } from '../../../../lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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

export default function EmployeeTab({ id }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ dep_id: "", section_id: "" });

  const params = useMemo(() => ({
    search: search,
    pageNumber: page,
    pageSize: 10,
    dep_id: filters.dep_id || undefined,
    section_id: filters.section_id || undefined,
  }), [page, search, filters]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["getPositionEmployees", id, params],
    queryFn: () => getPositionEmployees(id, params),
    enabled: !!id,
  });

  const { data: departmentsResponse } = useQuery({
    queryKey: ["getDepartmentsList"],
    queryFn: () => getDepartments({ PageSize: 1000 }),
  });

  const { data: sectionsResponse } = useQuery({
    queryKey: ["getSectionsList"],
    queryFn: () => getSections({ PageSize: 1000 }),
  });

  const departmentOptions = useMemo(() => departmentsResponse?.data?.items?.map(d => ({ value: d.id, label: d.departmentName })) || [], [departmentsResponse]);
  const sectionOptions = useMemo(() => sectionsResponse?.data?.items?.map(s => ({ value: s.id, label: s.section_name })) || [], [sectionsResponse]);

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
      key: "employee_Name",
      label: "Employee Name",
      render: (row) => <span className="text-primary">{row.employee_Name || row.employeeName || row.name || "N/A"}</span>
    },
    {
      key: "job_Number",
      label: "Job Number",
      render: (row) => <span className="text-primary">{row.job_Number || row.jobNumber || "N/A"}</span>
    }
  ];

  return (
    <div className="space-y-4 pt-4">
      {/* Filter Menu */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isFilterOpen
            ? "grid-rows-[1fr] opacity-100 mb-6"
            : "grid-rows-[0fr] opacity-0 mb-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-card text-card-foreground p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-end gap-4 flex-wrap">
            {[
              {
                key: "dep_id",
                label: "Filter by Department",
                placeholder: "All Departments",
                options: departmentOptions,
              },
              {
                key: "section_id",
                label: "Filter by Section",
                placeholder: "All Sections",
                options: sectionOptions,
              },
            ].map((config) => (
              <div
                key={config.key}
                className="flex flex-col gap-2 w-full sm:max-w-[200px]"
              >
                <label className="text-sm font-medium text-foreground">
                  {config.label}
                </label>
                <Select
                  value={filters[config.key] || "all"}
                  onValueChange={(val) => {
                    setFilters((prev) => ({
                      ...prev,
                      [config.key]: val === "all" ? "" : val,
                    }));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={config.placeholder} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="all">{config.placeholder}</SelectItem>
                    {config.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {Object.values(filters).some((val) => val !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ dep_id: "", section_id: "" });
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      <DataView
        data={displayRows}
        isLoading={isLoading}
        columns={columns}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search by id or employee name...",
          value: search,
          onChange: setSearch
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen)
        }}
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
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: () => <span className="text-primary">👤</span>,
          title: (row) => row.employee_Name || row.employeeName || row.name || "N/A",
          subtitle: (row) => `Job Number: ${row.job_Number || row.jobNumber || "N/A"}`,
          fields: [
            {
              label: "Job Number:",
              value: (row) => row.job_Number || row.jobNumber || "N/A",
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
