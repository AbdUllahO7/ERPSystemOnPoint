import React, { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventoryRecordDetails, importPhysicalCountFromExcel } from "@/lib/api";
import { useParams, useNavigate } from "react-router-dom";
import DataView from "@/components/data-view/DataView";
import { ArrowLeft, Upload, Package, Hash, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function MaterialReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-record-details", id],
    queryFn: () => getInventoryRecordDetails(id),
    enabled: !!id,
  });

  const importMutation = useMutation({
    mutationFn: (formData) => importPhysicalCountFromExcel(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory-record-details", id]);
      toast.success("Excel imported successfully!");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error) => {
      console.error("Failed to import excel", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to import Excel!");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("excelFile", file);
    formData.append("recordid", id);

    importMutation.mutate(formData);
  };

  const columns = [
    {
      label: "Product Code",
      key: "product_Code",
    },
    {
      label: "Product Name",
      key: "product_Name",
    },
    {
      label: "System Quantity",
      key: "system_Quantity",
    },
    {
      label: "Physical Quantity",
      key: "physical_Quantity",
    },
    {
      label: "Upward Adjustment",
      key: "upward_Adjustment",
      render: (row) => (
        <span className="text-green-600 font-medium">
          +{row.upward_Adjustment}
        </span>
      ),
    },
    {
      label: "Settlement Reduction",
      key: "settlement_Reduction",
      render: (row) => (
        <span className="text-red-600 font-medium">
          {row.settlement_Reduction > 0 ? `-${row.settlement_Reduction}` : row.settlement_Reduction}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Record Details</h1>
        </div>
        
        <div>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isLoading}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {importMutation.isLoading ? "Importing..." : "Import Excel"}
          </Button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <DataView
          data={data?.data || []}
          columns={columns}
          isLoading={isLoading || importMutation.isLoading}
          card={{
            icon: Package,
            title: (row) => row.product_Name,
            subtitle: (row) => `Code: ${row.product_Code}`,
            fields: [
              {
                icon: Hash,
                label: "System Qty:",
                value: (row) => row.system_Quantity,
              },
              {
                icon: Boxes,
                label: "Physical Qty:",
                value: (row) => row.physical_Quantity,
              },
              {
                icon: Package,
                label: "Upward Adj:",
                value: (row) => <span className="text-green-600 font-medium">+{row.upward_Adjustment}</span>,
              },
              {
                icon: Package,
                label: "Settlement Red:",
                value: (row) => <span className="text-red-600 font-medium">{row.settlement_Reduction > 0 ? `-${row.settlement_Reduction}` : row.settlement_Reduction}</span>,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
