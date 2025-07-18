import { db } from "@/db";

export function wait(seconds: number): Promise<number> {
  return new Promise((res) => setTimeout(res, seconds));
}

// User
export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });
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
