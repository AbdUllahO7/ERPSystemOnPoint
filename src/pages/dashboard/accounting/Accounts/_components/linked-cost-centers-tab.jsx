import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataView } from "@/components/data-view/DataView";
import { getChildCostCenters } from "../../../../../lib/api";
import { Building } from "lucide-react";

export function LinkedCostCentersTab({ id }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const params = useMemo(() => ({
    AccountId: id,
    pageNumber: page,
    pageSize: 10,
    search: search,
  }), [id, page, search]);

  const { data, isLoading } = useQuery({
    queryKey: ["getChildCostCenters", params],
    queryFn: () => getChildCostCenters(params),
  });

  const columns = [
    { key: "cost_Center_Number", label: "Code", sortable: true },
    { key: "cost_Center_Name", label: "Cost Center Name", sortable: true },
  ];

  return (
    <div className="bg-card rounded-xl border shadow-sm p-4">
      <DataView
        data={data?.data?.items || []}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search by id or cost center name...",
          value: search,
          onChange: (val) => {
            setSearch(val);
            setPage(1);
          },
        }}
        columns={columns}
        card={{
          icon: Building,
          title: (row) => row.cost_Center_Name,
          subtitle: (row) => `Code: ${row.cost_Center_Number}`,
        }}
        pagination={{
          page: data?.data?.pageNumber || page,
          totalPages: data?.data?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyMessage="No linked cost centers found"
      />
    </div>
  );
}
