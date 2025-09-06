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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function FeedbackForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add new +</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Suggestions Form</DialogTitle>
          <DialogDescription>Please provide your idea below.</DialogDescription>
        </DialogHeader>
        <form className="grid grid-cols-6 gap-3">
          <div className="col-span-6 sm:col-span-3">
            <Label htmlFor="title" className="block text-sm font-medium">
              Idea name
            </Label>
            <Input
              name="title"
              className="my-2 w-full"
              type="text"
              placeholder="Idea title"
            />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Label htmlFor="subject" className="block text-sm font-medium">
              Subject idea
            </Label>
            <Input
              name="subject"
              className="my-2 w-full"
              type="text"
              placeholder="Subject idea"
            />
          </div>

          <div className="col-span-6">
            <Label htmlFor="description">Describe your idea</Label>
            <Textarea
              id="description"
              className="my-2 w-full"
              name="description"
            />
          </div>
          <div className="mt-6 col-span-6 gap-x-6">
            <Button
              type="submit"
              variant="default"
              className={cn(
                "w-full bg-teal-600 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 cursor-pointer"
                // pending && "cursor-not-allowed bg-metal"
              )}
              // disabled={pending}
            >
              {/* {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} */}
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
