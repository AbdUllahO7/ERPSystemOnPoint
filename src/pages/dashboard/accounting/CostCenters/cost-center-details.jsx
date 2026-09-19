import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { getCostCenterById } from "../../../../lib/api";

export default function CostCenterDetails() {
  const { id } = useParams();

  const { data: costCenterData, isLoading } = useQuery({
    queryKey: ["getCostCenterById", id],
    queryFn: () => getCostCenterById(id),
  });

  const data = costCenterData?.data || {};

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-foreground">Cost Center Details</h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Link to="/dashboard/accounting/cost-centers" className="hover:text-primary transition-colors">
            Cost Centers
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Cost Center Details</span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading details...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Cost Center Code</p>
              <p className="text-base text-blue-500">{data.cost_Center_Number || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Cost Center Name</p>
              <p className="text-base text-muted-foreground">{data.cost_Center_Name || "N/A"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
