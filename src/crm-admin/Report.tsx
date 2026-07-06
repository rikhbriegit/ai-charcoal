import { useState } from "react";
import { api, rp, dt } from "./api";

function thisMonth(): string {
  // Avoid Date() pitfalls: derive from an explicit ISO string is fine in the browser.
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function Report() {
  const [month, setMonth] = useState(thisMonth());
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setErr(""); setBusy(true); setData(null);
    try { setData(await api.report(month)); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-[11px] text-zinc-500 mb-1">Bulan (YYYY-MM)</label>
          <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="2026-07"
                 className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
        </div>
        <button onClick={load} disabled={busy} className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-sm font-semibold disabled:opacity-50">
          {busy ? "…" : "Muat Laporan"}
        </button>
        {data && (
          <a href={api.reportCsvUrl(month)} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm">Unduh CSV</a>
        )}
      </div>

      {err && <p className="text-red-400 text-sm">{err}</p>}

      {data && (
        <>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="text-zinc-400">Customer Digital: <b className="text-zinc-100">{data.customers}</b></span>
            <span className="text-zinc-400">Kontainer: <b className="text-zinc-100">{data.totals.containers}</b></span>
            <span className="text-zinc-400">Total Komisi: <b className="text-orange-500">{rp(data.totals.commission)}</b></span>
            <span className={data.chain.ok ? "text-emerald-400" : "text-red-400"}>
              Chain: {data.chain.ok ? `✔ verified (${data.chain.count} baris)` : `✖ BROKEN @ id ${data.chain.brokenAtId}`}
            </span>
          </div>

          {data.rows.length === 0 ? <p className="text-zinc-600 text-sm">Tidak ada B/L pada bulan ini.</p> : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900 text-zinc-500 text-xs">
                  <tr>{["Perusahaan", "First Touch (bukti atribusi)", "B/L", "Tanggal", "Kontainer", "Komisi", "Status"].map((h, i) => <th key={i} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {data.rows.map((r: any, i: number) => (
                    <tr key={i} className="border-t border-zinc-800">
                      <td className="px-3 py-2">{r.company}</td>
                      <td className="px-3 py-2 text-zinc-400">{dt(r.first_touch_at)} · {r.first_touch_channel}</td>
                      <td className="px-3 py-2">{r.bl_number}</td>
                      <td className="px-3 py-2">{r.bl_date}</td>
                      <td className="px-3 py-2">{r.containers}× {r.container_size}{r.order_seq >= 2 ? " 🔁" : ""}</td>
                      <td className="px-3 py-2">{rp(r.amount_total)}</td>
                      <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800">{r.commission_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-[11px] text-zinc-600">Kirim laporan ini + CSV ke Pihak Pertama tiap ≤ tanggal 5 (Pasal 5). Chain hash = deteksi tamper; salinan di dua tangan = bobot bukti.</p>
        </>
      )}
    </div>
  );
}
