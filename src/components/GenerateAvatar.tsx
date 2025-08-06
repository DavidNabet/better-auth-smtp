"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { UpdateProfileSchema } from "@/lib/user/user.schema";
import { faker } from "@faker-js/faker";
import { useRef, useState } from "react";

interface GenerateAvatarProps {
  session: Session | null;
  value?: UpdateProfileSchema["avatar"];
  onChange?: (value: UpdateProfileSchema["avatar"]) => void;
}

export default function GenerateAvatar({
  session,
  value,
  onChange,
}: GenerateAvatarProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const inputRef = useRef(null);

  const handleClick = () => {
    // Generate a random avatar image
    const randomImage = faker.image.avatar();
    setSelectedImage(randomImage);
    onChange?.(randomImage);
  };

  return (
    <div className="mt-1 flex items-center gap-x-3 relative">
      <Avatar className="h-12 w-12 rounded-full">
        {selectedImage && value ? (
          <>
            <AvatarImage src={value} className="object-cover" />
          </>
        ) : !!session?.user.image ? (
          <>
            <AvatarImage
              src={session?.user.image!}
              alt="avatar"
              className="object-cover"
            />
          </>
        ) : (
          <span className="rounded-full text-md bg-teal-600 text-white size-12 grid place-items-center">
            {session?.user.name?.slice(0, 2).toUpperCase()}
          </span>
        )}
      </Avatar>
      <Button
        variant="ghost"
        onClick={handleClick}
        className="rounded-md font-semibold text-primary"
      >
        Generate
      </Button>
    </div>
  );
}
