import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="currentColor" />
      <path
        d="M11 14.5h18M11 20h12M11 25.5h7"
        stroke="var(--color-primary-foreground)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="28.5" cy="25.5" r="4.5" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={inverted ? "text-sidebar-primary" : "text-primary"} />
      <div className="leading-tight">
        <p className={cn("text-lg font-extrabold tracking-tight", inverted && "text-sidebar-accent-foreground")}>
          Admin<span className="text-accent">Flow</span>
        </p>
        <p className={cn("text-[10px] font-medium tracking-wide text-muted-foreground uppercase", inverted && "text-sidebar-foreground/70")}>
          Simplify work. Stay organised.
        </p>
      </div>
    </div>
  );
}
