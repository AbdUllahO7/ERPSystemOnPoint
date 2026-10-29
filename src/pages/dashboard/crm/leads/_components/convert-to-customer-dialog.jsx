import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCcw, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeLeadStatus } from "@/lib/api";
import toast from "react-hot-toast";

export function ConvertToCustomerDialog({ isOpen, onClose, lead }) {
  const queryClient = useQueryClient();
  const isAlreadyConverted = lead?.status === "Converted";

  const [formData, setFormData] = useState({
    isPriceOfferAccepted: false,
    projectName: "",
    projectValue: "",
  });

  useEffect(() => {
    if (isOpen && lead) {
      setFormData({
        isPriceOfferAccepted: false,
        projectName: lead.company ? `Project - ${lead.company}` : "",
        projectValue: lead.expectedValue ? String(lead.expectedValue) : "",
      });
    }
  }, [isOpen, lead]);

  const mutation = useMutation({
    mutationFn: (payload) => changeLeadStatus(payload),
    onSuccess: () => {
      toast.success("Lead converted to customer successfully!");
      queryClient.invalidateQueries(["lead", lead?.id]);
      queryClient.invalidateQueries(["leads"]);
      onClose();
      setFormData({ isPriceOfferAccepted: false, projectName: "", projectValue: "" });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to convert lead to customer.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAlreadyConverted) {
      toast.error("This opportunity has already been converted to a customer.");
      return;
    }

    if (!formData.isPriceOfferAccepted) {
      toast.error("Please confirm that the price offer has been accepted by the client.");
      return;
    }

    if (!formData.projectName?.trim()) {
      toast.error("Please enter the project name.");
      return;
    }

    if (!formData.projectValue || Number(formData.projectValue) <= 0) {
      toast.error("Please specify a valid approved project value.");
      return;
    }

    const payload = {
      leadId: lead.id,
      newStatus: "Converted",
      isPriceOfferAccepted: true,
      projectName: formData.projectName.trim(),
      projectValue: Number(formData.projectValue),
    };

    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] p-6 rounded-[28px] gap-[10px]">
        <DialogHeader className="flex flex-row items-center gap-3 border-b pb-3">
          <div className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
            <RefreshCcw className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-lg m-0 font-semibold">Convert to Customer</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Approved conversion path upon agreement</p>
          </div>
        </DialogHeader>

        {isAlreadyConverted ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 my-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-amber-800">Already Converted</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                This opportunity has already been converted to a customer. The system prevents converting an opportunity more than once.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-[12px] mt-2">
            <div className="flex items-center gap-3 p-3 border border-border rounded-xl bg-card">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-foreground truncate">{lead?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {lead?.company ? `Company: ${lead.company}` : "No Company"} • Expected: ${lead?.expectedValue || 0}
                </p>
              </div>
            </div>

          

            <div className="flex items-center gap-2 py-1">
              <input 
                type="checkbox"
                id="acceptPrice"
                checked={formData.isPriceOfferAccepted}
                onChange={(e) => setFormData(prev => ({...prev, isPriceOfferAccepted: e.target.checked}))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <Label htmlFor="acceptPrice" className="text-sm font-medium text-foreground cursor-pointer">
                The price offer was accepted by the client <span className="text-rose-500">*</span>
              </Label>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Project Name <span className="text-rose-500">*</span></Label>
              <Input 
                placeholder="Project name"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({...prev, projectName: e.target.value}))}
                className="h-10 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">Approved Project Value ($) <span className="text-rose-500">*</span></Label>
                {lead?.expectedValue ? (
                  <span className="text-xs text-muted-foreground">Estimated was: ${lead.expectedValue}</span>
                ) : null}
              </div>
              <Input 
                type="number"
                placeholder="Approved project value"
                value={formData.projectValue}
                onChange={(e) => setFormData(prev => ({...prev, projectValue: e.target.value}))}
                className="h-10 text-sm"
                min="0.01"
                step="any"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Reflects the approved contractual value in the conversion, not necessarily the initial estimate.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#0070e0] hover:bg-[#005bb5] text-white mt-4 h-10 text-sm font-semibold rounded-lg"
              disabled={mutation.isPending || !formData.isPriceOfferAccepted || !formData.projectName || !formData.projectValue}
            >
              {mutation.isPending ? "Converting & Creating..." : "Transform & Create Project"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
