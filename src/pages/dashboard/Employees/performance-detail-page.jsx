import { Info, ChevronRight } from "lucide-react";

export default function PerformanceDetailPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 p-6 space-y-6">
        {/* Header & Breadcrumbs */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1e293b]">Performance Details</h2>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>Employees</span>
            <ChevronRight className="w-4 h-4" />
            <span>Employee Details</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Performance Details</span>
            <Info className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-8 mt-6">
          <div className="flex gap-24 mb-10">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Type Of Performance</p>
              <span className="px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                Positive
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Date Added</p>
              <p className="text-sm text-muted-foreground">23/7/2023</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Performance Text</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-6xl">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
