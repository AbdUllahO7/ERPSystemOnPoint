import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronsRight, PhoneCall, Calendar } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFollowUpLead } from "@/lib/api";
import toast from "react-hot-toast";

export function AddFollowUpDialog({ isOpen, onClose, leadId, defaultType }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    type: defaultType || "",
    status: "",
    topic: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: defaultType || "",
        status: "",
        topic: "",
        date: "",
        time: "",
      });
    }
  }, [isOpen, defaultType]);

  const mutation = useMutation({
    mutationFn: (payload) => createFollowUpLead(payload),
    onSuccess: () => {
      toast.success("Follow-up added successfully");
      queryClient.invalidateQueries(["lead", leadId]);
      onClose();
      setFormData({ type: "", status: "", topic: "", date: "", time: "" });
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

    // Combine date and time to ISO string
    const scheduledDate = new Date(`${formData.date}T${formData.time}`).toISOString();

    const payload = {
      leadId,
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
        <DialogHeader className="flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-full border flex items-center justify-center shrink-0">
            {!defaultType && <ChevronsRight className="w-6 h-6 text-muted-foreground" />}
            {defaultType === "Call" && <PhoneCall className="w-5 h-5 text-muted-foreground" />}
            {defaultType === "Meeting" && <Calendar className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div>
            <DialogTitle className="text-xl">
              {!defaultType && "Add new follow-Up"}
              {defaultType === "Call" && "Schedule a call"}
              {defaultType === "Meeting" && "Meeting scheduling"}
            </DialogTitle>
            {!defaultType && (
              <p className="text-sm text-muted-foreground mt-1">
                Added follow-up information such as calls, meetings, and more...
              </p>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className={`grid ${!defaultType ? 'grid-cols-2 gap-4' : 'grid-cols-1'}`}>
            {!defaultType && (
              <div className="space-y-2">
                <Label className="font-semibold">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData(prev => ({...prev, type: val}))}
                >
                  <SelectTrigger>
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
            )}

            <div className="space-y-2">
              <Label className="font-semibold">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData(prev => ({...prev, status: val}))}
              >
                <SelectTrigger>
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
            <Label className="font-semibold">Topic</Label>
            <Input 
              placeholder="Topic"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({...prev, topic: e.target.value}))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">Date</Label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Time</Label>
              <Input 
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4 h-11"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Adding..." : "Add"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
