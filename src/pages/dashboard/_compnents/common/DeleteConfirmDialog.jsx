import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteConfirmDialog({ targetName, onConfirm }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon-xs"
          className="rounded-full"
        >
          <Trash2 className="size-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">تأكيد الحذف</h3>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف {targetName}؟
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline">إلغاء</Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
            >
              حذف
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}