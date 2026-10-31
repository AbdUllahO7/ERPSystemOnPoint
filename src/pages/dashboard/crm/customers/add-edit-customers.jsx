
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
import { Plus, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCustomer, updateCustomer, getCustomerById } from "@/lib/api";
import { useI18n } from "@/context/translate-api";
import { cn } from "@/lib/utils";

export default function AddEditCustomers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { locale } = useI18n();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    type: "Individual",
    sector: "",
    status: "Active",
    email: "",
    phone: "",
    website: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const isFormValid = Boolean(
    formData.name?.trim() && formData.phone?.trim() && formData.type && formData.status
  );

  const { data: customerData, isLoading: isFetching } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (customerData) {
      const data = customerData?.data?.data || customerData?.data || customerData;
      if (!data || typeof data !== "object") return;

      const rawType = data.customerType || data.customer_Type || data.type || "";
      let normalizedType = rawType;
      if (rawType.toLowerCase() === "company") normalizedType = "Company";
      else if (rawType.toLowerCase() === "individual") normalizedType = "Individual";

      const rawStatus = data.status || "";
      const validStatuses = ["Active", "Distinct", "Old", "Unacceptable", "Unreliable"];
      const matchedStatus =
        validStatuses.find((s) => s.toLowerCase() === rawStatus.toLowerCase()) || rawStatus;

      setFormData({
        name: data.customerName || data.name || data.customer_Name || "",
        type: normalizedType,
        sector: data.sector || "",
        status: matchedStatus,
        email: data.email || "",
        phone: data.phone || data.phone_Number || data.phoneNumber || "",
        website: data.website || data.webSite || "",
        address: data.address || "",
      });
    }
  }, [customerData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const addMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      toast.success("Customer added successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["allCustomersList"] });
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
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["allCustomersList"] });
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      navigate("/dashboard/crm/customers");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update customer!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = true;
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = true;
    }
    if (!formData.type) {
      newErrors.type = true;
    }
    if (!formData.status) {
      newErrors.status = true;
    }
    if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.name) {
        toast.error(locale === "ar" ? "اسم العميل مطلوب" : "Customer name is required");
      } else if (newErrors.phone) {
        toast.error(locale === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required");
      } else if (newErrors.email) {
        toast.error(locale === "ar" ? "يرجى إدخال بريد إلكتروني صالح" : "Please enter a valid email address");
      } else if (newErrors.type) {
        toast.error(locale === "ar" ? "يرجى تحديد نوع العميل" : "Please select customer type");
      } else if (newErrors.status) {
        toast.error(locale === "ar" ? "يرجى تحديد حالة العميل" : "Please select customer status");
      }
      return;
    }

    if (isEdit) {
      updateMutation.mutate({
        id,
        customer_Name: formData.name.trim(),
        customerName: formData.name.trim(),
        name: formData.name.trim(),
        phone_Number: formData.phone.trim(),
        phoneNumber: formData.phone.trim(),
        phone: formData.phone.trim(),
        address: formData.address?.trim() || "",
        email: formData.email?.trim() || "",
        status: formData.status,
        customer_Type: formData.type,
        customerType: formData.type,
        type: formData.type,
        sector: formData.sector?.trim() || "",
        webSite: formData.website?.trim() || "",
        website: formData.website?.trim() || "",
      });
    } else {
      addMutation.mutate({
        customer_Name: formData.name.trim(),
        customerName: formData.name.trim(),
        name: formData.name.trim(),
        customer_Type: formData.type || "Individual",
        customerType: formData.type || "Individual",
        type: formData.type || "Individual",
        sector: formData.sector?.trim() || "",
        status: formData.status || "Active",
        email: formData.email?.trim() || "",
        phone_Number: formData.phone.trim(),
        phoneNumber: formData.phone.trim(),
        phone: formData.phone.trim(),
        webSite: formData.website?.trim() || "",
        website: formData.website?.trim() || "",
        address: formData.address?.trim() || "",
      });
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm">Loading customer details...</p>
      </div>
    );
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
        <Button
          onClick={handleSubmit}
          className="gap-2"
          disabled={isLoading || !isFormValid}
          title={!isFormValid ? "Please fill in required fields (Name, Phone, Type, Status)" : ""}
        >
          <Plus className="w-4 h-4" />
          {isLoading ? "Saving..." : isEdit ? "Save" : "Add"}
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-1">
              <span>Name</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Name"
              className={cn("h-11 bg-transparent", errors.name && "border-red-500 focus-visible:ring-red-500")}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">
                {locale === "ar" ? "اسم العميل مطلوب" : "Customer name is required"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-semibold text-foreground flex items-center gap-1">
              <span>Type</span>
              <span className="text-red-500">*</span>
            </Label>
            <Select
              key={formData.type || "type-select"}
              value={formData.type}
              onValueChange={(val) => handleSelectChange("type", val)}
            >
              <SelectTrigger className={cn("!h-11 w-full bg-transparent", errors.type && "border-red-500 focus-visible:ring-red-500")}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Company">Company</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-red-500 font-medium">
                {locale === "ar" ? "نوع العميل مطلوب" : "Customer type is required"}
              </p>
            )}
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
            <Label htmlFor="status" className="text-sm font-semibold text-foreground flex items-center gap-1">
              <span>Status</span>
              <span className="text-red-500">*</span>
            </Label>
            <Select
              key={formData.status || "status-select"}
              value={formData.status}
              onValueChange={(val) => handleSelectChange("status", val)}
            >
              <SelectTrigger className={cn("!h-11 w-full bg-transparent", errors.status && "border-red-500 focus-visible:ring-red-500")}>
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
            {errors.status && (
              <p className="text-xs text-red-500 font-medium">
                {locale === "ar" ? "حالة العميل مطلوبة" : "Customer status is required"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-foreground">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e-mail"
              className={cn("h-11 bg-transparent", errors.email && "border-red-500 focus-visible:ring-red-500")}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium">
                {locale === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email address"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-semibold text-foreground flex items-center gap-1">
              <span>Phone</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="phone"
              className={cn("h-11 bg-transparent", errors.phone && "border-red-500 focus-visible:ring-red-500")}
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 font-medium">
                {locale === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required"}
              </p>
            )}
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