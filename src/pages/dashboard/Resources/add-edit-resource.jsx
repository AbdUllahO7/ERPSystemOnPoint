import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Building2,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  DollarSign,
  HelpCircle,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  createResource,
  updateResource,
  getResourceById,
  getResourceLookups,
} from "@/services/resources";

export default function AddEditResourcePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Initial resource state for impact analysis on edits
  const [initialResource, setInitialResource] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    referenceNumber: "",
    capacity: "20",
    ownership: "Owned",
    fixedAssetId: "",
    supplierId: "",
    contractStartDate: "",
    contractEndDate: "",
    dailyRentalCost: "0",
    notes: "",
  });

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["resourceLookups"],
    queryFn: getResourceLookups,
  });
  const lookups = lookupsData?.data || {
    suppliers: [],
    fixedAssets: [],
    statuses: [],
    ownerships: [
      { id: "Owned", name: "Owned" },
      { id: "Leased", name: "Leased / Rented" },
    ],
  };

  // Fetch resource if in edit mode
  const { data: resourceData, isLoading: isFetching } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => getResourceById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && resourceData?.data) {
      const r = resourceData.data;
      const initial = {
        name: r.name || r.fullName || "",
        referenceNumber: r.code || r.referenceNumber || "",
        capacity: String(r.numericCapacity || r.capacity || 20),
        ownership: r.rawOwnership === "Leased" ? "Leased" : "Owned",
        fixedAssetId: r.fixedAssetId || "",
        supplierId: r.supplierId || "",
        contractStartDate: r.contractStartDate || "",
        contractEndDate: r.contractEndDate || "",
        dailyRentalCost: String(r.dailyRentalCost || 0),
        notes: r.notes || "",
      };
      setFormData(initial);
      setInitialResource({
        capacity: Number(r.numericCapacity || r.capacity || 20),
        contractEndDate: r.contractEndDate || "",
      });
    }
  }, [isEdit, resourceData]);

  // Impact Analysis (Page 6: فحص أثر تخفيض السعة أو تقصير عقد الإيجار على الأحداث المرتبطة)
  const isCapacityDecreased = useMemo(() => {
    if (!isEdit || !initialResource) return false;
    const current = Number(formData.capacity) || 0;
    return current > 0 && current < initialResource.capacity;
  }, [isEdit, initialResource, formData.capacity]);

  const isContractShortened = useMemo(() => {
    if (!isEdit || !initialResource?.contractEndDate || formData.ownership !== "Leased") return false;
    if (!formData.contractEndDate) return false;
    return new Date(formData.contractEndDate) < new Date(initialResource.contractEndDate);
  }, [isEdit, initialResource, formData.contractEndDate, formData.ownership]);

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateResource(id, data) : createResource(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["resources"]);
      toast.success(res?.message || (isEdit ? "Resource updated!" : "Resource created!"));
      navigate("/dashboard/resources");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || (isEdit ? "Failed to update resource" : "Failed to create resource");
      toast.error(msg);
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم المورد (Resource name is required)");
      return;
    }

    const cap = Number(formData.capacity);
    if (!cap || cap <= 0) {
      toast.error("السعة القصوى يجب أن تكون رقماً موجباً أكبر من صفر (Max Capacity must be > 0)");
      return;
    }

    // Validation matching Page 6 rules
    if (formData.ownership === "Leased") {
      if (!formData.supplierId || formData.supplierId === "none") {
        toast.error("المورد المستأجر يتطلب تحديد المورد/المالك (SupplierId is required for leased resources)");
        return;
      }
      if (!formData.contractStartDate || !formData.contractEndDate) {
        toast.error("يجب تحديد تاريخ بداية ونهاية عقد الاستئجار (Contract Start and End Dates are required)");
        return;
      }
      if (new Date(formData.contractEndDate) < new Date(formData.contractStartDate)) {
        toast.error("تاريخ نهاية العقد يجب أن يكون لاحقاً لتاريخ البداية (End date must be after start date)");
        return;
      }
    }

    saveMutation.mutate(formData);
  };

  if (isFetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  const isLeased = formData.ownership === "Leased";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title={isEdit ? "Edit Resource" : "Add Resource"}
          breadcrumbLinks={[
            { label: "Resources", href: "/dashboard/resources" },
            { label: isEdit ? "Edit Resource" : "Add Resource" },
          ]}
          infoTooltip="Add facility or equipment resource, define capacity, address location, and ownership."
        />

        <Button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
        >
          {saveMutation.isPending && (
            <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
          )}
          Save
        </Button>
      </div>

      {/* Page 6 Guidance Alert (فهم النظام: الموارد) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50/90 border-r-4 border-blue-600 rounded-xl text-xs space-y-1.5">
          <p className="font-bold text-blue-950 flex items-center gap-1.5 text-sm">
            <Building2 className="w-4 h-4 text-blue-600" />
            الموارد: المكان أو الأصل (Resources & Assets):
          </p>
          <p className="text-blue-900 leading-relaxed">
            قاعة، سيارة، جهاز أو مساحة تستخدمها عند تقديم خدمة أو تنظيم حدث. المورد المملوك يتطلب ربطه بأصل ثابت (FixedAssetId)، بينما المورد المستأجر يتطلب مورداً (SupplierId) وفترة عقد استئجار.
          </p>
        </div>

        <div className="p-4 bg-teal-50/90 border-r-4 border-teal-600 rounded-xl text-xs space-y-1.5">
          <p className="font-bold text-teal-950 flex items-center gap-1.5 text-sm">
            <DollarSign className="w-4 h-4 text-teal-600" />
            تكلفة المورد وسعر بيعه (Cost vs Price):
          </p>
          <p className="text-teal-900 leading-relaxed">
            الحقل DailyRentalCost يمثل تكلفة استئجار المورد على شركتك. أما BookingEvent.Price فيمثل سعر الحدث وفق قاعدة التسعير التي تحددها، وليس مطلوباً أن يتساويا.
          </p>
        </div>
      </div>

      {/* Impact Analysis Alerts on Edit (Page 6) */}
      {isCapacityDecreased && (
        <div className="p-3.5 bg-amber-50 border-r-4 border-amber-600 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">فحص أثر تخفيض السعة (Capacity Impact Warning):</p>
            <p className="leading-relaxed">
              لقد قمت بتخفيض السعة القصوى من <strong>{initialResource.capacity}</strong> إلى <strong>{formData.capacity}</strong>. يرجى التحقق من الأحداث والحجوزات المرتبطة مسبقاً بهذا المورد للتأكد من عدم تجاوز الحضور للسعة الجديدة.
            </p>
          </div>
        </div>
      )}

      {isContractShortened && (
        <div className="p-3.5 bg-amber-50 border-r-4 border-amber-600 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">فحص أثر تقصير عقد الإيجار (Lease Period Impact Warning):</p>
            <p className="leading-relaxed">
              لقد تم تقصير تاريخ نهاية عقد الاستئجار إلى <strong>{formData.contractEndDate}</strong> (السابق كان {initialResource.contractEndDate}). يرجى التحقق من الأحداث المستقبلية المجدولة بعد هذا التاريخ لتفادي التعارض التشغيلي.
            </p>
          </div>
        </div>
      )}

      {/* Resource Info Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-800">
          Resource Information
        </h2>

        {/* Row 1: Name, Reference Number, Total Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Conference Hall A"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Reference / Code
            </Label>
            <Input
              placeholder="e.g. RES-001"
              value={formData.referenceNumber}
              onChange={(e) => handleInputChange("referenceNumber", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Total Capacity
            </Label>
            <Input
              type="number"
              placeholder="20"
              value={formData.capacity}
              onChange={(e) => handleInputChange("capacity", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>
        </div>

        {/* Row 2: Ownership, Fixed Asset (if owned) OR Supplier (if leased) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Ownership Model
            </Label>
            <Select
              value={formData.ownership}
              onValueChange={(val) => handleInputChange("ownership", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owned">Owned (مملوك)</SelectItem>
                <SelectItem value="Leased">Leased / Rented (مستأجر)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isLeased ? (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                الأصل الثابت المرتبط (Fixed Asset)
              </Label>
              <Select
                value={formData.fixedAssetId || "none"}
                onValueChange={(val) => handleInputChange("fixedAssetId", val === "none" ? "" : val)}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                  <SelectValue placeholder="اختر الأصل الثابت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- غير مرتبط بأصل ثابت دفتري --</SelectItem>
                  {lookups.fixedAssets.map((fa) => (
                    <SelectItem key={fa.id} value={String(fa.id)}>
                      {fa.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-500 leading-tight">
                المورد المملوك يربط بأصل ثابت، ويمكن تركه فارغاً إذا كان لا يمثل أصلاً دفترياً.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                المورد / المالك (Supplier) <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.supplierId || "none"}
                onValueChange={(val) => handleInputChange("supplierId", val === "none" ? "" : val)}
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                  <SelectValue placeholder="اختر المورد أو المالك" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- اختر المورد أو المؤجر --</SelectItem>
                  {lookups.suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-500 leading-tight">
                المورد المستأجر يتطلب اختيار المورد أو الجهة المؤجرة.
              </p>
            </div>
          )}

          {isLeased && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                تكلفة الإيجار اليومية (Daily Rental Cost)
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.dailyRentalCost}
                onChange={(e) => handleInputChange("dailyRentalCost", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                تكلفة استئجار المورد على شركتك (لا تشترط التساوي مع سعر بيع الحدث للعميل).
              </p>
            </div>
          )}
        </div>

        {/* Row 3 (Conditional for Leased): Contract Start & End Date */}
        {isLeased && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                تاريخ بداية عقد الاستئجار (Contract Start Date) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.contractStartDate}
                onChange={(e) => handleInputChange("contractStartDate", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                تاريخ نهاية عقد الاستئجار (Contract End Date) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.contractEndDate}
                onChange={(e) => handleInputChange("contractEndDate", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>
          </div>
        )}

        {/* Row 4: Notes */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Notes
          </Label>
          <Textarea
            rows={4}
            placeholder="Specifications, location guidelines, or notes..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-[#0066d1] resize-none"
          />
        </div>
      </div>
    </form>
  );
}
