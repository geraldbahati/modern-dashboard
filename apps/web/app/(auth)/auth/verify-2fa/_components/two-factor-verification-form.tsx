"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@workspace/auth/client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Shield, KeyRound } from "lucide-react";
import { toast } from "sonner";

const verifySchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .length(6, "Code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

const backupCodeSchema = z.object({
  backupCode: z.string().min(1, "Backup code is required"),
});

type VerifyFormData = z.infer<typeof verifySchema>;
type BackupCodeFormData = z.infer<typeof backupCodeSchema>;

export function TwoFactorVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [useBackupCode, setUseBackupCode] = useState(false);

  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: verifyErrors, isSubmitting: isVerifying },
    setError: setVerifyError,
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  const {
    register: registerBackup,
    handleSubmit: handleSubmitBackup,
    formState: { errors: backupErrors, isSubmitting: isUsingBackup },
    setError: setBackupError,
  } = useForm<BackupCodeFormData>({
    resolver: zodResolver(backupCodeSchema),
  });

  const onVerifySubmit = async (data: VerifyFormData) => {
    try {
      const result = await authClient.twoFactor.verifyTotp({
        code: data.code,
        trustDevice: true,
      });

      if (result.error) {
        setVerifyError("root", {
          message: result.error.message || "Invalid verification code",
        });
        return;
      }

      toast.success("2FA verification successful!");
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("2FA verification error:", error);
      setVerifyError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const onBackupCodeSubmit = async (data: BackupCodeFormData) => {
    try {
      const result = await authClient.twoFactor.verifyBackupCode({
        code: data.backupCode,
      });

      if (result.error) {
        setBackupError("root", {
          message: result.error.message || "Invalid backup code",
        });
        return;
      }

      toast.success("Backup code verified successfully!");
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("Backup code verification error:", error);
      setBackupError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6" />
          <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
        </div>
        <CardDescription>
          {useBackupCode
            ? "Enter one of your backup codes to verify your identity"
            : "Enter the verification code from your authenticator app"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!useBackupCode ? (
          <form onSubmit={handleSubmitVerify(onVerifySubmit)}>
            <FieldGroup>
              {verifyErrors.root && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {verifyErrors.root.message}
                </div>
              )}

              <Field data-invalid={!!verifyErrors.code}>
                <FieldLabel htmlFor="code">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Verification Code
                  </div>
                </FieldLabel>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  aria-invalid={!!verifyErrors.code}
                  disabled={isVerifying}
                  autoComplete="off"
                  autoFocus
                  {...registerVerify("code")}
                />
                <FieldDescription>
                  Enter the 6-digit code from your authenticator app
                </FieldDescription>
                {verifyErrors.code && (
                  <FieldError>{verifyErrors.code.message}</FieldError>
                )}
              </Field>

              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setUseBackupCode(true)}
              >
                Use backup code instead
              </Button>
            </FieldGroup>
          </form>
        ) : (
          <form onSubmit={handleSubmitBackup(onBackupCodeSubmit)}>
            <FieldGroup>
              {backupErrors.root && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {backupErrors.root.message}
                </div>
              )}

              <Field data-invalid={!!backupErrors.backupCode}>
                <FieldLabel htmlFor="backupCode">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Backup Code
                  </div>
                </FieldLabel>
                <Input
                  id="backupCode"
                  type="text"
                  placeholder="XXXXX-XXXXX"
                  aria-invalid={!!backupErrors.backupCode}
                  disabled={isUsingBackup}
                  autoComplete="off"
                  autoFocus
                  {...registerBackup("backupCode")}
                />
                <FieldDescription>
                  Enter one of your backup codes (each code can only be used
                  once)
                </FieldDescription>
                {backupErrors.backupCode && (
                  <FieldError>{backupErrors.backupCode.message}</FieldError>
                )}
              </Field>

              <Button type="submit" className="w-full" disabled={isUsingBackup}>
                {isUsingBackup ? "Verifying..." : "Verify Backup Code"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setUseBackupCode(false)}
              >
                Use authenticator app instead
              </Button>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
