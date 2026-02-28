import { cn } from "../../utils/cn";

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-cta text-white",
    secondary: "bg-lilac/20 text-dark",
    destructive:
      "bg-destructive text-destructive-foreground",
    outline: "text-dark border border-border",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
