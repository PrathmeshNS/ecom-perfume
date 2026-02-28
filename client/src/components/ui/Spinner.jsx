import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";

function Spinner({ className, size = 24 }) {
  return (
    <Loader2 className={cn("animate-spin text-primary", className)} size={size} />
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size={40} />
    </div>
  );
}

export { Spinner, PageLoader };
