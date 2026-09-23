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
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Reusable Dynamic Modal component for the entire project.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {string|React.ReactNode} [props.title] - Modal title
 * @param {string|React.ReactNode} [props.description] - Modal subtitle or description
 * @param {React.ReactNode} [props.icon] - Optional icon displayed next to title
 * @param {React.ReactNode} props.children - Modal body content / form
 * @param {React.ReactNode} [props.footer] - Custom footer (overrides default action buttons)
 * @param {string} [props.submitLabel='Save'] - Text for submit button
 * @param {string} [props.cancelLabel='Cancel'] - Text for cancel button
 * @param {Function} [props.onSubmit] - Submit handler when using default footer
 * @param {boolean} [props.isLoading=false] - Show loading state on submit button
 * @param {boolean} [props.isSubmitDisabled=false] - Disable submit button
 * @param {boolean} [props.isDestructive=false] - Red submit button variant
 * @param {string} [props.size='md'] - 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
 * @param {string} [props.className] - Additional content classes
 * @param {boolean} [props.showDefaultFooter=true] - Whether to render default Cancel/Submit buttons
 */
export function DynamicModal({
  isOpen,
  open,
  onClose,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  footer,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onSubmit,
  isLoading = false,
  isSubmitDisabled = false,
  isDestructive = false,
  size = "md",
  className = "",
  showDefaultFooter = true,
}) {
  const isModalOpen = open !== undefined ? open : Boolean(isOpen);

  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    full: "sm:max-w-4xl",
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen && !isLoading) {
      onClose?.();
      onOpenChange?.(false);
    } else if (newOpen) {
      onOpenChange?.(true);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6",
          sizeClasses[size] || sizeClasses.md,
          className
        )}
      >
        {(title || description) && (
          <DialogHeader className="space-y-1.5 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {React.isValidElement(Icon) ? (
                    Icon
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
              )}
              {title && (
                <DialogTitle className="text-lg font-bold text-foreground">
                  {title}
                </DialogTitle>
              )}
            </div>
            {description && (
              <DialogDescription className="text-xs text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {/* Modal Body */}
        <div className="py-2">{children}</div>

        {/* Modal Footer */}
        {footer !== undefined ? (
          footer
        ) : showDefaultFooter ? (
          <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            {onSubmit && (
              <Button
                type="button"
                onClick={onSubmit}
                disabled={isLoading || isSubmitDisabled}
                variant={isDestructive ? "destructive" : "default"}
                className="gap-1.5"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitLabel}
              </Button>
            )}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default DynamicModal;
