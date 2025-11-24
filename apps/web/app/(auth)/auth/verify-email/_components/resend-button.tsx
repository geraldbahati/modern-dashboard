"use client";

import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { resendVerificationEmail } from "@/app/actions/verify-email";

type ResendButtonProps = {
  email: string;
};

export function ResendButton({ email }: ResendButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!canResend || isLoading) return;

    setIsLoading(true);
    setCanResend(false);

    try {
      const result = await resendVerificationEmail(email);

      if (result.success) {
        toast.success(result.message);
        // Set cooldown to 60 seconds on success
        setCooldown(60);
      } else {
        toast.error(result.message);

        // If rate limited, set the cooldown from server
        if (result.remainingTime) {
          setCooldown(result.remainingTime);
        } else {
          // Allow retry after 5 seconds on other errors
          setCooldown(5);
        }
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast.error("Failed to resend email. Please try again.");
      setCooldown(5);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleResend}
        disabled={!canResend || isLoading}
        variant="outline"
        className="w-full"
      >
        {isLoading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Sending...
          </>
        ) : cooldown > 0 ? (
          `Resend in ${formatTime(cooldown)}`
        ) : (
          "Resend verification email"
        )}
      </Button>

      {cooldown > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          You can resend the email after the cooldown period
        </p>
      )}
    </div>
  );
}
