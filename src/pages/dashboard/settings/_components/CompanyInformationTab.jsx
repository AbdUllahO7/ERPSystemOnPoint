import { useState, useEffect } from "react";
import { Building2, UploadCloud, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTenants, updateTenantSettings } from "@/lib/api";
import toast from "react-hot-toast";

export default function CompanyInformationTab() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    companyName: "",
    companyNameEn: "",
    taxIdNumber: "",
    commercialRegistrationNumber: "",
    email: "",
    phoneNumber: "",
    state: "",
    city: "",
    fullAddress: "",
    logo: "",
  });

  const { data: tenantsData, isLoading } = useQuery({
    queryKey: ["getTenants"],
    queryFn: getTenants,
  });

  useEffect(() => {
    const raw = tenantsData?.data || tenantsData;
    const tenant = Array.isArray(raw) ? raw[0] : (raw?.items ? raw.items[0] : raw);
    if (tenant && typeof tenant === "object") {
      setFormData((prev) => ({
        ...prev,
        companyName: tenant.companyName || tenant.tenantName || tenant.name || "",
        companyNameEn: tenant.companyNameEn || "",
        taxIdNumber: tenant.taxIdNumber || tenant.taxNumber || "",
        commercialRegistrationNumber: tenant.commercialRegistrationNumber || "",
        email: tenant.email || "",
        phoneNumber: tenant.phoneNumber || tenant.phone || "",
        state: tenant.state || "",
        city: tenant.city || "",
        fullAddress: tenant.fullAddress || tenant.address || "",
        logo: tenant.logo || "",
      }));
    }
  }, [tenantsData]);

  const saveMutation = useMutation({
    mutationFn: (data) => updateTenantSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getTenants"]);
      toast.success("Company information saved successfully!");
    },
    onError: (error) => {
      console.error("Failed to save company information:", error);
      toast.error(
        error?.message && error.message !== "An unexpected error occurred"
          ? error.message
          : "Failed to save company information!"
      );
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Header Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/40 shrink-0 overflow-hidden">
            {formData.logo ? (
              <img src={formData.logo} alt="Company Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {(formData.companyName || "P")[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Company Information</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Name, logo, address, and commercial registration
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || saveMutation.isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-11 shrink-0"
        >
          {saveMutation.isPending || saveMutation.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Save Changes
        </Button>
      </div>

      {/* Main Form Card */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-8">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground">Basic company information</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This data appears on all documents and invoices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Company name (Arabic)
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="اسم الشركة بالعربية"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Company name (English)
            </label>
            <Input
              value={formData.companyNameEn}
              onChange={(e) => handleChange("companyNameEn", e.target.value)}
              placeholder="Company name (English)"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Tax ID number
            </label>
            <Input
              value={formData.taxIdNumber}
              onChange={(e) => handleChange("taxIdNumber", e.target.value)}
              placeholder="Tax ID number"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Commercial Registration Number
            </label>
            <Input
              value={formData.commercialRegistrationNumber}
              onChange={(e) => handleChange("commercialRegistrationNumber", e.target.value)}
              placeholder="Commercial Registration Number"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">E-mail</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="e-mail"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Phone Number
            </label>
            <Input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="phone number"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">State / Region</label>
            <Input
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="State / Region"
              className="h-11"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-foreground">City</label>
            <Input
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="City"
              className="h-11"
            />
          </div>

          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-semibold text-foreground">Full Address</label>
            <Input
              value={formData.fullAddress}
              onChange={(e) => handleChange("fullAddress", e.target.value)}
              placeholder="Full Address"
              className="h-11"
            />
          </div>
        </div>

        {/* Upload Logo URL or file */}
        <div className="mt-8 space-y-2">
          <label className="text-sm font-semibold text-foreground">Logo URL</label>
          <Input
            value={formData.logo}
            onChange={(e) => handleChange("logo", e.target.value)}
            placeholder="https://example.com/logo.png"
            className="h-11"
          />
        </div>
      </div>
    </div>
  );
}
