import { AppError } from "../../core/errors/app-error";
import { CreateReceiptInput } from "./receipt.types";

export function validateCreateReceiptInput(
  input: Partial<CreateReceiptInput>
): CreateReceiptInput {
  if (!input.saleId || !input.saleId.trim()) {
    throw new AppError("saleId is required", 400);
  }

  return {
    saleId: input.saleId.trim(),
  };
}
