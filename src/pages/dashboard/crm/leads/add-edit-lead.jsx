import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeadById, createLead, updateLead } from "@/lib/api";
import toast from "react-hot-toast";

export default function AddEditLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phoneNumber: "",
    status: "New",
    expectedValue: "",
    responsible: null,
    note: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLeadById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data?.data) {
      const lead = data.data;
      console.log(lead?.status)
      setFormData({
        name: lead.name || "",
        company: lead.company || "",
        email: lead.email || "",
        phoneNumber: lead.phone || lead.phoneNumber || "",
        status: lead.status || "",
        expectedValue: lead.expectedValue || "",
        responsible: lead.responsibleId || null,
        note: lead.notes || lead.note || "",
      });
    }
  }, [data]);
  console.log(formData.status)

  const mutation = useMutation({
    mutationFn: (payload) => isEdit ? updateLead(payload) : createLead(payload),
    onSuccess: () => {
      toast.success(isEdit ? "Lead updated successfully" : "Lead added successfully");
      queryClient.invalidateQueries(["leads"]);
      navigate("/dashboard/crm/leads");
    },
    onError: () => {
      toast.error(isEdit ? "Failed to update lead" : "Failed to add lead");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      expectedValue: Number(formData.expectedValue) || 0,
      responsible: null, // As requested: ابعن دي responsible ب null
    };

    if (isEdit) {
      payload.id = id;
    } else {
      delete payload.status; // status is only in Update payload per API docs
    }

    mutation.mutate(payload);
  };

  if (isEdit && isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {isEdit ? "Edit Lead" : "Add Lead"}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/crm/leads")}>Leads</span>
            <span>/</span>
            <span>{isEdit ? "Edit Lead" : "Add Lead"}</span>
          </div>
        </div>
        <Button onClick={handleSubmit} className="gap-2" disabled={mutation.isPending}>
          <Plus className="w-4 h-4" />
          {mutation.isPending ? "Saving..." : isEdit ? "Save" : "Add"}
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Name"
              className="h-11 bg-transparent"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-semibold text-foreground">Company</Label>
            <Input
              id="company"
              name="company"
              placeholder="Company"
              className="h-11 bg-transparent"
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-foreground">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e-mail"
              className="h-11 bg-transparent"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-semibold text-foreground">Phone</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder="phone"
              className="h-11 bg-transparent"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold text-foreground">Status</Label>
            <Select 
              key={formData.status} // Force re-render when data arrives to avoid Radix UI desync
              value={formData.status || "New"} 
              onValueChange={(val) => handleSelectChange("status", val)}
              disabled={!isEdit} // Disable changing status when creating
            >
              <SelectTrigger className="!h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Qualified">Qualified</SelectItem>
                <SelectItem value="Quotation">Quotation</SelectItem>
                <SelectItem value="Converted">Converted</SelectItem>
                <SelectItem value="Lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div className="space-y-2">
            <Label htmlFor="expectedValue" className="text-sm font-semibold text-foreground">Expected value</Label>
            <Input
              id="expectedValue"
              name="expectedValue"
              placeholder="Expected value"
              className="h-11 bg-transparent"
              value={formData.expectedValue}
              onChange={handleChange}
            />
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="responsible" className="text-sm font-semibold text-foreground">Responsible</Label>
            <Select value={formData.responsible} onValueChange={(val) => handleSelectChange("responsible", val)}>
              <SelectTrigger className="!h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Responsible" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="John Doe">John Doe</SelectItem>
                <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="note" className="text-sm font-semibold text-foreground">Notes</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="Notes"
              className="min-h-[120px] bg-transparent"
              value={formData.note}
              onChange={handleChange}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
