import { db } from ".";
import { User, Role, Account } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { auth } from "@/lib/auth";

async function seedDatabase() {
  const defaultPassword = await (
    await auth.$context
  ).password.hash("superpassword");
  console.log("default password", defaultPassword);
  const usersData: Omit<User, "id" | "banned" | "banReason" | "banExpires">[] &
    Pick<Account, "password">[] = [
    ...Array.from({ length: 5 }, () => ({
      name: faker.person.lastName(),
      email: faker.internet.email(),
      emailVerified: true,
      role: Role.MEMBER,
      image: faker.image.avatar(),
      createdAt: new Date(),
      updatedAt: new Date(),
      twoFactorEnabled: false,
      password: defaultPassword,
    })),
  ];

  try {
    for (const user of usersData) {
      await db.user.create({
        data: user,
      });
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding the database:", error);
  } finally {
    await db.$disconnect();
  }
}

seedDatabase();
