import { Request, Response } from "express";
import prisma from "../../config/prisma";

export const healthCheck = async (req: Request, res: Response) => {
  const usersCount = await prisma.user.count();

  res.status(200).json({
    status: "OK",
    message: "API working correctly 🚀",
    usersInDatabase: usersCount,
  });
};