import { useState, useEffect } from "react";
import { Plus, FileText, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { 
  getSupplierNotes, 
  createSupplierNote, 
  updateSupplierNote,
  deleteSupplierNote,
  getSupplierNoteById
} from "@/lib/api";
import { useI18n } from "@/context/translate-api";

export function NotesTab({ supplierId }) {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [editNoteId, setEditNoteId] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    note: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["supplierNotes", supplierId],
    queryFn: () => getSupplierNotes({ SupplierId: supplierId, PageNumber: 1, PageSize: 100 }),
    enabled: !!supplierId,
  });

  const { data: editNoteData, isFetching: isFetchingEditNote } = useQuery({
    queryKey: ["supplierNote", editNoteId],
    queryFn: () => getSupplierNoteById(editNoteId),
    enabled: !!editNoteId,
  });

  useEffect(() => {
    if (editNoteId && editNoteData?.data) {
      const note = editNoteData.data;
      setFormData({
        title: note.title || "",
        note: note.note || "",
      });
      setIsAddModalOpen(true);
    }
  }, [editNoteData, editNoteId]);

  const addMutation = useMutation({
    mutationFn: (newNote) => createSupplierNote(newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierNotes", supplierId] });
      toast.success(t('crmSuppliers.notes.saveSuccess'));
      closeModal();
    },
    onError: () => toast.error(t('crmSuppliers.notes.saveError'))
  });

  const updateMutation = useMutation({
    mutationFn: (updatedNote) => updateSupplierNote(updatedNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierNotes", supplierId] });
      toast.success(t('crmSuppliers.notes.saveSuccess'));
      closeModal();
    },
    onError: () => toast.error(t('crmSuppliers.notes.saveError'))
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSupplierNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierNotes", supplierId] });
      toast.success(t('crmSuppliers.notes.deleteSuccess'));
      setDeleteModalOpen(false);
      setSelectedNoteId(null);
    },
    onError: () => toast.error(t('crmSuppliers.notes.deleteError'))
  });

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditNoteId(null);
    setFormData({ title: "", note: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error(t('crmSuppliers.notes.saveError'));
      return;
    }
    
    if (editNoteId) {
      updateMutation.mutate({
        id: editNoteId,
        title: formData.title,
        note: formData.note,
      });
    } else {
      addMutation.mutate({
        supplierId: supplierId,
        title: formData.title,
        note: formData.note,
      });
    }
  };

  const handleDelete = () => {
    if (selectedNoteId) {
      deleteMutation.mutate(selectedNoteId);
    }
  };

  const notes = data?.data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t('crmSuppliers.notes.title')}</h3>
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          if (!open) closeModal();
          else setIsAddModalOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditNoteId(null)}>
              <Plus className="w-4 h-4" />
              {t('common.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 border-0 rounded-2xl overflow-hidden">
            <div className="p-6">
              <DialogHeader className="flex flex-row items-center gap-4 space-y-0 border-b pb-6">
                <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <DialogTitle className="text-xl font-semibold">
                  {editNoteId ? t('crmSuppliers.notes.editNote') : t('crmSuppliers.notes.addNote')}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">{t('crmSuppliers.notes.noteTitle')}</Label>
                  <Input
                    placeholder={t('crmSuppliers.notes.noteTitlePlaceholder')}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">{t('crmSuppliers.notes.noteContent')}</Label>
                  <Textarea
                    placeholder={t('crmSuppliers.notes.noteContentPlaceholder')}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    required
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#006fee] hover:bg-[#005bc4] text-white h-11 text-base font-medium" 
                  disabled={addMutation.isPending || updateMutation.isPending || isFetchingEditNote}
                >
                  {addMutation.isPending || updateMutation.isPending 
                    ? t('common.saving')
                    : isFetchingEditNote ? t('common.loading') : (editNoteId ? t('common.save') : t('common.add'))}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div className="text-center py-4 text-sm text-muted-foreground">{t('common.loading')}</div>}
      {isError && <div className="text-center py-4 text-red-500 text-sm">{t('crmSuppliers.notes.empty')}</div>}
      {!isLoading && !isError && notes.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">{t('crmSuppliers.notes.empty')}</div>
      )}

      {notes.map((note) => (
        <div key={note.id} className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
          <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setEditNoteId(note.id)}
              className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                setSelectedNoteId(note.id);
                setDeleteModalOpen(true);
              }}
              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">{note.title}</h4>
              <span className="text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {note.note}
          </p>
        </div>
      ))}

      <DeleteConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('crmSuppliers.notes.deleteTitle')}
        description={t('crmSuppliers.notes.deleteDesc')}
      />
    </div>
  );
}
