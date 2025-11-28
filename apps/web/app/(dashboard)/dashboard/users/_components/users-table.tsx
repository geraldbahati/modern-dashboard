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
import { getUsers } from "../_lib/actions";
import { UserActions } from "./user-actions";
import { Pagination } from "./pagination";

interface UsersTableProps {
  searchParams: {
    page?: string;
    username?: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    fromDate?: string;
    toDate?: string;
  };
}

export async function UsersTable({ searchParams }: UsersTableProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  const { users, pagination } = await getUsers({
    page,
    username: searchParams.username,
    email: searchParams.email,

    firstName: searchParams.firstName,
    lastName: searchParams.lastName,
    fromDate: searchParams.fromDate,
    toDate: searchParams.toDate,
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
              <TableHead>Status</TableHead>
              <TableHead>Joined Date</TableHead>
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
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.role || "user"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "verified" ? "default" : "secondary"
                        }
                        className={
                          user.status === "verified"
                            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                            : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                        }
                      >
                        {user.status === "verified" ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.joinedDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                        <UserActions
                          user={{
                            ...user,
                            image: user.image ?? null,
                            role: user.role ?? null,
                            banned: user.banned ?? null,
                            banReason: user.banReason ?? null,
                            twoFactorEnabled: user.twoFactorEnabled ?? null,
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
