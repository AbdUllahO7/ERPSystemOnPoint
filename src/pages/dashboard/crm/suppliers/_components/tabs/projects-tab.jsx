import { useState } from "react";
import { DataView } from "@/components/data-view/DataView";
import { useI18n } from "@/context/translate-api";

export function ProjectsTab() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const MOCK_PROJECTS = Array.from({ length: 6 }).map((_, i) => ({
    id: `${i + 1}`,
    projectName: `${t('crmSuppliers.projects.projectName')} #${i + 1}`,
    status: t('new', 'New'),
    progress: "62%",
    value: "$350.000",
    endedAt: "23/7/2025",
  }));

  const columns = [
    { key: "id", label: t('id', 'ID'), render: (row) => <span className="text-blue-500 font-medium">{row.id}</span> },
    { key: "projectName", label: t('crmSuppliers.projects.projectName') },
    { 
      key: "status", 
      label: t('crmSuppliers.projects.status'),
      render: (row) => <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">{row.status}</span>
    },
    { key: "progress", label: t('progress', 'Progress'), render: (row) => <span className="text-blue-500">{row.progress}</span> },
    { key: "value", label: t('value', 'Value'), render: (row) => <span className="text-blue-500">{row.value}</span> },
    { key: "endedAt", label: t('crmSuppliers.projects.deliveryDate') },
  ];

  return (
    <div>
      <DataView
        data={MOCK_PROJECTS}
        getRowId={(row, index) => `${row.id}-${index}`}
        selectable
        search={{
          placeholder: t('crmSuppliers.projects.searchPlaceholder'),
          value: search,
          onChange: setSearch,
        }}
        columns={columns}
        pagination={{
          page: page,
          totalPages: 1,
          onPageChange: setPage,
          prevLabel: t('common.prev'),
          nextLabel: t('common.next'),
        }}
        emptyMessage={t('crmSuppliers.projects.empty')}
      />
    </div>
  );
}
