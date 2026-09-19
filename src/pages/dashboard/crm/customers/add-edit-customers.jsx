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
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCustomer, updateCustomer, getCustomerById } from "@/lib/api";

export default function AddEditCustomers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    sector: "",
    status: "",
    email: "",
    phone: "",
    website: "",
    address: "",
  });

  const { data: customerData, isLoading: isFetching } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (customerData?.data) {
      const data = customerData.data;
      setFormData({
        name: data.customerName || data.name || "",
        type: data.customer_Type || data.type || "",
        sector: data.sector || "",
        status: data.status || "",
        email: data.email || "",
        phone: data.phone_Number || data.phone || "",
        website: data.webSite || data.website || "",
        address: data.address || "",
      });
    }
  }, [customerData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      toast.success("Customer added successfully!");
      queryClient.invalidateQueries(["customers"]);
      navigate("/dashboard/crm/customers");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to add customer!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => {
      toast.success("Customer updated successfully!");
      queryClient.invalidateQueries(["customers"]);
      navigate("/dashboard/crm/customers");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update customer!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate({
        id,
        customer_Name: formData.name,
        phone_Number: formData.phone,
        address: formData.address,
        email: formData.email,
        status: formData.status,
        // include other fields just in case they are accepted
        customer_Type: formData.type,
        sector: formData.sector,
        webSite: formData.website,
      });
    } else {
      addMutation.mutate({
        customer_Name: formData.name,
        customer_Type: formData.type || "Individual",
        sector: formData.sector,
        status: formData.status || "Active",
        email: formData.email,
        phone_Number: formData.phone,
        webSite: formData.website,
        address: formData.address,
      });
    }
  };

  if (isFetching) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  const isLoading = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {isEdit ? "Edit Customer" : "Add Customers"}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/crm/customers")}>Customers</span>
            <span>/</span>
            <span>{isEdit ? "Edit Customer" : "Add Customers"}</span>
          </div>
        </div>
        <Button onClick={handleSubmit} className="gap-2" disabled={isLoading}>
          <Plus className="w-4 h-4" />
          {isEdit ? "Save" : "Add"}
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <Label htmlFor="type" className="text-sm font-semibold text-foreground">Type</Label>
            <Select value={formData.type} onValueChange={(val) => handleSelectChange("type", val)}>
              <SelectTrigger className="!h-11 w-full bg-transparent">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector" className="text-sm font-semibold text-foreground">Sector</Label>
            <Input
              id="sector"
              name="sector"
              placeholder="Sector"
              className="h-11 bg-transparent"
              value={formData.sector}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold text-foreground">Status</Label>
            <Select value={formData.status} onValueChange={(val) => handleSelectChange("status", val)}>
              <SelectTrigger className="!h-11 w-full bg-transparent">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Distinct">Distinct</SelectItem>
                <SelectItem value="Old">Old</SelectItem>
                <SelectItem value="Unacceptable">Unacceptable</SelectItem>
                <SelectItem value="Unreliable">Unreliable</SelectItem>
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
            <Label htmlFor="website" className="text-sm font-semibold text-foreground">Website</Label>
            <Input
              id="website"
              name="website"
              placeholder="website"
              className="h-11 bg-transparent"
              value={formData.website}
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
        </form>
      </div>
    </div>
  );
}