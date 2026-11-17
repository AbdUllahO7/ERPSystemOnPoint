import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info, Package } from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { getTransferDetails } from "../../../../lib/api";
import { useI18n } from "@/context/translate-api";

export default function TransferDetails() {
  const { id } = useParams();
  const { locale, t } = useI18n();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["getTransferDetails", id],
    queryFn: () => getTransferDetails(id),
    enabled: !!id,
  });

  const transfer = data?.data || {};
  const materials = transfer.details || [];

  const columns = [
    {
      key: "material_Name",
      label: t('inventory.transfers.materialName'),
    },
    {
      key: "quantity",
      label: t('inventory.transfers.quantity'),
      render: (row) => <span className="text-blue-500 font-medium">{row.quantity}</span>,
    },
    {
      key: "weight",
      label: t('inventory.transfers.weight'),
      render: (row) => <span className="text-blue-500 font-medium">{row.weight} {locale === "ar" ? "كغ" : "kg"}</span>,
    },
    {
      key: "unit_Name",
      label: t('inventory.transfers.unit'),
    },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">
            {t('inventory.transfers.detailsTitle')}
          </h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>{t('inventory.transfers.title')}</span>
          <span>/</span>
          <span className="font-medium text-foreground">
            {t('inventory.transfers.detailsTitle')}
          </span>
        </div>
      </div>

      {/* Top Details Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-2">{t('common.loading')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t('inventory.transfers.transferNumber')}
              </p>
              <p className="text-sm text-blue-500 font-medium mt-1">{transfer.transfer_Id ? transfer.transfer_Id.substring(0, 8) : "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t('inventory.transfers.source')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{transfer.source_Warehouse_Name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t('inventory.transfers.destination')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{transfer.destination_Warehouse_Name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t('inventory.transfers.date')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {transfer.transfer_Date ? new Date(transfer.transfer_Date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US") : "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Materials Section */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">
          {t('inventory.transfers.addMaterials')}
        </h3>

        <DataView
          data={materials}
          isLoading={isLoading}
          getRowId={(row) => row.detail_Id}
          onRefresh={() => {}}
          columns={columns}
          allowedViews={["table", "cards"]}
          card={{
            icon: Package,
            title: (row) => row.material_Name,
            fields: [
              {
                key: "quantity",
                label: t('inventory.transfers.quantity') + ":",
                value: (row) => <span className="text-blue-500 font-medium">{row.quantity}</span>,
              },
              {
                key: "weight",
                label: t('inventory.transfers.weight') + ":",
                value: (row) => <span className="text-blue-500 font-medium">{row.weight} {locale === "ar" ? "كغ" : "kg"}</span>,
              },
              {
                key: "unit_Name",
                label: t('inventory.transfers.unit') + ":",
              },
            ],
          }}
          pagination={{
            page: page,
            totalPages: 1,
            onPageChange: setPage,
            prevLabel: t('common.prev'),
            nextLabel: t('common.next'),
          }}
          emptyMessage={t('inventory.transfers.emptyMaterials')}
        />
      </div>
    </div>
  );
}
