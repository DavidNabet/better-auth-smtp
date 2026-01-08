import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "@/lib/auth";

export default function SettingHeader({ user }: Session) {
  return (
    <div className="mb-8 flex items-center gap-6">
      <Avatar className="size-20">
        <AvatarImage src={user.image!} alt="profile" />
        <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
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
