import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Info, Plus, Trash2, Check, FileText, ArrowLeft, ShieldCheck, CheckCircle2, User, Calendar, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomerProjectById, updateProjectPercentage } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: projectData, isLoading, isError } = useQuery({
    queryKey: ["projectDetails", id],
    queryFn: () => getCustomerProjectById(id),
    enabled: !!id,
  });

  const project = projectData?.data || {};

  const updateMutation = useMutation({
    mutationFn: (data) => updateProjectPercentage(data),
    onSuccess: () => {
      toast.success("Progress updated successfully");
      queryClient.invalidateQueries(["projectDetails", id]);
    },
    onError: () => toast.error("Failed to update progress"),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading project details...</div>;
  }

  if (isError || !project.id) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Project details could not be loaded.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/crm/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const completionPerc = Number(project.completionPercentage || 0);
  const initials = project.projectName ? project.projectName.substring(0, 2).toUpperCase() : "PR";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate("/dashboard/crm/projects")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Project Details
              <Info className="w-4 h-4 text-muted-foreground" />
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/crm/projects")}>
                Projects
              </span>
              <span>/</span>
              <span>{project.projectName}</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="gap-2 bg-white"
          onClick={() => navigate(`/dashboard/crm/projects/edit/${id}`)}
        >
          <Edit className="w-4 h-4" />
          Edit Project
        </Button>
      </div>

      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-2xl border shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{project.projectName}</h3>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                {project.status || "InProgress"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ID: #{project.id.substring(0, 8)} • Value: ${Number(project.projectValue || project.value || 0).toLocaleString()}
            </p>
            {project.customerId && (
              <button
                onClick={() => navigate(`/dashboard/crm/customers/${project.customerId}`)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-medium"
              >
                <User className="w-3.5 h-3.5" />
                Customer: {project.customerName || `#${project.customerId.substring(0, 8)}`}
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto w-full md:w-auto">
          <div className="flex-1 md:flex-none border border-blue-200 bg-blue-50/60 rounded-xl p-3.5 text-center min-w-[120px]">
            <p className="text-blue-700 text-xs mb-1 font-medium">Operational Progress</p>
            <p className="text-blue-900 font-bold text-xl">{completionPerc}%</p>
          </div>
          <div className="flex-1 md:flex-none border border-emerald-200 bg-emerald-50/60 rounded-xl p-3.5 text-center min-w-[120px]">
            <p className="text-emerald-700 text-xs mb-1 font-medium">Start Date</p>
            <p className="text-emerald-900 font-semibold text-sm">
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}
            </p>
          </div>
          <div className="flex-1 md:flex-none border border-purple-200 bg-purple-50/60 rounded-xl p-3.5 text-center min-w-[120px]">
            <p className="text-purple-700 text-xs mb-1 font-medium">End Date</p>
            <p className="text-purple-900 font-semibold text-sm">
              {project.endDate ? new Date(project.endDate).toLocaleDateString() : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Guidance Callout */}
      <div className="p-3.5 bg-blue-50/80 border-r-4 border-blue-600 rounded-lg text-xs space-y-1">
        <p className="font-bold text-blue-950 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          الفوترة ليست إنجازاً تشغيلياً (Operational Execution vs Billing):
        </p>
        <p className="text-blue-900 leading-relaxed">
          إصدار فاتورة بقيمة 50% من المشروع لا يثبت إنجاز 50% من العمل. ترتبط نسبة الإنجاز (CompletionPercentage) بتقدم المهام أو مراحل التنفيذ المعتمدة في الميدان، مع إظهار الفوترة كمؤشر مستقل.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scope and Deliverables */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 space-y-4">
            <h4 className="font-bold text-base text-foreground">Project Scope & Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {project.description || "No description provided for this project."}
            </p>
          </div>

          {/* Quick Progress Update Card */}
          <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 space-y-4">
            <h4 className="font-bold text-base text-foreground">Update Execution Progress</h4>
            <p className="text-xs text-muted-foreground">
              Adjust the operational completion percentage based on current milestone deliverables.
            </p>
            <div className="flex items-center gap-3">
              {[25, 50, 75, 100].map((val) => (
                <Button
                  key={val}
                  variant={completionPerc === val ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateMutation.mutate({
                      id: project.id,
                      newPercentage: val,
                      status: val === 100 ? "Completed" : "InProgress",
                    })
                  }
                  disabled={updateMutation.isPending}
                >
                  {val}%
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 space-y-4">
            <h4 className="font-bold text-base text-foreground">Contractual Details</h4>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Contractual Value</span>
                <span className="font-bold text-blue-600 text-sm">
                  ${Number(project.projectValue || project.value || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-foreground">{project.status || "InProgress"}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Linked Contract</span>
                <span className="font-medium text-foreground">
                  {project.contractId ? `#${project.contractId.substring(0, 8)}` : "None"}
                </span>
              </div>
            </div>

            {project.customerId && (
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate(`/dashboard/crm/customers/${project.customerId}`)}
              >
                View Customer Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
