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
import { getAdmins } from "../_lib/actions";
import { AdminActions } from "./admin-actions";
import { Pagination } from "../../users/_components/pagination"; // Reusing pagination

interface AdminsTableProps {
  searchParams: {
    page?: string;
    search?: string;
    email?: string;
    name?: string;
  };
}

export async function AdminsTable({ searchParams }: AdminsTableProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  const { users, pagination } = await getAdmins({
    page,
    search: searchParams.search,
    email: searchParams.email,
    name: searchParams.name,
  });

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
                    <TableCell>{user.createdDate}</TableCell>
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
