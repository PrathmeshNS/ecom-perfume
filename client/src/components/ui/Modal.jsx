import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-dark/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate hover:text-dark">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
