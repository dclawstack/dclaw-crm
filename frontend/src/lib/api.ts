const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }
  return response.json();
}

export async function getHealth() {
  return fetchJson<{ status: string }>("/health/");
}

// Dashboard
export async function getDashboard() {
  return fetchJson<{
    total_customers: number;
    open_deals: number;
    total_pipeline_value: number;
    win_rate: number;
    deals_by_stage: Record<string, number>;
    recent_activities: Array<{
      id: string;
      customer_id: string;
      deal_id: string | null;
      activity_type: string;
      description: string;
      scheduled_at: string | null;
      completed: boolean;
      created_at: string;
    }>;
  }>("/api/v1/dashboard/");
}

// Customers
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deals: DealSummary[];
  activities: ActivitySummary[];
}

export interface CustomerCreate {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  status?: string;
  notes?: string | null;
}

export interface CustomerUpdate {
  name?: string;
  email?: string;
  phone?: string | null;
  company?: string | null;
  status?: string;
  notes?: string | null;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
}

export async function listCustomers(limit = 20, offset = 0) {
  return fetchJson<CustomerListResponse>(
    `/api/v1/customers/?limit=${limit}&offset=${offset}`
  );
}

export async function getCustomer(id: string) {
  return fetchJson<Customer>(`/api/v1/customers/${id}`);
}

export async function createCustomer(data: CustomerCreate) {
  return fetchJson<Customer>("/api/v1/customers/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCustomer(id: string, data: CustomerUpdate) {
  return fetchJson<Customer>(`/api/v1/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id: string) {
  return fetch(`/api/v1/customers/${id}`, { method: "DELETE" });
}

// Deals
export interface DealSummary {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date: string | null;
  created_at: string;
}

export interface Deal {
  id: string;
  customer_id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date: string | null;
  created_at: string;
  updated_at: string;
  customer: CustomerSummary;
  activities: ActivitySummary[];
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  created_at: string;
}

export interface DealCreate {
  customer_id: string;
  title: string;
  value?: number;
  stage?: string;
  probability?: number;
  expected_close_date?: string | null;
}

export interface DealUpdate {
  customer_id?: string;
  title?: string;
  value?: number;
  stage?: string;
  probability?: number;
  expected_close_date?: string | null;
}

export interface DealListResponse {
  items: Deal[];
  total: number;
}

export async function listDeals(limit = 20, offset = 0, stage?: string) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (stage) params.set("stage", stage);
  return fetchJson<DealListResponse>(`/api/v1/deals/?${params.toString()}`);
}

export async function getDeal(id: string) {
  return fetchJson<Deal>(`/api/v1/deals/${id}`);
}

export async function createDeal(data: DealCreate) {
  return fetchJson<Deal>("/api/v1/deals/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDeal(id: string, data: DealUpdate) {
  return fetchJson<Deal>(`/api/v1/deals/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDeal(id: string) {
  return fetch(`/api/v1/deals/${id}`, { method: "DELETE" });
}

// Activities
export interface ActivitySummary {
  id: string;
  activity_type: string;
  description: string;
  scheduled_at: string | null;
  completed: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  customer_id: string;
  deal_id: string | null;
  activity_type: string;
  description: string;
  scheduled_at: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  customer: CustomerSummary;
  deal: DealSummary | null;
}

export interface ActivityCreate {
  customer_id: string;
  deal_id?: string | null;
  activity_type: string;
  description: string;
  scheduled_at?: string | null;
  completed?: boolean;
}

export interface ActivityUpdate {
  customer_id?: string;
  deal_id?: string | null;
  activity_type?: string;
  description?: string;
  scheduled_at?: string | null;
  completed?: boolean;
}

export interface ActivityListResponse {
  items: Activity[];
  total: number;
}

export async function listActivities(
  limit = 20,
  offset = 0,
  customerId?: string,
  dealId?: string
) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (customerId) params.set("customer_id", customerId);
  if (dealId) params.set("deal_id", dealId);
  return fetchJson<ActivityListResponse>(
    `/api/v1/activities/?${params.toString()}`
  );
}

export async function getActivity(id: string) {
  return fetchJson<Activity>(`/api/v1/activities/${id}`);
}

export async function createActivity(data: ActivityCreate) {
  return fetchJson<Activity>("/api/v1/activities/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateActivity(id: string, data: ActivityUpdate) {
  return fetchJson<Activity>(`/api/v1/activities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteActivity(id: string) {
  return fetch(`/api/v1/activities/${id}`, { method: "DELETE" });
}
