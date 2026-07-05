import { useEffect, useState } from "react";
import { api, rp, dt } from "./api";

const Badge = ({ children }: { children: any }) => (
  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">{children}</span>
);
const Card = ({ title, children }: { title: string; children: any }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3">{title}</h3>
    {children}
  </div>
);

export function CompanyDetail({ id, onBack, onAddShipment }: { id: string; onBack: () => void; onAddShipment: (id: string) => void }) {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => { api.company(id).then(setD).catch((e) => setErr(e.message)); }, [id]);

  if (err) return <p className="text-red-400">{err}</p>;
  if (!d) return <p className="text-zinc-500">Loading…</p>;
  const c = d.company;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-xs text-zinc-500 hover:text-white">← Inbox</button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{c.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            <Badge>{c.status}</Badge>
            <Badge>{c.country || "-"}</Badge>
            <Badge>stage: {d.pipeline?.stage || "-"}</Badge>
            <span className="text-zinc-500">first touch: {dt(c.first_touch_at)} via {c.first_touch_channel}</span>
          </div>
        </div>
        <button onClick={() => onAddShipment(id)} className="shrink-0 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-sm font-semibold">+ B/L</button>
      </div>

      <Card title="Kontak">
        {d.contacts.length === 0 ? <p className="text-zinc-600 text-sm">-</p> :
          d.contacts.map((k: any) => (
            <div key={k.id} className="text-sm text-zinc-300">{k.name || "-"} · {k.email || "-"} · {k.phone_e164 || "-"}</div>
          ))}
      </Card>

      <Card title={`Shipments & Komisi (${d.shipments.length})`}>
        {d.shipments.length === 0 ? <p className="text-zinc-600 text-sm">Belum ada B/L.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-zinc-500"><tr>{["B/L", "Tanggal", "Kontainer", "Seq", "Komisi", "Status"].map((h, i) => <th key={i} className="text-left py-1 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {d.shipments.map((s: any) => (
                  <tr key={s.id} className="border-t border-zinc-800">
                    <td className="py-1.5">{s.bl_number}</td>
                    <td>{s.bl_date}</td>
                    <td>{s.containers} × {s.container_size}</td>
                    <td>{s.order_seq}{s.order_seq >= 2 ? " 🔁" : ""}</td>
                    <td>{rp(s.amount_total)}</td>
                    <td><Badge>{s.commission_status || "-"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title={`Timeline · read-only (${d.interactions.length})`}>
        <div className="space-y-2">
          {d.interactions.map((i: any) => (
            <div key={i.id} className="text-sm border-l-2 border-zinc-700 pl-3">
              <div className="text-zinc-300">{i.summary}</div>
              <div className="text-[10px] text-zinc-600">{i.kind} · {i.channel} · {i.direction} · {dt(i.happened_at)} · hash {String(i.row_hash).slice(0, 10)}…</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
