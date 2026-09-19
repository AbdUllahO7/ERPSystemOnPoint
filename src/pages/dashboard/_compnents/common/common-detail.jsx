"use client";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function CommonDetailsSheet({ user, dir }) {
  return (
    <Sheet className="">
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon-xs"
          className="rounded-full"
        >
          <Eye className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side={dir === "ltr" ? "left" : "right"}
        className="w-full min-w-[500px] border border-red-500 p-6 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-lg font-bold">
            {user?.name}
          </SheetTitle>
        </SheetHeader>

        <div className="text-xs text-muted-foreground mt-2">
          تاريخ الإنضمام: {user?.joinedAt}
        </div>

        <div className="rounded-xl border p-4 mt-6">
          <div className="text-sm font-medium mb-3">
            المعلومات
          </div>

          <div className="space-y-2 text-sm">
            <div>البريد الإلكتروني: {user?.email}</div>
            <div>الهاتف: {user?.phone}</div>
          </div>
        </div>

        <div className="rounded-xl border p-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              السماح بإنشاء المزادات
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
