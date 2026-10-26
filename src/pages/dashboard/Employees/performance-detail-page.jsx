import { Info, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPerformanceById } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function PerformanceDetailPage() {
  const { id: employeeId, performanceId } = useParams();
  const navigate = useNavigate();

  const { data: performanceResponse, isLoading } = useQuery({
    queryKey: ["getPerformanceById", employeeId],
    queryFn: () => getPerformanceById(employeeId),
    enabled: !!employeeId,
  });

  const rawData = performanceResponse?.data || performanceResponse || {};
  
  // If API returns an array of performances for the employee, find the specific one or use the first
  const performance = Array.isArray(rawData)
    ? rawData.find((p) => String(p.id) === String(performanceId)) || rawData[0] || {}
    : rawData?.items
    ? rawData.items.find((p) => String(p.id) === String(performanceId)) || rawData.items[0] || {}
    : rawData;

  const type = performance.type || performance.performance_Type || "Positive";
  const isPositive = String(type).toLowerCase().includes("pos") || type === 1;
  const dateFormatted = performance.date || performance.created_At
    ? new Date(performance.date || performance.created_At).toLocaleDateString()
    : "N/A";
  const noteText = performance.note || performance.description || performance.performance_Text || "No performance note provided.";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-slate-500">Loading performance details...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background space-y-6">
      {/* Header & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight text-[#1e293b]">Performance Details</h2>
        </div>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground ps-11">
          <Link to="/dashboard/hr/employees" className="hover:underline">
            Employees
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/dashboard/hr/employees/${employeeId}?tab=performance`} className="hover:underline">
            Employee Details
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Performance Details</span>
          <Info className="w-4 h-4 ml-1" />
        </div>
      </div>

      {/* Content */}
      <div className="bg-card text-card-foreground rounded-2xl border shadow-xs p-8">
        <div className="flex flex-wrap gap-12 sm:gap-24 mb-8 pb-8 border-b border-slate-100">
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Type Of Performance</p>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                isPositive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {type}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Date Added</p>
            <p className="text-sm text-muted-foreground">{dateFormatted}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Performance Note / Text</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl bg-slate-50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
            {noteText}
          </p>
        </div>
      </div>
    </div>
  );
}
