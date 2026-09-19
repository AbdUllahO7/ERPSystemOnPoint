import { useState, useRef } from "react";
import { Search, Filter, RefreshCw, Printer, Plus, MoreVertical, FileText, CloudUpload, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupplierDocuments, uploadSupplierDocument, deleteSupplierDocument } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";

export function FilesTab({ supplierId }) {
  const [search, setSearch] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["supplierDocuments", supplierId],
    queryFn: () => getSupplierDocuments({ SupplierId: supplierId, PageNumber: 1, PageSize: 50 }),
    enabled: !!supplierId,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadSupplierDocument,
    onSuccess: () => {
      toast.success("File uploaded successfully");
      queryClient.invalidateQueries(["supplierDocuments", supplierId]);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    },
    onError: () => {
      toast.error("Failed to upload file");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplierDocument,
    onSuccess: () => {
      toast.success("File deleted successfully");
      queryClient.invalidateQueries(["supplierDocuments", supplierId]);
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete file");
      setDeleteId(null);
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
    formData.append("SupplierId", supplierId);
    formData.append("File", selectedFile);
    formData.append("FileName", selectedFile.name);

    uploadMutation.mutate(formData);
  };

  const files = data?.data?.items || [];
  const filteredFiles = files.filter(f => f.fileName.toLowerCase().includes(search.toLowerCase()));

  const getFileIconColor = (extension) => {
    const ext = extension?.toLowerCase();
    if (ext === "pdf") return "bg-red-500";
    if (ext === "doc" || ext === "docx") return "bg-blue-500";
    if (ext === "csv" || ext === "xls" || ext === "xlsx") return "bg-emerald-500";
    return "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by file name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-transparent"
            />
          </div>
          <Button variant="outline" className="h-10 gap-2 bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Printer className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button className="h-10 gap-2" onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">No files found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => (
            <div key={file.id} className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className={`shrink-0 w-12 h-14 rounded-lg flex items-center justify-center text-white font-bold text-xs ${getFileIconColor(file.fileExtension)}`}>
                  {file.fileExtension?.toUpperCase() || "FILE"}
                </div>
                <div className="min-w-0">
                  <a href={file.fullUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline truncate block">
                    {file.fileName}
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">{file.fileSizeDisplay} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setDeleteId(file.id)}
                className="p-2 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded-lg transition-colors shrink-0"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
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
                <DialogTitle>Upload files</DialogTitle>
                <DialogDescription className="text-xs mt-1">Select and upload the files of your choice</DialogDescription>
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
              <h4 className="text-sm font-semibold mb-1">Choose a file or drag & drop it here</h4>
              <p className="text-xs text-muted-foreground mb-4">JPEG, PNG, PDF, and MP4 formats, up to 50MB</p>
              <Button variant="outline" className="bg-white" onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}>
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
                  <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                </div>
                <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-gray-200 rounded-full">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUploadSubmit} disabled={!selectedFile || uploadMutation.isPending}>
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete File"
        description="Are you sure you want to delete this file? This action cannot be undone."
      />
    </div>
  );
}
