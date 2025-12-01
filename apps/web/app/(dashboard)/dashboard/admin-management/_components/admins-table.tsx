"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Eye } from "lucide-react";
import { Pagination } from "../../users/_components/pagination";
import { AdminActions } from "./admin-actions";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { TableSkeleton } from "../../_components/table-skeleton";

interface AdminsTableProps {
  searchParams: {
    page?: string;
    search?: string;
    email?: string;
    name?: string;
  };
}

export function AdminsTable({ searchParams }: AdminsTableProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  const { data, isLoading, error } = useQuery(
    orpc.users.list.queryOptions({
      input: {
        page,
        limit: 10,
        search: searchParams.search,
        email: searchParams.email,
        username: searchParams.name, // Mapping name to username filter as per API
      },
    })
  );

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Failed to load admins. Please try again.
      </div>
    );
  }

  const users = data?.users || [];
  const pagination = data?.pagination || {
    currentPage: page,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    startIndex: 0,
    endIndex: 0,
  };

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => {
                const initials = user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium leading-none">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-4 px-1 py-0 font-normal"
                            >
                              {user.role === "admin"
                                ? "Super Admin"
                                : (user.role || "user")
                                    .charAt(0)
                                    .toUpperCase() +
                                  (user.role || "user").slice(1)}
                            </Badge>
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {/* Mock phone */}
                      +1555000000
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                        <AdminActions user={user} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} />
    </>
  );
}
