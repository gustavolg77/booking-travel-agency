import { Request, Response } from "express";
import { loginUser } from "./auth.service";
import { validateLoginInput } from "./auth.validators";

export async function login(req: Request, res: Response) {
  const credentials = validateLoginInput(req.body);
  const result = await loginUser(credentials);

  return res.status(200).json(result);
}
