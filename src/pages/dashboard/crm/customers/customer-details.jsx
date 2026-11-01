import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Info, Edit, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCustomerById } from "@/lib/api";
import { BasicInfoTab } from "./_components/tabs/basic-info-tab";
import { ContactsTab } from "./_components/tabs/contacts-tab";
import { ProjectsTab } from "./_components/tabs/projects-tab";
import { ContractsTab } from "./_components/tabs/contracts-tab";
import { InvoicesTab } from "./_components/tabs/invoices-tab";
import { FollowUpsTab } from "./_components/tabs/follow-ups-tab";
import { FilesTab } from "./_components/tabs/files-tab";
import { NotesTab } from "./_components/tabs/notes-tab";
import { TimelineTab } from "./_components/tabs/timeline-tab";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = [
    "Basic Information",
    "Contacts",
    "Projects",
    "Contracts",
    "Invoices",
    "Follow-Ups",
    "Files",
    "Notes",
    "Timeline"
  ];

  const tabParam = searchParams.get("tab");
  const initialTab = tabParam && tabs.includes(tabParam) ? tabParam : "Basic Information";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (tabParam && tabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const { data: customerData, isLoading, isError } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });

  const customer = customerData?.data?.data || customerData?.data || customerData || {};

  const MOCK_CUSTOMER = {
    id: id,
    name: customer.customerName || customer.name || "-",
    initials: (customer.customerName || customer.name)?.substring(0, 2).toUpperCase() || "--",
    type: customer.customerType || customer.customer_Type || customer.type || "-",
    sector: customer.sector || "-",
    email: customer.email || "-",
    phone: customer.phone || customer.phone_Number || "-",
    website: customer.website || customer.webSite || "-",
    address: customer.address || "-",
    createdAt: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "-",
    status: customer.status || "New",
    projectsCount: customer.totalProjectsCount || 0,
    invoicesCount: customer.totalInvoicesCount || 0,
    paymentsCount: customer.totalPayments || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive">
        Failed to load customer details.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">Customer Details</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/crm/customers")}>Customers</span>
            <span>/</span>
            <span className="font-medium text-foreground">Customer Details</span>
          </div>
        </div>
        <Button variant="outline" className="gap-2 bg-white" onClick={() => navigate(`/dashboard/crm/customers/edit/${id}`)}>
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      {/* Customer Header Card */}
      <div className="bg-white text-card-foreground p-6 rounded-xl border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-500 text-white rounded-xl flex items-center justify-center text-3xl font-bold">
            {MOCK_CUSTOMER.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{MOCK_CUSTOMER.name}</h3>
              <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-md text-xs font-semibold">
                {MOCK_CUSTOMER.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ID: #{MOCK_CUSTOMER.id?.substring(0, 8)} • {MOCK_CUSTOMER.type} • {MOCK_CUSTOMER.sector || "General"} • {MOCK_CUSTOMER.email} • {MOCK_CUSTOMER.phone}
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto">
          <div className="px-6 py-3 border border-orange-200 bg-orange-50/50 rounded-xl min-w-[120px] text-center">
            <div className="text-orange-500 text-sm font-medium">Projects</div>
            <div className="text-orange-500 font-bold">{MOCK_CUSTOMER.projectsCount}</div>
          </div>
          <div className="px-6 py-3 border border-emerald-200 bg-emerald-50/50 rounded-xl min-w-[120px] text-center">
            <div className="text-emerald-500 text-sm font-medium">Invoices</div>
            <div className="text-emerald-500 font-bold">{MOCK_CUSTOMER.invoicesCount}</div>
          </div>
          <div className="px-6 py-3 border border-blue-200 bg-blue-50/50 rounded-xl min-w-[140px] text-center">
            <div className="text-blue-500 text-sm font-medium">Payments</div>
            <div className="text-blue-500 font-bold">$ {MOCK_CUSTOMER.paymentsCount}</div>
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="flex items-center gap-6 px-6 border-b border-border overflow-x-auto bg-white pt-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === tab
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 bg-white min-h-[300px]">
          {activeTab === "Basic Information" && <BasicInfoTab customer={MOCK_CUSTOMER} />}
          {activeTab === "Contacts" && <ContactsTab customerId={id} />}
          {activeTab === "Projects" && <ProjectsTab customerId={id} />}
          {activeTab === "Contracts" && <ContractsTab customerId={id} />}
          {activeTab === "Invoices" && <InvoicesTab customerId={id} />}
          {activeTab === "Follow-Ups" && <FollowUpsTab customerId={id} />}
          {activeTab === "Files" && <FilesTab customerId={id} />}
          {activeTab === "Notes" && <NotesTab customerId={id} />}
          {activeTab === "Timeline" && <TimelineTab customer={customer} customerId={id} />}

          {![
            "Basic Information",
            "Contacts",
            "Projects",
            "Contracts",
            "Invoices",
            "Follow-Ups",
            "Files",
            "Notes",
            "Timeline"
          ].includes(activeTab) && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center text-muted-foreground">
                <h3 className="text-lg font-medium mb-1">Coming Soon</h3>
                <p className="text-sm">This section is currently under development.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
