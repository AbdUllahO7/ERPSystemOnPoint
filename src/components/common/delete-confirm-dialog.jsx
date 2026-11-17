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
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export function DeleteConfirmDialog({
  isOpen,
  open: openProp,
  onClose,
  onOpenChange,
  onConfirm,
  title,
  description,
  isLoading = false,
}) {
  const { locale, t } = useI18n();
  const isAr = locale === "ar";

  const effectiveTitle = title
    ? (isAr ? translateErp(title, locale) : title)
    : t("dataView.confirmDelete");

  const effectiveDescription = description
    ? (isAr ? translateErp(description, locale) : description)
    : t("dataView.deleteWarning");

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
            <DialogTitle className="text-xl">{effectiveTitle}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{effectiveDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 space-x-1">
          <Button variant="outline" disabled={isLoading} onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => {
              onConfirm?.();
            }}
          >
            {isLoading
              ? t("common.deleting", "جارٍ الحذف...")
              : t("common.delete", "حذف")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
