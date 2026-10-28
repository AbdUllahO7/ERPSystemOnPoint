import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Info,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  CreditCard,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/data-view/DataView";
import {
  getInvoiceById,
  getAllInstallments,
  getWarehouses,
  getAllCostCenters,
  getAllCurrencies,
  getAllSuppliers,
  getAllCustomers,
  getAllInvoicePatterns
} from "../../../../lib/api";
import PayInstallmentDialog from "./Installments/_components/pay-installment-dialog";

export default function InvoiceDetails() {
  const { id } = useParams();

  const { data: invoiceData, isLoading, isError } = useQuery({
    queryKey: ["getInvoiceById", id],
    queryFn: () => getInvoiceById(id),
  });

  const invoice = invoiceData?.data;

  const [selectedForPay, setSelectedForPay] = useState(null);

  // Fetch Payment Schedules / Installments for this invoice
  const {
    data: installmentsRes,
    isLoading: isLoadingInstallments,
    refetch: refetchInstallments,
  } = useQuery({
    queryKey: ["getAllInstallments", { InvoiceId: id }],
    queryFn: () => getAllInstallments({ InvoiceId: id, PageSize: 100 }),
    enabled: Boolean(id),
  });

  const invoiceSchedules = Array.isArray(installmentsRes?.data)
    ? installmentsRes.data
    : Array.isArray(installmentsRes?.data?.items)
    ? installmentsRes.data.items
    : Array.isArray(invoice?.paymentSchedules)
    ? invoice.paymentSchedules
    : [];

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

          {/* Installments & Payment Schedule Section */}
          <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">
                  Installments & Payment Schedule (جدول الأقساط)
                </h3>
              </div>
              <Link
                to={`/dashboard/accounting/invoices/installments?invoiceId=${id}`}
                className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                View all in Installments <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingInstallments ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Loading payment schedules...
              </div>
            ) : invoiceSchedules.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                No installments configured for this invoice (Standard single-payment invoice).
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Schedule</th>
                      <th className="py-2.5 px-3 font-semibold">Due Date</th>
                      <th className="py-2.5 px-3 font-semibold">Amount Due</th>
                      <th className="py-2.5 px-3 font-semibold">Paid</th>
                      <th className="py-2.5 px-3 font-semibold">Remaining</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoiceSchedules.map((sch, sIdx) => {
                      const due = Number(sch.amountDue ?? sch.amount_Due ?? sch.amount ?? 0);
                      const paid = Number(sch.amountPaid ?? sch.amount_Paid ?? sch.paidAmount ?? 0);
                      const remaining = Math.max(0, due - paid);
                      const isPaid = remaining === 0 && due > 0;
                      return (
                        <tr key={sch.id || sch.scheduleId || sIdx} className="hover:bg-muted/30">
                          <td className="py-2.5 px-3 font-medium text-foreground">
                            {sch.description || `Installment ${sIdx + 1}`}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-muted-foreground">
                            {sch.dueDate ? new Date(sch.dueDate).toLocaleDateString() : "-"}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-foreground">
                            ${due.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-600">
                            ${paid.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-primary">
                            ${remaining.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                isPaid
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              }`}
                            >
                              {isPaid ? "Paid" : "Pending"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {remaining > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setSelectedForPay({
                                    ...sch,
                                    scheduleId: sch.id || sch.scheduleId,
                                    invoice_Number: invoice.invoice_Number,
                                    invoiceId: id,
                                  })
                                }
                                className="h-7 px-2 text-xs gap-1 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                              >
                                <CreditCard className="w-3 h-3" /> Pay
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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

      {/* Pay Installment Modal */}
      {selectedForPay && (
        <PayInstallmentDialog
          isOpen={Boolean(selectedForPay)}
          onClose={() => setSelectedForPay(null)}
          installment={selectedForPay}
          onSuccess={() => refetchInstallments()}
        />
      )}
    </div>
  );
}
