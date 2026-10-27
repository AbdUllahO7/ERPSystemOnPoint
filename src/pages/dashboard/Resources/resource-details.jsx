import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCcw,
  Loader2,
  Pencil,
  Power,
  PowerOff,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  Info,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Users,
} from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { Button } from "@/components/ui/button";
import { DynamicModal } from "@/components/common/dynamic-modal";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  getResourceById,
  changeResourceStatus,
  toggleResourceActive,
  getResourceLookups,
} from "@/services/resources";
import { getEvents } from "@/services/events";

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("Active");

  // Resource Query
  const { data: resourceData, isLoading } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => getResourceById(id),
  });
  const resource = resourceData?.data || {};

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["resourceLookups"],
    queryFn: getResourceLookups,
  });
  const lookups = lookupsData?.data || { statuses: [] };

  // Linked Events Query (Page 6: الحالة العامة لا تحدد وحدها توافر المورد في موعد معين؛ يُحسب التعارض من الأحداث والمواعيد المرتبطة به)
  const { data: eventsData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["resourceEvents", id],
    queryFn: () => getEvents({ ResourceId: id, PageSize: 50 }),
    enabled: !!id,
  });
  const linkedEvents = eventsData?.data?.items || [];

  // Status Mutation (with condition for exiting 'Rented')
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => changeResourceStatus({ id, status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["resource", id]);
      queryClient.invalidateQueries(["resources"]);
      toast.success(res?.message || "Resource status updated successfully!");
      setIsStatusModalOpen(false);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Failed to update status";
      toast.error(msg);
    },
  });

  // Toggle Active Mutation (Page 6: is_Active: تفعيل المورد أو إيقافه في النظام)
  const toggleActiveMutation = useMutation({
    mutationFn: () => toggleResourceActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["resource", id]);
      queryClient.invalidateQueries(["resources"]);
      toast.success("تم تحديث حالة تفعيل المورد بنجاح!");
    },
    onError: () => {
      toast.error("فشل تغيير حالة تفعيل المورد");
    },
  });

  const handleStatusSubmit = (e) => {
    e?.preventDefault();
    statusMutation.mutate({ id, status: newStatus });
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("active") || s === "متاح") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s.includes("maintenance") || s.includes("صيانة")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (s.includes("out") || s.includes("inactive") || s.includes("خارج")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (s.includes("rented") || s.includes("مؤجر")) {
      return "bg-blue-50 text-[#0066d1] border-blue-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066d1]" />
      </div>
    );
  }

  const isCurrentlyRented = String(resource.status || "").toLowerCase().includes("rented");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title={resource.name || "Resource Details"}
          breadcrumbLinks={[
            { label: "Resources", href: "/dashboard/resources" },
            { label: resource.name || "Resource Details" },
          ]}
          infoTooltip="المواصفات، السعة القصوى، نموذج الملكية، تكلفة الاستئجار، والحالة التشغيلية والمواعيد المجدولة."
        />

        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/dashboard/resources/edit/${id}`)}
            className="h-10 gap-2 rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold px-4 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-600" />
            Edit Resource
          </Button>

          {/* Toggle Active Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => toggleActiveMutation.mutate()}
            disabled={toggleActiveMutation.isPending}
            className={`h-10 gap-2 rounded-xl text-xs font-semibold px-4 cursor-pointer border ${
              resource.isActive
                ? "border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100/50"
                : "border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50"
            }`}
          >
            {resource.isActive ? (
              <>
                <PowerOff className="w-3.5 h-3.5" />
                Deactivate (إيقاف)
              </>
            ) : (
              <>
                <Power className="w-3.5 h-3.5" />
                Reactivate (إعادة تفعيل)
              </>
            )}
          </Button>

          {/* Change Status Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setNewStatus(resource.status || "Active");
              setIsStatusModalOpen(true);
            }}
            className="h-10 gap-2 rounded-xl border-[#0066d1]/40 text-[#0066d1] bg-white hover:bg-blue-50/50 text-xs font-semibold px-4 cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-[#0066d1]" />
            Change Status
          </Button>
        </div>
      </div>

      

      {/* Details Grid (Left 8 cols, Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Details (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0066d1]" />
              Resource Specifications (بيانات ومواصفات المورد)
            </h2>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Ref: {resource.code || resource.referenceNumber || "N/A"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-800">Resource Name (اسم المورد)</p>
              <p className="text-xs text-slate-600 mt-1">
                {resource.name || resource.fullName || "Unnamed Resource"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Max Capacity (السعة القصوى)</p>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">{resource.capacity || resource.numericCapacity || 20}</span> مقعد / وحدة
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Ownership Model (نموذج الملكية)</p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mt-1 border ${
                  resource.ownership === "Leased"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-teal-50 text-teal-700 border-teal-200"
                }`}
              >
                {resource.ownership === "Leased" ? "Leased (مستأجر)" : "Owned (مملوك للشركة)"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-50">
            <div>
              <p className="text-xs font-semibold text-slate-800">
                {resource.ownership === "Leased" ? "Lessor / Supplier (المورد المؤجر)" : "Fixed Asset (الأصل الثابت)"}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {resource.supplierAsset || resource.supplierAssetName || resource.supplierName || resource.fixedAssetName || "None / General Asset"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Daily Rental Cost (تكلفة الاستئجار)</p>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">${Number(resource.dailyRentalCost || 0).toLocaleString()}</span> / يوم
              </p>
              <span className="text-[10px] text-slate-400">التكلفة على شركتك (لا تتطابق بالضرورة مع سعر الفعالية)</span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">Facility Location (الموقع)</p>
              <p className="text-xs text-slate-600 mt-1">
                {resource.address || resource.location || "Main Facility"}
              </p>
            </div>
          </div>

          {resource.ownership === "Leased" && (resource.contractStartDate || resource.contractEndDate) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-50 bg-slate-50/50 p-3.5 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-slate-800">Contract Start (بداية العقد)</p>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {resource.contractStartDate || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">Contract End (نهاية العقد)</p>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {resource.contractEndDate || "مستمر (Ongoing)"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Operational Status & Specs (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-800">
            Operational Status & Notes
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-800 mb-1.5">
                Current Status (الحالة التشغيلية)
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                  resource.status
                )}`}
              >
                {resource.status || "Active"}
              </span>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                الحالة العامة تعكس الجاهزية المادية، بينما يُحسب التوافر للخدمات من جدول المواعيد أدناه.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800 mb-1.5">
                System Activation (is_Active)
              </p>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${resource.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span className="text-xs font-medium text-slate-700">
                  {resource.isActive ? "مفعل في النظام (Active Record)" : "معطل أو غير مفعل (Inactive Record)"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800 mb-1.5">
                Notes & Specifications (ملاحظات ومواصفات)
              </p>
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {resource.notes || "لا توجد مواصفات إضافية مسجلة لهذا المورد."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Events & Availability Schedule Section (Page 6: الحالة العامة لا تحدد وحدها توافر المورد في موعد معين؛ يُحسب التعارض من الأحداث والمواعيد المرتبطة به) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0066d1]" />
              الأحداث والمواعيد المرتبطة وجدول التوافر (Linked Events & Availability)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              الحالة العامة لا تحدد وحدها توافر المورد في موعد معين؛ يُحسب التعارض من الأحداث والمواعيد المجدولة أدناه.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#0066d1] border border-blue-200">
            {linkedEvents.length} مواعيد مجدولة
          </span>
        </div>

        {isLoadingEvents ? (
          <div className="py-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#0066d1] mx-auto" />
            <p className="text-xs text-slate-400 mt-2">جاري تحميل جدول الأحداث والمواعيد المرتبطة...</p>
          </div>
        ) : linkedEvents.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">لا توجد مواعيد أو فعاليات متعارضة حالياً</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto mt-1">
              المورد شاغر ومتاح للجدولة في أي فترة زمنية طالما حالته التشغيلية تسمح بذلك.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-3">Event Code</th>
                  <th className="py-2.5 px-3">Title / Activity</th>
                  <th className="py-2.5 px-3">Dates (التاريخ)</th>
                  <th className="py-2.5 px-3">Time (التوقيت)</th>
                  <th className="py-2.5 px-3">Event Price (BookingEvent.Price)</th>
                  <th className="py-2.5 px-3">Provider / Host</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {linkedEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-[#0066d1] font-medium">
                      {evt.code || `EVT-${evt.id}`}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {evt.title}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {evt.period || evt.startDate || "N/A"}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {evt.time || "09:00 - 12:00"}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {evt.price}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {evt.provider || "General"}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {evt.status || "Scheduled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Status Modal (Page 6: شرط الخروج من حالة «مؤجر») */}
      <DynamicModal
        open={isStatusModalOpen}
        onOpenChange={setIsStatusModalOpen}
        title="تغيير الحالة التشغيلية للمورد (Change Operational Status)"
        icon={RefreshCcw}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 pt-1">
          {isCurrentlyRented && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>شرط الخروج من حالة «مؤجر»:</strong>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  المورد حالياً مؤجر لعميل. يمكنك تحويله إلى «متاح (Active)» أو «تحت الصيانة (Under Maintenance)» أو «خارج الخدمة» لتحريره أو إيقافه.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Select New Operational Status (الحالة الجديدة)
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active (متاح للتشغيل)</SelectItem>
                <SelectItem value="UnderMaintenance">Under Maintenance (تحت الصيانة)</SelectItem>
                <SelectItem value="OutOfService">Out of Service (خارج الخدمة)</SelectItem>
                <SelectItem value="Rented">Rented (مؤجر لعميل)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400 leading-tight">
              تغيير الحالة يحدّث الوصف التشغيلي العام للمورد في النظام.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              className="h-11 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={statusMutation.isPending}
              className="h-11 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white text-xs font-semibold cursor-pointer"
            >
              {statusMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin me-1.5" />
              )}
              Save Status
            </Button>
          </div>
        </form>
      </DynamicModal>
    </div>
  );
}
