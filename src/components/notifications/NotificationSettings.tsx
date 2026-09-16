"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import {
  useState,
  useActionState,
  startTransition,
  SyntheticEvent,
} from "react";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth/auth.client";
import { cn } from "@/lib/utils";
import Alert from "@/app/_components/Alert";
import { updateNotificationSetting } from "@/lib/notification/notification.action";
import { wait } from "@/lib/utils";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "../ui/label";

export default function NotificationsSettings() {
  const { data, refetch } = authClient.useSession();
  const [isEnabled, setIsEnabled] = useState(
    data?.user.notificationStatus ?? false,
  );

  // const { userId, socket } = useSocket();

  const [
    {
      message: { success, error },
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

  /**
   * Subscribe notifications
   */

  // useEffect(() => {
  //   if (!socket || !socket.connected) return;

  //   refetch();
  //   if (isEnabled) {
  //     socket.emit("notifications:subscribe");
  //   } else {
  //     socket.emit("notifications:unsubscribe");
  //   }

  //   return () => {
  //     socket.off("notifications:subscribe");
  //     socket.off("notifications:unsubscribe");
  //   };
  // }, [isEnabled, socket, refetch]);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const fd = new FormData(e.target as HTMLFormElement);
        const dt = Object.fromEntries(fd);
        console.log(dt);
        if (data?.user.notificationStatus) {
          console.log("end");
        }
        wait(2000);
        formAction(fd);

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
            <input type="hidden" name="userId" value={data?.user.id} />

            <div className="flex items-center gap-2">
              <Switch
                id="notificationStatus"
                name="notificationStatus"
                defaultChecked={isEnabled}
                onCheckedChange={(checked) => setIsEnabled(!checked)}
              />
              <Label
                htmlFor="notificationsStatus"
                className="text-sm font-medium"
              >
                {!isEnabled ? "No" : "Yes"}
              </Label>
              {/* <ErrorMessages errors={errorMessage?.notificationStatus} /> */}
            </div>
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
