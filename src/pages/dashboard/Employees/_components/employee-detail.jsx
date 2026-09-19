import { useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Info,
  Pencil,
  MoreVertical,
  CheckCircle2,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CalendarDays,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EmployeeAttendanceTab from "./employee-attendance-tab";
import EmployeeLeavesTab from "./employee-leaves-tab";
import EmployeeSalaryTab from "./employee-salary-tab";
import EmployeeDocumentsTab from "./employee-documents-tab";
import EmployeeContractsTab from "./employee-contracts-tab";
import EmployeePerformanceTab from "./employee-performance-tab";
import { useQuery } from "@tanstack/react-query";
import { getEmployeeById } from "../../../../lib/api";
// import { getEmployeeById } from "../../../lib/api";

export default function EmployeeDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get("tab") || "basic-info";

  const tabs = [
    { id: "basic-info", label: "Basic information" },
    { id: "attendance", label: "Attendance" },
    { id: "leaves", label: "Leaves" },
    { id: "salary", label: "Salary" },
    { id: "documents", label: "Documents" },
    { id: "contracts", label: "Contracts" },
    { id: "performance", label: "Performance" },
  ];

  const { data: employeeDataResponse, isLoading } = useQuery({
    queryKey: ["getEmployeeById", id],
    queryFn: () => getEmployeeById(id),
    enabled: !!id,
  });

  const employee = employeeDataResponse?.data || {};

  return (
    <div className="space-y-6">
      {/* Header / Breadcrumb */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">Employee Profile</h2>
          <Info className="size-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          <Link to="/dashboard/hr/employees" className="hover:underline">Employees</Link> / Employee Profile
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="size-24 rounded-2xl bg-[#0b80eb] text-white flex items-center justify-center text-3xl font-bold uppercase">
              {employee.firstName ? employee.firstName[0] : ""}
              {employee.lastName ? employee.lastName[0] : ""}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
              <CheckCircle2 className="size-6 text-green-500 fill-green-500/20" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-foreground">
                {employee.firstName} {employee.lastName}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">
                {employee.statusName || "Active"}
              </span>
            </div>
            <p className="text-muted-foreground">{employee.jobTitleName || "-"}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <Briefcase className="size-4" />
                <span>Job Number : <span className="text-primary font-medium">#{employee.jobNumber || "-"}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="size-4" />
                <span>Department : <span className="text-primary font-medium cursor-pointer hover:underline">{employee.departmentName || employee.sectionName || "-"}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <span>Join Date : <span className="text-primary font-medium">{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "-"}</span></span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/dashboard/hr/employees/edit/${id}`)}>
            <Pencil className="size-4" />
            Edit Profile
          </Button>
          <Button variant="outline" size="icon">
            <MoreVertical className="size-4" />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border shadow-sm p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
            <p className="text-xl font-bold text-foreground">{employee.attendanceRate || 0}%</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CalendarDays className="size-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining holidays</p>
            <p className="text-xl font-bold text-foreground">{employee.remainingHolidays || 0} Days</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-4 flex items-center gap-4 border-l-4 border-l-orange-500">
          <div className="size-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <TrendingUp className="size-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Performance</p>
            <p className="text-xl font-bold text-foreground">{employee.performanceScore || 0} / 5</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Shift Rule</p>
            <p className="text-xl font-bold text-foreground truncate max-w-[150px]">{employee.shiftRuleName || "-"}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="flex items-center gap-6 px-6 border-b overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {currentTab === "basic-info" && (
            <div className="space-y-8">
              {/* Grid 1 */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">First Name</p>
                  <p className="text-sm text-muted-foreground">{employee.firstName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Last name</p>
                  <p className="text-sm text-muted-foreground">{employee.lastName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Father name</p>
                  <p className="text-sm text-muted-foreground">{employee.fatherName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Mother name</p>
                  <p className="text-sm text-muted-foreground">{employee.motherName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Birth date</p>
                  <p className="text-sm text-muted-foreground">{employee.birthDate && employee.birthDate !== "0001-01-01T00:00:00" ? new Date(employee.birthDate).toLocaleDateString() : "-"}</p>
                </div>
              </div>

              {/* Grid 2 */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Department</p>
                  <p className="text-sm text-muted-foreground">{employee.departmentName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Sector</p>
                  <p className="text-sm text-muted-foreground">{employee.sectionName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Office</p>
                  <p className="text-sm text-muted-foreground">{employee.officeName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Position</p>
                  <p className="text-sm text-muted-foreground">{employee.positionName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">Direct Manager</p>
                  <p className="text-sm text-primary font-medium hover:underline cursor-pointer">{employee.managerName || "-"}</p>
                </div>
              </div>

              {/* Contact Info Row */}
              <div className="border-t pt-8 mt-2">
                <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-0.5">Email</p>
                      <p className="text-sm font-medium text-foreground">{employee.email || "-"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-0.5">Phone Number</p>
                      <p className="text-sm font-medium text-foreground">{employee.phone || "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-0.5">Location</p>
                      <p className="text-sm font-medium text-foreground">-</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "attendance" && <EmployeeAttendanceTab />}
          {currentTab === "leaves" && <EmployeeLeavesTab />}
          {currentTab === "salary" && <EmployeeSalaryTab />}
          {currentTab === "documents" && <EmployeeDocumentsTab />}
          {currentTab === "contracts" && <EmployeeContractsTab />}
          {currentTab === "performance" && <EmployeePerformanceTab />}
          
          {currentTab !== "basic-info" && currentTab !== "attendance" && currentTab !== "leaves" && currentTab !== "salary" && currentTab !== "documents" && currentTab !== "contracts" && currentTab !== "performance" && (
            <div className="py-12 text-center text-muted-foreground">
              Content for {tabs.find(t => t.id === currentTab)?.label} will be available soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
