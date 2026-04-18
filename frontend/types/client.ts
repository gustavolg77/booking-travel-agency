export type DocumentType = "CI" | "PASSPORT" | "NIT" | "OTHER";

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string | null;
  email: string | null;
  nit: string | null;
  businessName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSaleSummary {
  id: string;
  saleNumber: string;
  saleDate: string;
  totalClient: string;
  status: string;
  passengerCount: number;
}

export interface ClientListItem extends Client {
  salesCount: number;
  latestSale: ClientSaleSummary | null;
}

export interface ClientDetail extends Client {
  salesCount: number;
  latestSale: ClientSaleSummary | null;
  sales: Array<
    ClientSaleSummary & {
      paymentMethod: string | null;
      items: Array<{
        id: string;
        passengerFirstName: string;
        passengerLastName: string;
        routeOrigin: string;
        routeDestination: string;
        flightDate: string | null;
        ticketNumber: string | null;
      }>;
    }
  >;
}
