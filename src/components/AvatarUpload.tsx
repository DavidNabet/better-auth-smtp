"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "@/lib/auth";
import { UpdateProfileSchema } from "@/lib/user/user.schema";
import { toBase64 } from "@/lib/utils";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PencilIcon, XIcon } from "lucide-react";

interface AvatarUploadProps {
  session: Session | null;
  value?: UpdateProfileSchema["image"];
  onChange?: (value: UpdateProfileSchema["image"]) => void;
}

export default function AvatarUpload({
  value,
  session,
  onChange,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const base64 = (await toBase64(file)) as string;
      onChange?.(base64);
    }
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (inputRef.current) inputRef.current.value = "";
  };
  return (
    <div className="mt-1 flex items-center gap-x-3 relative">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12 rounded-full">
          <AvatarImage src={value} className="object-cover" />
          <AvatarFallback className="rounded-full text-md">
            {session?.user.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full font-semibold text-primary hover:bg-gray-100"
        onClick={(e) => {
          e.preventDefault();
          inputRef.current?.click();
        }}
      >
        <PencilIcon className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full font-semibold text-primary hover:bg-destructive"
        onClick={handleRemove}
      >
        <XIcon className="w-4 h-4" />
      </Button>
      <Input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="image/*"
      />
    </div>
  );
}
