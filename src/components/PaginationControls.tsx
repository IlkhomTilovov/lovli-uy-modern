import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  startIndex?: number;
  endIndex?: number;
  totalItems?: number;
  showPageInfo?: boolean;
  showQuickJump?: boolean;
  className?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
  showPageInfo = true,
  showQuickJump = false,
  className,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Page Info */}
      {showPageInfo && startIndex !== undefined && endIndex !== undefined && totalItems !== undefined && (
        <p className="text-sm text-muted-foreground order-2 sm:order-1">
          {startIndex}-{endIndex} / {totalItems} ta
        </p>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* First Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:flex"
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">Birinchi sahifa</span>
        </Button>

        {/* Previous */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Oldingi</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          )}
        </div>

        {/* Next */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Keyingi</span>
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Oxirgi sahifa</span>
        </Button>
      </div>

      {/* Quick Jump */}
      {showQuickJump && totalPages > 5 && (
        <div className="flex items-center gap-2 order-3">
          <span className="text-sm text-muted-foreground">Sahifa:</span>
          <Select
            value={currentPage.toString()}
            onValueChange={(value) => onPageChange(parseInt(value))}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <SelectItem key={page} value={page.toString()}>
                  {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
