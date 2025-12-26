import { PlusCircleIcon } from "lucide-react";
import { ReactNode } from "react";

interface CreateFromButtonProps {
  title: string;
  children?: ReactNode;
}

export function CreateFromButton({ title, children }: CreateFromButtonProps) {
  return (
    <div className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-input border-dashed py-4 px-12 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-[input:focus]:border-ring has-[img]:border-none has-disabled:opacity-50 has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50">
      <div className="flex flex-col items-center justify-center py-3 text-center">
        <div
          aria-hidden="true"
          className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
        >
          <PlusCircleIcon className="size-4 opacity-60" />
        </div>
        <h3 className="mb-1.5 font-medium text-sm">{title}</h3>
        <p className="text-muted-foreground text-xs">{children}</p>
      </div>
    </div>
  );
}
