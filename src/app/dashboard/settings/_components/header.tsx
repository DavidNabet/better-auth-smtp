import { AvatarSession } from "@/components/AvatarUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "@/lib/auth";

export default function SettingHeader({ session }: { session: Session }) {
  return (
    <div className="mb-8 flex items-center gap-6">
      <Avatar className="size-20">
        <AvatarSession session={session} avatarSize="20" />
      </Avatar>
      <div>
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings and preferences
        </p>
      </div>
    </div>
  );
}
