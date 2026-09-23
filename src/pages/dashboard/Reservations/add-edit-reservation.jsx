import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Calendar as CalendarIcon, Wallet } from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { DynamicModal } from "@/components/common/dynamic-modal";
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
import toast from "react-hot-toast";
import {
  getReservationById,
  createReservation,
  updateReservation,
  getReservationLookups,
} from "@/services/reservations";

export default function AddEditReservation() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    customerId: "",
    customer: "",
    bookingEventId: "",
    bookingEvent: "",
    quantity: "1",
    invoicePatternId: "",
    paymentMethod: "",
    costCenterId: "",
    notes: "",
    amountPaid: "0",
    discountAmount: "0",
    discountPercent: "0",
    taxPercent: "0",
    paymentSchedule: [],
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    dueDate: "2025-07-23",
    notes: "",
  });

  // Lookups Query
  const { data: lookupsData } = useQuery({
    queryKey: ["reservationLookups"],
    queryFn: getReservationLookups,
  });
  const lookups = lookupsData?.data || {
    customers: [],
    events: [],
    invoicePatterns: [],
    paymentMethods: [],
    costCenters: [],
  };

  // Reservation Query for Edit Mode
  const { data: reservationData, isLoading } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => getReservationById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (reservationData?.data) {
      const r = reservationData.data;
      setFormData({
        customerId: r.customerId || "1",
        customer: r.customer || "Customer",
        bookingEventId: r.bookingEventId || "1",
        bookingEvent: r.bookingEvent || "Event",
        quantity: String(r.quantity || 1),
        invoicePatternId: r.invoicePatternId || "1",
        paymentMethod: r.paymentMethod || "Card",
        costCenterId: r.costCenterId || "1",
        notes: r.notes || "",
        amountPaid: String(r.numericPaid || 0),
        discountAmount: "0",
        discountPercent: "0",
        taxPercent: "0",
        paymentSchedule: r.paymentSchedule || [],
      });
    }
  }, [reservationData]);

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEdit ? updateReservation(id, data) : createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations"]);
      queryClient.invalidateQueries(["reservation", id]);
      toast.success(
        isEdit
          ? "Reservation updated successfully!"
          : "Reservation created successfully!"
      );
      navigate("/dashboard/reservations");
    },
    onError: () => {
      toast.error(
        isEdit
          ? "Failed to update reservation!"
          : "Failed to create reservation!"
      );
    },
  });

  const handleAddPayment = (e) => {
    e?.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const newPayment = {
      id: Date.now(),
      amount: Number(paymentForm.amount),
      dueDate: paymentForm.dueDate,
      notes: paymentForm.notes,
    };

    setFormData((prev) => ({
      ...prev,
      paymentSchedule: [...prev.paymentSchedule, newPayment],
    }));

    setPaymentForm({ amount: "", dueDate: "2025-07-23", notes: "" });
    setIsPaymentModalOpen(false);
    toast.success("Payment schedule installment added!");
  };

  const handleRemovePayment = (paymentId) => {
    setFormData((prev) => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.filter((p) => p.id !== paymentId),
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.customer) {
      toast.error("Please select a customer");
      return;
    }
    if (!formData.bookingEvent) {
      toast.error("Please select a booking event");
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Page Title with Breadcrumb & Top Right Save Button */}
      <PageTitle
        title={isEdit ? "Edit Reservation" : "Add Reservations"}
        breadcrumbs={[
          { label: "Reservations", href: "/dashboard/reservations" },
          { label: isEdit ? "Edit Reservation" : "Add Reservations" },
        ]}
        infoTooltip="Create new booking reservation, ticket allotments, and payment terms."
        actions={
          <Button
            onClick={handleSubmit}
            disabled={saveMutation.isPending || isLoading}
            className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-8 py-2 rounded-lg font-medium shadow-sm transition-all"
          >
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        }
      />

      {/* Form Content - 3 White Sections */}
      <div className="space-y-6">
        {/* Section 1: Reservation Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800">
            Reservation Info
          </h2>

          {/* Row 1: Customer, Booking Event, Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Customer <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.customerId}
                onValueChange={(val) => {
                  const cust = lookups.customers.find((c) => c.id === val);
                  setFormData({
                    ...formData,
                    customerId: val,
                    customer: cust?.name || "Customer",
                  });
                }}
              >
                <SelectTrigger className="w-full h-11 rounded-lg border-slate-200 bg-white">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Booking Event <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={formData.bookingEventId}
                onValueChange={(val) => {
                  const ev = lookups.events.find((e) => e.id === val);
                  setFormData({
                    ...formData,
                    bookingEventId: val,
                    bookingEvent: ev?.name || "Event",
                  });
                }}
              >
                <SelectTrigger className="w-full h-11 rounded-lg border-slate-200 bg-white">
                  <SelectValue placeholder="Select Booking Event" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Quantity (9 remaining)
              </Label>
              <Input
                placeholder="Select Provider"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="h-11 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
              />
            </div>
          </div>

          {/* Row 2: Invoice Pattern, Payment Method, Cost Center */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Invoice Pattern
              </Label>
              <Select
                value={formData.invoicePatternId}
                onValueChange={(val) =>
                  setFormData({ ...formData, invoicePatternId: val })
                }
              >
                <SelectTrigger className="w-full h-11 rounded-lg border-slate-200 bg-white">
                  <SelectValue placeholder="Select Invoice Pattern" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.invoicePatterns.map((ip) => (
                    <SelectItem key={ip.id} value={ip.id}>
                      {ip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Payment Method
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(val) =>
                  setFormData({ ...formData, paymentMethod: val })
                }
              >
                <SelectTrigger className="w-full h-11 rounded-lg border-slate-200 bg-white">
                  <SelectValue placeholder="Select Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.name}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Cost Center
              </Label>
              <Select
                value={formData.costCenterId}
                onValueChange={(val) =>
                  setFormData({ ...formData, costCenterId: val })
                }
              >
                <SelectTrigger className="w-full h-11 rounded-lg border-slate-200 bg-white">
                  <SelectValue placeholder="Select Cost Center" />
                </SelectTrigger>
                <SelectContent>
                  {lookups.costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Notes */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-800">
              Notes
            </Label>
            <Textarea
              placeholder="Notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="min-h-[100px] rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>
        </div>

        {/* Section 2: Amounts & Discounts */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800">
            Amounts & Discounts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Amount Paid
              </Label>
              <Input
                placeholder="0"
                value={formData.amountPaid}
                onChange={(e) =>
                  setFormData({ ...formData, amountPaid: e.target.value })
                }
                className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Discount Amount
              </Label>
              <Input
                placeholder="0"
                value={formData.discountAmount}
                onChange={(e) =>
                  setFormData({ ...formData, discountAmount: e.target.value })
                }
                className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Discount %
              </Label>
              <Input
                placeholder="0"
                value={formData.discountPercent}
                onChange={(e) =>
                  setFormData({ ...formData, discountPercent: e.target.value })
                }
                className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Tax %
              </Label>
              <Input
                placeholder="0"
                value={formData.taxPercent}
                onChange={(e) =>
                  setFormData({ ...formData, taxPercent: e.target.value })
                }
                className="h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-[#0066d1]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Payment Schedule */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Payment Schedule
            </h2>
            <Button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-[#0066d1] hover:bg-[#0052a8] text-white px-5 rounded-xl font-medium text-xs h-10 gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add
            </Button>
          </div>

          {formData.paymentSchedule.length === 0 ? (
            <p className="text-xs text-slate-500 pt-1">
              No installments — full amount due at appointment
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {formData.paymentSchedule.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-white"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-800">
                        ${item.amount}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Due: {item.dueDate}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-slate-600 mt-1 max-w-xl">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePayment(item.id)}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Payment Modal matching Image 4 */}
      <DynamicModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        title="Add Payment"
        icon={Wallet}
        showDefaultFooter={false}
        size="md"
        className="rounded-[28px] p-7"
      >
        <form onSubmit={handleAddPayment} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Amount
            </Label>
            <Input
              type="number"
              placeholder="Amount"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, amount: e.target.value })
              }
              className="h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Due Date
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={paymentForm.dueDate}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, dueDate: e.target.value })
                }
                className="h-11 rounded-xl border-slate-200 bg-white pr-10 focus-visible:ring-[#0066d1]"
              />
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Notes
            </Label>
            <Textarea
              placeholder="Notes"
              value={paymentForm.notes}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, notes: e.target.value })
              }
              className="min-h-[90px] rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-[#0066d1]"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-[#0066d1] hover:bg-[#0052a8] text-white py-3.5 h-auto rounded-xl font-medium text-sm transition-all"
            >
              Add
            </Button>
          </div>
        </form>
      </DynamicModal>
    </div>
  );
}
