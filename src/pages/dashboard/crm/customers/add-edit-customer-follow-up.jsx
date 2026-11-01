import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  Activity,
  ArrowLeft,
  Loader2,
  Save,
  User,
  Plus,
  Clock,
  FileText,
  Building,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCustomerFollowUp,
  updateCustomerFollowUp,
  completeOrCancelCustomerFollowUp,
  getCustomerFollowUpsTimeline,
  getAllCustomers,
  getCustomerById,
} from "@/lib/api";
import { toast } from "react-hot-toast";

export default function AddEditCustomerFollowUp() {
  const { customerId: routeCustomerId, followUpId: routeFollowUpId, id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const followUpId = routeFollowUpId || routeId || searchParams.get("followUpId") || searchParams.get("id");
  const isEdit = Boolean(followUpId);

  const initialCustomerId =
    routeCustomerId ||
    searchParams.get("customerId") ||
    location.state?.customerId ||
    location.state?.followUp?.customerId ||
    "";

  const [formData, setFormData] = useState({
    customerId: initialCustomerId,
    type: location.state?.followUp?.type || "Call",
    status: location.state?.followUp?.status || "Scheduled",
    topic: location.state?.followUp?.topic || "",
    date: "",
    time: "",
    executionNote: location.state?.followUp?.executionNote || "",
  });

  // Initialize date/time if location.state.followUp has scheduledDate
  useEffect(() => {
    if (location.state?.followUp?.scheduledDate) {
      try {
        const d = new Date(location.state.followUp.scheduledDate);
        if (!isNaN(d.getTime())) {
          setFormData((prev) => ({
            ...prev,
            date: d.toISOString().split("T")[0],
            time: d.toTimeString().substring(0, 5),
          }));
        }
      } catch {
        // fallback
      }
    } else if (!isEdit && !formData.date) {
      const now = new Date();
      setFormData((prev) => ({
        ...prev,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().substring(0, 5),
      }));
    }
  }, [location.state, isEdit]);

  // Fetch all customers for selection
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["allCustomersForFollowUp"],
    queryFn: () => getAllCustomers({ PageNumber: 1, PageSize: 1000 }),
  });
  const customers = customersData?.data?.items || customersData?.data || [];

  // If customerId is set, fetch customer details for preview
  const currentCustomerId = formData.customerId || initialCustomerId;
  const { data: customerDetailsData } = useQuery({
    queryKey: ["customerDetailsForFollowUp", currentCustomerId],
    queryFn: () => getCustomerById(currentCustomerId),
    enabled: Boolean(currentCustomerId),
  });
  const currentCustomer = customerDetailsData?.data?.data || customerDetailsData?.data || null;

  // If editing and no followUp data was passed in state, fetch timeline
  const { data: timelineData, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ["customer-follow-ups-lookup", currentCustomerId || "all"],
    queryFn: () =>
      getCustomerFollowUpsTimeline({
        CustomerId: currentCustomerId || undefined,
        PageNumber: 1,
        PageSize: 100,
      }),
    enabled: isEdit && !location.state?.followUp,
  });

  // Populate data when fetched
  useEffect(() => {
    if (isEdit && !location.state?.followUp && timelineData) {
      const items = timelineData?.data?.items || [];
      const match = items.find((item) => String(item.id) === String(followUpId));
      if (match) {
        let dateStr = "";
        let timeStr = "";
        if (match.scheduledDate) {
          const d = new Date(match.scheduledDate);
          if (!isNaN(d.getTime())) {
            dateStr = d.toISOString().split("T")[0];
            timeStr = d.toTimeString().substring(0, 5);
          }
        }
        setFormData({
          customerId: match.customerId || currentCustomerId || "",
          type: match.type || "Call",
          status: match.status || "Scheduled",
          topic: match.topic || "",
          date: dateStr,
          time: timeStr,
          executionNote: match.executionNote || "",
        });
      }
    }
  }, [isEdit, timelineData, followUpId, currentCustomerId, location.state]);

  const isCompleteOrCanceled =
    formData.status === "Completed" ||
    formData.status === "Canceled" ||
    formData.status === "Cancled";

  const isFormValid = Boolean(
    formData.customerId &&
    formData.type &&
    formData.status &&
    formData.topic?.trim() &&
    formData.date &&
    formData.time &&
    (!isCompleteOrCanceled || formData.executionNote?.trim())
  );

  const mutation = useMutation({
    mutationFn: async (data) => {
      const scheduledDate = new Date(`${data.date}T${data.time}`).toISOString();

      if (isEdit) {
        await updateCustomerFollowUp({
          id: followUpId,
          customerId: data.customerId,
          type: data.type,
          status: data.status,
          topic: data.topic.trim(),
          scheduledDate,
        });

        if (isCompleteOrCanceled && data.executionNote?.trim()) {
          await completeOrCancelCustomerFollowUp({
            id: followUpId,
            status: data.status === "Canceled" ? "Cancled" : data.status,
            executionNote: data.executionNote.trim(),
          });
        }
      } else {
        await createCustomerFollowUp({
          customerId: data.customerId,
          type: data.type,
          status: data.status,
          topic: data.topic.trim(),
          scheduledDate,
        });
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? "Follow-up updated successfully" : "Follow-up created successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["follow-ups-timeline"] });
      queryClient.invalidateQueries({ queryKey: ["customer-follow-ups-lookup"] });

      if (formData.customerId) {
        navigate(`/dashboard/crm/customers/${formData.customerId}?tab=Follow-Ups`);
      } else {
        navigate("/dashboard/crm/follow-up-list");
      }
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          (isEdit ? "Failed to update follow-up" : "Failed to create follow-up")
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      if (!formData.customerId) toast.error("Please select a customer");
      else if (!formData.type) toast.error("Please select interaction type");
      else if (!formData.status) toast.error("Please select status");
      else if (!formData.topic?.trim()) toast.error("Please enter a topic");
      else if (!formData.date) toast.error("Please select a date");
      else if (!formData.time) toast.error("Please select a time");
      else if (isCompleteOrCanceled && !formData.executionNote?.trim()) {
        toast.error("Execution notes are required when status is Completed or Canceled");
      }
      return;
    }

    mutation.mutate(formData);
  };

  const handleBack = () => {
    if (formData.customerId || initialCustomerId) {
      navigate(`/dashboard/crm/customers/${formData.customerId || initialCustomerId}?tab=Follow-Ups`);
    } else {
      navigate("/dashboard/crm/follow-up-list");
    }
  };

  const isPageLoading = isEdit && isLoadingTimeline;

  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-2 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm">Loading follow-up details...</p>
      </div>
    );
  }

  const customerDisplayName =
    currentCustomer?.customerName ||
    currentCustomer?.name ||
    customers.find((c) => (c.id || c.customerId) === (formData.customerId || initialCustomerId))?.customerName ||
    customers.find((c) => (c.id || c.customerId) === (formData.customerId || initialCustomerId))?.name ||
    (initialCustomerId ? `Customer #${initialCustomerId.substring(0, 8)}` : "");

  return (
    <div className="space-y-6 max-w-[900px] mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-white shadow-xs"
              onClick={handleBack}
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-bold text-foreground">
              {isEdit ? "Edit Customer Follow-Up" : "Add Customer Follow-Up"}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 ml-12">
            <span
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => navigate("/dashboard/crm/customers")}
            >
              Customers
            </span>
            <span>/</span>
            {formData.customerId ? (
              <>
                <span
                  className="cursor-pointer hover:text-primary transition-colors max-w-[150px] truncate"
                  onClick={handleBack}
                >
                  {customerDisplayName || "Details"}
                </span>
                <span>/</span>
              </>
            ) : null}
            <span className="font-medium text-foreground">
              {isEdit ? "Edit Follow-Up" : "New Follow-Up"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="bg-white"
            onClick={handleBack}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={mutation.isPending || !isFormValid}
            title={!isFormValid ? "Please fill all required fields marked with *" : ""}
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isEdit ? (
              <Save className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Follow-Up"}
          </Button>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Customer Info / Selection */}
        <div className="space-y-2">
          <Label className="font-semibold text-sm flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-500" />
            Select Customer <span className="text-red-500">*</span>
          </Label>
          {initialCustomerId && routeCustomerId ? (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">
                    {customerDisplayName || "Selected Customer"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: #{initialCustomerId.substring(0, 8)}
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-md">
                Active Customer
              </span>
            </div>
          ) : (
            <Select
              value={formData.customerId}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, customerId: val }))}
              disabled={isLoadingCustomers}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder={isLoadingCustomers ? "Loading customers..." : "Choose a customer"} />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => {
                  const cId = c.id || c.customerId;
                  const cName = c.customerName || c.name || `Customer #${String(cId).substring(0, 8)}`;
                  return (
                    <SelectItem key={cId} value={cId}>
                      {cName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Type & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div className="space-y-2">
            <Label className="font-semibold text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-slate-500" />
              Interaction Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, type: val }))}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Call">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span>Call</span>
                  </div>
                </SelectItem>
                <SelectItem value="Meeting">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>Meeting</span>
                  </div>
                </SelectItem>
                <SelectItem value="Email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-500" />
                    <span>Email</span>
                  </div>
                </SelectItem>
                <SelectItem value="Task">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-500" />
                    <span>Task</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-sm">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Scheduled</span>
                  </div>
                </SelectItem>
                <SelectItem value="Completed">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Completed</span>
                  </div>
                </SelectItem>
                <SelectItem value="Canceled">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Canceled</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Topic / Subject */}
        <div className="space-y-2">
          <Label className="font-semibold text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-500" />
            Topic / Subject <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="e.g., Project kickoff meeting, contract follow-up, pricing review"
            value={formData.topic}
            onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
            className="h-11"
            required
          />
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="font-semibold text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Time <span className="text-red-500">*</span>
            </Label>
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
              className="h-11"
              required
            />
          </div>
        </div>

        {/* Execution Notes (Shown especially if Completed/Canceled, or optional for Scheduled) */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Label className="font-semibold text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              Execution Notes
              {isCompleteOrCanceled && <span className="text-red-500">*</span>}
            </Label>
            {isCompleteOrCanceled ? (
              <span className="text-xs text-amber-600 font-medium">Required for Completed/Canceled status</span>
            ) : (
              <span className="text-xs text-muted-foreground">Optional</span>
            )}
          </div>
          <Textarea
            placeholder={
              isCompleteOrCanceled
                ? "Describe the outcome, meeting minutes, or reason for cancellation..."
                : "Add any preparation notes or background details..."
            }
            value={formData.executionNote}
            onChange={(e) => setFormData((prev) => ({ ...prev, executionNote: e.target.value }))}
            className="min-h-[120px] resize-none"
            required={isCompleteOrCanceled}
          />
        </div>

        {/* Form Actions Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleBack}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
            disabled={mutation.isPending || !isFormValid}
            title={!isFormValid ? "Please fill all required fields marked with *" : ""}
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : isEdit ? (
              <Save className="w-4 h-4 mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Follow-Up"}
          </Button>
        </div>
      </form>
    </div>
  );
}

