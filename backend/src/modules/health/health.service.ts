import prisma from "../../config/prisma";

export async function getHealthStatus() {
  const usersCount = await prisma.user.count();

  return {
    status: "OK",
    message: "API working correctly",
    usersInDatabase: usersCount,
  };
}
