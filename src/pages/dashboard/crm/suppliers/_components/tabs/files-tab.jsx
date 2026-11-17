import { useState, useRef } from "react";
import { Search, RefreshCw, Plus, FileText, CloudUpload, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupplierDocuments, uploadSupplierDocument, deleteSupplierDocument } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { useI18n } from "@/context/translate-api";

export function FilesTab({ supplierId }) {
  const { t, locale } = useI18n();
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
      toast.success(t('crmSuppliers.files.uploadSuccess'));
      queryClient.invalidateQueries(["supplierDocuments", supplierId]);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    },
    onError: () => {
      toast.error(t('crmSuppliers.files.uploadError'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplierDocument,
    onSuccess: () => {
      toast.success(t('crmSuppliers.files.deleteSuccess'));
      queryClient.invalidateQueries(["supplierDocuments", supplierId]);
      setDeleteId(null);
    },
    onError: () => {
      toast.error(t('crmSuppliers.files.deleteError'));
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
      toast.error(t('crmSuppliers.files.chooseFiles'));
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
              placeholder={t('crmSuppliers.files.searchPlaceholder')} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-transparent"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10 cursor-pointer" onClick={() => refetch()} title={t('common.refresh', 'Refresh')}>
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="h-10 gap-2 cursor-pointer" onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="w-4 h-4" />
            {t('common.add')}
          </Button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">{t('common.loading')}</div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl text-sm">
          {t('crmSuppliers.files.empty')}
        </div>
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
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {file.fileSizeDisplay} • {new Date(file.uploadedAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setDeleteId(file.id)}
                className="p-2 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded-lg transition-colors shrink-0 cursor-pointer"
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
                <DialogTitle>{t('crmSuppliers.files.uploadFiles')}</DialogTitle>
                <DialogDescription className="text-xs mt-1">
                  {t('crmSuppliers.files.supportedFormats')}
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
                {t('crmSuppliers.files.dragAndDrop')}
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                {t('crmSuppliers.files.supportedFormats')}
              </p>
              <Button variant="outline" className="bg-white" onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}>
                {t('crmSuppliers.files.chooseFiles')}
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
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleUploadSubmit} disabled={!selectedFile || uploadMutation.isPending}>
              {uploadMutation.isPending ? t('common.saving') : t('crmSuppliers.files.uploadFiles')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title={t('crmSuppliers.files.deleteTitle')}
        description={t('crmSuppliers.files.deleteDesc')}
      />
    </div>
  );
}
