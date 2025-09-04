import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function FeedbackForm() {
  return (
    <Dialog>
      <form id="feedbackForm">
        <DialogTrigger asChild>
          <Button>Trigger</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feedback Form</DialogTitle>
            <DialogDescription>
              Please provide your feedback below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3"></div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
