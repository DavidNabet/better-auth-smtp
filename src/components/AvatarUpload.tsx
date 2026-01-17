"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "@/lib/auth";
import { cn, toBase64 } from "@/lib/utils";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PencilIcon, XIcon } from "lucide-react";

export type AvatarContext = {
  session?: Session;
  avatarSize?: string;
};

interface AvatarUploadProps {
  ctx: AvatarContext;
  value?: File;
  onChange?: (value?: File) => void;
}

export default function AvatarUpload({
  value,
  onChange,
  ctx,
}: AvatarUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (file: File | undefined) => {
    onChange?.(file);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const base64 = (await toBase64(file)) as string;
      setSelectedImage(base64);
      handleFileSelection(file ?? undefined);
    }
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleFileSelection(undefined);
    if (inputRef?.current) inputRef.current.value = "";
  };
  return (
    <div className="mt-1 flex items-center gap-x-3 relative">
      <div className="flex items-center space-x-4">
        <Avatar className={cn("h-12 w-12 rounded-full", ctx.avatarSize)}>
          {selectedImage && value ? (
            <>
              <AvatarImage
                src={URL.createObjectURL(value)}
                className="object-cover"
              />
            </>
          ) : !!ctx.session ? (
            <AvatarSession {...ctx} avatarSize="12" />
          ) : (
            <AvatarFallback className="text-white">LOGO</AvatarFallback>
          )}
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
      {value && selectedImage && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full font-semibold text-primary hover:bg-destructive"
            onClick={handleRemove}
          >
            <XIcon className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{value.name}</p>
            <p className="text-xs text-muted-foreground">
              {Number(value.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </>
      )}
      <Input
        ref={inputRef}
        type="file"
        name="image"
        className="hidden"
        onChange={handleChange}
        accept="image/*"
      />
    </div>
  );
}

export function AvatarSession({ session, avatarSize }: AvatarContext) {
  return session?.user.image ? (
    <>
      <AvatarImage
        src={session.user.image}
        alt="avatar"
        className="object-cover"
      />
    </>
  ) : (
    <span
      className={cn(
        "rounded-full text-md bg-teal-600 text-white grid place-items-center",
        !!avatarSize && `size-${avatarSize}`,
      )}
    >
      {session?.user.name?.slice(0, 2).toUpperCase()}
    </span>
  );
}
