import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLeadById,
  updateFollowUpStatus,
  changeLeadStatus,
  getLeadDocuments,
  uploadLeadDocument,
  deleteLeadDocument,
} from "@/lib/api";
import {
  Info,
  Edit,
  RefreshCcw,
  PhoneCall,
  Calendar,
  Plus,
  Check,
  X,
  Loader2,
  FileText,
  Download,
  Trash2,
  CloudUpload,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { AddFollowUpDialog } from "./_components/add-follow-up-dialog";
import { ConvertToCustomerDialog } from "./_components/convert-to-customer-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/context/translate-api";

export default function LeadDetails() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [followUpType, setFollowUpType] = useState("");

  // Execution Note Dialog state for follow-up completion/cancellation
  const [executionDialog, setExecutionDialog] = useState({
    isOpen: false,
    followUp: null,
    action: "Completed",
    executionNote: "",
  });

  // Lead Document Upload Dialog state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docFileName, setDocFileName] = useState("");
  const fileInputRef = useRef(null);

  // Queries
  const { data, isLoading, isError } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLeadById(id),
  });

  const { data: docsData, isLoading: isDocsLoading } = useQuery({
    queryKey: ["lead-documents", id],
    queryFn: () => getLeadDocuments({ LeadId: id }),
    enabled: !!id,
  });

  const lead = data?.data?.data || data?.data || data;
  const isConverted = lead?.status === "Converted" || !!lead?.customerId;

  // Mutations
  const followUpStatusMutation = useMutation({
    mutationFn: (payload) => updateFollowUpStatus(payload),
    onSuccess: () => {
      toast.success(t("leads.followUpStatusUpdateSuccess"));
      queryClient.invalidateQueries(["lead", id]);
      setExecutionDialog({ isOpen: false, followUp: null, action: "Completed", executionNote: "" });
    },
    onError: (err) => {
      toast.error(err?.message || t("leads.followUpStatusUpdateError"));
    },
  });

  const leadStatusMutation = useMutation({
    mutationFn: (payload) => changeLeadStatus(payload),
    onSuccess: () => {
      toast.success(t("leads.statusChangeSuccess"));
      queryClient.invalidateQueries(["lead", id]);
      queryClient.invalidateQueries(["leads"]);
    },
    onError: (err) => {
      toast.error(err?.message || t("leads.statusChangeError"));
    },
  });

  const uploadDocMutation = useMutation({
    mutationFn: (formData) => uploadLeadDocument(formData),
    onSuccess: () => {
      toast.success(t("leads.docAttachSuccess"));
      queryClient.invalidateQueries(["lead-documents", id]);
      setIsDocModalOpen(false);
      setSelectedFile(null);
      setDocFileName("");
    },
    onError: (err) => {
      toast.error(err?.message || t("leads.docAttachError"));
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId) => deleteLeadDocument(docId),
    onSuccess: () => {
      toast.success(t("leads.docDeleteSuccess"));
      queryClient.invalidateQueries(["lead-documents", id]);
    },
    onError: (err) => {
      toast.error(err?.message || t("leads.docDeleteError"));
    },
  });

  // Handlers
  const handleOpenExecutionDialog = (followUp, action) => {
    setExecutionDialog({
      isOpen: true,
      followUp,
      action,
      executionNote: "",
    });
  };

  const handleExecutionSubmit = (e) => {
    e.preventDefault();
    if (!executionDialog.executionNote.trim()) {
      toast.error(t("leads.executionNoteRequired"));
      return;
    }

    followUpStatusMutation.mutate({
      id: executionDialog.followUp.id,
      status: executionDialog.action,
      executionNote: executionDialog.executionNote.trim(),
    });
  };

  const handleLeadStatusChange = (status) => {
    if (status === "Converted") {
      if (isConverted) {
        toast.error(t("leads.alreadyConvertedError"));
        return;
      }
      setIsConvertDialogOpen(true);
      return;
    }

    if (isConverted) {
      toast.error(t("leads.convertedLeadsCannotChangeStatus"));
      return;
    }

    leadStatusMutation.mutate({
      leadId: id,
      newStatus: status,
      isPriceOfferAccepted: false,
      projectName: "",
      projectValue: 0,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!docFileName) {
        setDocFileName(file.name);
      }
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error(t("leads.pleaseChooseFile"));
      return;
    }

    const formData = new FormData();
    formData.append("LeadId", id);
    formData.append("File", selectedFile);
    formData.append("FileName", docFileName.trim() || selectedFile.name);

    uploadDocMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-6">{t("leads.loadingDetails")}</div>;
  if (isError || !lead) return <div className="p-6 text-red-500">{t("leads.errorLoadingDetails")}</div>;

  const documents =
    (docsData?.data?.items && docsData.data.items.length > 0)
      ? docsData.data.items
      : (Array.isArray(docsData?.data) && docsData.data.length > 0)
      ? docsData.data
      : (lead?.leadDoucumentDtos || lead?.leadDocumentDtos || []);

  const getInitials = (name) => (name ? name.substring(0, 2).toUpperCase() : "LD");

  const renderStatusBadge = (status) => {
    let colorClass = "bg-gray-100 text-gray-600";
    let meaning = "";
    switch (status) {
      case "New":
        colorClass = "bg-green-100 text-green-700 border border-green-200";
        meaning = t("leads.statusMeanings.new");
        break;
      case "Contacted":
        colorClass = "bg-blue-100 text-blue-700 border border-blue-200";
        meaning = t("leads.statusMeanings.contacted");
        break;
      case "Qualified":
        colorClass = "bg-teal-100 text-teal-700 border border-teal-200";
        meaning = t("leads.statusMeanings.qualified");
        break;
      case "Quotation":
        colorClass = "bg-amber-100 text-amber-700 border border-amber-200";
        meaning = t("leads.statusMeanings.quotation");
        break;
      case "Converted":
        colorClass = "bg-purple-100 text-purple-700 border border-purple-200";
        meaning = t("leads.statusMeanings.converted");
        break;
      case "Lost":
        colorClass = "bg-red-100 text-red-700 border border-red-200";
        meaning = t("leads.statusMeanings.lost");
        break;
      default:
        meaning = status;
    }
    const statusKey = status?.toLowerCase();
    const label = t(`leads.statuses.${statusKey}`) || status;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`} title={meaning}>
        {label}
      </span>
    );
  };

  const renderFollowUpStatus = (status) => {
    let colorClass = "bg-gray-100 text-gray-600";
    if (status === "Scheduled") colorClass = "bg-blue-100 text-blue-600";
    if (status === "Completed") colorClass = "bg-green-100 text-green-600";
    if (status === "Canceled" || status === "Cancelled" || status === "Missed")
      colorClass = "bg-red-100 text-red-600";
    return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${colorClass}`}>{status}</span>;
  };

  const getFileBadgeColor = (ext) => {
    switch (ext?.toUpperCase()) {
      case "PDF":
        return "bg-rose-500 text-white";
      case "DOC":
      case "DOCX":
        return "bg-blue-500 text-white";
      case "XLS":
      case "XLSX":
        return "bg-emerald-500 text-white";
      case "PNG":
      case "JPG":
      case "JPEG":
        return "bg-amber-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-10">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">
            {t("leads.details")}
          </h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/crm/leads")}>
            {t("leads.title")}
          </span>
          <span>/</span>
          <span className="font-medium text-foreground">
            {t("leads.details")}
          </span>
        </div>
      </div>

      {/* Resulting Customer Reference Banner (Rule 1 & Rule 2) */}
      {isConverted && (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {t("leads.resultingCustomerRef")}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-200 text-emerald-900 font-bold">
                  {t("leads.statuses.converted")}
                </span>
              </div>
              <p className="text-sm font-semibold text-emerald-950 mt-0.5">
                {lead.customerName || lead.company || lead.name}
                {lead.customerId ? ` • ${t("leads.customerIdLabel")} #${lead.customerId.substring(0, 8)}` : ""}
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {t("leads.reconversionRestricted")}
              </p>
            </div>
          </div>
          {lead.customerId && (
            <Button
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shrink-0 rounded-xl"
              onClick={() => navigate(`/dashboard/crm/customers/${lead.customerId}`)}
            >
              {t("leads.viewCustomerProfile")}
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info & Documents & Follow-Ups */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-sm">
                {getInitials(lead.name)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-2xl font-bold">{lead.name}</h3>
                  {renderStatusBadge(lead.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {lead.company || t("leads.individualLead")} • {t("leads.expectedValueLabel")}{" "}
                  <span className="text-blue-600 font-semibold">${lead.expectedValue || 0}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2" disabled={leadStatusMutation.isPending || isConverted}>
                    {leadStatusMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="w-4 h-4" />
                    )}
                    {t("leads.changeStatus")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-2 space-y-1">
                  <DropdownMenuItem
                    onClick={() => handleLeadStatusChange("New")}
                    className="cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 font-medium py-2 rounded-md"
                  >
                    {t("leads.statuses.new")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLeadStatusChange("Contacted")}
                    className="cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium py-2 rounded-md"
                  >
                    {t("leads.statuses.contacted")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLeadStatusChange("Qualified")}
                    className="cursor-pointer bg-teal-50 text-teal-700 hover:bg-teal-100 font-medium py-2 rounded-md"
                  >
                    {t("leads.statuses.qualified")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLeadStatusChange("Quotation")}
                    className="cursor-pointer bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium py-2 rounded-md"
                  >
                    {t("leads.statuses.quotation")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLeadStatusChange("Converted")}
                    disabled={isConverted}
                    className="cursor-pointer bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium py-2 rounded-md disabled:opacity-50"
                  >
                    {isConverted ? t("leads.statuses.converted") : t("leads.convertToCustomerAction")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLeadStatusChange("Lost")}
                    className="cursor-pointer bg-red-50 text-red-700 hover:bg-red-100 font-medium py-2 rounded-md"
                  >
                    {t("leads.statuses.lost")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" className="gap-2" onClick={() => navigate(`/dashboard/crm/leads/edit/${id}`)}>
                <Edit className="w-4 h-4" />
                {t("leads.editProfile")}
              </Button>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-foreground">{t("leads.company")}</h4>
                <p className="text-sm text-muted-foreground mt-1">{lead.company || "-"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{t("leads.email")}</h4>
                <p className="text-sm text-muted-foreground mt-1">{lead.email || "-"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{t("leads.phone")}</h4>
                <p className="text-sm text-muted-foreground mt-1">{lead.phone || lead.phoneNumber || "-"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{t("leads.responsible")}</h4>
                <p className="text-sm text-muted-foreground mt-1">{lead.responsibleName || lead.responsible || t("leads.none")}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{t("leads.createdAt")}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{t("leads.value")}</h4>
                  <span className="text-[11px] text-muted-foreground">{t("leads.opportunityEstimate")}</span>
                </div>
                <p className="text-sm text-blue-600 font-bold mt-1">${lead.expectedValue || 0}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground">{t("leads.notes")}</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {lead.notes || lead.note || t("leads.noNotes")}
              </p>
            </div>
          </div>

          {/* Lead Documents (LeadDocument) Section - Rule 4 */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold">
                    {t("leads.attachedDocuments")}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("leads.attachDocHelp")}
                </p>
              </div>
              <Button onClick={() => setIsDocModalOpen(true)} className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                {t("leads.attachDocument")}
              </Button>
            </div>

            {isDocsLoading ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                <Paperclip className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-semibold text-foreground">
                  {t("leads.noDocuments")}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("leads.attachDocEmptyHelp")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 border border-border rounded-xl flex items-center justify-between bg-card hover:border-blue-200 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`w-10 h-11 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${getFileBadgeColor(
                          doc.fileExtension
                        )}`}
                      >
                        {doc.fileExtension?.toUpperCase() || "DOC"}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-semibold text-foreground truncate" title={doc.fileName}>
                          {doc.fileName}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {doc.formattedFileSize || t("leads.file")} •{" "}
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {(doc.fullUrl || doc.fileUrl || doc.url) && (
                        <a
                          href={doc.fullUrl || doc.fileUrl || doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title={t("leads.download")}
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => deleteDocMutation.mutate(doc.id)}
                        disabled={deleteDocMutation.isPending}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors disabled:opacity-50"
                        title={t("leads.deleteDocument")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-Up Log - Rule 2 & 3 */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold">{t("leads.followUpLog")}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("leads.followUpHelp")}
                </p>
              </div>
              <Button
                className="gap-2 shrink-0"
                onClick={() => {
                  setFollowUpType("");
                  setIsFollowUpDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                {t("leads.addFollowUp")}
              </Button>
            </div>

            <div className="space-y-4">
              {lead.followUps && lead.followUps.length > 0 ? (
                lead.followUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="p-4 border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{followUp.topic || t("leads.followUp")}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            {followUp.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {followUp.scheduledDate ? new Date(followUp.scheduledDate).toLocaleString() : "-"}
                        </p>
                        {followUp.executionNote && (
                          <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                            <span className="text-[11px] font-bold text-slate-700 block">
                              {t("leads.executionResult")}
                            </span>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                              {followUp.executionNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {followUp.status === "Scheduled" && (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenExecutionDialog(followUp, "Completed")}
                            className="h-8 px-2.5 gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {t("leads.complete")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenExecutionDialog(followUp, "Canceled")}
                            className="h-8 px-2.5 gap-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                            {t("leads.cancel")}
                          </Button>
                        </div>
                      )}
                      {renderFollowUpStatus(followUp.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8 border-2 border-dashed border-border rounded-xl">
                  {t("leads.noFollowUps")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Quotes */}
        <div className="space-y-6">
          {/* Price Quote Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{t("leads.priceQuote")}</h3>
              {renderStatusBadge("Quotation")}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("leads.quoteTitle")}</span>
                <span className="font-medium">{lead.quoteTitle || t("leads.quotationPhase")}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("leads.estimatedValue")}</span>
                <span className="font-semibold text-blue-600">${lead.expectedValue || lead.quoteValue || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("leads.date")}</span>
                <span className="font-medium">
                  {lead.quoteDate ? new Date(lead.quoteDate).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>

            {/* Rule note: Quotation status does not generate quotation document by itself */}
            <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">
              <p className="font-semibold mb-0.5">{t("leads.quoteStatusNote")}</p>
              {t("leads.quotationStatusHelp")}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-4">{t("leads.quickActions")}</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
                onClick={() => {
                  setFollowUpType("Call");
                  setIsFollowUpDialogOpen(true);
                }}
              >
                <PhoneCall className="w-4 h-4 text-muted-foreground" />
                {t("leads.scheduleCall")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-transparent"
                onClick={() => {
                  setFollowUpType("Meeting");
                  setIsFollowUpDialogOpen(true);
                }}
              >
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {t("leads.scheduleMeeting")}
              </Button>

              {/* Prevent double conversion (Rule 1) */}
              {isConverted ? (
                <div className="pt-2">
                  <Button
                    disabled
                    className="w-full justify-start gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed opacity-90"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {t("leads.alreadyConvertedToCustomer")}
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-1.5 px-1">
                    {t("leads.reconversionRestrictedShort")}
                  </p>
                </div>
              ) : (
                <Button
                  className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white mt-4"
                  onClick={() => setIsConvertDialogOpen(true)}
                >
                  <RefreshCcw className="w-4 h-4" />
                  {t("leads.convertToCustomerAction")}
                </Button>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t("leads.followUpScheduleNote")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Note Dialog for Completing or Canceling Follow-Ups */}
      <Dialog
        open={executionDialog.isOpen}
        onOpenChange={(open) =>
          !open && setExecutionDialog((prev) => ({ ...prev, isOpen: false, executionNote: "" }))
        }
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  executionDialog.action === "Completed"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-rose-50 text-rose-600 border border-rose-200"
                }`}
              >
                {executionDialog.action === "Completed" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-lg">
                  {executionDialog.action === "Completed"
                    ? t("leads.completeFollowUp")
                    : t("leads.cancelFollowUp")}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {t("leads.recordOutcomeInExecutionNote")} {executionDialog.followUp?.topic || t("leads.followUp")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleExecutionSubmit} className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
              <p className="font-semibold text-slate-700">{t("leads.workflowStep3")}</p>
              <p className="text-slate-600">
                {t("leads.workflowStep3Desc")}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {t("leads.executionNoteLabel")} <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                placeholder={t("leads.executionNotePlaceholder")}
                value={executionDialog.executionNote}
                onChange={(e) => setExecutionDialog((prev) => ({ ...prev, executionNote: e.target.value }))}
                className="min-h-[110px] text-xs resize-none"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExecutionDialog((prev) => ({ ...prev, isOpen: false, executionNote: "" }))}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={followUpStatusMutation.isPending || !executionDialog.executionNote.trim()}
                className={
                  executionDialog.action === "Completed"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-rose-600 hover:bg-rose-700 text-white"
                }
              >
                {followUpStatusMutation.isPending
                  ? t("common.saving")
                  : executionDialog.action === "Completed"
                  ? t("leads.saveAndComplete")
                  : t("leads.saveAndCancel")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Lead Document Dialog */}
      <Dialog open={isDocModalOpen} onOpenChange={setIsDocModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <CloudUpload className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  {t("leads.attachDocModalTitle")}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {t("leads.attachDocModalDesc")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                {t("leads.docTitleLabel")}
              </Label>
              <Input
                placeholder={t("leads.docTitlePlaceholder")}
                value={docFileName}
                onChange={(e) => setDocFileName(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div
              className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUpload className="w-8 h-8 text-muted-foreground mb-2 opacity-60" />
              <p className="text-xs font-semibold text-foreground">
                {t("leads.clickToSelectFile")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t("leads.fileTypesSupported")}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {selectedFile && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium text-blue-900 truncate">{selectedFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDocModalOpen(false);
                  setSelectedFile(null);
                  setDocFileName("");
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={!selectedFile || uploadDocMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {uploadDocMutation.isPending
                  ? t("leads.uploading")
                  : t("leads.uploadDocument")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Follow-Up Dialog */}
      <AddFollowUpDialog
        isOpen={isFollowUpDialogOpen}
        onClose={() => setIsFollowUpDialogOpen(false)}
        leadId={id}
        defaultType={followUpType}
      />

      {/* Convert to Customer Dialog */}
      <ConvertToCustomerDialog
        isOpen={isConvertDialogOpen}
        onClose={() => setIsConvertDialogOpen(false)}
        lead={lead}
      />
    </div>
  );
}
