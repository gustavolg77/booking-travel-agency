import { AppError } from "../../core/errors/app-error";
import { LoginInput } from "./auth.types";

export function validateLoginInput(input: Partial<LoginInput>): LoginInput {
  if (!input.email || !input.password) {
    throw new AppError("Email and password are required", 400);
  }

  return {
    email: input.email,
    password: input.password,
  };
}
