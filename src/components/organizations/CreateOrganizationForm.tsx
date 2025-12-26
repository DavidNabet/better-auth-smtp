"use client";

import { authClient } from "@/lib/auth/auth.client";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition, ChangeEvent, FormEvent } from "react";
import { DialogFooter } from "../ui/dialog";
import { ErrorMessages } from "@/app/_components/ErrorMessages";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
});

export function CreateOrganizationForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [formData, setFormData] = useState<z.infer<typeof formSchema>>({
    name: "",
    slug: "",
  });

  const [errorMessage, setErrorMessage] = useState<
    z.inferFlattenedErrors<typeof formSchema>["fieldErrors"]
  >({
    name: [""],
    slug: [""],
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validateFields = formSchema.safeParse(formData);

    if (!validateFields.success) {
      const { fieldErrors } = validateFields.error.flatten();
      setErrorMessage({
        name: fieldErrors.name ?? [""],
        slug: fieldErrors.slug ?? [""],
      });
      return;
    }

    startTransition(async () => {
      await authClient.organization.create({
        name: formData.name,
        slug: formData.slug,
        fetchOptions: {
          onError(ctx) {
            console.error(ctx.error);
            toast.error("Failed to create an organization");
          },
          onSuccess() {
            toast.success("Organization created successfully!!");
            router.refresh();
          },
        },
      });
    });
  };

  return (
    <form className="grid grid-cols-6 gap-3" onSubmit={handleSubmit}>
      <div className="col-span-6">
        <Label htmlFor="name" className="block text-sm font-medium">
          Name
        </Label>
        <Input
          name="name"
          className="my-2 w-full"
          type="text"
          placeholder="Organization Name"
          value={formData.name}
          onChange={handleChange}
        />
        <ErrorMessages errors={errorMessage?.name} />
      </div>
      <div className="col-span-6">
        <Label htmlFor="slug" className="block text-sm font-medium">
          Name
        </Label>
        <Input
          name="slug"
          className="my-2 w-full"
          type="text"
          placeholder="my-org"
          value={formData.slug}
          onChange={handleChange}
        />
        <ErrorMessages errors={errorMessage?.slug} />
      </div>
      <DialogFooter className="mt-6 col-span-6 gap-x-6">
        <Button type="submit" variant="default" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Organization
        </Button>
      </DialogFooter>
    </form>
  );
}
