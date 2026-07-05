import { useEffect, useState } from "react";
import { api } from "./api";
import { Login } from "./Login";
import { Inbox } from "./Inbox";
import { CompanyDetail } from "./CompanyDetail";
import { Shipments } from "./Shipments";

type View =
  | { name: "inbox" }
  | { name: "company"; id: string }
  | { name: "shipments"; companyId?: string };

const tab = (active: boolean) =>
  `px-3 py-1.5 rounded text-sm ${active ? "bg-orange-600 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`;

export function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [view, setView] = useState<View>({ name: "inbox" });

  useEffect(() => {
    api.me().then((r) => { setAuthed(true); setEmail(r.email); }).catch(() => setAuthed(false));
  }, []);

  if (authed === null) return <div className="min-h-screen grid place-items-center text-zinc-500">Loading…</div>;
  if (!authed) return <Login onLogin={(e) => { setAuthed(true); setEmail(e); }} />;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900/70 sticky top-0 backdrop-blur z-10">
        <div className="flex items-center gap-5">
          <span className="font-bold text-orange-500">CRM · Bricket Charcoal</span>
          <nav className="flex gap-1">
            <button onClick={() => setView({ name: "inbox" })} className={tab(view.name === "inbox" || view.name === "company")}>Inbox</button>
            <button onClick={() => setView({ name: "shipments" })} className={tab(view.name === "shipments")}>Shipments &amp; Komisi</button>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span>{email}</span>
          <button onClick={async () => { await api.logout(); location.reload(); }} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">Logout</button>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {view.name === "inbox" && <Inbox onOpen={(id) => setView({ name: "company", id })} />}
        {view.name === "company" && (
          <CompanyDetail
            id={view.id}
            onBack={() => setView({ name: "inbox" })}
            onAddShipment={(id) => setView({ name: "shipments", companyId: id })}
          />
        )}
        {view.name === "shipments" && (
          <Shipments presetCompanyId={view.companyId} onOpenCompany={(id) => setView({ name: "company", id })} />
        )}
      </main>
    </div>
  );
}
