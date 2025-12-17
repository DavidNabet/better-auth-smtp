"use server";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache as cache } from "next/cache";

export const getNotAdminUsers = async () => {
  try {
    const users = await db.user.findMany({
      where: {
        role: {
          not: {
            equals: "ADMIN",
          },
        },
      },
    });
    return users;
  } catch (error) {
    console.log(error);
  }
};

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  const currentUser = await db.user.findFirst({
    where: { id: session.user.id },
    select: {
      role: true,
      email: true,
      name: true,
      id: true,
    },
  });

  if (!currentUser) {
    redirect("/auth/signin");
  }

  return {
    ...session,
    currentUser,
  };
});

// User
export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error("Email required");
    }
    return user;
  } catch (error) {
    console.log(error);
  }
};

export const getUserByUsername = async (name: string) => {
  try {
    const user = await db.user.findUnique({
      where: { name },
    });
    return user;
  } catch (error) {
    console.log(error);
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.log(error);
  }
};

export const getUserIdByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    return user?.id;
  } catch (error) {
    console.log(error);
  }
};
