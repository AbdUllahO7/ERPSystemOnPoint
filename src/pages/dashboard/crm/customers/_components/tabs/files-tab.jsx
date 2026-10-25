import { useState, useRef } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Download,
  CloudUpload,
  X,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerDocuments,
  uploadCustomerDocument,
  deleteCustomerDocument,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";

export function FilesTab({ customerId: propCustomerId }) {
  const params = useParams();
  const customerId = propCustomerId || params.id;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: filesData, isLoading, refetch } = useQuery({
    queryKey: ["customer-documents", customerId, page],
    queryFn: () =>
      getCustomerDocuments({
        CustomerId: customerId,
        PageNumber: page,
        PageSize: pageSize,
      }),
    enabled: !!customerId,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadCustomerDocument,
    onSuccess: () => {
      toast.success("File uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-documents", customerId] });
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    },
    onError: () => {
      toast.error("Failed to upload file");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCustomerDocument(id),
    onSuccess: () => {
      toast.success("Document deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-documents", customerId] });
      setDeleteDocId(null);
    },
    onError: () => {
      toast.error("Failed to delete document");
      setDeleteDocId(null);
    },
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("CustomerId", customerId);
    formData.append("File", selectedFile);
    formData.append("FileName", selectedFile.name);

    uploadMutation.mutate(formData);
  };

  const files = filesData?.data?.items || [];
  const totalPages = filesData?.data?.totalPages || 1;

  const filteredFiles = files.filter((f) =>
    f.fileName?.toLowerCase().includes(search.toLowerCase())
  );

  const getFileColor = (ext) => {
    switch (ext?.toUpperCase()) {
      case "PDF":
        return "bg-red-500";
      case "DOC":
      case "DOCX":
        return "bg-blue-500";
      case "CSV":
      case "XLS":
      case "XLSX":
        return "bg-emerald-500";
      case "PNG":
      case "JPG":
      case "JPEG":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => refetch()}
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 text-muted-foreground ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </Button>
          <Button
            className="h-10 gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Upload File
          </Button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-xl shadow-sm">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No documents found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Upload customer contracts, agreements, or requirements files.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`w-11 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 ${getFileColor(
                    file.fileExtension
                  )}`}
                >
                  {file.fileExtension?.toUpperCase() || "DOC"}
                </div>
                <div className="truncate pr-2">
                  <h4
                    className="font-semibold text-sm text-foreground truncate"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {file.formattedFileSize || "File"} •{" "}
                    {file.createdAt
                      ? new Date(file.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "Uploaded"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {file.fullUrl && (
                  <a
                    href={file.fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteDocId(file.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Pre
          </Button>
          <span className="text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-gray-50">
                <CloudUpload className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription className="text-xs mt-1">
                  Upload customer-related attachments, contracts, or specs
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6">
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <CloudUpload className="w-6 h-6 text-gray-600" />
              </div>
              <h4 className="text-sm font-semibold mb-1">
                Choose a file or drag & drop it here
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                PDF, Word, Excel, and images up to 50MB
              </p>
              <Button
                variant="outline"
                className="bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {selectedFile && (
              <div className="mt-4 p-3 border rounded-lg flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadModalOpen(false);
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={!selectedFile || uploadMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={() => deleteMutation.mutate(deleteDocId)}
        title="Delete Customer Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
      />
    </div>
  );
}
