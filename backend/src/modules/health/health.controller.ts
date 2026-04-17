import { Request, Response } from "express";
import { getHealthStatus } from "./health.service";

export async function healthCheck(_req: Request, res: Response) {
  const data = await getHealthStatus();
  return res.status(200).json(data);
}
