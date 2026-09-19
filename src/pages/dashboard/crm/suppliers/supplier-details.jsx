import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { Info, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSupplierById } from "@/lib/api";
import { BasicInfoTab } from "./_components/tabs/basic-info-tab";
import { ContactsTab } from "./_components/tabs/contacts-tab";
import { ProjectsTab } from "./_components/tabs/projects-tab";
import { ContractsTab } from "./_components/tabs/contracts-tab";
import { InvoicesTab } from "./_components/tabs/invoices-tab";
import { FollowUpsTab } from "./_components/tabs/follow-ups-tab";
import { FilesTab } from "./_components/tabs/files-tab";
import { NotesTab } from "./_components/tabs/notes-tab";
import { TimelineTab } from "./_components/tabs/timeline-tab";

export default function SupplierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Basic Information");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["supplier", id],
    queryFn: () => getSupplierById(id),
  });

  const tabs = [
    "Basic Information",
    "Contacts",
    // "Projects(15)",
    "Contracts",
    "Invoices",
    // "Follow-Ups(45)",
    "Files",
    "Notes",
    "Timeline"
  ];

  if (isLoading) return <div className="p-6">Loading supplier details...</div>;
  if (isError || !data?.data) return <div className="p-6 text-red-500">Error loading supplier details.</div>;

  const supplier = data.data;

  // mapping the supplier to match what basic info tab might expect
  const formattedSupplier = {
    id: supplier.id,
    name: supplier.supplierName,
    initials: supplier.supplierName ? supplier.supplierName.substring(0, 2).toUpperCase() : "SP",
    type: supplier.supplierType,
    // sector: "N/A", // or based on data if exists
    email: supplier.email,
    phone: supplier.phone,
    website: supplier.website,
    address: supplier.address,
    createdAt: new Date(supplier.createdAt).toLocaleDateString(),
    status: supplier.status,
    taxNumber: supplier.taxNumber,
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">Supplier Details</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/crm/suppliers")}>Suppliers</span>
            <span>/</span>
            <span className="font-medium text-foreground">Supplier Details</span>
          </div>
        </div>
        <Button variant="outline" className="gap-2 bg-white" onClick={() => navigate(`/dashboard/crm/suppliers/edit/${id}`)}>
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      {/* Customer Header Card */}
      <div className="bg-white text-card-foreground p-6 rounded-xl border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-500 text-white rounded-xl flex items-center justify-center text-3xl font-bold">
            {formattedSupplier.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{formattedSupplier.name}</h3>
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${formattedSupplier.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {formattedSupplier.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {formattedSupplier.id.substring(0,8)} • {formattedSupplier.type} • {formattedSupplier.email} • {formattedSupplier.phone} • {formattedSupplier.website}
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto">
          <div className="px-6 py-3 border border-orange-200 bg-orange-50/50 rounded-xl min-w-[120px] text-center">
            <div className="text-orange-500 text-sm font-medium">Projects</div>
            <div className="text-orange-500 font-bold">{supplier.purchaseOrdersCount || 0}</div>
          </div>
          <div className="px-6 py-3 border border-emerald-200 bg-emerald-50/50 rounded-xl min-w-[120px] text-center">
            <div className="text-emerald-500 text-sm font-medium">Invoices</div>
            <div className="text-emerald-500 font-bold">{supplier.purchaseInvoices?.length || 0}</div>
          </div>
          <div className="px-6 py-3 border border-blue-200 bg-blue-50/50 rounded-xl min-w-[140px] text-center">
            <div className="text-blue-500 text-sm font-medium">Payments</div>
            <div className="text-blue-500 font-bold">$ {supplier.totalPaid || 0}</div>
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="flex items-center gap-6 px-6 border-b border-border overflow-x-auto bg-white pt-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
          {activeTab === "Basic Information" && <BasicInfoTab customer={formattedSupplier} />}
          {activeTab === "Contacts" && <ContactsTab supplierId={id} />}
          {activeTab === "Projects" && <ProjectsTab />}
          {activeTab === "Contracts" && <ContractsTab supplierId={id} />}
          {activeTab === "Invoices" && <InvoicesTab />}
          {activeTab === "Follow-Ups" && <FollowUpsTab />}
          {activeTab === "Files" && <FilesTab supplierId={id} />}
          {activeTab === "Notes" && <NotesTab supplierId={id} />}
          {activeTab === "Timeline" && <TimelineTab timeline={supplier.timeline || []} />}

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
