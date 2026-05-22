import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-6 py-8", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest transition-all",
          currentPage === 1
            ? "text-muted-foreground/30 cursor-not-allowed"
            : "text-primary hover:text-primary/70 active:scale-95"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          Página
        </span>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm font-black">
          {currentPage}
        </span>
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
          de
        </span>
        <span className="text-sm font-black text-foreground">
          {totalPages}
        </span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest transition-all",
          currentPage === totalPages
            ? "text-muted-foreground/30 cursor-not-allowed"
            : "text-primary hover:text-primary/70 active:scale-95"
        )}
      >
        <span className="hidden sm:inline">Próxima</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
