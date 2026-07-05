import { useEffect, useState, type FormEvent } from "react";
import { api } from "./api";

const inp = "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500";

export function Login({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const cid = (import.meta as any).env?.VITE_CRM_GOOGLE_CLIENT_ID as string | undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try { const r = await api.login(email, pw); onLogin(r.email); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  // Optional Google Identity Services button (only if a client id is configured).
  useEffect(() => {
    if (!cid) return;
    const render = () => {
      const g = (window as any).google;
      if (!g?.accounts?.id) return;
      try {
        g.accounts.id.initialize({
          client_id: cid,
          callback: async (resp: any) => {
            try { const r = await api.loginGoogle(resp.credential); onLogin(r.email); }
            catch (e: any) { setErr(e.message); }
          },
        });
        g.accounts.id.renderButton(document.getElementById("gbtn"), { theme: "filled_black", size: "large", width: 288 });
      } catch { /* ignore */ }
    };
    if ((window as any).google?.accounts?.id) { render(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = render;
    document.head.appendChild(s);
  }, [cid]);

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-xl font-bold text-orange-500 mb-1">CRM Login</h1>
        <p className="text-xs text-zinc-500 mb-6">Bricket Charcoal Indonesia — Lead Ledger</p>
        <form onSubmit={submit} className="space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className={inp} />
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="Password" className={inp} />
          {err && <p className="text-xs text-red-400">{err}</p>}
          <button disabled={busy} className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 font-semibold text-sm disabled:opacity-50">
            {busy ? "…" : "Masuk"}
          </button>
        </form>
        {cid && (
          <>
            <div className="my-4 text-center text-[10px] text-zinc-600 uppercase tracking-widest">atau</div>
            <div id="gbtn" className="flex justify-center" />
          </>
        )}
      </div>
    </div>
  );
}
