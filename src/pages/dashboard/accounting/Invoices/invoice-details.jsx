import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info, Printer, Download, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/data-view/DataView";
import {
  getInvoiceById,
  getWarehouses,
  getAllCostCenters,
  getAllCurrencies,
  getAllSuppliers,
  getAllCustomers,
  getAllInvoicePatterns
} from "../../../../lib/api";

export default function InvoiceDetails() {
  const { id } = useParams();

  const { data: invoiceData, isLoading, isError } = useQuery({
    queryKey: ["getInvoiceById", id],
    queryFn: () => getInvoiceById(id),
  });

  const invoice = invoiceData?.data;

  // We can fetch related data to map IDs to Names
  // In a real scenario, the backend might return the names directly, but since the sample JSON only has IDs, we fetch lists.
  const { data: warehousesData } = useQuery({ queryKey: ["getWarehouses"], queryFn: () => getWarehouses({ pageNumber: 1, pageSize: 100 }) });
  const { data: costCentersData } = useQuery({ queryKey: ["getAllCostCenters"], queryFn: () => getAllCostCenters({ pageNumber: 1, pageSize: 100 }) });
  const { data: currenciesData } = useQuery({ queryKey: ["getAllCurrencies"], queryFn: () => getAllCurrencies({ pageNumber: 1, pageSize: 100 }) });
  const { data: suppliersData } = useQuery({ queryKey: ["getAllSuppliers"], queryFn: () => getAllSuppliers({ pageNumber: 1, pageSize: 100 }) });
  const { data: customersData } = useQuery({ queryKey: ["getAllCustomers"], queryFn: () => getAllCustomers({ pageNumber: 1, pageSize: 100 }) });

  const getWarehouseName = (wId) => warehousesData?.data?.items?.find(w => w.id === wId)?.name_Warehouse || wId || "-";
  const getCostCenterName = (ccId) => costCentersData?.data?.items?.find(c => c.id === ccId)?.cost_Center_Name || ccId || "-";
  const getCurrencyName = (cId) => currenciesData?.data?.items?.find(c => c.id === cId)?.currency_Name || cId || "-";
  const getSupplierName = (sId) => suppliersData?.data?.items?.find(s => s.id === sId)?.supplier_Name || sId || "-";
  const getCustomerName = (cId) => customersData?.data?.items?.find(c => c.id === cId)?.customer_Name || cId || "-";

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading Invoice Details...</div>;
  if (isError || !invoice) return <div className="p-8 text-center text-red-500">Error loading invoice details.</div>;

  const isPurchase = !!invoice.supplier_Id;
  const partnerLabel = isPurchase ? "Supplier Name" : "Customer Name";
  const partnerName = isPurchase ? getSupplierName(invoice.supplier_Id) : getCustomerName(invoice.customer_Id);
  console.log(invoice)
  // Status mapping based on invoice fields (mock logic, adjust as needed)
  const isPaid = invoice.total_Amount > 0 && invoice.net_Amount === invoice.total_Amount && invoice.payment_Method === "Cash";
  const statusColor = isPaid ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200";
  const statusText = isPaid ? "Paid" : "Pending";

  const isReturn = false; // Add logic if invoice is a return based on invoicePattern_Id type

  const columns = [
    { key: "productVariant_Id", label: "Item" },
    { key: "unitOfMeasurement_Id", label: "Unit" },
    { key: "quantity", label: "Qty" },
    { key: "unit_Price", label: "Price", render: (row) => `$${Number(row.unit_Price || 0).toFixed(2)}` },
    { key: "discount_Percentage", label: "Disc %", render: (row) => `${row.discount_Percentage || 0}%` },
    { key: "tax_Percentage", label: "Tax %", render: (row) => `${row.tax_Percentage || 0}%` },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Invoice Details</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Link to="/dashboard/accounting/invoices" className="hover:text-primary">Invoices</Link>
            <span>/</span>
            <span className="font-medium text-foreground">Invoice Details</span>
          </div>
        </div>
        {/* <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4" /> PDF
          </Button>
        </div> */}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 font-semibold p-4 rounded-lg">
                {isPurchase ? "Purchase Invoice" : "Sales Invoice"}
              </div>
              <div className={`px-8 py-4 rounded-lg border font-semibold ${statusColor}`}>
                {statusText}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              <div>
                <div className="text-sm font-semibold">Invoice Number</div>
                <div className="text-blue-600 font-medium">#{invoice.invoice_Number}</div>
              </div>
              <div>
                <div className="text-sm font-semibold">Date</div>
                <div className="text-muted-foreground">{new Date(invoice.invoice_Date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm font-semibold">{partnerLabel}</div>
                <div className="text-muted-foreground">{partnerName}</div>
              </div>
              <div>
                <div className="text-sm font-semibold">Cost Center</div>
                <div className="text-muted-foreground">{getCostCenterName(invoice.costCenter_Id)}</div>
              </div>
              <div>
                <div className="text-sm font-semibold">Warehouse</div>
                <div className="text-muted-foreground">{getWarehouseName(invoice.warehouse_Id)}</div>
              </div>
              <div>
                <div className="text-sm font-semibold">Currency</div>
                <div className="text-muted-foreground">{getCurrencyName(invoice.currency_Id)}</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-sm p-4">
            <h3 className="font-semibold mb-4">Invoice items</h3>
            <DataView
              data={invoice.invoiceDetails || []}
              isLoading={false}
              getRowId={(row) => row.id}
              columns={columns}
              emptyMessage="No items found"
              card={{
                icon: FileText,
                title: (row) => row.productVariant_Id,
                subtitle: (row) => `Unit: ${row.unitOfMeasurement_Id}`,
                fields: [
                  { label: "Qty:", value: (row) => row.quantity },
                  { label: "Price:", value: (row) => `$${Number(row.unit_Price || 0).toFixed(2)}` },
                ],
              }}
            />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
            <h3 className="font-semibold">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${(invoice.total_Amount - invoice.tax_Amount + invoice.discount_Amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>-${invoice.discount_Amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>${invoice.tax_Amount?.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${invoice.total_Amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-green-600">
                <span>Paid</span>
                <span>${invoice.total_Amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-red-600">
                <span>Due</span>
                <span>$0.00</span>
              </div>
            </div>
          </div>

          {invoice.note && (
            <div className="bg-card p-6 rounded-xl border shadow-sm space-y-2">
              <h3 className="font-semibold">Notes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {invoice.note}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
