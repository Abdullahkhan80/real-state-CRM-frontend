import type { ReactNode } from "react";

type Variant = "default" | "new" | "contacted" | "converted" | "lost";

const variants: Record<Variant, string> = {
  default: "bg-zinc-800 text-zinc-300",
  new: "status-new",
  contacted: "status-contacted",
  converted: "status-converted",
  lost: "status-lost",
};

export default function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
