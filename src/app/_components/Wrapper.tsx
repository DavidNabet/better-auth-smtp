import { cn } from "@/lib/utils";

interface WrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export default function Wrapper({
  children,
  title,
  description,
  className,
}: WrapperProps) {
  return (
    <div className="w-full">
      {title && (
        <h3
          className={cn(
            "pt-10 pb-4 font-bold text-2xl md:text-3xl tracking-tight text-primary",
            className,
          )}
        >
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {children}
    </div>
  );
}
