import { cn } from "../../utils/cn";

function Button({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}) {
  const variants = {
    default: "bg-cta text-white hover:bg-cta/90 shadow-sm",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-border bg-white text-dark hover:bg-pastel/40 hover:border-lilac",
    secondary: "bg-lilac/20 text-dark hover:bg-lilac/35",
    ghost: "hover:bg-pastel/30 text-dark",
    link: "text-cta underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-xl px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button };
