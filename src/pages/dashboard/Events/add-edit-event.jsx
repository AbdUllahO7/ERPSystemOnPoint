import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Loader2 } from "lucide-react";
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
  createEvent,
  updateEvent,
  getEventById,
  getEventLookups,
} from "@/services/events";

const DAYS_OF_WEEK = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

export default function AddEditEventPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form State matching image 2
  const [formData, setFormData] = useState({
    title: "",
    service: "",
    resource: "",
    provider: "",
    maxCapacity: "0",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "12:00",
    price: "0",
    deposit: "0",
    recurringDays: [],
    notes: "",
  });

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["eventLookups"],
    queryFn: getEventLookups,
  });
  const lookups = lookupsData?.data || {
    services: [],
    resources: [],
    providers: [],
    statuses: [],
    days: DAYS_OF_WEEK,
  };

  // Fetch Event if in edit mode
  const { data: eventData, isLoading: isFetching } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && eventData?.data) {
      const e = eventData.data;
      setFormData({
        title: e.title || e.fullTitle || "",
        service: e.service || "",
        resource: e.resource || "",
        provider: e.provider || "",
        maxCapacity: String(e.maxCapacity || 0),
        startDate: e.startDate || "",
        endDate: e.endDate || "",
        startTime: e.startTime || "09:00",
        endTime: e.endTime || "12:00",
        price: String(e.numericPrice || e.price || 0),
        deposit: String(e.numericDeposit || e.deposit || 0),
        recurringDays: e.recurringDays || [],
        notes: e.notes || "",
      });
    }
  }, [isEdit, eventData]);

  // Mutation for saving
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateEvent(id, data) : createEvent(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["events"]);
      toast.success(res?.message || (isEdit ? "Event updated!" : "Event created!"));
      navigate("/dashboard/events");
    },
    onError: () => {
      toast.error(isEdit ? "Failed to update event" : "Failed to create event");
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleRecurringDay = (day) => {
    setFormData((prev) => {
      const exists = prev.recurringDays.includes(day);
      return {
        ...prev,
        recurringDays: exists
          ? prev.recurringDays.filter((d) => d !== day)
          : [...prev.recurringDays, day],
      };
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.title) {
      toast.error("Please enter event title");
      return;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          title={isEdit ? "Edit Event" : "Add Event"}
          breadcrumbLinks={[
            { label: "Events", href: "/dashboard/events" },
            { label: isEdit ? "Edit Event" : "Add Event" },
          ]}
          infoTooltip="Fill in the event information, assign service & resource, set period, capacity and pricing."
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

      {/* Reservation Info / Event Info Card matching Image 2 */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-800">
          Reservation Info
        </h2>

        {/* Row 1: Title, Service, Resource */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Title
            </Label>
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Service
            </Label>
            <Select
              value={formData.service}
              onValueChange={(val) => handleInputChange("service", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                {lookups.services.map((svc) => (
                  <SelectItem key={svc.id} value={svc.name}>
                    {svc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Resource
            </Label>
            <Select
              value={formData.resource}
              onValueChange={(val) => handleInputChange("resource", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Resource" />
              </SelectTrigger>
              <SelectContent>
                {lookups.resources.map((res) => (
                  <SelectItem key={res.id} value={res.name}>
                    {res.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Provider (optional), Max Capacity, Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Provider (optional)
            </Label>
            <Select
              value={formData.provider}
              onValueChange={(val) => handleInputChange("provider", val)}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white focus:ring-[#0066d1]">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                {lookups.providers.map((prov) => (
                  <SelectItem key={prov.id} value={prov.name}>
                    {prov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Max Capacity
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.maxCapacity}
              onChange={(e) => handleInputChange("maxCapacity", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Start Date
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
              />
              <Calendar className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Row 3: End Date, Start Time, End Time, Price */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              End Date
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
              />
              <Calendar className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Start
            </Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="9:00"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
              />
              <Clock className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              End
            </Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="12:00"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white focus-visible:ring-[#0066d1] pe-9"
              />
              <Clock className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Price
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>
        </div>

        {/* Row 4: Deposit */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Deposit
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.deposit}
              onChange={(e) => handleInputChange("deposit", e.target.value)}
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>
        </div>

        {/* Row 5: Recurring Days Toggle Buttons matching Image 2 */}
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-slate-700">
            Recurring Days
          </Label>
          <div className="flex flex-wrap items-center gap-2.5">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = formData.recurringDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleRecurringDay(day)}
                  className={`min-w-[70px] h-10 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#0066d1] bg-[#0066d1] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 6: Notes */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-slate-700">
            Notes
          </Label>
          <Textarea
            rows={4}
            placeholder="Notes"
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="rounded-xl border-slate-200 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
          />
        </div>
      </div>
    </form>
  );
}
