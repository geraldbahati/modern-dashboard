/**
 * OrganizationDetails - Comprehensive organization profile view with members
 *
 * @example
 * <OrganizationDetails organization={mockOrg} members={mockMembers} onAction={handleAction} />
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import {
  Calendar,
  Building2,
  Users,
  Crown,
  Shield,
  User,
  Edit,
  Trash2,
  UserPlus,
  Hash,
} from "lucide-react";

interface OrganizationMember {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface OrganizationDetailsProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    createdAt: Date;
    metadata?: string | null;
  };
  members?: OrganizationMember[];
  onAction?: (
    action: "edit" | "delete" | "addMember" | "viewMember" | "removeMember",
    data?: string
  ) => void;
  className?: string;
}

export function OrganizationDetails({
  organization,
  members = [],
  onAction,
  className,
}: OrganizationDetailsProps) {
  if (!organization) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case "owner":
        return "destructive";
      case "admin":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "owner":
        return <Crown className="h-3 w-3" />;
      case "admin":
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {organization.logo ? (
                  <AvatarImage
                    src={organization.logo}
                    alt={organization.name}
                  />
                ) : (
                  <AvatarFallback className="text-lg">
                    <Building2 className="h-8 w-8" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{organization.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  {organization.slug}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction?.("edit", organization.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onAction?.("delete", organization.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>Basic details about the organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Organization Name
                </p>
                <p className="text-sm font-semibold">{organization.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Slug</p>
                <p className="text-sm font-semibold">{organization.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created
                </p>
                <p className="text-sm font-semibold">
                  {new Date(organization.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Members
                </p>
                <p className="text-sm font-semibold">{members.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                People who are part of this organization
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction?.("addMember", organization.id)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={member.user?.image || undefined}
                              alt={member.user?.name || "Member"}
                            />
                            <AvatarFallback>
                              {member.user?.name
                                ? getInitials(member.user.name)
                                : "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{member.user?.name || "Unknown"}</span>
                            <span className="text-xs text-muted-foreground">
                              {member.user?.email || "No email"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getRoleBadgeVariant(member.role)}
                          className="gap-1"
                        >
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(member.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onAction?.("viewMember", member.userId)
                            }
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onAction?.("removeMember", member.userId)
                            }
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
