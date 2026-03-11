'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  /** Show a spinning loader inside the input */
  loading?: boolean;
  /** Show ⌘K keyboard shortcut hint */
  shortcut?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Compact size for sidebars */
  compact?: boolean;
}

export const SearchInput = React.memo(function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  id,
  className,
  loading = false,
  shortcut = false,
  autoFocus = false,
  compact = false,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  // ⌘K global shortcut
  useEffect(() => {
    if (!shortcut) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcut]);

  const hasValue = value.length > 0;

  return (
    <div className={cn('search-input-wrapper group/search relative', className)}>
      <label htmlFor={id} className="sr-only">{placeholder}</label>

      {/* Search icon — animates on focus */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-[1]">
        <Search
          className={cn(
            'h-4 w-4 transition-colors duration-200',
            'text-muted-foreground/50 group-focus-within/search:text-teal-400'
          )}
          aria-hidden
        />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          // Base
          'w-full text-sm text-foreground bg-white/[0.03] rounded-xl',
          'border border-border/50',
          'placeholder:text-muted-foreground/40',
          'transition-all duration-200 ease-out',
          // Padding
          compact ? 'pl-9 py-2' : 'pl-10 py-2.5',
          hasValue || loading ? 'pr-9' : shortcut ? 'pr-16' : 'pr-3',
          // Hover
          'hover:bg-white/[0.05] hover:border-border/80',
          // Focus
          'focus:outline-none focus:bg-white/[0.06]',
          'focus:border-teal-500/40 focus:ring-2 focus:ring-teal-500/10',
          'focus:shadow-[0_0_0_3px_oklch(0.70_0.15_162/6%)]',
        )}
      />

      {/* Right side: clear button, loading, or shortcut hint */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {loading && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400/70" />
        )}

        {hasValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'flex items-center justify-center rounded-md p-1',
              'text-muted-foreground/50 hover:text-foreground hover:bg-white/[0.08]',
              'transition-all duration-150',
              'focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-500/30',
            )}
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {!hasValue && !loading && shortcut && (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border/60 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/40 select-none">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        )}
      </div>
    </div>
  );
});
