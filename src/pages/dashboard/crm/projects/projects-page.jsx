import { useState } from "react";
import {
  Users as UsersIcon,
  Pencil,
  Trash2,
  Eye,
  Building,
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-600",
    icon: Building,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-emerald-500",
    icon: UsersIcon,
  },
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-900",
    icon: Building,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-orange-500",
    icon: UsersIcon,
  },
];

const MOCK_LEADS = [
  { id: "1", name: "Ahmed", company: "Company A", phone: "+971 25648..", source: "Facebook", value: "$350,000", responsible: "John Doe", status: "New", createdAt: "23/7/2025" },
  { id: "2", name: "Sarah", company: "Company B", phone: "+971 25648..", source: "Website", value: "$150,000", responsible: "Jane Smith", status: "Contacted", createdAt: "23/7/2025" },
  { id: "3", name: "Mike", company: "Company C", phone: "+971 25648..", source: "Referral", value: "$550,000", responsible: "Mike Johnson", status: "Qualified", createdAt: "23/7/2025" },
  { id: "4", name: "Emma", company: "Company D", phone: "+971 25648..", source: "LinkedIn", value: "$250,000", responsible: "Emily Brown", status: "Quotation", createdAt: "23/7/2025" },
  { id: "5", name: "Tom", company: "Company E", phone: "+971 25648..", source: "Google", value: "$450,000", responsible: "Tom Wilson", status: "Converted", createdAt: "23/7/2025" },
  { id: "6", name: "Lucy", company: "Company F", phone: "+971 25648..", source: "Twitter", value: "$650,000", responsible: "Lucy Davis", status: "Lost", createdAt: "23/7/2025" },
];

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();

  const tabs = ["All", "New", "Contacted", "Qualified", "Quotation", "Converted", "Lost"];

  // Filter leads based on active tab and search (mock logic)
  let filteredLeads = MOCK_LEADS;
  if (activeTab !== "All") {
    filteredLeads = filteredLeads.filter(lead => lead.status === activeTab);
  }
  if (search) {
    filteredLeads = filteredLeads.filter(
      lead => lead.name.toLowerCase().includes(search.toLowerCase()) || lead.id.includes(search)
    );
  }

  const columns = [
    { key: "id", label: "ID", render: (row) => <span className="text-blue-500 font-medium">{row.id}</span> },
    { key: "name", label: "Name" },
    { key: "company", label: "Company" },
    { key: "phone", label: "Phone" },
    { key: "source", label: "Source" },
    { key: "value", label: "Value", render: (row) => <span className="text-blue-500">{row.value}</span> },
    { key: "responsible", label: "Responsible" },
    { 
      key: "status", 
      label: "Status",
      render: (row) => {
        let colorClass = "bg-gray-100 text-gray-600";
        switch(row.status) {
          case "New": colorClass = "bg-green-100 text-green-600"; break;
          case "Contacted": colorClass = "bg-blue-100 text-blue-600"; break;
          case "Qualified": colorClass = "bg-teal-100 text-teal-600"; break;
          case "Quotation": colorClass = "bg-yellow-100 text-yellow-600"; break;
          case "Converted": colorClass = "bg-purple-100 text-purple-600"; break;
          case "Lost": colorClass = "bg-red-100 text-red-600"; break;
        }
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>{row.status}</span>;
      }
    },
    { key: "createdAt", label: "Created At" },
  ];

  const rowActionsMenu = [
    {
      items: [
        {
          key: "view",
          label: "View",
          icon: Eye,
          onClick: (row) =>navigate(`/dashboard/crm/projects/${row.id}`),
        },
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          onClick: (row) => navigate(`/dashboard/crm/leads/edit/${row.id}`),
        },
      ]
    },
    {
      items: [
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          destructive: true,
          onClick: (row) => console.log("Delete", row.id),
        },
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
        <span>Leads</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className={`text-xs font-semibold ${stat.isUp ? "text-green-500" : "text-red-500"}`}>
                  {stat.trend} {stat.isUp ? "↑" : "↓"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <DataView
        data={filteredLeads}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search by id or employee name...",
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => console.log("Filter clicked"),
        }}
        export={{
          label: "Export",
          onClick: () => console.log("Export clicked"),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/crm/leads/add"),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        pagination={{
          page: page,
          totalPages: 1,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
      />
    </div>
  );
}
