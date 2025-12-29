"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createFeedback } from "@/lib/feedback/feedback.action";
import { cn, decodeSlug } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ReactNode, startTransition, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateFeedback } from "@/lib/feedback/feedback.schema";
import { wait } from "@/lib/auth/auth.utils";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import { toast } from "sonner";
import { App } from "@prisma/client";

export default function FeedbackForm({ apps }: { apps: App[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateFeedback>({
    title: "",
    subject: "",
    description: "",
    status: "PENDING",
    appId: "",
  });
  const [
    {
      message: { success, error },
      errorMessage,
    },
    formAction,
    pending,
  ] = useActionState(createFeedback, {
    message: {
      error: "",
      success: "",
    },
    errorMessage: {},
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData);
        console.log(data);
        formAction(formData);
        setFormData({
          title: "",
          description: "",
          status: "ACCEPTED",
          subject: "",
          appId: "",
        });
        // Refresh data
        wait(2000);
        // router.refresh();
        toast.success(success, {
          id: "feedbackForm",
        });
      } catch (err) {
        console.log(err);
        toast.error(error, {
          id: "feedbackForm",
        });
      }
    });
  };
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
        <form
          className="grid grid-cols-6 gap-3"
          id="feedbackForm"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="appId" value={formData.appId} />
          <div className="col-span-6 sm:col-span-3">
            <Label htmlFor="title" className="block text-sm font-medium">
              Idea name
            </Label>
            <Input
              name="title"
              className="my-2 w-full"
              type="text"
              placeholder="Idea title"
              onChange={handleChange}
              value={formData.title}
            />
            <ErrorMessages errors={errorMessage?.title} />
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
              onChange={handleChange}
              value={formData.subject}
            />
            <ErrorMessages errors={errorMessage?.subject} />
          </div>

          <div className="col-span-6">
            <Label htmlFor="description">Describe your idea</Label>
            <Textarea
              id="description"
              className="my-2 w-full"
              name="description"
              onChange={handleChange}
              value={formData.description}
            />
            <ErrorMessages errors={errorMessage?.description} />
          </div>
          <div className="col-span-6">
            <Label htmlFor="app" className="block text-sm font-medium">
              Associate an app
            </Label>
            <Select name="appId">
              <SelectTrigger
                id="app"
                className="mt-1 w-full ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_[data-square]]:shrink-0"
              >
                <SelectValue placeholder="Associate an app" />
              </SelectTrigger>
              <SelectContent>
                {apps &&
                  apps.map((a) => (
                    <SelectItem key={a.name} value={a.slug}>
                      <Square className="bg-rose-400/20 text-rose-500">
                        {a.name.charAt(0).toUpperCase()}
                      </Square>
                      <span className="truncate">{a.name}</span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <ErrorMessages errors={errorMessage?.appId} />
          </div>
          <div className="mt-6 col-span-6 gap-x-6">
            <Button
              type="submit"
              variant="default"
              className={cn(
                "w-full bg-teal-600 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 cursor-pointer",
                pending && "cursor-not-allowed bg-metal"
              )}
              disabled={pending}
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Square({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center rounded bg-muted font-medium text-muted-foreground text-xs",
        className
      )}
      data-square
    >
      {children}
    </span>
  );
}
