export function formatMoney(value: number | string | null | undefined) {
  const numericValue =
    typeof value === "string" ? Number(value) : (value ?? 0);

  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
  }).format(Number.isNaN(numericValue) ? 0 : numericValue);
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
  }).format(new Date(value));
}
