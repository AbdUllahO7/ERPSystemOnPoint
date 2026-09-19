import { Plus, FileText, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomerNotes, createCustomerNote } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

export function NotesTab() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: notesData, isLoading } = useQuery({
    queryKey: ["customer-notes", id, page],
    queryFn: () => getCustomerNotes({ CustomerId: id, PageNumber: page, PageSize: pageSize }),
    enabled: !!id,
  });

  const notes = notesData?.data?.items || [];
  const totalPages = notesData?.data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Notes</h3>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Add
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
          <p className="text-muted-foreground text-sm mt-1">Add a note to keep track of important information.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-white border rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">{note.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(note.createdAt).toLocaleString('en-US')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
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
        customerId={id} 
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
        className="sm:max-w-[500px] flex flex-col p-0 overflow-hidden bg-background rounded-[28px] border-0"
      >
        <DialogHeader className="px-6 py-6 border-b border-border flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <DialogTitle className="text-xl font-bold">Add Note</DialogTitle>
          </div>
          <DialogClose className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted border border-border cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </DialogClose>
        </DialogHeader>

        <form
          id="add-note-form"
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-4"
        >
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Note Title</Label>
            <Input
              placeholder="note title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-sm">Note</Label>
            <Textarea
              placeholder="Note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              required
              className="min-h-[120px] resize-none"
            />
          </div>
        </form>

        <div className="px-6 py-6 shrink-0 pt-2">
          <Button
            type="submit"
            form="add-note-form"
            className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium rounded-lg"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
