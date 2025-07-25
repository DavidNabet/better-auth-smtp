import { db } from "@/db";

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
