import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeadById, updateFollowUpStatus, changeLeadStatus } from "@/lib/api";
import { Info, Edit, RefreshCcw, PhoneCall, Calendar, Plus, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { AddFollowUpDialog } from "./_components/add-follow-up-dialog";
import { ConvertToCustomerDialog } from "./_components/convert-to-customer-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [followUpType, setFollowUpType] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLeadById(id),
  });

  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (payload) => updateFollowUpStatus(payload),
    onSuccess: () => {
      toast.success("Follow-up status updated!");
      queryClient.invalidateQueries(["lead", id]);
    },
    onError: () => {
      toast.error("Failed to update follow-up status.");
    },
  });

  const handleUpdateFollowUpStatus = (followUpId, newStatus) => {
    statusMutation.mutate({
      id: followUpId,
      status: newStatus,
      executionNote:"note"
    });
  };

  const leadStatusMutation = useMutation({
    mutationFn: (payload) => changeLeadStatus(payload),
    onSuccess: () => {
      toast.success("Status changed successfully");
      queryClient.invalidateQueries(["lead", id]);
      queryClient.invalidateQueries(["leads"]);
    },
    onError: () => {
      toast.error("Failed to change status");
    },
  });

  const handleLeadStatusChange = (status) => {
    if (status === "Converted") {
      setIsConvertDialogOpen(true);
      return;
    }
    
    leadStatusMutation.mutate({
      leadId: id,
      newStatus: status,
      isPriceOfferAccepted: false,
      projectName: "",
      projectValue: 0,
    });
  };

  if (isLoading) return <div className="p-6">Loading lead details...</div>;
  if (isError || !data?.data) return <div className="p-6 text-red-500">Error loading lead details.</div>;

  const lead = data.data;

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : "LD";

  const renderStatusBadge = (status) => {
    let colorClass = "bg-gray-100 text-gray-600";
    switch (status) {
      case "New": colorClass = "bg-green-100 text-green-600"; break;
      case "Contacted": colorClass = "bg-blue-100 text-blue-600"; break;
      case "Qualified": colorClass = "bg-teal-100 text-teal-600"; break;
      case "Quotation": colorClass = "bg-yellow-100 text-yellow-600"; break;
      case "Converted": colorClass = "bg-purple-100 text-purple-600"; break;
      case "Lost": colorClass = "bg-red-100 text-red-600"; break;
    }
    return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${colorClass}`}>{status}</span>;
  };

  const renderFollowUpStatus = (status) => {
    let colorClass = "bg-gray-100 text-gray-600";
    if (status === "Scheduled") colorClass = "bg-blue-100 text-blue-600";
    if (status === "Completed") colorClass = "bg-green-100 text-green-600";
    if (status === "Cancelled" || status === "Missed") colorClass = "bg-red-100 text-red-600";
    return <span className={`px-2 py-1 rounded-md text-xs font-semibold ${colorClass}`}>{status}</span>;
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">Lead Details</h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/crm/leads")}>Leads</span>
          <span>/</span>
          <span className="font-medium text-foreground">Lead Details</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-500 text-white rounded-xl flex items-center justify-center text-3xl font-bold">
                {getInitials(lead.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">{lead.name}</h3>
                  {renderStatusBadge(lead.status)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2" disabled={leadStatusMutation.isPending}>
                    {leadStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                    Change Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-2 space-y-1">
                  <DropdownMenuItem 
                    onClick={() => handleLeadStatusChange("New")}
                    className="justify-center cursor-pointer bg-green-50 text-green-600 hover:bg-green-100 focus:bg-green-100 font-medium py-2 rounded-md"
                  >
                    New
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleLeadStatusChange("Contacted")}
                    className="justify-center cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 focus:bg-blue-100 font-medium py-2 rounded-md"
                  >
                    Contacted
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleLeadStatusChange("Qualified")}
                    className="justify-center cursor-pointer bg-cyan-50 text-cyan-500 hover:bg-cyan-100 focus:bg-cyan-100 font-medium py-2 rounded-md"
                  >
                    Qualified
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleLeadStatusChange("Quotation")}
                    className="justify-center cursor-pointer bg-orange-50 text-orange-500 hover:bg-orange-100 focus:bg-orange-100 font-medium py-2 rounded-md"
                  >
                    Quotation
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleLeadStatusChange("Converted")}
                    className="justify-center cursor-pointer bg-slate-50 text-slate-500 hover:bg-slate-100 focus:bg-slate-100 font-medium py-2 rounded-md"
                  >
                    Converted
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleLeadStatusChange("Lost")}
                    className="justify-center cursor-pointer bg-red-50 text-red-500 hover:bg-red-100 focus:bg-red-100 font-medium py-2 rounded-md"
                  >
                    Lost
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="gap-2" onClick={() => navigate(`/dashboard/crm/leads/edit/${id}`)}>
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Company</h4>
                <p className="text-sm text-muted-foreground mt-1">{lead.company || "-"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">E-mail</h4>
                <p className="text-sm text-muted-foreground mt-1">{lead.email || "-"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Phone</h4>
                <p className="text-sm text-muted-foreground mt-1">{lead.phone || "-"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Responsible</h4>
                <p className="text-sm text-muted-foreground mt-1">{lead.responsibleName || "None"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Created At</h4>
                <p className="text-sm text-muted-foreground mt-1">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Expected value</h4>
                <p className="text-sm text-blue-500 font-medium mt-1">${lead.expectedValue || 0}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-foreground">Notes</h4>
              <p className="text-sm text-muted-foreground mt-1">{lead.notes || "-"}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Quotes */}
        <div className="space-y-6">
          {/* Price Quote */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Price Quote</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium">{lead.quoteTitle || "-"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Value</span>
                <span className="font-medium text-blue-500">${lead.quoteValue || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{lead.quoteDate ? new Date(lead.quoteDate).toLocaleDateString() : "-"}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 bg-transparent"
                onClick={() => {
                  setFollowUpType("Call");
                  setIsFollowUpDialogOpen(true);
                }}
              >
                <PhoneCall className="w-4 h-4 text-muted-foreground" />
                Schedule Call
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 bg-transparent"
                onClick={() => {
                  setFollowUpType("Meeting");
                  setIsFollowUpDialogOpen(true);
                }}
              >
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Meeting Scheduling
              </Button>
              <Button 
                className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white mt-4"
                onClick={() => setIsConvertDialogOpen(true)}
              >
                <RefreshCcw className="w-4 h-4" />
                Convert to Customer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-Up Log */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Follow-Up Log</h3>
          <Button 
            className="gap-2" 
            onClick={() => {
              setFollowUpType("");
              setIsFollowUpDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        <div className="space-y-4">
          {lead.followUps && lead.followUps.length > 0 ? (
            lead.followUps.map((followUp) => (
              <div key={followUp.id} className="p-4 border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-1 sm:mt-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{followUp.topic || "Follow-up"}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {followUp.type} • {followUp.scheduledDate ? new Date(followUp.scheduledDate).toLocaleString() : "-"}
                    </p>
                    {followUp.executionNote && (
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-foreground">Notes</span>
                        <p className="text-xs text-muted-foreground">{followUp.executionNote}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {followUp.status === "Scheduled" && (
                    <>
                      <button 
                        onClick={() => handleUpdateFollowUpStatus(followUp.id, "Completed")}
                        disabled={statusMutation.isPending}
                        className="w-8 h-8 rounded bg-green-50 text-green-500 border border-green-200 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleUpdateFollowUpStatus(followUp.id, "Canceled")}
                        disabled={statusMutation.isPending}
                        className="w-8 h-8 rounded bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {renderFollowUpStatus(followUp.status)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No follow-ups logged yet.
            </div>
          )}
        </div>
      </div>
      <AddFollowUpDialog 
        isOpen={isFollowUpDialogOpen} 
        onClose={() => setIsFollowUpDialogOpen(false)} 
        leadId={id} 
        defaultType={followUpType}
      />
      
      <ConvertToCustomerDialog 
        isOpen={isConvertDialogOpen}
        onClose={() => setIsConvertDialogOpen(false)}
        lead={lead}
      />
    </div>
  );
}
