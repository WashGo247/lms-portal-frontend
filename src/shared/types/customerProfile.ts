export type CustomerProfile = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  customer_code: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
};

export type ListCustomerProfilesResponse = {
  data: CustomerProfile[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type ListCustomerProfilesParams = {
  page: number;
  page_size: number;
  search?: string;
  gender?: string;
  order_by?: string;
  order_direction?: string;
};

export type UpdateCustomerProfileRequest = {
  full_name?: string;
  email?: string;
  phone_number?: string;
  gender?: string;
  address?: string;
};
