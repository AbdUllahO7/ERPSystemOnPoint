import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Users, Building } from "lucide-react";
import DetailsTab from './details-tab';
import BranchTab from './branch-tab';
import EmployeeTab from './employee-tab';
import ArchiveTab from './archive-tab';
import { useParams, useSearchParams } from 'react-router-dom';

const stats = [
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-600",
    icon: Building
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-emerald-500",
    icon: Users
  },
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-900",
    icon: Building
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-orange-500",
    icon: Users
  }
];

export default function DepartmentDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = searchParams.get('tab') || 'details';
  
  const handleTabChange = (value) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Department Details</h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>Departments</span>
          <span>/</span>
          <span className="font-medium text-foreground">Department Details</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className={`text-xs font-semibold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend} {stat.isUp ? '↑' : '↓'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Section */}
      <div className="bg-card text-card-foreground rounded-xl border p-4 shadow-sm">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start border-b border-border rounded-none p-0 h-auto bg-transparent mb-6 gap-6 overflow-x-auto overflow-y-hidden flex-nowrap pb-1">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 py-3 font-medium text-muted-foreground hover:text-foreground transition-all duration-200 ease-in-out whitespace-nowrap"
            >
              Department Details
            </TabsTrigger>
            <TabsTrigger 
              value="section"
              className="data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 py-3 font-medium text-muted-foreground hover:text-foreground transition-all duration-200 ease-in-out whitespace-nowrap"
            >
              Sections
            </TabsTrigger>
            <TabsTrigger 
              value="employee"
              className="data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 py-3 font-medium text-muted-foreground hover:text-foreground transition-all duration-200 ease-in-out whitespace-nowrap"
            >
              Department Employee
            </TabsTrigger>
            <TabsTrigger 
              value="archive"
              className="data-[state=active]:border-b-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-1 py-3 font-medium text-muted-foreground hover:text-foreground transition-all duration-200 ease-in-out whitespace-nowrap"
            >
              Department Archive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <DetailsTab id={id} />
          </TabsContent>
          <TabsContent value="section">
            <BranchTab id={id} />
          </TabsContent>
          <TabsContent value="employee">
            <EmployeeTab id={id} />
          </TabsContent>
          <TabsContent value="archive">
            <ArchiveTab id={id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}