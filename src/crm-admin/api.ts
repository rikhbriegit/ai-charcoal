// Thin fetch wrapper for the CRM admin SPA. Same-origin cookie auth.
async function req(path: string, opts: RequestInit = {}): Promise<any> {
  const res = await fetch("/crm/api" + path, {
    credentials: "same-origin",
    headers: opts.body ? { "Content-Type": "application/json" } : undefined,
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  me: () => req("/auth/me"),
  login: (email: string, password: string) => req("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  loginGoogle: (credential: string) => req("/auth/google", { method: "POST", body: JSON.stringify({ credential }) }),
  logout: () => req("/auth/logout", { method: "POST" }),
  inbox: () => req("/inbox"),
  ledger: () => req("/ledger"),
  companies: (q = "") => req("/companies" + (q ? `?q=${encodeURIComponent(q)}` : "")),
  company: (id: string) => req("/companies/" + id),
  setStage: (id: string, stage: string) => req(`/companies/${id}/stage`, { method: "POST", body: JSON.stringify({ stage }) }),
  spam: (id: string) => req(`/companies/${id}/spam`, { method: "POST" }),
  createShipment: (data: any) => req("/shipments", { method: "POST", body: JSON.stringify(data) }),
  chainVerify: () => req("/chain/verify"),
};

export const rp = (n: number) => "Rp" + (Number(n) || 0).toLocaleString("id-ID");
export const dt = (s: string) => (s ? new Date(s).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-");
