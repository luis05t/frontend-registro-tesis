// src/components/ui/LoadingOverlay.tsx
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay = ({ isVisible, message = "Cargando..." }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className={clsx(
      "fixed inset-0 z-[9999] flex items-center justify-center",
      "bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
    )}>
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center space-y-6 border border-gray-700">
        <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full"></div>
            <Loader2 className="h-16 w-16 animate-spin text-cyan-500 relative z-10" />
        </div>
        
        <p className="text-gray-100 font-semibold text-xl animate-pulse tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
};