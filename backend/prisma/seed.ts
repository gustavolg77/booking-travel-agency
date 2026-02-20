import prisma from "../src/config/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding database...");

  const users = [
    {
      name: "Admin",
      email: "admin@agency.com",
      password: "admin123",
      role: "ADMIN",
    },
    {
      name: "Agente 1",
      email: "agent1@agency.com",
      password: "agent123",
      role: "AGENT",
    },
    {
      name: "Agente 2",
      email: "agent2@agency.com",
      password: "agent123",
      role: "AGENT",
    },
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role as any,
        },
      });

      console.log(`✅ Created: ${userData.email}`);
    } else {
      console.log(`⚠️ Already exists: ${userData.email}`);
    }
  }

  console.log("🌱 Seeding completed.");
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });