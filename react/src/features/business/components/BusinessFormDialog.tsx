import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type BusinessFormDialogProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "medium" | "large";
};

/** Shared frame for business forms. The content scrolls inside the dialog on short phones. */
export default function BusinessFormDialog({ title, onClose, children, size = "large" }: BusinessFormDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className={`grid-cols-[minmax(0,1fr)] max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] overflow-x-hidden overflow-y-auto rounded-3xl p-4 sm:p-7 ${size === "medium" ? "max-w-xl" : "max-w-2xl"}`}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <DialogTitle className="min-w-0 break-words text-xl font-bold">{title}</DialogTitle>
          <button type="button" onClick={onClose} aria-label="Bağla" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-xl">×</button>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}
