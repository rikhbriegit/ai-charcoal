import { useEffect, useState, type FormEvent } from "react";
import { api, rp } from "./api";

const inp = "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500";

export function Shipments({ presetCompanyId, onOpenCompany }: { presetCompanyId?: string; onOpenCompany: (id: string) => void }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [f, setF] = useState<any>({
    company_id: presetCompanyId || "", bl_number: "", bl_date: "", containers: 1, container_size: "40ft", destination_country: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = () => { api.companies().then(setCompanies); api.ledger().then(setLedger); };
  useEffect(() => { load(); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr(""); setMsg("");
    try {
      const r = await api.createShipment({ ...f, containers: Number(f.containers) });
      setMsg(`Tersimpan · komisi ${rp(r.amount_total)}${r.repeat_order ? " · Repeat Order" : ""}`);
      setF({ ...f, bl_number: "", bl_date: "" });
      load();
    } catch (e: any) { setErr(e.message); }
  };

  const total = ledger.reduce((a, s) => a + (Number(s.amount_total) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-bold mb-4">Input B/L Baru</h2>
          <form onSubmit={submit} className="space-y-3">
            <select value={f.company_id} onChange={(e) => setF({ ...f, company_id: e.target.value })} required className={inp}>
              <option value="">— pilih perusahaan —</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.status})</option>)}
            </select>
            <input value={f.bl_number} onChange={(e) => setF({ ...f, bl_number: e.target.value })} placeholder="Nomor B/L" required className={inp} />
            <input value={f.bl_date} onChange={(e) => setF({ ...f, bl_date: e.target.value })} type="date" required className={inp} />
            <div className="flex gap-2">
              <input value={f.containers} onChange={(e) => setF({ ...f, containers: e.target.value })} type="number" min={1} required className={inp} placeholder="Jumlah kontainer" />
              <select value={f.container_size} onChange={(e) => setF({ ...f, container_size: e.target.value })} className={inp}>
                <option>40ft</option><option>20ft</option>
              </select>
            </div>
            <input value={f.destination_country} onChange={(e) => setF({ ...f, destination_country: e.target.value })} placeholder="Negara tujuan (opsional)" className={inp} />
            {err && <p className="text-xs text-red-400">{err}</p>}
            {msg && <p className="text-xs text-emerald-400">{msg}</p>}
            <button className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 font-semibold text-sm">Simpan B/L → Komisi</button>
          </form>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-bold mb-1">Total Komisi (semua)</h2>
          <p className="text-3xl font-black text-orange-500">{rp(total)}</p>
          <p className="text-xs text-zinc-500 mt-1">{ledger.length} B/L tercatat</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-bold mb-3">Ledger Komisi</h2>
        {ledger.length === 0 ? <p className="text-zinc-600 text-sm">Belum ada.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-zinc-500"><tr>{["B/L", "Tanggal", "Perusahaan", "Kontainer", "Komisi", "Status"].map((h, i) => <th key={i} className="text-left py-1 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {ledger.map((s: any) => (
                  <tr key={s.id} className="border-t border-zinc-800">
                    <td className="py-1.5">{s.bl_number}</td>
                    <td>{s.bl_date}</td>
                    <td><button onClick={() => onOpenCompany(s.company_id)} className="text-orange-400 hover:underline">{s.company}</button></td>
                    <td>{s.containers}× {s.container_size}</td>
                    <td>{rp(s.amount_total)}</td>
                    <td><span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800">{s.commission_status || "-"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
