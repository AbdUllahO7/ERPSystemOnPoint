import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Building2,
  AlertTriangle,
  Users,
  DollarSign,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

  // Form state strictly matching CreateResourceDto & UpdateResourceDto schemas
  const [formData, setFormData] = useState({
    name: "",
    referenceNumber: "",
    maxCapacity: "20",
    ownership: "Owned",
    fixedAssetId: "",
    supplierId: "",
    contractStartDate: "",
    contractEndDate: "",
    dailyRentalCost: "0",
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

  const [manualAssetIdMode, setManualAssetIdMode] = useState(false);

  // Dynamic options ensuring current fixedAssetId is always present
  const fixedAssetOptions = useMemo(() => {
    const list = [...(lookups.fixedAssets || [])];
    if (formData.fixedAssetId && formData.fixedAssetId !== "none") {
      const exists = list.some((fa) => String(fa.id) === String(formData.fixedAssetId));
      if (!exists) {
        list.unshift({
          id: formData.fixedAssetId,
          name: `الأصل المحدد (${formData.fixedAssetId})`,
        });
      }
    }
    return list;
  }, [lookups.fixedAssets, formData.fixedAssetId]);

  // Fetch resource if in edit mode
  const { data: resourceData, isLoading: isFetching } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => getResourceById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && resourceData?.data) {
      const r = resourceData.data;
      const startDate = r.contractStartDate
        ? (r.contractStartDate.includes("T") ? r.contractStartDate.split("T")[0] : r.contractStartDate)
        : "";
      const endDate = r.contractEndDate
        ? (r.contractEndDate.includes("T") ? r.contractEndDate.split("T")[0] : r.contractEndDate)
        : "";

      setFormData({
        name: r.name || r.fullName || "",
        referenceNumber: r.referenceNumber || r.code || "",
        maxCapacity: String(r.maxCapacity ?? r.numericCapacity ?? r.capacity ?? 20),
        ownership: r.rawOwnership === "Leased" || r.ownership === "Leased" ? "Leased" : "Owned",
        fixedAssetId: r.fixedAssetId || "",
        supplierId: r.supplierId || "",
        contractStartDate: startDate,
        contractEndDate: endDate,
        dailyRentalCost: String(r.dailyRentalCost ?? 0),
      });

      setInitialResource({
        maxCapacity: Number(r.maxCapacity ?? r.numericCapacity ?? r.capacity ?? 20),
        contractEndDate: endDate,
      });
    }
  }, [isEdit, resourceData]);

  // Impact Analysis (Page 6: فحص أثر تخفيض السعة أو تقصير عقد الإيجار على الأحداث المرتبطة)
  const isCapacityDecreased = useMemo(() => {
    if (!isEdit || !initialResource) return false;
    const current = Number(formData.maxCapacity) || 0;
    return current > 0 && current < initialResource.maxCapacity;
  }, [isEdit, initialResource, formData.maxCapacity]);

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
      toast.success(res?.message || (isEdit ? "Resource updated successfully!" : "Resource created successfully!"));
      navigate("/dashboard/resources");
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        (isEdit ? "Failed to update resource" : "Failed to create resource");
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

    const cap = Number(formData.maxCapacity);
    if (!cap || cap <= 0) {
      toast.error("السعة القصوى يجب أن تكون رقماً موجباً أكبر من صفر (Max Capacity must be > 0)");
      return;
    }

    // Validation matching business and schema rules
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
      const cost = Number(formData.dailyRentalCost);
      if (isNaN(cost) || cost < 0) {
        toast.error("تكلفة الإيجار اليومية يجب أن تكون صفراً أو أكثر");
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
          title={isEdit ? "Edit Resource (تعديل المورد)" : "Add Resource (إضافة مورد)"}
          breadcrumbLinks={[
            { label: "Resources", href: "/dashboard/resources" },
            { label: isEdit ? "Edit Resource" : "Add Resource" },
          ]}
          infoTooltip="إدارة الموارد المادية مع تحديد السعة، نموذج الملكية، تكلفة الاستئجار، وفترة العقد متوافقاً مع API الموارد."
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/resources")}
            className="h-10 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 h-10 rounded-xl font-semibold text-xs shadow-xs cursor-pointer"
          >
            {saveMutation.isPending && (
              <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
            )}
            Save Resource (حفظ المورد)
          </Button>
        </div>
      </div>

      {/* Impact Analysis Alerts on Edit (Page 6) */}
      {isCapacityDecreased && (
        <div className="p-3.5 bg-amber-50 border-r-4 border-amber-600 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">فحص أثر تخفيض السعة (Capacity Impact Warning):</p>
            <p className="leading-relaxed">
              لقد قمت بتخفيض السعة القصوى من <strong>{initialResource.maxCapacity}</strong> إلى <strong>{formData.maxCapacity}</strong>. يرجى التحقق من الأحداث والحجوزات المرتبطة مسبقاً بهذا المورد للتأكد من عدم تجاوز الحضور للسعة الجديدة.
            </p>
          </div>
        </div>
      )}

      {isContractShortened && (
        <div className="p-3.5 bg-amber-50 border-r-4 border-amber-600 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
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
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0066d1]" />
          بيانات ومواصفات المورد (Resource Specifications)
        </h2>

        {/* Row 1: Name, Reference Number, Max Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              اسم المورد (name) <span className="text-rose-500">*</span>
            </Label>
            <Input
              placeholder="مثال: قاعة المؤتمرات الرئيسية"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              الرقم المرجعي / الكود (referenceNumber)
            </Label>
            <Input
              placeholder="مثال: 123 أو RES-001"
              value={formData.referenceNumber}
              onChange={(e) => handleInputChange("referenceNumber", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              السعة القصوى (maxCapacity) <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="20"
                value={formData.maxCapacity}
                onChange={(e) => handleInputChange("maxCapacity", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1] pe-9"
              />
              <Users className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Row 2: Ownership Model, Fixed Asset (if owned) OR Supplier & Daily Cost (if leased) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 border-t border-slate-50">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              نموذج الملكية (ownership) <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={formData.ownership}
              onValueChange={(val) => handleInputChange("ownership", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="اختر نموذج الملكية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owned">Owned (مملوك للشركة)</SelectItem>
                <SelectItem value="Leased">Leased (مستأجر من جهة خارجية)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isLeased ? (
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">
                  الأصل الثابت المرتبط (fixedAssetId)
                </Label>
                {lookups.fixedAssets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setManualAssetIdMode((prev) => !prev)}
                    className="text-[11px] font-medium text-[#0066d1] hover:underline cursor-pointer"
                  >
                    {manualAssetIdMode ? "اختيار من القائمة (Select from list)" : "إدخال المعرف يدوياً (Enter GUID)"}
                  </button>
                )}
              </div>

              {manualAssetIdMode || lookups.fixedAssets.length === 0 ? (
                <div className="space-y-1.5">
                  <Input
                    placeholder="مثال: 3fa85f64-5717-4562-b3fc-2c963f66afa6 (Fixed Asset GUID)"
                    value={formData.fixedAssetId}
                    onChange={(e) => handleInputChange("fixedAssetId", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1] font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-500">
                    {lookups.fixedAssets.length === 0
                      ? "لا توجد أصول ثابتة مسجلة في القائمة حالياً. تم تفعيل الإدخال المباشر لتتمكن من كتابة معرف الأصل (GUID) ليتم إرساله مع الطلب."
                      : "يمكنك إدخال معرف الأصل الثابت (GUID) مباشرة أو الضغط أعلاه للاختيار من القائمة."}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Select
                    value={formData.fixedAssetId || "none"}
                    onValueChange={(val) => handleInputChange("fixedAssetId", val === "none" ? "" : val)}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                      <SelectValue placeholder="اختر الأصل الثابت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- غير مرتبط بأصل دفتري محدد --</SelectItem>
                      {fixedAssetOptions.map((fa) => (
                        <SelectItem key={fa.id} value={String(fa.id)}>
                          {fa.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-400">
                    المورد المملوك يمكن ربطه بأصل ثابت دفتري (Fixed Asset)، أو تركه فارغاً.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  المورد / المالك المؤجر (supplierId) <span className="text-rose-500">*</span>
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
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  تكلفة الإيجار اليومية (dailyRentalCost)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.dailyRentalCost}
                    onChange={(e) => handleInputChange("dailyRentalCost", e.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1] pe-9 font-semibold"
                  />
                  <DollarSign className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Row 3 (For Leased): Contract Start & End Date */}
        {isLeased && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-50">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                تاريخ بداية عقد الاستئجار (contractStartDate) <span className="text-rose-500">*</span>
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
                تاريخ نهاية عقد الاستئجار (contractEndDate) <span className="text-rose-500">*</span>
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
      </div>
    </form>
  );
}
