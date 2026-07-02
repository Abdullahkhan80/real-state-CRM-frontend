import { ReactNode, SVGProps } from "react";
import type { IconName } from "./data";

export function Icon({ name, className = "h-4 w-4", ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  let content: ReactNode;

  switch (name) {
    case "activity":
      content = <path d="M3 12h3l2-7 4 14 2-7h7" />;
      break;
    case "add":
      content = <path d="M12 5v14M5 12h14" />;
      break;
    case "agent":
      content = <><path d="M8 9a4 4 0 0 1 8 0v3a4 4 0 0 1-8 0V9Z" /><path d="M12 2v3M7 21h10M9 16l-2 5M15 16l2 5" /></>;
      break;
    case "call":
      content = <path d="M6 5c4 8 5 9 13 13l-3 3c-8-3-13-8-16-16l3-3 3 3Z" />;
      break;
    case "check":
      content = <path d="m5 13 4 4L19 7" />;
      break;
    case "clock":
      content = <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>;
      break;
    case "database":
      content = <><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" /><path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>;
      break;
    case "filter":
      content = <path d="M4 6h16M7 12h10M10 18h4" />;
      break;
    case "home":
      content = <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /></>;
      break;
    case "lead":
      content = <><circle cx="9" cy="8" r="4" /><path d="M3 21a6 6 0 0 1 12 0" /><path d="M17 11h4M19 9v4" /></>;
      break;
    case "message":
      content = <><path d="M4 5h16v11H8l-4 4V5Z" /><path d="M8 9h8M8 13h5" /></>;
      break;
    case "refresh":
      content = <><path d="M20 6v5h-5" /><path d="M4 18v-5h5" /><path d="M18 9a7 7 0 0 0-12-2M6 15a7 7 0 0 0 12 2" /></>;
      break;
    case "search":
      content = <><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></>;
      break;
    case "shield":
      content = <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />;
      break;
    case "spark":
      content = <><path d="M12 2l2.2 6.2L20 10l-5.8 1.8L12 18l-2.2-6.2L4 10l5.8-1.8L12 2Z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>;
      break;
    case "target":
      content = <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>;
      break;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {content}
    </svg>
  );
}