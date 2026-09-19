import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCcw, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeLeadStatus } from "@/lib/api";
import toast from "react-hot-toast";

export function ConvertToCustomerDialog({ isOpen, onClose, lead }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    isPriceOfferAccepted: false,
    projectName: "",
    projectValue: "",
  });

  const mutation = useMutation({
    mutationFn: (payload) => changeLeadStatus(payload),
    onSuccess: () => {
      toast.success("Lead converted to customer successfully!");
      queryClient.invalidateQueries(["lead", lead?.id]);
      queryClient.invalidateQueries(["leads"]);
      onClose();
      setFormData({ isPriceOfferAccepted: false, projectName: "", projectValue: "" });
    },
    onError: () => {
      toast.error("Failed to convert lead to customer.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectName || !formData.projectValue) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      leadId: lead.id,
      newStatus: "Converted",
      isPriceOfferAccepted: formData.isPriceOfferAccepted,
      projectName: formData.projectName,
      projectValue: Number(formData.projectValue),
    };

    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[501px] p-6 rounded-[28px] gap-[6px]">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0">
            <RefreshCcw className="w-5 h-5 text-muted-foreground" />
          </div>
          <DialogTitle className="text-lg m-0 font-semibold">Convert to Customer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-[10px] mt-2">
          <div className="flex items-center gap-3 p-3 border border-border rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Potential Customer : {lead?.name}</p>
              <p className="text-xs text-muted-foreground">Company: {lead?.company}</p>
            </div>
          </div>

          <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-xl">
            <p className="text-xs text-orange-600 font-medium leading-relaxed">
              The conversion requires accepting the price offer and creating a project for the client.
            </p>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input 
              type="checkbox"
              id="acceptPrice"
              checked={formData.isPriceOfferAccepted}
              onChange={(e) => setFormData(prev => ({...prev, isPriceOfferAccepted: e.target.checked}))}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="acceptPrice" className="text-sm font-medium text-muted-foreground">
              The price offer was accepted by the client
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#1e293b]">Project name</Label>
            <Input 
              placeholder="Project name"
              value={formData.projectName}
              onChange={(e) => setFormData(prev => ({...prev, projectName: e.target.value}))}
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-[#1e293b]">Project value</Label>
            <Input 
              type="number"
              placeholder="Project value"
              value={formData.projectValue}
              onChange={(e) => setFormData(prev => ({...prev, projectValue: e.target.value}))}
              className="h-10 text-sm"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#0070e0] hover:bg-[#005bb5] text-white mt-4 h-10 text-sm font-semibold rounded-lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Transforming..." : "Transform & Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
