import { useState } from "react";
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
import { Plus } from "lucide-react";

export default function AddEditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "",
    status: "",
    expectedValue: "",
    responsible: "",
    notes: "",
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
    console.log("Submit mock lead data:", formData);
    navigate("/dashboard/crm/leads");
  };

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
        <Button onClick={handleSubmit} className="gap-2">
          <Plus className="w-4 h-4" />
          {isEdit ? "Save" : "Add"}
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
            <Label htmlFor="phone" className="text-sm font-semibold text-foreground">Phone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="phone"
              className="h-11 bg-transparent"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm font-semibold text-foreground">Source</Label>
            <Select value={formData.source} onValueChange={(val) => handleSelectChange("source", val)}>
              <SelectTrigger className="!h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="Twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold text-foreground">Status</Label>
            <Select value={formData.status} onValueChange={(val) => handleSelectChange("status", val)}>
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

          <div className="space-y-2">
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
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes" className="text-sm font-semibold text-foreground">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Notes"
              className="min-h-[120px] bg-transparent"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
