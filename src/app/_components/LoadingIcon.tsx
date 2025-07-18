import { Loader2 } from "lucide-react";
export default function LoadingIcon() {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="animate-spin w-12 h-12 text-primary" />
    </div>
  );
}
