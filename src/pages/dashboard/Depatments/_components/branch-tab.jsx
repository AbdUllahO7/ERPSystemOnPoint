import React, { useState, useMemo } from 'react';
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getDepartmentSections } from "../../../../lib/api";
import { useNavigate, useLocation } from "react-router-dom";
import { Pencil, Eye, Building, User } from "lucide-react";

export default function BranchTab({ id }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const params = useMemo(() => ({
    department_id: id,
    Search: search,
    search: search,
    pageNumber: page,
    pageSize: 10,
  }), [id, page, search]);

  const { data, isLoading } = useQuery({
    queryKey: ["getDepartmentSections", params],
    queryFn: () => getDepartmentSections(params),
    enabled: !!id,
  });

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  const navigate = useNavigate();
  const location = useLocation();

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "View",
        items: [
          {
            key: "details",
            label: "Details",
            icon: Eye,
            onClick: (row) => navigate(`/dashboard/hr/sections/${row.id}?tab=details`),
          },
          {
            key: "offices",
            label: "Offices",
            icon: Building,
            onClick: (row) => navigate(`/dashboard/hr/sections/${row.id}?tab=office`),
          },
          {
            key: "employee",
            label: "Employee",
            icon: User,
            onClick: (row) => navigate(`/dashboard/hr/sections/${row.id}?tab=employee`),
          },
        ],
      },
      {
        items: [
          {
            key: "edit",
            label: "Edit Section",
            icon: Pencil,
            onClick: (row) => navigate(`/dashboard/hr/sections/edit/${row.id}`, { state: { returnTo: location.pathname + location.search } }),
          },
        ],
      },
    ],
    [navigate, location.pathname, location.search]
  );

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => <span className="text-primary">#{row.id ? row.id.substring(0, 8) : ''}</span>
    },
    {
      key: "sectionName",
      label: "Section/Department Name",
      render: (row) => <span>{row.name || row.sectionName || "N/A"}</span>
    },
    {
      key: "managerName",
      label: "Manager Name",
      render: (row) => <span className="text-primary">{row.managerName || "N/A"}</span>
    },
    {
      key: "numberOfEmployees",
      label: "Number of employees",
      render: (row) => <span className="text-primary">{row.numberOfEmployees || "N/A"}</span>
    }
  ];

  return (
    <div className="pt-4">
      <DataView
        data={displayRows}
        isLoading={isLoading}
        columns={columns}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search by id or section name...",
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
          label: "Add Section",
          onClick: () => navigate("/dashboard/hr/sections/add", { state: { returnTo: location.pathname + location.search, departmentId: id } })
        }}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: () => <span className="text-primary">🏢</span>, 
          title: (row) => row.name || row.sectionName || "N/A",
          subtitle: (row) => `Manager: ${row.managerName || "N/A"}`,
          fields: [
            {
              label: "Employees:",
              value: (row) => row.numberOfEmployees || "N/A",
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
        emptyMessage="No sections found"
      />
    </div>
  );
}
