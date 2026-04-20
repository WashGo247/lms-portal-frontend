import { type PaymentMethod } from "@shared/types/PaymentMethod";

export type Store = {
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  deleted_at: string | null;
  deleted_by: string | null;
  status: string;
  name: string;
  address: string;
  longitude: number | null;
  latitude: number | null;
  contact_phone_number: string;
  tenant_id: string;
  tenant_name: string | null;
  payment_methods: PaymentMethod[];
  logo_url: string | null;
}
