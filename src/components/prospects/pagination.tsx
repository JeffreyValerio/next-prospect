import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from "../ui/pagination";

interface Props {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (value: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
}

export const ProspectsPagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
}: Props) => {
  return (
    <div className="px-4 w-full flex justify-between items-center shadow-2xl absolute bg-secondary rounded-b bottom-0">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-2 text-sm">
        <label htmlFor="pagination-select" className="text-muted-foreground">
          Ver
        </label>
        <select
          id="pagination-select"
          className="bg-background rounded-md px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[10, 20, 30, 50, 100].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {/* Controles de paginación */}
      <div className="flex-1 flex justify-end pt-1">
        <Pagination>
          <PaginationContent>
            {/* Botón anterior */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={cn({ disabled: currentPage === 1 })}
              />
            </PaginationItem>

            {/* Página 1 visible si hay separación */}
            {currentPage > 3 && (
              <>
                <Button
                  size="sm"
                  variant={currentPage === 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(1)}
                  className="w-8 h-8 p-0"
                >
                  1
                </Button>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              </>
            )}

            {/* Páginas centrales */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === currentPage ||
                  page === currentPage - 1 ||
                  page === currentPage + 1
              )
              .map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}

            {/* Última página visible si hay separación */}
            {currentPage < totalPages - 2 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <Button
                  size="sm"
                  variant={currentPage === totalPages ? "default" : "outline"}
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}

            {/* Botón siguiente */}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className={cn({ disabled: currentPage === totalPages })}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
