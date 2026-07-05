import { useEffect, useState } from "react";
import { api, dt } from "./api";

export function Inbox({ onOpen }: { onOpen: (id: string) => void }) {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  const load = () => api.inbox().then(setData).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  if (err) return <p className="text-red-400">{err}</p>;
  if (!data) return <p className="text-zinc-500">Loading…</p>;

  const act = async (p: Promise<any>) => { try { await p; load(); } catch (e: any) { alert(e.message); } };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-bold text-zinc-300 mb-3">Lead Baru <span className="text-zinc-600">({data.leads.length})</span></h2>
        {data.leads.length === 0 ? (
          <p className="text-zinc-600 text-sm">Belum ada lead baru.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-500 text-xs">
                <tr>{["Perusahaan", "Negara", "Kanal", "Ringkasan", "", ""].map((h, i) => <th key={i} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.leads.map((l: any) => (
                  <tr key={l.id} className="border-t border-zinc-800 hover:bg-zinc-900/50">
                    <td className="px-3 py-2"><button onClick={() => onOpen(l.id)} className="text-orange-400 hover:underline font-medium">{l.name}</button></td>
                    <td className="px-3 py-2 text-zinc-400">{l.country || "-"}</td>
                    <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800">{l.first_touch_channel}</span></td>
                    <td className="px-3 py-2 text-zinc-400 max-w-xs truncate">{l.last_summary}</td>
                    <td className="px-3 py-2"><button onClick={() => act(api.setStage(l.id, "qualified"))} className="text-xs px-2 py-1 rounded bg-emerald-700/40 text-emerald-300 hover:bg-emerald-700/60">Qualify</button></td>
                    <td className="px-3 py-2"><button onClick={() => act(api.spam(l.id))} className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:bg-red-900/40 hover:text-red-300">Spam</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold text-zinc-300 mb-3">Antrian Chat Belum Terparse <span className="text-zinc-600">({data.unparsed.length})</span></h2>
        {data.unparsed.length === 0 ? (
          <p className="text-zinc-600 text-sm">Kosong.</p>
        ) : (
          <div className="space-y-2">
            {data.unparsed.map((u: any) => (
              <div key={u.id} className="text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                <span className="text-amber-400">{u.reason}</span>
                {u.extracted && <span className="text-zinc-400"> · {JSON.stringify(u.extracted).slice(0, 140)}</span>}
                <span className="text-zinc-600"> · {dt(u.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
