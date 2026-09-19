import { useMemo, useState } from "react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllPosSalesInvoices, getAllCategories } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Eye } from "lucide-react";

export function InvoicesTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ Category_Id: "", FromDate: "", ToDate: "", PaymentMethodId: "" });

  const { data: categoryData } = useQuery({
    queryKey: ["getAllCategories"],
    queryFn: () => getAllCategories({ pageNumber: 1, pageSize: 100 }),
  });
  const categories = categoryData?.data?.items || [];

  const params = useMemo(() => {
    const p = {
      Search: search,
      PageNumber: page,
      PageSize: 10,
    };
    if (filters.Category_Id) p.Category_Id = filters.Category_Id;
    if (filters.FromDate) p.FromDate = filters.FromDate;
    if (filters.ToDate) p.ToDate = filters.ToDate;
    if (filters.PaymentMethodId) p.PaymentMethodId = filters.PaymentMethodId;
    return p;
  }, [page, search, filters]);

  const { data, isLoading } = useQuery({
    queryKey: ["getAllPosSalesInvoices", params],
    queryFn: () => getAllPosSalesInvoices(params),
  });

  const displayRows = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const columns = [
    { 
      key: "invoice_Number", 
      label: "Invoice #", 
      render: (row) => <span className="text-blue-500 font-medium">{row.invoice_Number}</span> 
    },
    { 
      key: "customer_Account_Name", 
      label: "Customer" 
    },
    { 
      key: "invoice_Date", 
      label: "Date",
      render: (row) => row.invoice_Date ? new Date(row.invoice_Date).toLocaleDateString() : "-"
    },
    { 
      key: "total_Amount", 
      label: "Total Amount", 
      render: (row) => <span className="font-semibold">${row.total_Amount}</span> 
    },
    { 
      key: "net_Amount", 
      label: "Net Amount", 
      render: (row) => <span className="text-emerald-600 font-semibold">${row.net_Amount}</span> 
    },
    { 
      key: "payment_Method_Name", 
      label: "Payment Method",
      render: (row) => (
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          {row.payment_Method_Name || "N/A"}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filter Menu */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isFilterOpen ? "grid-rows-[1fr] opacity-100 mb-6" : "grid-rows-[0fr] opacity-0 mb-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-card text-card-foreground p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">From Date</label>
              <Input
                type="date"
                value={filters.FromDate}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, FromDate: e.target.value }));
                  setPage(1);
                }}
              />
            </div>
            
            <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">To Date</label>
              <Input
                type="date"
                value={filters.ToDate}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, ToDate: e.target.value }));
                  setPage(1);
                }}
              />
            </div>

            {/* <div className="flex flex-col gap-2 w-full sm:max-w-[200px]">
              <label className="text-sm font-medium text-foreground">Category</label>
              <Select
                value={filters.Category_Id || "all"}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, Category_Id: val === "all" ? "" : val }));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name || c.categoryName || "Unnamed Category"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            {Object.values(filters).some((val) => val !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ Category_Id: "", FromDate: "", ToDate: "", PaymentMethodId: "" });
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      <DataView
        data={displayRows}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search invoices...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        columns={columns}
        card={{
          icon: FileText,
          title: (row) => row.invoice_Number,
          subtitle: (row) => `Date: ${row.invoice_Date ? new Date(row.invoice_Date).toLocaleDateString() : "-"}`,
          fields: [
            { label: "Customer:", value: (row) => row.customer_Account_Name },
            { label: "Net Amount:", value: (row) => `$${row.net_Amount}` },
          ],
        }}
        pagination={{
          page: currentPage,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Prev",
          nextLabel: "Next",
        }}
        emptyMessage="No invoices found"
      />
    </div>
  );
}

