import { parseAsInteger, useQueryStates, parseAsJson } from "nuqs";
import {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";

const paginationParsers = {
  pageIndex: parseAsInteger.withDefault(0),
  pageSize: parseAsInteger.withDefault(10),
  sorting: parseAsJson<SortingState>((v) => v as SortingState).withDefault([]),
  columnFilters: parseAsJson<ColumnFiltersState>(
    (v) => v as ColumnFiltersState
  ).withDefault([]),
  columnVisibility: parseAsJson<VisibilityState>(
    (v) => v as VisibilityState
  ).withDefault({}),
};

const paginationUrlKeys = {
  pageIndex: "page",
  pageSize: "perPage",
  sorting: "sort",
  columnFilters: "filters",
  columnVisibility: "visibility",
};

export function useTableParams() {
  const [state, setState] = useQueryStates(paginationParsers, {
    urlKeys: paginationUrlKeys,
    history: "push",
    shallow: false, // Ensure server is notified for data fetching
  });

  return [state, setState] as const;
}
