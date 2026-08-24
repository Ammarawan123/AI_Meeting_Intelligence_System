import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          {title ? <h3 className="text-lg font-semibold text-slate-900">{title}</h3> : <div />}
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={cn("text-slate-600")}>{children}</div>
      </div>
    </div>
  );
}
