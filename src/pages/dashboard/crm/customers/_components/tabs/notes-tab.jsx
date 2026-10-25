import { Plus, FileText, Calendar, X, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerNotes,
  createCustomerNote,
  updateCustomerNote,
  deleteCustomerNote,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";

export function NotesTab({ customerId: propCustomerId }) {
  const params = useParams();
  const customerId = propCustomerId || params.id;
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [deleteNoteId, setDeleteNoteId] = useState(null);

  const { data: notesData, isLoading } = useQuery({
    queryKey: ["customer-notes", customerId, page],
    queryFn: () =>
      getCustomerNotes({
        CustomerId: customerId,
        PageNumber: page,
        PageSize: pageSize,
      }),
    enabled: !!customerId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCustomerNote(id),
    onSuccess: () => {
      toast.success("Note deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-notes", customerId] });
      setDeleteNoteId(null);
    },
    onError: () => {
      toast.error("Failed to delete note");
      setDeleteNoteId(null);
    },
  });

  const notes = notesData?.data?.items || [];
  const totalPages = notesData?.data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Customer Notes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Internal observations, communication logs, and customer preferences
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Note
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-xl shadow-sm">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No notes found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Add a note to keep track of important customer information.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border rounded-xl p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">{note.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(note.createdAt).toLocaleString("en-US")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNoteToEdit(note)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 w-8"
                    title="Edit Note"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteNoteId(note.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap pl-13">
                {note.note}
              </p>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      <AddNoteDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        customerId={customerId}
      />

      {noteToEdit && (
        <EditNoteDialog
          open={!!noteToEdit}
          onOpenChange={(val) => {
            if (!val) setNoteToEdit(null);
          }}
          customerId={customerId}
          noteItem={noteToEdit}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deleteNoteId}
        onClose={() => setDeleteNoteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteNoteId)}
        title="Delete Customer Note"
        description="Are you sure you want to delete this customer note? This action cannot be undone."
      />
    </div>
  );
}

function AddNoteDialog({ open, onOpenChange, customerId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    note: "",
  });

  const createMutation = useMutation({
    mutationFn: createCustomerNote,
    onSuccess: () => {
      toast.success("Note added successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-notes", customerId] });
      onOpenChange(false);
      setFormData({ title: "", note: "" });
    },
    onError: () => toast.error("Failed to add note"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      customerId: customerId,
      title: formData.title,
      note: formData.note,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[500px] flex flex-col p-0 overflow-hidden bg-background rounded-2xl border-0 shadow-lg"
      >
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Add Note</DialogTitle>
          </div>
          <DialogClose className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted border border-border cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </DialogClose>
        </DialogHeader>

        <form id="add-note-form" onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Note Title</Label>
            <Input
              placeholder="e.g. Meeting summary, follow-up preferences"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-sm">Note</Label>
            <Textarea
              placeholder="Write the note content here..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              required
              className="min-h-[120px] resize-none"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-border bg-background shrink-0 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-note-form"
            className="bg-blue-600 hover:bg-blue-700 font-medium px-5"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Adding..." : "Add Note"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditNoteDialog({ open, onOpenChange, customerId, noteItem }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: noteItem.title || "",
    note: noteItem.note || "",
  });

  const updateMutation = useMutation({
    mutationFn: updateCustomerNote,
    onSuccess: () => {
      toast.success("Note updated successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-notes", customerId] });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update note"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({
      id: noteItem.id,
      title: formData.title,
      note: formData.note,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[500px] flex flex-col p-0 overflow-hidden bg-background rounded-2xl border-0 shadow-lg"
      >
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-blue-50 text-blue-600">
              <Pencil className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Edit Note</DialogTitle>
          </div>
          <DialogClose className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted border border-border cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </DialogClose>
        </DialogHeader>

        <form id="edit-note-form" onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Note Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-sm">Note</Label>
            <Textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              required
              className="min-h-[120px] resize-none"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-border bg-background shrink-0 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-note-form"
            className="bg-blue-600 hover:bg-blue-700 font-medium px-5"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
