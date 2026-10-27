import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  Pencil,
  ArrowLeft,
  FileCheck,
  FileText,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/common/page-title";
import toast from "react-hot-toast";
import { getAppointmentById } from "@/services/appointments";

const statusStyles = {
  Pending:
    "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Confirmed:
    "bg-cyan-50 text-cyan-600 border border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800",
  CheckedIn:
    "bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
  Completed:
    "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Canceled:
    "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
  NoShow:
    "bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  Scheduled:
    "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
};

export default function AppointmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copiedKey, setCopiedKey] = useState(null);

  // Fetch Appointment
  const { data: appointmentResponse, isLoading, isError } = useQuery({
    queryKey: ["appointmentDetail", id],
    queryFn: () => getAppointmentById(id),
    enabled: Boolean(id),
  });

  const appointment = appointmentResponse?.data || {};

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading appointment details...
        </p>
      </div>
    );
  }

  if (isError || !appointment.id) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-4 text-center">
        <p className="text-base font-medium text-foreground">
          Appointment not found or failed to load.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/appointments")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Appointments</span>
        </Button>
      </div>
    );
  }

  const badgeClass =
    statusStyles[appointment.status] ||
    "bg-muted text-muted-foreground border border-border";

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs & Actions */}
      <PageTitle
        title="Appointment Details"
        infoText="Comprehensive overview of service appointment details"
        breadcrumbs={[
          { label: "Appointments", href: "/dashboard/appointments" },
          { label: `Appointment Details` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/appointments")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              onClick={() => navigate(`/dashboard/appointments/edit/${id}`)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit Appointment</span>
            </Button>
          </div>
        }
      />

      {/* Main Overview Banner Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
              >
                {appointment.status || "Pending"}
              </span>

              {appointment.invoiceId ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <FileCheck className="h-3.5 w-3.5" />
                  Invoiced (#{appointment.invoiceId.slice(0, 8)})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                  <FileText className="h-3.5 w-3.5" />
                  Not Invoiced
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {appointment.serviceName || appointment.service || "Service Appointment"}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Appointment ID:</span>
              <span className="font-mono text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                {appointment.id}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(appointment.id, "appointmentId")}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Copy ID"
              >
                {copiedKey === "appointmentId" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Metadata Grid */}
        <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Date</p>
              <p className="truncate text-sm font-semibold text-foreground">
                {appointment.date || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Time Slot</p>
              <p className="truncate text-sm font-semibold text-foreground">
                {appointment.time || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Customer</p>
              <p className="truncate text-sm font-semibold text-foreground">
                {appointment.customerName || appointment.customer || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Provider</p>
              <p className="truncate text-sm font-semibold text-foreground">
                {appointment.serviceProviderName || appointment.provider || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Details Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Service & Product Info */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Service Details
            </h2>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Service Name</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {appointment.serviceName || appointment.service || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-muted-foreground">Product Variant ID</dt>
              <dd className="mt-1 flex items-center gap-1.5">
                <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded truncate max-w-[200px]" title={appointment.productVariantId}>
                  {appointment.productVariantId || "—"}
                </span>
                {appointment.productVariantId && (
                  <button
                    type="button"
                    onClick={() => handleCopy(appointment.productVariantId, "productVariantId")}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    title="Copy Variant ID"
                  >
                    {copiedKey === "productVariantId" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-muted-foreground">Start Time</dt>
              <dd className="mt-1 text-sm font-mono text-foreground">
                {appointment.startTime || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-muted-foreground">End Time</dt>
              <dd className="mt-1 text-sm font-mono text-foreground">
                {appointment.endTime || "—"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Customer & Provider Relations */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCheck className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Customer & Provider Information
            </h2>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">Customer Name</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {appointment.customerName || appointment.customer || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-muted-foreground">Customer ID</dt>
              <dd className="mt-1 flex items-center gap-1.5">
                <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded truncate max-w-[200px]" title={appointment.customerId}>
                  {appointment.customerId || "—"}
                </span>
                {appointment.customerId && (
                  <button
                    type="button"
                    onClick={() => handleCopy(appointment.customerId, "customerId")}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    title="Copy Customer ID"
                  >
                    {copiedKey === "customerId" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-muted-foreground">Service Provider</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {appointment.serviceProviderName || appointment.provider || "—"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium text-muted-foreground">Provider ID</dt>
              <dd className="mt-1 flex items-center gap-1.5">
                <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded truncate max-w-[200px]" title={appointment.serviceProviderId}>
                  {appointment.serviceProviderId || "—"}
                </span>
                {appointment.serviceProviderId && (
                  <button
                    type="button"
                    onClick={() => handleCopy(appointment.serviceProviderId, "serviceProviderId")}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    title="Copy Provider ID"
                  >
                    {copiedKey === "serviceProviderId" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Invoice & Billing Info */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-border pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Invoice & Billing Status
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Invoice Status</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {appointment.invoiceId ? "Invoiced" : "Not Invoiced"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground">Invoice ID</p>
              <p className="mt-1 text-sm font-mono text-foreground">
                {appointment.invoiceId ? (
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs bg-muted px-2 py-1 rounded">
                    {appointment.invoiceId}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
