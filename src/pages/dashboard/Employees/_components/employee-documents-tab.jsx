import { useState, useRef } from "react";
import { Search, Filter, RefreshCw, Printer, Plus, MoreVertical, Download, Trash2, UploadCloud, File as FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDocumentsByEmployee, deleteDocument, uploadDocument } from "@/lib/api";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import toast from "react-hot-toast";

export default function EmployeeDocumentsTab() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ type: "", year: "" });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteDocId, setDeleteDocId] = useState(null);

  const { data: documentsData, isLoading, refetch } = useQuery({
    queryKey: ["getDocumentsByEmployee", id],
    queryFn: () => getDocumentsByEmployee(id),
    enabled: !!id,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["getDocumentsByEmployee"]);
      toast.success("Document uploaded successfully!");
      setIsUploadOpen(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      console.error("Failed to upload document", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to upload document!");
    }
  });

  const delMutation = useMutation({
    mutationFn: (docId) => deleteDocument(docId),
    onSuccess: () => {
      queryClient.invalidateQueries(["getDocumentsByEmployee"]);
      toast.success("Document deleted successfully!");
      setDeleteDocId(null);
    },
    onError: (error) => {
      console.error("Failed to delete document:", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to delete document!");
      setDeleteDocId(null);
    }
  });

  const handleUpload = () => {
    if (!selectedFile || !id) return;
    const formData = new FormData();
    formData.append("EmployeeId", id);
    formData.append("FileName", selectedFile.name);
    formData.append("File", selectedFile);
    uploadMutation.mutate(formData);
  };

  const getFileColor = (ext) => {
    switch (ext?.toLowerCase()) {
      case ".pdf": return "bg-red-600";
      case ".doc":
      case ".docx": return "bg-blue-600";
      case ".csv":
      case ".xlsx":
      case ".xls": return "bg-green-600";
      default: return "bg-slate-600";
    }
  };

  const documents = documentsData?.data || [];
  
  const filteredDocuments = documents.filter(doc => {
    if (search && !doc.fileName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.type && doc.fileExtension?.toLowerCase() !== `.${filters.type}`) return false;
    if (filters.year && !doc.uploadedOn?.startsWith(filters.year)) return false;
    return true;
  });

  return (
    <div className="mt-4 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by id or employee name..."
              className="pl-8 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 hover:text-blue-700"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" className="bg-card text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-card text-muted-foreground">
            <Printer className="w-4 h-4" />
          </Button>
          <Button 
            className="bg-[#0066d1] hover:bg-blue-700 text-white"
            onClick={() => setIsUploadOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Filter Menu */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isFilterOpen
            ? "grid-rows-[1fr] opacity-100 mb-6"
            : "grid-rows-[0fr] opacity-0 mb-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-card text-card-foreground p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-end gap-4 flex-wrap">
            {[
              {
                key: "type",
                label: "Filter by Type",
                placeholder: "All Types",
                options: [{ value: "pdf", label: "PDF" }, { value: "doc", label: "DOC" }, { value: "csv", label: "CSV" }],
              },
              {
                key: "year",
                label: "Filter by Year",
                placeholder: "All Years",
                options: [{ value: "2025", label: "2025" }, { value: "2024", label: "2024" }, { value: "2023", label: "2023" }],
              },
            ].map((config) => (
              <div
                key={config.key}
                className="flex flex-col gap-2 w-full sm:max-w-[200px]"
              >
                <label className="text-sm font-medium text-foreground">
                  {config.label}
                </label>
                <Select
                  value={filters[config.key] || "all"}
                  onValueChange={(val) => {
                    setFilters((prev) => ({
                      ...prev,
                      [config.key]: val === "all" ? "" : val,
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={config.placeholder} />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4}>
                    <SelectItem value="all">{config.placeholder}</SelectItem>
                    {config.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {Object.values(filters).some((val) => val !== "") && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ type: "", year: "" });
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center p-8 text-muted-foreground">Loading documents...</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex justify-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">No documents found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-card p-4 rounded-xl border flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow group">
              {/* File Icon */}
              <div className={`relative w-12 h-14 rounded-lg flex items-center justify-center text-white font-bold text-xs ${getFileColor(doc.fileExtension)}`}>
                <div className="absolute top-0 right-0 w-4 h-4 bg-card rounded-bl-lg" />
                <div className="absolute top-0 right-0 w-4 h-4 border-b border-l border-white/30 rounded-bl-lg" />
                <span className="mt-1">{doc.fileExtension?.replace('.', '').toUpperCase()}</span>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-semibold text-foreground truncate">{doc.fileName}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {doc.docType} • {doc.uploadedOn ? new Date(doc.uploadedOn).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="text-slate-600 focus:text-blue-600 focus:bg-blue-50 cursor-pointer" onClick={() => window.open(doc.fullUrl, "_blank")}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer" onClick={() => setDeleteDocId(doc.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document for this employee.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${selectedFile ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                    <FileIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1 truncate max-w-xs">{selectedFile.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                    <X className="w-4 h-4 mr-2" />
                    Remove File
                  </Button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 mb-4">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Choose a file or drag & drop it here</h3>
                  <p className="text-xs text-muted-foreground mb-4">PDF, DOC, DOCX, JPEG, PNG formats</p>
                  <Button variant="outline" className="px-8" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse File</Button>
                </>
              )}
            </div>
            
            <div className="flex justify-end mt-6 gap-3">
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || uploadMutation.isPending}
                className="bg-[#0066d1] hover:bg-blue-700 text-white"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={() => {
          if (deleteDocId) delMutation.mutate(deleteDocId);
        }}
        isLoading={delMutation.isPending}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
      />
    </div>
  );
}
