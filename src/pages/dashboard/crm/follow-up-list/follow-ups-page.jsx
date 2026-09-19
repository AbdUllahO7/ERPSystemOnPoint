import { useState } from "react";
import { 
  Building, 
  Users, 
  Phone, 
  Calendar as CalendarIcon,
  List as ListIcon 
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
    icon: Users,
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
    icon: Users,
  },
];

const MOCK_FOLLOW_UPS = Array.from({ length: 7 }).map((_, i) => ({
  id: i + 1,
  type: "Call",
  topic: "Topic",
  relatedTo: "Customer Name",
  dateTime: "23/7/2025 AT 19:57 PM",
  status: "Scheduled",
}));

export default function FollowUpsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const navigate = useNavigate();

  const tabs = ["All", "Next", "Complete", "Past"];

  const columns = [
    { 
      key: "type", 
      label: "Type",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <span className="font-medium">{row.type}</span>
        </div>
      )
    },
    { key: "topic", label: "Topic" },
    { 
      key: "relatedTo", 
      label: "Related To",
      render: (row) => <span className="text-blue-500 hover:underline cursor-pointer">{row.relatedTo}</span>
    },
    { key: "dateTime", label: "Date & Time" },
    { 
      key: "status", 
      label: "Status",
      render: (row) => (
        <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-lg text-xs font-semibold">
          {row.status}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
        <span>Follow-Ups</span>
        <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 cursor-pointer">
          i
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
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

      <div className="flex items-center gap-6 border-b border-border mt-4 overflow-x-auto">
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

      {viewMode === "list" ? (
        <div className="-mt-4">
          <DataView
            data={MOCK_FOLLOW_UPS}
            getRowId={(row) => row.id}
            // selectable
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
              onClick: () => console.log("Add Follow-Up"),
            }}
            columns={columns}
            pagination={{
              page: page,
              totalPages: 1,
              onPageChange: setPage,
              prevLabel: "Pre",
              nextLabel: "Next",
            }}
            toolbarAddon={
              <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    viewMode === "list" ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-gray-200"
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    viewMode === "calendar" ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-gray-200"
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
            }
          />
        </div>
      ) : (
        <div className="bg-white border rounded-b-xl shadow-sm overflow-hidden">
          {/* Calendar Toolbar matches DataView style manually */}
          <div className="p-4 border-t border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 max-w-sm w-full">
              <input 
                className="flex-1 h-10 px-3 border rounded-lg text-sm bg-transparent outline-none focus:border-blue-500" 
                placeholder="Search by id or employee name..." 
              />
              <Button variant="outline" className="h-10 gap-2 bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100">
                Filter
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    viewMode === "list" ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-gray-200"
                  }`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    viewMode === "calendar" ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-gray-200"
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
              </Button>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              </Button>
              <Button variant="outline" className="h-10 gap-2">
                Export
              </Button>
              <Button className="h-10 gap-2">
                Add
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-b">
            {["MON", "TUE", "WED", "THUR", "FRI", "SAT", "SUN"].map(day => (
              <div key={day} className="p-3 text-xs font-semibold text-muted-foreground border-r last:border-r-0 uppercase">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-5">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i + 29 > 31 && i < 3 ? i + 29 : (i >= 3 ? i - 2 : i + 29); // Mocking dates roughly
              return (
                <div key={i} className="min-h-[120px] p-2 border-r border-b last:border-r-0 relative flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground mb-4">{dayNum}</span>
                  
                  {/* Mock some events randomly */}
                  {i % 3 === 0 && (
                    <div className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded truncate">
                      Call With Ahmad
                    </div>
                  )}
                  {i % 5 === 0 && (
                    <div className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded truncate">
                      Metting With Samer
                    </div>
                  )}
                  {i % 7 === 0 && (
                    <div className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-1 rounded truncate">
                      Visit To....
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
