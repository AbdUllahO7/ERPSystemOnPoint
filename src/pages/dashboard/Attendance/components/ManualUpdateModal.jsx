import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { manualUpdateAttendance } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function ManualUpdateModal({ isOpen, onClose, recordId, defaultEntryTime = "08:00", defaultExitTime = "16:00" }) {
  const [entryTime, setEntryTime] = useState(defaultEntryTime);
  const [exitTime, setExitTime] = useState(defaultExitTime);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setEntryTime(defaultEntryTime);
      setExitTime(defaultExitTime);
    }
  }, [isOpen, defaultEntryTime, defaultExitTime]);

  const updateMutation = useMutation({
    mutationFn: (payload) => manualUpdateAttendance(payload),
    onSuccess: () => {
      // Invalidate relevant queries when an update succeeds
      queryClient.invalidateQueries(["getMonthErrors"]);
      queryClient.invalidateQueries(["getDailySummary"]);
      toast.success("Attendance updated successfully!");
      onClose();
    },
    onError: (error) => {
      console.error("Error updating time logs manually:", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to update attendance!");
    }
  });

  const handleSave = () => {
    const now = new Date().toISOString().split("T")[0];
    
    const payload = {
      attendanceId: recordId,
      manualCheckIn: `${now}T${entryTime}:00.000Z`,
      manualCheckOut: `${now}T${exitTime}:00.000Z`,
      reason: "تعديل يدوي من النظام"
    };
    
    updateMutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Time log modification</DialogTitle>
          <DialogDescription>
            Adjusting employee entry and exit times
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Entry time</label>
            <Input
              type="time"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Exit time</label>
            <Input
              type="time"
              value={exitTime}
              onChange={(e) => setExitTime(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending} 
            className="w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
