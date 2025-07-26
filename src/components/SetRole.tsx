"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Session } from "@/lib/auth";
import { Button } from "./ui/button";
import Alert from "@/app/_components/Alert";
import { Loader2 } from "lucide-react";
import { getNotAdminUsers } from "@/lib/user/user.utils";
import type { User } from "@prisma/client";
import { authServer } from "@/lib/auth/auth.client";
import React from "react";

interface Props {
  users: User[];
}

export default function SetRole({ users }: Props) {
  return (
    <form>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-6 sm:col-span-3">
          <Label htmlFor="User" className="block text-sm font-medium ">
            User
          </Label>

          <Select name="name">
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select a username" />
            </SelectTrigger>

            <SelectContent>
              {Array.isArray(users) &&
                users.length > 0 &&
                users?.map((u) => (
                  <SelectItem key={u.id} value={u.name!}>
                    {u.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-6 sm:col-span-3">
          <Label htmlFor="Role" className="block text-sm font-medium ">
            Role
          </Label>

          <Select name="role">
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Select a Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">USER</SelectItem>
              <SelectItem value="MODERATE">MODERATE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-6">
          {/* {error && <Alert message={error!} status="error" />}
        {success && <Alert message={success!} status="success" />} */}
        </div>
        <div className="mt-6 col-span-6 sm:flex sm:items-center sm:justify-end gap-x-6">
          <Button
            type="submit"
            className="bg-teal-600 hover:bg-teal-500 cursor-pointer"
            // className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            {/* {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} */}
            Update profile
          </Button>
        </div>
      </div>
    </form>
  );
}
