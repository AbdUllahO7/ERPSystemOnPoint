import React, { useState } from "react";
import { Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useI18n } from "@/context/translate-api";

import PurchaseInvoiceForm from "./_components/purchase-invoice-form";
import SalesInvoiceForm from "./_components/sales-invoice-form";
import PurchaseReturnInvoiceForm from "./_components/purchase-return-invoice-form";
import SalesReturnInvoiceForm from "./_components/sales-return-invoice-form";

export default function AddEditInvoice() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState("purchases");

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">
              {isAr ? "إضافة فاتورة" : "Add Invoice"}
            </h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{isAr ? "الفواتير" : "Invoices"}</span>
            <span>/</span>
            <span className="font-medium text-foreground">
              {isAr ? "إضافة فاتورة" : "Add Invoice"}
            </span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full xl:w-2/3 grid-cols-4 bg-transparent gap-2 h-auto mb-6 bg-card p-2 rounded-xl border shadow-sm">
          <TabsTrigger
            value="purchases"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border py-3 rounded-lg flex items-center gap-2"
          >
            {isAr ? "مشتريات" : "Purchases"}
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200 border py-3 rounded-lg flex items-center gap-2"
          >
            {isAr ? "مبيعات" : "Sales"}
          </TabsTrigger>
          <TabsTrigger
            value="sales-return"
            className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border-red-200 border py-3 rounded-lg flex items-center gap-2"
          >
            {isAr ? "مرتجع مبيعات" : "Sales Return"}
          </TabsTrigger>
          <TabsTrigger
            value="purchase-return"
            className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 data-[state=active]:border-yellow-200 border py-3 rounded-lg flex items-center gap-2"
          >
            {isAr ? "مرتجع مشتريات" : "Purchase Return"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="mt-0 outline-none">
          <PurchaseInvoiceForm />
        </TabsContent>
        <TabsContent value="sales" className="mt-0 outline-none">
          <SalesInvoiceForm />
        </TabsContent>
        <TabsContent value="sales-return" className="mt-0 outline-none">
          <SalesReturnInvoiceForm />
        </TabsContent>
        <TabsContent value="purchase-return" className="mt-0 outline-none">
          <PurchaseReturnInvoiceForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
