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
        "bg-sidebar p-3 sm:p-4 rounded-2xl border border-border relative overflow-hidden w-full flex flex-col",
        className
      )}
      {...props}
    >
      {/* Dot pattern background */}
      <div
        className="absolute -inset-400 pointer-events-none opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          transform: "rotate(40deg)",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 70%)",
        }}
      />
      {/* Gradient overlay */}
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
