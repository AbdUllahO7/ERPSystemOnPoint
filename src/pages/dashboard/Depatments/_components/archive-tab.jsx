import React, { useState, useMemo } from 'react';
import { DataView } from "@/components/data-view/DataView";
import { History } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { getDepartmentArchive } from '../../../../lib/api';

export default function ArchiveTab({ id }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const params = useMemo(() => ({
    PageNumber: page,
    PageSize: pageSize,
    search: search || undefined
  }), [page, pageSize, search]);

  const { data, isLoading } = useQuery({
    queryKey: ['departmentArchive', id, params],
    queryFn: () => getDepartmentArchive(id, params),
    enabled: !!id,
  });

  const responseData = data?.data || {};
  const items = responseData.items || [];
  const totalPages = responseData.totalPages || 1;
  const currentPage = responseData.pageNumber || page;

  const columns = [
    {
      key: "activity",
      label: "", // Empty header like in the design
      render: (row) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
             <History className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{row.actionTitle}</p>
            <p className="text-xs text-muted-foreground">{row.actionDescription}</p>
            {row.create_at && (
              <p className="text-xs text-muted-foreground mt-1 text-opacity-80">
                {new Date(row.create_at).toLocaleString('en-US')}
              </p>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="pt-4">
      <DataView
        data={items}
        isLoading={isLoading}
        columns={columns}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search archive...",
          value: search,
          onChange: setSearch
        }}
        // filter={{
        //   label: "Filter",
        //   onClick: () => {}
        // }}
        onRefresh={() => {}}
        onPrint={() => {}}
        export={{
          label: "Export",
          onClick: () => {}
        }}
        card={{
          icon: () => <History className="w-4 h-4 text-primary" />,
          title: (row) => row.actionTitle,
          subtitle: (row) => row.actionDescription,
          fields: [
            {
              label: "Date:",
              value: (row) => row.create_at ? new Date(row.create_at).toLocaleString('en-US') : "N/A",
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
        emptyMessage="No archive records found"
      />
    </div>
  );
}
