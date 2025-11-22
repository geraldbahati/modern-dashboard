import { cn } from "@workspace/ui/lib/utils";

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DashboardCard({
  children,
  className,
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "h-auto bg-card rounded-2xl border border-border/50 relative overflow-hidden w-full min-h-[360px] flex flex-col p-4",
        className
      )}
      {...props}
    >
      {/* Background Patterns */}
      <div
        className="absolute -inset-400 pointer-events-none opacity-[0.03] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          transform: "rotate(40deg)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 20,
          background:
            "radial-gradient(640px 720px at 0% 0%, rgba(205, 205, 205, 0.07) 0%, rgba(205, 205, 205, 0) 30%, transparent 70%)",
        }}
      />
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  );
}
