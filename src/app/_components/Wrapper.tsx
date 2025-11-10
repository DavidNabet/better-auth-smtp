import { cn } from "@/lib/utils";

interface WrapperProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

export default function Wrapper({ children, title, className }: WrapperProps) {
  return (
    <div className="w-full">
      <h3
        className={cn(
          "pt-10 pb-4 font-bold text-2xl md:text-3xl tracking-tight text-primary",
          className
        )}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
