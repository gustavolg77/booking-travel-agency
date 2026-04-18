export function toMoneyValue(value: number | string) {
  const parsed = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(parsed)) {
    return "0.00";
  }

  return parsed.toFixed(2);
}

export function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(parsed) ? 0 : parsed;
}
