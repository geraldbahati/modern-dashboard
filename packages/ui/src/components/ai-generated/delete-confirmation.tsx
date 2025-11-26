/**
 * DeleteConfirmation - Safe deletion dialog
 *
 * @example
 * <DeleteConfirmation
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Delete Project"
 *   description="Are you sure? This action cannot be undone."
 *   itemName="my-project"
 *   onConfirm={handleDelete}
 *   isDeleting={isDeleting}
 * />
 */

"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName?: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmation({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationProps) {
  const [confirmationText, setConfirmationText] = React.useState("");
  const isConfirmed = !itemName || confirmationText === itemName;

  React.useEffect(() => {
    if (open) {
      setConfirmationText("");
    }
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>{description}</p>
            {itemName && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-md border text-sm">
                <p>
                  To confirm, please type{" "}
                  <span className="font-bold select-all">{itemName}</span>{" "}
                  below:
                </p>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={itemName}
                  className="bg-background"
                  autoComplete="off"
                />
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              if (isConfirmed) {
                onConfirm();
              }
            }}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
