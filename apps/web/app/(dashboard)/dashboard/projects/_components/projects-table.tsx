import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Eye } from "lucide-react";
import { getProjects } from "../_lib/actions";
import { Pagination } from "../../users/_components/pagination"; // Reusing pagination
import { ProjectActions } from "./project-actions";

interface ProjectsTableProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    environment?: string;
  };
}

export async function ProjectsTable({ searchParams }: ProjectsTableProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const status = searchParams.status as any; // Cast to valid type
  const environment = searchParams.environment as any;

  const { projects, pagination } = await getProjects({
    page,
    search: searchParams.search,
    status,
    environment,
  });

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg border bg-muted/50 flex items-center justify-center overflow-hidden">
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl}
                            alt={project.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            {project.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium leading-none">
                          {project.name}
                        </span>
                        {project.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {project.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        project.status === "active"
                          ? "default"
                          : project.status === "archived"
                            ? "secondary"
                            : "destructive"
                      }
                      className={
                        project.status === "active"
                          ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          : project.status === "archived"
                            ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                            : ""
                      }
                    >
                      {project.status
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>Production</TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.lastUpdated}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                      <ProjectActions project={project} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
