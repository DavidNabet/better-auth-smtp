"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import {
  useState,
  FormEvent,
  useActionState,
  startTransition,
  ChangeEvent,
} from "react";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth/auth.client";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { FieldErrors } from "@/lib/feedback/feedback.types";
import Alert from "@/app/_components/Alert";
import { auth } from "@/lib/auth";
import { notificationSettingSchema } from "@/lib/notification/notification.schema";
import { updateNotificationSetting } from "@/lib/notification/notification.action";
import { wait } from "@/lib/auth/auth.utils";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type NotificationSetting = z.infer<typeof notificationSettingSchema>;

export default function NotificationsSettings() {
  const { data, refetch } = authClient.useSession();
  const [isUserId, setIsUserId] = useState(data?.user.id ?? "");
  const [isEnabled, setIsEnabled] = useState(
    data?.user.notificationStatus ?? false,
  );

  // const [formData, setFormData] = useState<NotificationSetting>({
  //   userId: "",
  //   notificationStatus: false,
  // });

  const [
    {
      message: { success, error },
      errorMessage,
    },
    formAction,
    pending,
  ] = useActionState(updateNotificationSetting, {
    message: {
      error: "",
      success: "",
    },
    errorMessage: {},
  });

  if (data?.user.notificationStatus === null) {
    return;
  }

  // const handleChange = <K extends keyof NotificationSetting>(
  //   key: K,
  //   value: NotificationSetting[K],
  // ) => {
  //   setFormData((prev) => ({ ...prev, [key]: value }));
  // };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const fd = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(fd);
        console.log(data);
        formAction(fd);
        wait(2000);

        toast.success(success, {
          id: "notificationSettingForm",
        });
        refetch();
      } catch (err) {
        console.log(err);
        toast.error(error, {
          id: "notificationSettingForm",
        });
      }
    });
  };

  return (
    <Card className="px-3">
      <form id="notificationSettingForm" onSubmit={handleSubmit}>
        <CardHeader className="gap-1">
          <CardTitle className="font-semibold text-xl tracking-tight">
            Notifications
          </CardTitle>
          <CardDescription>
            Enable or Disable system notifications
          </CardDescription>
          <CardAction className="my-2">
            <input type="hidden" name="userId" value={isUserId} />
            <Switch
              id="notificationStatus"
              name="notificationStatus"
              defaultChecked={isEnabled}
              onCheckedChange={(checked) => setIsEnabled(checked)}
            />
            {/* <ErrorMessages errors={errorMessage?.notificationStatus} /> */}
          </CardAction>
        </CardHeader>
        <CardFooter className="mt-4 flex-col items-baseline gap-2">
          <div className="w-auto">
            {error && <Alert message={error!} status="error" />}
            {success && <Alert message={success!} status="success" />}
          </div>
          <Button
            type="submit"
            variant="default"
            className={cn(
              "w-full bg-teal-600 hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 cursor-pointer",
              pending && "cursor-not-allowed bg-metal",
            )}
            disabled={pending}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
