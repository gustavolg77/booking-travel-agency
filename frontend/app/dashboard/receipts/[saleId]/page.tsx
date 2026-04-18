import { ReceiptPage } from "@/features/receipts/components/receipt-page";

export default async function DashboardReceiptPage({
  params,
}: {
  params: Promise<{ saleId: string }>;
}) {
  const resolvedParams = await params;

  return <ReceiptPage saleId={resolvedParams.saleId} />;
}
