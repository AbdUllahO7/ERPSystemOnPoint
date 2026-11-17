import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInventoryRecords, getWarehouses } from "@/lib/api";
import DataView from "@/components/data-view/DataView";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Calendar, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

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

export default function MaterialReportsPage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ WarehouseId: "" });

  const { data: warehouseData } = useQuery({
    queryKey: ["getWarehouses"],
    queryFn: () => getWarehouses({ pageNumber: 1, pageSize: 100 }),
  });
  const warehouses = warehouseData?.data?.items || [];

  const params = useMemo(
    () => ({
      Search: search,
      PageNumber: page,
      PageSize: 10,
      ...(filters.WarehouseId && { WarehouseId: filters.WarehouseId }),
    }),
    [page, search, filters],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-records", params],
    queryFn: () => getInventoryRecords(params),
  });

  const columns = [
    {
      label: "Record Number",
      key: "record_Number",
    },
    {
      label: "Warehouse",
      key: "warehouse_Name",
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
      label: t("common.status"),
      key: "status",
      render: (row) => {
        const status = row.status;
        return (
          <Badge variant={status === "Completed" ? "default" : "secondary"}>
            {isAr ? translateErp(status, locale) : status}
          </Badge>
        );
      },
    },
    {
      label: t("inventory.materialReports.isSettled"),
      key: "is_Settled",
      render: (row) => (
        <Badge variant={row.is_Settled ? "success" : "outline"}>
          {row.is_Settled ? t("inventory.materialReports.settled") : t("inventory.materialReports.notSettled")}
        </Badge>
      ),
    },
  ];

  const rowActionsMenu = [
    {
      items: [
        {
          label: t("common.viewDetails"),
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {t("inventory.materialReports.titleFull")}
        </h1>
      </div>

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
            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">
                {t("inventory.materialReports.filterWarehouse")}
              </label>
              <Select
                value={filters.WarehouseId || "all"}
                onValueChange={(val) => {
                  setFilters((prev) => ({
                    ...prev,
                    WarehouseId: val === "all" ? "" : val,
                  }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("inventory.materialReports.allWarehouses")} />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">{t("inventory.materialReports.allWarehouses")}</SelectItem>
                  {warehouses.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name_Warehouse || "_"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {Object.values(filters).some((val) => val !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ WarehouseId: "" });
                  setPage(1);
                }}
              >
                {t("common.clearFilters")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <DataView
        data={data?.data?.items || []}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        isLoading={isLoading}
        search={{
          placeholder: t("inventory.materialReports.searchPlaceholder"),
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: t("common.filter"),
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        addButton={{
          label: t("common.add"),
          onClick: () => navigate("/dashboard/inventory/material-reports/add"),
        }}
        card={{
          icon: FileText,
          title: (row) => row.record_Number,
          subtitle: (row) => `${t("inventory.materialReports.warehousePrefix")} ${row.warehouse_Name}`,
          fields: [
            {
              icon: Calendar,
              label: t("inventory.materialReports.start"),
              value: (row) => formatDate(row.start_Date),
            },
            {
              icon: Calendar,
              label: t("inventory.materialReports.end"),
              value: (row) => formatDate(row.end_Date),
            },
            {
              icon: List,
              label: t("inventory.materialReports.statusLabel"),
              value: (row) => isAr ? translateErp(row.status, locale) : row.status,
            },
          ],
        }}
        pagination={{
          page: data?.data?.pageNumber || page,
          totalPages: data?.data?.totalPages || 1,
          onPageChange: (newPage) => setPage(newPage),
          prevLabel: t("common.prev"),
          nextLabel: t("common.next"),
        }}
        emptyMessage={t("inventory.materialReports.empty")}
      />
    </div>
  );
}
