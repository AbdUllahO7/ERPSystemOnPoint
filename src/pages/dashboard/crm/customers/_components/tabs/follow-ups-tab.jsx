import { Phone, Check, X, Plus, Mail, Calendar, CheckSquare, Activity, ChevronsRight, PhoneCall, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomerFollowUpsTimeline, createCustomerFollowUp, completeOrCancelCustomerFollowUp } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

export function FollowUpsTab() {
  const { id } = useParams();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState({ isOpen: false, itemId: null, action: null });

  const { data: followUpsData, isLoading } = useQuery({
    queryKey: ["customer-follow-ups", id, page],
    queryFn: () => getCustomerFollowUpsTimeline({ CustomerId: id, PageNumber: page, PageSize: pageSize }),
    enabled: !!id,
  });

  const followUps = followUpsData?.data?.items || [];
  const totalPages = followUpsData?.data?.totalPages || 1;

  const getIconForType = (type) => {
    switch(type?.toLowerCase()) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'meeting': return Calendar;
      case 'task': return CheckSquare;
      default: return Activity;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { day: '2-digit', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Follow-Up Log</h3>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : followUps.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-xl shadow-sm">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No follow-ups found</h3>
          <p className="text-muted-foreground text-sm mt-1">Schedule a follow-up to track customer interactions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {followUps.map((item) => {
            const Icon = getIconForType(item.type);
            const isScheduled = item.status === "Scheduled";
            const isCompleted = item.status === "Completed" || item.status === "Canceled" || item.status === "Cancled";
            
            return (
              <div key={item.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{item.topic}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {item.type} • {formatDate(item.scheduledDate)}
                      </div>
                    </div>
                  </div>
                  
                  {isScheduled ? (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setActionDialog({ isOpen: true, itemId: item.id, action: "Completed" })}
                        className="w-10 h-10 border border-emerald-200 text-emerald-500 rounded-lg flex items-center justify-center hover:bg-emerald-50 transition-colors"
                        title="Complete"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setActionDialog({ isOpen: true, itemId: item.id, action: "Canceled" })}
                        className="w-10 h-10 border border-red-200 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <span className="px-3 py-1 bg-blue-50 text-blue-500 text-sm font-semibold rounded-lg ml-2">
                        {item.status}
                      </span>
                    </div>
                  ) : (
                    <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${item.status === 'Completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                      {item.status}
                    </span>
                  )}
                </div>

                {isCompleted && item.executionNote && (
                  <div className="pl-16">
                    <h4 className="text-sm font-bold text-foreground">Notes</h4>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{item.executionNote}</p>
                  </div>
                )}
              </div>
            );
          })}

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

      <AddFollowUpDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        customerId={id}
      />

      <CompleteOrCancelDialog
        isOpen={actionDialog.isOpen}
        onClose={() => setActionDialog({ isOpen: false, itemId: null, action: null })}
        itemId={actionDialog.itemId}
        action={actionDialog.action}
        customerId={id}
      />
    </div>
  );
}

function AddFollowUpDialog({ isOpen, onClose, customerId }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    type: "",
    status: "",
    topic: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: "",
        status: "",
        topic: "",
        date: "",
        time: "",
      });
    }
  }, [isOpen]);

  const mutation = useMutation({
    mutationFn: createCustomerFollowUp,
    onSuccess: () => {
      toast.success("Follow-up added successfully");
      queryClient.invalidateQueries({ queryKey: ["customer-follow-ups", customerId] });
      onClose();
    },
    onError: () => {
      toast.error("Failed to add follow-up");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.type || !formData.status || !formData.topic || !formData.date || !formData.time) {
      toast.error("Please fill all required fields");
      return;
    }

    const scheduledDate = new Date(`${formData.date}T${formData.time}`).toISOString();

    const payload = {
      customerId,
      type: formData.type,
      status: formData.status,
      topic: formData.topic,
      scheduledDate,
    };

    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center gap-4 border-b pb-4">
          <div className="w-12 h-12 rounded-full border flex items-center justify-center shrink-0 bg-gray-50">
            <ChevronsRight className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <DialogTitle className="text-xl">Add new follow-Up</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Added follow-up information such as calls, meetings, and more...
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData(prev => ({...prev, type: val}))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-sm">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData(prev => ({...prev, status: val}))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-sm">Topic</Label>
            <Input 
              placeholder="Topic"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({...prev, topic: e.target.value}))}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Date</Label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-sm">Time</Label>
              <Input 
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                className="h-11"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6 h-11 text-base font-medium"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Adding..." : "Add"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CompleteOrCancelDialog({ isOpen, onClose, itemId, action, customerId }) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNote("");
    }
  }, [isOpen]);

  const mutation = useMutation({
    mutationFn: completeOrCancelCustomerFollowUp,
    onSuccess: () => {
      toast.success(`Follow-up ${action.toLowerCase()} successfully`);
      queryClient.invalidateQueries({ queryKey: ["customer-follow-ups", customerId] });
      onClose();
    },
    onError: () => {
      toast.error(`Failed to mark follow-up as ${action.toLowerCase()}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) {
      toast.error("Please enter execution notes");
      return;
    }

    // Backend expects 'Cancled' potentially based on user prompt, but typically 'Canceled'.
    // We send action directly, it can be 'Completed' or 'Cancled'
    const payloadAction = action === "Canceled" ? "Cancled" : "Completed";

    mutation.mutate({
      id: itemId,
      status: payloadAction,
      executionNote: note,
    });
  };

  const isCompleted = action === "Completed";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center gap-4 border-b pb-4">
          <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            {isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <X className="w-6 h-6 text-red-500" />}
          </div>
          <div>
            <DialogTitle className="text-xl">
              {isCompleted ? "Complete Follow-up" : "Cancel Follow-up"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Please enter the execution notes for this action.
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="font-semibold text-sm">Execution Notes <span className="text-red-500">*</span></Label>
            <Textarea 
              placeholder="Enter notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[120px] resize-none"
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              type="submit" 
              className={isCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : isCompleted ? "Complete" : "Cancel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
