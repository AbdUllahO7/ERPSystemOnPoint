import { Info, Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getContractById } from "../../../lib/api";

export default function ContractDetailPage() {
  const { id, contractId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["getContractById", contractId],
    queryFn: () => getContractById(contractId),
    enabled: !!contractId,
  });

  const contract = data?.data || {};

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading details...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 p-6 space-y-6">
        {/* Header & Breadcrumbs */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1e293b]">Contract Details</h2>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Link to="/dashboard/hr/employees" className="hover:underline">Employees</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/dashboard/hr/employees/${id || contract.employeeId}?tab=contracts`} className="hover:underline">Employee Details</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Contract Details</span>
            <Info className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-8 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Start Date</p>
              <p className="text-sm text-muted-foreground">{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">End Date</p>
              <p className="text-sm text-muted-foreground">{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Status</p>
              <span className={`px-3 py-1 rounded-md text-xs font-medium ${contract.status === "Active" ? "bg-blue-50 text-blue-600" : contract.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"}`}>
                {contract.status || "Active"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Salary</p>
              <p className="text-sm text-muted-foreground">${contract.salary || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Absence Days / Month</p>
              <p className="text-sm text-muted-foreground">{contract.allowedAbsenceDaysPerMonth || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Leave Hours / Month</p>
              <p className="text-sm text-muted-foreground">{contract.allowedLeaveHoursPerMonth || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Custom Annual Leave</p>
              <p className="text-sm text-muted-foreground">{contract.customAnnualLeaveBalance || 0}</p>
            </div>
          </div>
          
          <div className="mb-10">
            <p className="text-sm font-medium text-foreground mb-3">Notes</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-5xl whitespace-pre-wrap">
              {contract.contractText || "No notes provided."}
            </p>
          </div>
          
          {contract.attachmentUrl && (
            <div className="border-t border-border pt-8">
              <div className="inline-flex items-center gap-4 bg-card border border-red-100 rounded-xl p-4 shadow-sm min-w-[320px]">
                <div className="relative w-12 h-14 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  <div className="absolute top-0 right-0 w-3 h-3 bg-card rounded-bl" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-b border-l border-white/30 rounded-bl" />
                  <span className="mt-1">PDF</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Contract Details</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Attachment</p>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
