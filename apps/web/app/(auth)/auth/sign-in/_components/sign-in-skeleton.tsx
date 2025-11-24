import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import {
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function SignInSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              {/* Email field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Submit button */}
              <Skeleton className="h-10 w-full" />
            </FieldGroup>
          </FieldSet>

          <FieldSeparator>Or continue with</FieldSeparator>

          <FieldSet>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4 w-full">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
