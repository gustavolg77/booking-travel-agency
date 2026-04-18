import { Prisma, Role, DocumentType } from "@prisma/client";
import prisma from "../src/config/prisma";
import { hashPassword } from "../src/shared/utils/password";

async function seedAgencySettings() {
  const existingSettings = await prisma.agencySetting.findFirst();

  if (existingSettings) {
    console.log("Agency settings already exist");
    return;
  }

  await prisma.agencySetting.create({
    data: {
      agencyName: "Booking Travel Agency",
      email: "info@bookingtravel.local",
      phone: "+59170000000",
      address: "Av. Ejemplo 123",
      city: "Cochabamba",
    },
  });

  console.log("Agency settings created");
}

async function seedUsers() {
  const users: Array<{
    name: string;
    email: string;
    password: string;
    role: Role;
  }> = [
    {
      name: "Admin",
      email: "admin@agency.com",
      password: "admin123",
      role: Role.ADMIN,
    },
    {
      name: "Agente 1",
      email: "agent1@agency.com",
      password: "agent123",
      role: Role.AGENT,
    },
    {
      name: "Agente 2",
      email: "agent2@agency.com",
      password: "agent123",
      role: Role.AGENT,
    },
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`User already exists: ${userData.email}`);
      continue;
    }

    await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: await hashPassword(userData.password),
        role: userData.role,
      },
    });

    console.log(`User created: ${userData.email}`);
  }
}

async function seedClients() {
  const clients: Prisma.ClientCreateInput[] = [
    {
      firstName: "Maria",
      lastName: "Perez",
      documentType: DocumentType.CI,
      documentNumber: "58585858",
      phone: "+59171111111",
      email: "maria.perez@example.com",
      nit: "1020304011",
      businessName: "Maria Perez",
      notes: "Cliente inicial de ejemplo",
    },
  ];

  for (const clientData of clients) {
    const existingClient = await prisma.client.findFirst({
      where: {
        documentType: clientData.documentType,
        documentNumber: clientData.documentNumber,
      },
    });

    if (existingClient) {
      console.log(`Client already exists: ${clientData.documentNumber}`);
      continue;
    }

    await prisma.client.create({
      data: clientData,
    });

    console.log(`Client created: ${clientData.documentNumber}`);
  }
}

async function main() {
  console.log("Seeding database...");

  await seedAgencySettings();
  await seedUsers();
  await seedClients();

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
