"use client";

import { Button } from "@workspace/ui/components/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface PaginationProps {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    startIndex: number;
    endIndex: number;
  };
}

export function Pagination({ pagination }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    startTransition(() => {
      router.push(`/dashboard/users?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {pagination.startIndex} to {pagination.endIndex} of{" "}
        {pagination.totalItems} results
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1 || isPending}
        >
          Previous
        </Button>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
          (page) => (
            <Button
              key={page}
              variant={
                pagination.currentPage === page ? "default" : "outline"
              }
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => handlePageChange(page)}
              disabled={isPending}
            >
              {page}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages || isPending}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
