import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export function DeleteConfirmDialog({
  isOpen,
  open: openProp,
  onClose,
  onOpenChange,
  onConfirm,
  title = "Confirm Delete",
  description = "Are you sure you want to delete this item? This action cannot be undone and will permanently remove it from the system.",
  isLoading = false,
}) {
  const isModalOpen = isOpen !== undefined ? Boolean(isOpen) : Boolean(openProp);

  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 space-x-1">
          <Button variant="outline" disabled={isLoading} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => {
              onConfirm?.();
            }}
          >
            {isLoading ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
