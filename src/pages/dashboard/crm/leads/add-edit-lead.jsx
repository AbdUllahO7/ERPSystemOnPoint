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
import { useI18n } from "@/context/translate-api";
import { cn } from "@/lib/utils";

export default function AddEditLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();
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

  const [errors, setErrors] = useState({});

  const isFormValid = Boolean(
    formData.name?.trim() && formData.phoneNumber?.trim()
  );

  const { data, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLeadById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      const lead = data?.data?.data || data?.data || data;
      if (!lead || typeof lead !== "object") return;

      const rawStatus = lead.status || "New";
      const validStatuses = ["New", "Contacted", "Qualified", "Quotation", "Converted", "Lost"];
      const matchedStatus =
        validStatuses.find((s) => s.toLowerCase() === rawStatus.toLowerCase()) || rawStatus;

      setFormData({
        name: lead.name || "",
        company: lead.company || "",
        email: lead.email || "",
        phoneNumber: lead.phone || lead.phoneNumber || "",
        status: matchedStatus,
        expectedValue:
          lead.expectedValue !== undefined && lead.expectedValue !== null
            ? String(lead.expectedValue)
            : "",
        responsible: lead.responsibleId || null,
        note: lead.notes || lead.note || "",
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload) => (isEdit ? updateLead(payload) : createLead(payload)),
    onSuccess: () => {
      toast.success(isEdit ? "Lead updated successfully" : "Lead added successfully");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      navigate("/dashboard/crm/leads");
    },
    onError: () => {
      toast.error(isEdit ? "Failed to update lead" : "Failed to add lead");
    },
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = true;
    }
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = true;
    }
    if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.name) {
        toast.error(t("leads.nameRequired"));
      } else if (newErrors.phoneNumber) {
        toast.error(t("leads.phoneRequired"));
      } else if (newErrors.email) {
        toast.error(t("leads.invalidEmail"));
      }
      return;
    }

    const payload = {
      ...formData,
      phone: formData.phoneNumber.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      name: formData.name.trim(),
      company: formData.company?.trim() || "",
      email: formData.email?.trim() || "",
      notes: formData.note,
      note: formData.note,
      expectedValue: Number(formData.expectedValue) || 0,
      responsible: null,
      responsibleId: null,
    };

    if (isEdit) {
      payload.id = id;
    } else {
      delete payload.status; // status is only in Update payload per API docs
    }

    mutation.mutate(payload);
  };

  if (isEdit && isLoading) return <div className="p-6">{t("common.loading")}</div>;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {isEdit ? t("leads.editLead") : t("leads.addLead")}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/crm/leads")}>
              {t("leads.title")}
            </span>
            <span>/</span>
            <span>{isEdit ? t("leads.editLead") : t("leads.addLead")}</span>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          className="gap-2"
          disabled={mutation.isPending || !isFormValid}
          title={!isFormValid ? t("leads.fillRequiredFields") : ""}
        >
          <Plus className="w-4 h-4" />
          {mutation.isPending
            ? t("common.saving")
            : isEdit
            ? t("common.save")
            : t("common.add")}
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground flex items-center gap-1">
              <span>{t("leads.name")}</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder={t("leads.name")}
              className={cn("h-11 bg-transparent", errors.name && "border-red-500 focus-visible:ring-red-500")}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">
                {t("leads.nameRequired")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-semibold text-foreground">
              {t("leads.company")}
            </Label>
            <Input
              id="company"
              name="company"
              placeholder={t("leads.company")}
              className="h-11 bg-transparent"
              value={formData.company}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-foreground">
              {t("leads.email")}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("leads.email")}
              className={cn("h-11 bg-transparent", errors.email && "border-red-500 focus-visible:ring-red-500")}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-xs text-red-500 font-medium">
                {t("leads.invalidEmail")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-semibold text-foreground flex items-center gap-1">
              <span>{t("leads.phone")}</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder={t("leads.phone")}
              className={cn("h-11 bg-transparent", errors.phoneNumber && "border-red-500 focus-visible:ring-red-500")}
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 font-medium">
                {t("leads.phoneRequired")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold text-foreground">
              {t("leads.status")}
            </Label>
            <Select 
              key={formData.status || "status-select"}
              value={formData.status || "New"} 
              onValueChange={(val) => handleSelectChange("status", val)}
              disabled={!isEdit || formData.status === "Converted"}
            >
              <SelectTrigger className="!h-11 w-full bg-transparent">
                <SelectValue placeholder={t("leads.selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">{t("leads.statuses.new")}</SelectItem>
                <SelectItem value="Contacted">{t("leads.statuses.contacted")}</SelectItem>
                <SelectItem value="Qualified">{t("leads.statuses.qualified")}</SelectItem>
                <SelectItem value="Quotation">{t("leads.statuses.quotation")}</SelectItem>
                {formData.status === "Converted" && (
                  <SelectItem value="Converted" disabled>{t("leads.convertedLocked")}</SelectItem>
                )}
                <SelectItem value="Lost">{t("leads.statuses.lost")}</SelectItem>
              </SelectContent>
            </Select>
            {formData.status === "Converted" ? (
              <p className="text-xs text-amber-600">
                {t("leads.convertedLockedDesc")}
              </p>
            ) : isEdit ? (
              <p className="text-xs text-muted-foreground">
                {t("leads.conversionNote")}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="expectedValue" className="text-sm font-semibold text-foreground">
                {t("leads.approvedProjectValue")}
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {t("leads.opportunityEstimate")}
              </span>
            </div>
            <Input
              id="expectedValue"
              name="expectedValue"
              placeholder={t("leads.approvedProjectValuePlaceholder")}
              className="h-11 bg-transparent"
              value={formData.expectedValue}
              onChange={handleChange}
            />
            <p className="text-[11px] text-muted-foreground">
              {t("leads.expectedValueHint")}
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="note" className="text-sm font-semibold text-foreground">
              {t("leads.notes")}
            </Label>
            <Textarea
              id="note"
              name="note"
              placeholder={t("leads.notes")}
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
