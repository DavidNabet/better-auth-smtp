"use client";

import { Session } from "@/lib/auth";
import { Loader2, UserCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/user/user.actions";
import AvatarUpload from "@/components/AvatarUpload";
import Alert from "@/app/_components/Alert";
import { useActionState, useState, useTransition } from "react";
import { UpdateProfileSchema } from "@/lib/user/user.schema";

interface Props {
  session: Session | null;
}

export default function UserProfileForm({ session }: Props) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<UpdateProfileSchema>({
    name: "",
    image: null,
  });
  const [
    {
      message: { error, success },
    },
    formAction,
    pending,
  ] = useActionState(updateProfile, {
    message: {
      error: "",
      success: "",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      className="mt-8 grid grid-cols-6 gap-6"
      method="POST"
      action={formAction}
      encType="multipart/form-data"
    >
      <div className="col-span-6">
        <Label htmlFor="image" className="block text-sm font-medium ">
          Photo
        </Label>
        <AvatarUpload
          session={session}
          value={formData.image}
          onChange={handleChange}
        />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <Label htmlFor="Name" className="block text-sm font-medium ">
          Name
        </Label>

        <Input
          type="text"
          id="Name"
          name="name"
          placeholder={session?.user?.name}
          value={formData.name}
          onChange={handleChange}
          className="mt-1 w-full"
        />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <Label htmlFor="Role" className="block text-sm font-medium ">
          Role
        </Label>

        <Select
          defaultValue={session?.user.role!}
          disabled={session?.user.role === "USER"}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue aria-label={session?.user.role!} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">USER</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-6 border-b border-gray-900/10 pb-6">
        <Label htmlFor="Email" className="block text-sm font-medium ">
          Email
        </Label>

        <Input
          type="email"
          id="Email"
          placeholder="johndoe@example.com"
          defaultValue={session?.user.email ?? "johndoe@example.com"}
          className="mt-1 w-full cursor-not-allowed"
          disabled
        />
      </div>
      <div className="col-span-6">
        {error && <Alert message={error!} status="error" />}
        {success && <Alert message={success!} status="success" />}
      </div>
      <div className="mt-6 col-span-6 sm:flex sm:items-center sm:justify-end gap-x-6">
        <Button
          type="submit"
          className="bg-teal-600 hover:bg-teal-500 cursor-pointer"
          disabled={pending}
          // className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update profile
        </Button>
      </div>
    </form>
  );
}
