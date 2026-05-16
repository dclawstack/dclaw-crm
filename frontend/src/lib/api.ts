const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
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

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboard(fromDate?: string, toDate?: string) {
  const params = new URLSearchParams();
  if (fromDate) params.set("from_date", fromDate);
  if (toDate) params.set("to_date", toDate);
  const qs = params.toString() ? `?${params}` : "";
  return fetchJson<{
    total_customers: number;
    open_deals: number;
    total_pipeline_value: number;
    win_rate: number;
    deals_by_stage: Record<string, number>;
    recent_activities: Array<{
      id: string; customer_id: string; deal_id: string | null;
      activity_type: string; description: string; scheduled_at: string | null;
      completed: boolean; created_at: string;
    }>;
  }>(`/api/v1/dashboard/${qs}`);
}

export async function getForecast(fromDate?: string, toDate?: string) {
  const params = new URLSearchParams();
  if (fromDate) params.set("from_date", fromDate);
  if (toDate) params.set("to_date", toDate);
  const qs = params.toString() ? `?${params}` : "";
  return fetchJson<{
    weighted_pipeline: number;
    best_case: number;
    commit: number;
    deal_count: number;
    deals: Array<{ id: string; title: string; value: number; probability: number; stage: string; expected_close_date: string | null }>;
  }>(`/api/v1/forecast/${qs}`);
}

// ── Customers ─────────────────────────────────────────────────────────────────

export interface CustomerSummary {
  id: string; name: string; email: string; phone: string | null;
  company: string | null; status: string; created_at: string;
}

export interface Customer {
  id: string; name: string; email: string; phone: string | null;
  company: string | null; status: string; notes: string | null;
  created_at: string; updated_at: string;
  deals: DealSummary[]; activities: ActivitySummary[];
}

export interface CustomerCreate {
  name: string; email: string; phone?: string | null;
  company?: string | null; status?: string; notes?: string | null;
}

export interface CustomerUpdate {
  name?: string; email?: string; phone?: string | null;
  company?: string | null; status?: string; notes?: string | null;
}

export interface CustomerListResponse { items: Customer[]; total: number; }

export async function listCustomers(limit = 20, offset = 0) {
  return fetchJson<CustomerListResponse>(`/api/v1/customers/?limit=${limit}&offset=${offset}`);
}

export async function getCustomer(id: string) {
  return fetchJson<Customer>(`/api/v1/customers/${id}`);
}

export async function createCustomer(data: CustomerCreate) {
  return fetchJson<Customer>("/api/v1/customers/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCustomer(id: string, data: CustomerUpdate) {
  return fetchJson<Customer>(`/api/v1/customers/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteCustomer(id: string) {
  const url = `${API_BASE}/api/v1/customers/${id}`;
  return fetch(url, { method: "DELETE" });
}

export async function updateCustomerStatus(id: string, status: string) {
  return fetchJson<Customer>(`/api/v1/customers/${id}/status?status=${status}`, { method: "PATCH" });
}

export async function enrichCustomer(id: string) {
  return fetchJson<{ status: string; enriched_fields: string[] }>(`/api/v1/customers/${id}/enrich`, { method: "POST" });
}

export async function exportCustomers() {
  const url = `${API_BASE}/api/v1/customers/export`;
  return fetch(url);
}

export async function importCustomers(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const url = `${API_BASE}/api/v1/customers/import`;
  const resp = await fetch(url, { method: "POST", body: formData });
  if (!resp.ok) throw new Error(`Import error ${resp.status}`);
  return resp.json() as Promise<{ imported: number; skipped: number; errors: string[] }>;
}

// ── Deals ─────────────────────────────────────────────────────────────────────

export interface DealSummary {
  id: string; title: string; value: number; stage: string;
  probability: number; expected_close_date: string | null; created_at: string;
}

export interface Deal {
  id: string; customer_id: string; title: string; value: number; stage: string;
  probability: number; expected_close_date: string | null;
  created_at: string; updated_at: string;
  customer: CustomerSummary; activities: ActivitySummary[];
}

export interface DealCreate {
  customer_id: string; title: string; value?: number;
  stage?: string; probability?: number; expected_close_date?: string | null;
}

export interface DealUpdate {
  customer_id?: string; title?: string; value?: number;
  stage?: string; probability?: number; expected_close_date?: string | null;
}

export interface DealListResponse { items: Deal[]; total: number; }

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
  return fetchJson<Deal>("/api/v1/deals/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateDeal(id: string, data: DealUpdate) {
  return fetchJson<Deal>(`/api/v1/deals/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteDeal(id: string) {
  const url = `${API_BASE}/api/v1/deals/${id}`;
  return fetch(url, { method: "DELETE" });
}

export async function moveDealStage(id: string, stage: string) {
  return fetchJson<Deal>(`/api/v1/deals/${id}/stage?stage=${stage}`, { method: "PATCH" });
}

export async function getDealHealth(id: string) {
  return fetchJson<{ score: number; signals: Array<{ label: string; impact: string }> }>(
    `/api/v1/deals/${id}/health`
  );
}

export async function exportDeals() {
  const url = `${API_BASE}/api/v1/deals/export`;
  return fetch(url);
}

export async function importDeals(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const url = `${API_BASE}/api/v1/deals/import`;
  const resp = await fetch(url, { method: "POST", body: formData });
  if (!resp.ok) throw new Error(`Import error ${resp.status}`);
  return resp.json() as Promise<{ imported: number; skipped: number; errors: string[] }>;
}

// ── Activities ────────────────────────────────────────────────────────────────

export interface ActivitySummary {
  id: string; activity_type: string; description: string;
  scheduled_at: string | null; completed: boolean; created_at: string;
}

export interface Activity {
  id: string; customer_id: string; deal_id: string | null;
  activity_type: string; description: string; scheduled_at: string | null;
  completed: boolean; created_at: string; updated_at: string;
  customer: CustomerSummary; deal: DealSummary | null;
}

export interface ActivityCreate {
  customer_id: string; deal_id?: string | null; activity_type: string;
  description: string; scheduled_at?: string | null; completed?: boolean;
}

export interface ActivityUpdate {
  customer_id?: string; deal_id?: string | null; activity_type?: string;
  description?: string; scheduled_at?: string | null; completed?: boolean;
}

export interface ActivityListResponse { items: Activity[]; total: number; }

export async function listActivities(limit = 20, offset = 0, customerId?: string, dealId?: string) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (customerId) params.set("customer_id", customerId);
  if (dealId) params.set("deal_id", dealId);
  return fetchJson<ActivityListResponse>(`/api/v1/activities/?${params.toString()}`);
}

export async function getActivity(id: string) {
  return fetchJson<Activity>(`/api/v1/activities/${id}`);
}

export async function createActivity(data: ActivityCreate) {
  return fetchJson<Activity>("/api/v1/activities/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateActivity(id: string, data: ActivityUpdate) {
  return fetchJson<Activity>(`/api/v1/activities/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteActivity(id: string) {
  const url = `${API_BASE}/api/v1/activities/${id}`;
  return fetch(url, { method: "DELETE" });
}

export async function toggleActivityComplete(id: string) {
  return fetchJson<Activity>(`/api/v1/activities/${id}/complete`, { method: "PATCH" });
}

export async function getDueTodayActivities() {
  return fetchJson<ActivityListResponse>("/api/v1/activities/due-today");
}

export async function getOverdueActivities() {
  return fetchJson<ActivityListResponse>("/api/v1/activities/overdue");
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export interface Note {
  id: string; content: string; customer_id: string | null; deal_id: string | null;
  created_at: string; updated_at: string;
}

export interface NoteCreate { content: string; customer_id?: string | null; deal_id?: string | null; }
export interface NoteListResponse { items: Note[]; total: number; }

export async function listNotes(customerId?: string, dealId?: string) {
  const params = new URLSearchParams();
  if (customerId) params.set("customer_id", customerId);
  if (dealId) params.set("deal_id", dealId);
  return fetchJson<NoteListResponse>(`/api/v1/notes/?${params.toString()}`);
}

export async function createNote(data: NoteCreate) {
  return fetchJson<Note>("/api/v1/notes/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateNote(id: string, content: string) {
  return fetchJson<Note>(`/api/v1/notes/${id}`, { method: "PUT", body: JSON.stringify({ content }) });
}

export async function deleteNote(id: string) {
  const url = `${API_BASE}/api/v1/notes/${id}`;
  return fetch(url, { method: "DELETE" });
}

// ── Contacts ──────────────────────────────────────────────────────────────────

export interface Contact {
  id: string; customer_id: string; name: string; email: string | null;
  phone: string | null; title: string | null; is_primary: boolean;
  created_at: string; updated_at: string;
}

export interface ContactCreate {
  customer_id: string; name: string; email?: string | null;
  phone?: string | null; title?: string | null; is_primary?: boolean;
}

export interface ContactListResponse { items: Contact[]; total: number; }

export async function listContacts(customerId: string) {
  return fetchJson<ContactListResponse>(`/api/v1/customers/${customerId}/contacts/`);
}

export async function createContact(customerId: string, data: ContactCreate) {
  return fetchJson<Contact>(`/api/v1/customers/${customerId}/contacts/`, {
    method: "POST", body: JSON.stringify(data),
  });
}

export async function updateContact(id: string, data: Partial<ContactCreate>) {
  return fetchJson<Contact>(`/api/v1/contacts/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteContact(id: string) {
  const url = `${API_BASE}/api/v1/contacts/${id}`;
  return fetch(url, { method: "DELETE" });
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string; entity_type: string; entity_id: string; action: string;
  field_name: string | null; old_value: string | null; new_value: string | null;
  actor_ip: string | null; created_at: string;
}

export interface AuditLogListResponse { items: AuditLogEntry[]; total: number; }

export async function getAuditLog(entityType: string, entityId: string, limit = 50) {
  const params = new URLSearchParams({ entity_type: entityType, entity_id: entityId, limit: String(limit) });
  return fetchJson<AuditLogListResponse>(`/api/v1/audit-log/?${params.toString()}`);
}

// ── Webhooks ──────────────────────────────────────────────────────────────────

export interface WebhookEndpoint {
  id: string; url: string; events: string[]; secret: string;
  active: boolean; created_at: string;
}

export interface WebhookDelivery {
  id: string; endpoint_id: string; event: string;
  status_code: number | null; attempts: number; created_at: string;
}

export interface WebhookListResponse { items: WebhookEndpoint[]; total: number; }

export async function listWebhooks() {
  return fetchJson<WebhookListResponse>("/api/v1/webhooks/");
}

export async function createWebhook(data: { url: string; events: string[]; secret: string; active?: boolean }) {
  return fetchJson<WebhookEndpoint>("/api/v1/webhooks/", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteWebhook(id: string) {
  const url = `${API_BASE}/api/v1/webhooks/${id}`;
  return fetch(url, { method: "DELETE" });
}

export async function getWebhookDeliveries(id: string) {
  return fetchJson<WebhookDelivery[]>(`/api/v1/webhooks/${id}/deliveries`);
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchResult { type: string; id: string; title: string; subtitle: string; }

export async function globalSearch(q: string, limit = 10) {
  const params = new URLSearchParams({ q, limit: String(limit) });
  return fetchJson<{ results: SearchResult[] }>(`/api/v1/search/?${params.toString()}`);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser { id: string; email: string; role: string; created_at: string; }
export interface TokenResponse { access_token: string; token_type: string; user: AuthUser; }

export async function loginUser(email: string, password: string) {
  return fetchJson<TokenResponse>("/api/v1/auth/login", {
    method: "POST", body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(email: string, password: string, role = "member") {
  return fetchJson<TokenResponse>("/api/v1/auth/register", {
    method: "POST", body: JSON.stringify({ email, password, role }),
  });
}

export async function getMe(token: string) {
  return fetchJson<AuthUser>("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
