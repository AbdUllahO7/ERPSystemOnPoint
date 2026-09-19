import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupplierById, createSupplier, updateSupplier } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function AddEditSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    supplier_Name: "",
    contact_Person: "",
    phone_Number: "",
    tax_Number: "",
    address: "",
    webSite: "",
    email: "",
    status: "Active",
    supplier_Type: "Local",
  });

  const { data: supplierData, isLoading: isLoadingSupplier } = useQuery({
    queryKey: ["supplier", id],
    queryFn: () => getSupplierById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && supplierData?.data) {
      const data = supplierData.data;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        supplier_Name: data.supplierName || "",
        contact_Person: data.contact_Person || "",
        phone_Number: data.phone || "",
        tax_Number: data.taxNumber || "",
        address: data.address || "",
        webSite: data.website || "",
        email: data.email || "",
        status: data.status || "Active",
        supplier_Type: data.supplierType || "Local",
      });
    }
  }, [supplierData, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateSupplier({ id, ...data }) : createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success(`Supplier ${isEdit ? "updated" : "added"} successfully`);
      navigate("/dashboard/crm/suppliers");
    },
    onError: () => {
      toast.error(`Failed to ${isEdit ? "update" : "add"} supplier`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isEdit && isLoadingSupplier) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            {isEdit ? "Edit Supplier" : "Add Supplier"}
            <Info className="w-4 h-4 text-muted-foreground" />
          </h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/crm/suppliers")}>Suppliers</span>
            <span>/</span>
            <span>{isEdit ? "Edit Supplier" : "Add Supplier"}</span>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="gap-2">
          <Plus className="w-4 h-4" />
          {isEdit ? "Save" : "Add"}
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="supplier_Name" className="text-sm font-semibold text-foreground">Name</Label>
            <Input
              id="supplier_Name"
              name="supplier_Name"
              placeholder="Name"
              className="h-11 bg-transparent"
              value={formData.supplier_Name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_Person" className="text-sm font-semibold text-foreground">Contact Person</Label>
            <Input
              id="contact_Person"
              name="contact_Person"
              placeholder="Contact Person"
              className="h-11 bg-transparent"
              value={formData.contact_Person}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_Type" className="text-sm font-semibold text-foreground">Supplier Type</Label>
            <Select value={formData.supplier_Type} onValueChange={(val) => handleSelectChange("supplier_Type", val)}>
              <SelectTrigger className="!h-11 w-full bg-transparent">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Local">Local</SelectItem>
                <SelectItem value="International">International</SelectItem>
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="phone_Number" className="text-sm font-semibold text-foreground">Phone</Label>
            <Input
              id="phone_Number"
              name="phone_Number"
              placeholder="phone"
              className="h-11 bg-transparent"
              value={formData.phone_Number}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webSite" className="text-sm font-semibold text-foreground">Website</Label>
            <Input
              id="webSite"
              name="webSite"
              placeholder="website"
              className="h-11 bg-transparent"
              value={formData.webSite}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-semibold text-foreground">Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="Address"
              className="h-11 bg-transparent"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_Number" className="text-sm font-semibold text-foreground">Tax ID number</Label>
            <Input
              id="tax_Number"
              name="tax_Number"
              placeholder="Tax ID number"
              className="h-11 bg-transparent"
              value={formData.tax_Number}
              onChange={handleChange}
            />
          </div>
        </form>
      </div>
    </div>
  );
}