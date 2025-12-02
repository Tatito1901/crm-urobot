/**
 * ============================================================
 * MODAL BASE - Wrapper sobre shadcn Dialog
 * ============================================================
 * Mantiene la API existente pero usa Dialog de shadcn internamente
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={cn(
          sizeClasses[size],
          "max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0"
        )}
      >
        {title && (
          <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
