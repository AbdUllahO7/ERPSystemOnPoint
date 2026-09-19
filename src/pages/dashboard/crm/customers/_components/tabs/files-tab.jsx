import { useState, useRef } from "react";
import { Search, Filter, RefreshCw, Printer, Plus, MoreVertical, Download, CloudUpload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomerDocuments, uploadCustomerDocument } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

export function FilesTab() {
  const { id } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: filesData, isLoading, refetch } = useQuery({
    queryKey: ["customer-documents", id, page],
    queryFn: () => getCustomerDocuments({ CustomerId: id, PageNumber: page, PageSize: pageSize }),
    enabled: !!id,
  });

  const uploadMutation = useMutation({
    mutationFn: uploadCustomerDocument,
    onSuccess: () => {
      toast.success("File uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-documents", id] });
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    },
    onError: () => {
      toast.error("Failed to upload file");
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
    formData.append("CustomerId", id);
    formData.append("File", selectedFile);
    formData.append("FileName", selectedFile.name);

    uploadMutation.mutate(formData);
  };

  const files = filesData?.data?.items || [];
  const totalPages = filesData?.data?.totalPages || 1;

  const filteredFiles = files.filter(f => f.fileName.toLowerCase().includes(search.toLowerCase()));

  const getFileColor = (ext) => {
    switch (ext?.toUpperCase()) {
      case "PDF": return "bg-red-500";
      case "DOC":
      case "DOCX": return "bg-blue-500";
      case "CSV":
      case "XLS":
      case "XLSX": return "bg-emerald-500";
      case "PNG":
      case "JPG":
      case "JPEG": return "bg-purple-500";
      default: return "bg-gray-500";
    }
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
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
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
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold">No documents found</h3>
          <p className="text-muted-foreground text-sm mt-1">Upload a document to keep track of important files.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => (
            <div key={file.id} className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-14 rounded-lg flex items-center justify-center text-white font-bold text-xs ${getFileColor(file.fileExtension)}`}>
                  {file.fileExtension?.toUpperCase() || "FILE"}
                </div>
                <div className="max-w-[180px]">
                  <h4 className="font-semibold text-foreground truncate" title={file.fileName}>{file.fileName}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {file.formattedFileSize} • Uploaded {new Date(file.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {file.fullUrl && (
                  <a href={file.fullUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-blue-500">
                    <Download className="w-5 h-5" />
                  </a>
                )}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-muted-foreground">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground pt-4">
          <span 
            className={`cursor-pointer hover:text-foreground ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Pre
          </span>
          <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-md font-medium">
            {page}
          </div>
          <span className="px-2">of {totalPages}</span>
          <span 
            className={`cursor-pointer text-blue-600 hover:text-blue-700 ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </span>
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
            <Button variant="outline" onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); }}>Cancel</Button>
            <Button onClick={handleUploadSubmit} disabled={!selectedFile || uploadMutation.isPending}>
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
